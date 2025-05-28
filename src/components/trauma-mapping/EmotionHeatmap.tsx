import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Heart,
  Info
} from 'lucide-react'

interface HeatmapPoint {
  event_id: number
  date: string
  emotional_impact: number
  trauma_severity: number
  dominant_emotion: string
  is_resolved: boolean
  category: string
  title: string
}

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
}

interface EmotionHeatmapProps {
  heatmapData: HeatmapPoint[]
  events: LifeEvent[]
  onEventClick: (event: LifeEvent) => void
}

const EmotionHeatmap = ({ heatmapData, events, onEventClick }: EmotionHeatmapProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '1y' | '5y' | '10y'>('all')
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all')
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapPoint | null>(null)

  // Process and filter data
  const processedData = useMemo(() => {
    let filteredData = [...heatmapData]

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const years = parseInt(selectedTimeRange.replace('y', ''))
      const cutoffDate = new Date()
      cutoffDate.setFullYear(cutoffDate.getFullYear() - years)

      filteredData = filteredData.filter(point =>
        new Date(point.date) >= cutoffDate
      )
    }

    // Filter by emotion
    if (selectedEmotion !== 'all') {
      filteredData = filteredData.filter(point =>
        point.dominant_emotion === selectedEmotion
      )
    }

    // Sort by date
    return filteredData.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [heatmapData, selectedTimeRange, selectedEmotion])

  // Get unique emotions for filter
  const uniqueEmotions = useMemo(() => {
    const emotions = new Set(heatmapData.map(point => point.dominant_emotion))
    return Array.from(emotions).filter(Boolean)
  }, [heatmapData])

  // Create time-based grid
  const timeGrid = useMemo(() => {
    if (processedData.length === 0) return []

    const startDate = new Date(processedData[0].date)
    const endDate = new Date(processedData[processedData.length - 1].date)

    // Create monthly buckets
    const months = []
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

    while (current <= endDate) {
      months.push(new Date(current))
      current.setMonth(current.getMonth() + 1)
    }

    return months.map(month => {
      const monthEvents = processedData.filter(point => {
        const pointDate = new Date(point.date)
        return pointDate.getFullYear() === month.getFullYear() &&
               pointDate.getMonth() === month.getMonth()
      })

      return {
        month,
        events: monthEvents,
        avgImpact: monthEvents.length > 0
          ? monthEvents.reduce((sum, event) => sum + Math.abs(event.emotional_impact), 0) / monthEvents.length
          : 0,
        avgTrauma: monthEvents.length > 0
          ? monthEvents.reduce((sum, event) => sum + event.trauma_severity, 0) / monthEvents.length
          : 0,
        totalEvents: monthEvents.length
      }
    })
  }, [processedData])

  const getIntensityColor = (impact: number, trauma: number) => {
    const intensity = Math.max(Math.abs(impact), trauma)

    if (intensity >= 8) return 'bg-red-600'
    if (intensity >= 6) return 'bg-red-400'
    if (intensity >= 4) return 'bg-orange-400'
    if (intensity >= 2) return 'bg-yellow-400'
    if (intensity > 0) return 'bg-green-400'
    return 'bg-gray-200 dark:bg-gray-700'
  }

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: 'text-yellow-600',
      sadness: 'text-blue-600',
      anger: 'text-red-600',
      fear: 'text-purple-600',
      surprise: 'text-orange-600',
      disgust: 'text-green-600',
      neutral: 'text-gray-600'
    }
    return colors[emotion] || 'text-gray-600'
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const handlePointClick = (point: HeatmapPoint) => {
    const event = events.find(e => e.id === point.event_id)
    if (event) {
      onEventClick(event)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-2">
            Emotion Heatmap
          </h2>
          <p className="text-calm-600 dark:text-calm-300">
            Visual representation of emotional intensity over time. Darker colors indicate higher intensity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Time</option>
            <option value="1y">Last Year</option>
            <option value="5y">Last 5 Years</option>
            <option value="10y">Last 10 Years</option>
          </select>

          <select
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
            className="input-field"
          >
            <option value="all">All Emotions</option>
            {uniqueEmotions.map(emotion => (
              <option key={emotion} value={emotion}>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-calm-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-calm-700 dark:text-calm-300">Intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span className="text-xs text-calm-600 dark:text-calm-400">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-xs text-calm-600 dark:text-calm-400">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs text-calm-600 dark:text-calm-400">High</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-xs text-calm-600 dark:text-calm-400">Trauma Severity</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {timeGrid.length > 0 ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(timeGrid.length, 12)}, 1fr)` }}>
            {timeGrid.map((bucket, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
                className="relative"
              >
                {/* Month Header */}
                <div className="text-xs text-center text-calm-600 dark:text-calm-300 mb-2 font-medium">
                  {formatMonth(bucket.month)}
                </div>

                {/* Events in Month */}
                <div className="space-y-1">
                  {bucket.events.length > 0 ? (
                    bucket.events.map((point, eventIndex) => (
                      <motion.div
                        key={`${point.event_id}-${eventIndex}`}
                        whileHover={{ scale: 1.1, z: 10 }}
                        className={`
                          relative h-8 rounded cursor-pointer border border-white dark:border-calm-700
                          ${getIntensityColor(point.emotional_impact, point.trauma_severity)}
                          ${!point.is_resolved ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}
                        `}
                        onClick={() => handlePointClick(point)}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Trauma indicator */}
                        {point.trauma_severity > 5 && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-red-700 rounded-full transform translate-x-1 -translate-y-1" />
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded opacity-50" />
                  )}
                </div>

                {/* Month Summary */}
                {bucket.totalEvents > 0 && (
                  <div className="mt-2 text-center">
                    <div className="text-xs text-calm-500 dark:text-calm-400">
                      {bucket.totalEvents} event{bucket.totalEvents !== 1 ? 's' : ''}
                    </div>
                    {bucket.avgTrauma > 3 && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Avg trauma: {bucket.avgTrauma.toFixed(1)}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-calm-800/50 rounded-lg">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-calm-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-calm-600 dark:text-calm-300 mb-2">
                No data for selected filters
              </h3>
              <p className="text-calm-500 dark:text-calm-400">
                Try adjusting your time range or emotion filter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-calm-800 p-4 rounded-lg shadow-lg border z-50 max-w-sm"
        >
          <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">
            {hoveredPoint.title}
          </h4>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-calm-600 dark:text-calm-300">Date:</span>
              <span className="text-calm-900 dark:text-calm-100">
                {new Date(hoveredPoint.date).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-calm-600 dark:text-calm-300">Emotional Impact:</span>
              <span className="text-calm-900 dark:text-calm-100">
                {Math.abs(hoveredPoint.emotional_impact)}/10
              </span>
            </div>

            {hoveredPoint.trauma_severity > 0 && (
              <div className="flex justify-between">
                <span className="text-calm-600 dark:text-calm-300">Trauma Severity:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {hoveredPoint.trauma_severity}/10
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-calm-600 dark:text-calm-300">Emotion:</span>
              <span className={`capitalize font-medium ${getEmotionColor(hoveredPoint.dominant_emotion)}`}>
                {hoveredPoint.dominant_emotion}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-calm-600 dark:text-calm-300">Status:</span>
              <span className={`font-medium ${
                hoveredPoint.is_resolved
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {hoveredPoint.is_resolved ? 'Resolved' : 'Unresolved'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-calm-200 dark:border-calm-600">
            <p className="text-xs text-calm-500 dark:text-calm-400 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Click to view full details
            </p>
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      {processedData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="card text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
              {processedData.filter(p => p.emotional_impact > 0).length}
            </h3>
            <p className="text-calm-600 dark:text-calm-300 text-sm">Positive Events</p>
          </div>

          <div className="card text-center">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
              {processedData.filter(p => p.trauma_severity > 5).length}
            </h3>
            <p className="text-calm-600 dark:text-calm-300 text-sm">High Trauma Events</p>
          </div>

          <div className="card text-center">
            <Heart className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
              {processedData.filter(p => !p.is_resolved).length}
            </h3>
            <p className="text-calm-600 dark:text-calm-300 text-sm">Unresolved Events</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmotionHeatmap
