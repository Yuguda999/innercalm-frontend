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
  Target
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-calm-900 dark:text-calm-100 mb-2">
                Trauma Mapping & Inner Wound Explorer
              </h1>
              <p className="text-calm-600 dark:text-calm-300">
                Explore your life timeline, identify patterns, and begin healing through AI-guided reframing
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Life Event
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="card text-center">
              <Calendar className="h-8 w-8 text-primary-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-1">
                {analysis.total_events}
              </h3>
              <p className="text-calm-600 dark:text-calm-300">Total Events</p>
            </div>

            <div className="card text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-1">
                {analysis.traumatic_events_count}
              </h3>
              <p className="text-calm-600 dark:text-calm-300">Traumatic Events</p>
            </div>

            <div className="card text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-1">
                {analysis.positive_events_count}
              </h3>
              <p className="text-calm-600 dark:text-calm-300">Positive Events</p>
            </div>

            <div className="card text-center">
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-1">
                {analysis.unresolved_events_count}
              </h3>
              <p className="text-calm-600 dark:text-calm-300">Unresolved</p>
            </div>
          </motion.div>
        )}

        {/* View Toggle and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'timeline'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-calm-800 text-calm-600 dark:text-calm-300 hover:bg-primary-50 dark:hover:bg-calm-700'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Timeline
            </button>
            <button
              onClick={() => setActiveView('heatmap')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'heatmap'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-calm-800 text-calm-600 dark:text-calm-300 hover:bg-primary-50 dark:hover:bg-calm-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Emotion Heatmap
            </button>
            <button
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'insights'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-calm-800 text-calm-600 dark:text-calm-300 hover:bg-primary-50 dark:hover:bg-calm-700'
              }`}
            >
              <Lightbulb className="h-4 w-4 inline mr-2" />
              AI Insights
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-calm-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="all">All Events</option>
              <option value="traumatic">Traumatic</option>
              <option value="positive">Positive</option>
              <option value="unresolved">Unresolved</option>
              <option value="milestone">Milestones</option>
            </select>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-6"
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
                className="space-y-6"
              >
                {/* AI Insights */}
                {analysis.ai_insights && analysis.ai_insights.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">
                      AI-Generated Insights
                    </h3>
                    <div className="grid gap-4">
                      {analysis.ai_insights.map((insight, index) => (
                        <div key={index} className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                          <p className="text-calm-800 dark:text-calm-200">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">
                      Healing Recommendations
                    </h3>
                    <div className="grid gap-3">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <p className="text-calm-800 dark:text-calm-200">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns */}
                {analysis.patterns && analysis.patterns.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">
                      Identified Patterns
                    </h3>
                    <div className="grid gap-4">
                      {analysis.patterns.map((pattern, index) => (
                        <div key={index} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                          <h4 className="font-medium text-calm-900 dark:text-calm-100 mb-2">
                            {pattern.pattern_name || `Pattern ${index + 1}`}
                          </h4>
                          <p className="text-calm-700 dark:text-calm-300 text-sm">
                            {pattern.description || 'Pattern analysis available'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
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
