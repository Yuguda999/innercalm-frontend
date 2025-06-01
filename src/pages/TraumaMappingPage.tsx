import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Heart,
  Brain,
  TrendingUp,
  Plus,
  Filter,
  BarChart3,
  Lightbulb,
  Target,
  Sparkles,
  Activity,
  Shield
} from 'lucide-react'
import LifeTimeline from '../components/trauma-mapping/LifeTimeline'
import EmotionHeatmap from '../components/trauma-mapping/EmotionHeatmap'
import EventModal from '../components/trauma-mapping/EventModal'
import ReframeSessionModal from '../components/trauma-mapping/ReframeSessionModal'
import { traumaMappingAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface LifeEvent {
  id: number
  title: string
  description?: string
  event_date: string
  event_type: 'positive' | 'negative' | 'neutral' | 'traumatic' | 'milestone'
  category: string
  emotional_impact_score: number
  trauma_severity: number
  is_resolved: boolean
  associated_emotions?: Record<string, number>
  triggers?: string[]
  themes?: string[]
  created_at: string
  updated_at?: string
}

interface TimelineAnalysis {
  total_events: number
  traumatic_events_count: number
  positive_events_count: number
  unresolved_events_count: number
  patterns: any[]
  emotion_heatmap: any[]
  trauma_clusters: any[]
  healing_progress: any
  recommendations: string[]
  confidence_scores: Record<string, number>
  ai_insights: any[]
}

const TraumaMappingPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showEventModal, setShowEventModal] = useState(false)
  const [showReframeModal, setShowReframeModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)
  const [activeView, setActiveView] = useState<'timeline' | 'heatmap' | 'insights'>('timeline')
  const [filterType, setFilterType] = useState<string>('all')

  // Fetch life events with React Query
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError
  } = useQuery({
    queryKey: ['life-events'],
    queryFn: () => traumaMappingAPI.getLifeEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  })

  // Fetch timeline analysis with React Query (only when we have events)
  const {
    data: analysis,
    isLoading: analysisLoading,
    error: analysisError
  } = useQuery({
    queryKey: ['timeline-analysis'],
    queryFn: () => traumaMappingAPI.getTimelineAnalysis(),
    enabled: events.length > 0, // Only fetch when we have events
    staleTime: 1000 * 60 * 10, // 10 minutes (longer cache for expensive operation)
    retry: 1,
  })

  const loading = eventsLoading || analysisLoading

  const handleCreateEvent = useCallback(() => {
    setSelectedEvent(null)
    setShowEventModal(true)
  }, [])

  const handleEditEvent = useCallback((event: LifeEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }, [])

  const handleStartReframe = useCallback((event: LifeEvent) => {
    setSelectedEvent(event)
    setShowReframeModal(true)
  }, [])

  const handleEventSaved = useCallback(() => {
    setShowEventModal(false)
    // Invalidate and refetch queries
    queryClient.invalidateQueries({ queryKey: ['life-events'] })
    queryClient.invalidateQueries({ queryKey: ['timeline-analysis'] })
  }, [queryClient])

  const handleReorderEvents = useCallback(async (reorderedEvents: LifeEvent[]) => {
    try {
      // TODO: Add API call to persist the new order
      // await traumaMappingAPI.updateEventOrder(reorderedEvents.map(e => ({ id: e.id, timeline_position: e.timeline_position })))

      console.log('Events reordered:', reorderedEvents.map(e => ({ id: e.id, title: e.title, timeline_position: e.timeline_position })))
    } catch (error) {
      console.error('Error updating event order:', error)
      // Invalidate queries to revert to original order
      queryClient.invalidateQueries({ queryKey: ['life-events'] })
    }
  }, [queryClient])

  // Memoize filtered events for better performance
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterType === 'all') return true
      if (filterType === 'traumatic') return event.trauma_severity > 3
      if (filterType === 'unresolved') return !event.is_resolved
      if (filterType === 'positive') return event.event_type === 'positive'
      return event.event_type === filterType
    })
  }, [events, filterType])

  // Show skeleton loader while loading
  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card text-center">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-3 animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="card p-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg mr-3"
                >
                  <Brain className="h-6 w-6 text-white" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
                  Inner Wound Explorer
                </h1>
              </div>
              <p className="text-calm-600 dark:text-calm-300 leading-relaxed max-w-2xl">
                Explore your life timeline, identify patterns, and begin healing through AI-guided reframing
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 shadow-lg touch-target"
            >
              <motion.div
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Plus className="h-5 w-5" />
              </motion.div>
              Add Life Event
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-wellness-800 dark:text-wellness-300 mb-1">
                {analysis.total_events}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Total Events</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-warmth-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-accent-800 dark:text-accent-300 mb-1">
                {analysis.traumatic_events_count}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Healing Focus</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-serenity-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-serenity-400 to-wellness-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-serenity-800 dark:text-serenity-300 mb-1">
                {analysis.positive_events_count}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Positive Events</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-warmth-400 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-warmth-800 dark:text-warmth-300 mb-1">
                {analysis.unresolved_events_count}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">In Progress</p>
            </motion.div>
          </motion.div>
        )}

        {/* View Toggle and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8"
        >
          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-wellness-200/30 dark:border-calm-700/30">
            <div className="flex flex-wrap gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('timeline')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 touch-target ${
                  activeView === 'timeline'
                    ? 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white shadow-lg'
                    : 'text-calm-600 dark:text-calm-400 hover:text-wellness-600 dark:hover:text-wellness-400'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('heatmap')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 touch-target ${
                  activeView === 'heatmap'
                    ? 'bg-gradient-to-r from-serenity-400 to-accent-500 text-white shadow-lg'
                    : 'text-calm-600 dark:text-calm-400 hover:text-serenity-600 dark:hover:text-serenity-400'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Heatmap</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('insights')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 touch-target ${
                  activeView === 'insights'
                    ? 'bg-gradient-to-r from-accent-400 to-warmth-500 text-white shadow-lg'
                    : 'text-calm-600 dark:text-calm-400 hover:text-accent-600 dark:hover:text-accent-400'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-warmth-400 to-accent-400 p-2 rounded-xl">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-2xl px-4 py-3 text-calm-800 dark:text-calm-200 font-medium focus:outline-none focus:ring-2 focus:ring-warmth-400/50 min-w-[150px] touch-target"
            >
              <option value="all">All Events</option>
              <option value="traumatic">Healing Focus</option>
              <option value="positive">Positive</option>
              <option value="unresolved">In Progress</option>
              <option value="milestone">Milestones</option>
            </select>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl"
        >
          <AnimatePresence mode="wait">
            {activeView === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <LifeTimeline
                  events={filteredEvents}
                  onEditEvent={handleEditEvent}
                  onStartReframe={handleStartReframe}
                  onReorderEvents={handleReorderEvents}
                />
              </motion.div>
            )}

            {activeView === 'heatmap' && analysis && (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <EmotionHeatmap
                  heatmapData={analysis.emotion_heatmap}
                  events={filteredEvents}
                  onEventClick={handleEditEvent}
                />
              </motion.div>
            )}

            {activeView === 'insights' && analysis && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* AI Insights */}
                {analysis.ai_insights && analysis.ai_insights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-wellness-800 dark:text-wellness-300">
                        AI-Generated Insights
                      </h3>
                    </div>
                    <div className="grid gap-4">
                      {analysis.ai_insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-wellness-50/70 dark:bg-wellness-900/20 backdrop-blur-sm border border-wellness-200/30 dark:border-wellness-700/30 p-6 rounded-2xl"
                        >
                          <p className="text-wellness-800 dark:text-wellness-300 leading-relaxed">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-serenity-400 to-wellness-400 p-2 rounded-xl mr-3">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-serenity-800 dark:text-serenity-300">
                        Healing Recommendations
                      </h3>
                    </div>
                    <div className="grid gap-4">
                      {analysis.recommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-serenity-50/70 dark:bg-serenity-900/20 backdrop-blur-sm border border-serenity-200/30 dark:border-serenity-700/30 p-6 rounded-2xl"
                        >
                          <p className="text-serenity-800 dark:text-serenity-300 leading-relaxed">{recommendation}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Patterns */}
                {analysis.patterns && analysis.patterns.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-300">
                        Identified Patterns
                      </h3>
                    </div>
                    <div className="grid gap-4">
                      {analysis.patterns.map((pattern, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-accent-50/70 dark:bg-accent-900/20 backdrop-blur-sm border border-accent-200/30 dark:border-accent-700/30 p-6 rounded-2xl"
                        >
                          <h4 className="font-medium text-accent-800 dark:text-accent-300 mb-3 text-lg">
                            {pattern.pattern_name || `Pattern ${index + 1}`}
                          </h4>
                          <p className="text-accent-700 dark:text-accent-400 leading-relaxed">
                            {pattern.description || 'Pattern analysis available'}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        event={selectedEvent}
        onSave={handleEventSaved}
      />

      <ReframeSessionModal
        isOpen={showReframeModal}
        onClose={() => setShowReframeModal(false)}
        event={selectedEvent}
      />
    </div>
  )
}

export default TraumaMappingPage
