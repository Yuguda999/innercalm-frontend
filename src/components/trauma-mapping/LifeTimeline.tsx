import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Heart,
  Smile,
  Frown,
  Meh,
  Star,
  Edit3,
  Brain,
  MoreHorizontal,
  GripVertical
} from 'lucide-react'

interface LifeEvent {
  id: number
  title: string
  description?: string
  event_date: string
  event_type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'TRAUMATIC' | 'MILESTONE'
  category: string
  emotional_impact_score: number
  trauma_severity: number
  is_resolved: boolean
  associated_emotions?: Record<string, number>
  triggers?: string[]
  themes?: string[]
}

interface LifeTimelineProps {
  events: LifeEvent[]
  onEditEvent: (event: LifeEvent) => void
  onStartReframe: (event: LifeEvent) => void
  onReorderEvents?: (reorderedEvents: LifeEvent[]) => void
}

const LifeTimeline = ({ events, onEditEvent, onStartReframe, onReorderEvents }: LifeTimelineProps) => {
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)
  const [draggedEvent, setDraggedEvent] = useState<LifeEvent | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [localEvents, setLocalEvents] = useState<LifeEvent[]>(events)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Sync local events with props
  useEffect(() => {
    setLocalEvents(events)
  }, [events])

  // Memoize sorted events for better performance
  const sortedEvents = useMemo(() => {
    return [...localEvents].sort((a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    )
  }, [localEvents])

  const getEventIcon = (eventType: string, traumaSeverity: number) => {
    if (traumaSeverity > 7) return <Heart className="h-5 w-5 text-red-600" />
    if (eventType === 'POSITIVE') return <Smile className="h-5 w-5 text-green-600" />
    if (eventType === 'NEGATIVE') return <Frown className="h-5 w-5 text-orange-600" />
    if (eventType === 'TRAUMATIC') return <Heart className="h-5 w-5 text-red-600" />
    if (eventType === 'MILESTONE') return <Star className="h-5 w-5 text-purple-600" />
    return <Meh className="h-5 w-5 text-gray-600" />
  }

  const getEventColor = (event: LifeEvent) => {
    if (event.trauma_severity > 7) return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    if (event.trauma_severity > 4) return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
    if (event.event_type === 'POSITIVE') return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    if (event.event_type === 'TRAUMATIC') return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    if (event.event_type === 'MILESTONE') return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
    return 'border-gray-300 bg-gray-50 dark:bg-gray-800/20'
  }

  const getIntensityHeight = (emotionalImpact: number, traumaSeverity: number) => {
    const intensity = Math.max(Math.abs(emotionalImpact), traumaSeverity)
    return Math.max(40, (intensity / 10) * 120) // Min 40px, max 120px
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDragStart = (e: React.DragEvent, event: LifeEvent) => {
    setDraggedEvent(event)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event.id.toString())

    // Create a custom drag image
    const dragImage = document.createElement('div')
    dragImage.className = 'bg-white dark:bg-calm-800 p-3 rounded-lg shadow-lg border-2 border-primary-400'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.innerHTML = `
      <div class="text-sm font-medium text-calm-900 dark:text-calm-100">${event.title}</div>
      <div class="text-xs text-calm-600 dark:text-calm-300">${formatDate(event.event_date)}</div>
    `
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the timeline container
    const rect = timelineRef.current?.getBoundingClientRect()
    if (rect && (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedEvent) return

    const draggedIndex = sortedEvents.findIndex(event => event.id === draggedEvent.id)
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDragOverIndex(null)
      return
    }

    // Create new array with reordered events
    const newEvents = [...sortedEvents]
    const [draggedItem] = newEvents.splice(draggedIndex, 1)
    newEvents.splice(dropIndex, 0, draggedItem)

    // Update timeline positions based on new order
    const reorderedEvents = newEvents.map((event, index) => ({
      ...event,
      timeline_position: index
    }))

    setLocalEvents(reorderedEvents)
    setDragOverIndex(null)

    // Notify parent component of reorder
    if (onReorderEvents) {
      onReorderEvents(reorderedEvents)
    }
  }

  const getDominantEmotion = (emotions?: Record<string, number>) => {
    if (!emotions) return null
    const entries = Object.entries(emotions)
    if (entries.length === 0) return null
    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0]
  }

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-2">
          Life Timeline
        </h2>
        <p className="text-calm-600 dark:text-calm-300">
          Drag events to reorder them chronologically or click to view details. Height represents emotional intensity. Hover to see drag handle.
        </p>
      </div>

      {/* Timeline Container */}
      <div
        ref={timelineRef}
        className="relative overflow-x-auto pb-8"
        style={{ minHeight: '300px' }}
        onDragLeave={handleDragLeave}
      >
        {/* Timeline Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 transform -translate-y-1/2" />

        {/* Events */}
        <div className="flex items-center gap-8 px-4 py-8 min-w-max">
          {sortedEvents.map((event, index) => {
            const height = getIntensityHeight(event.emotional_impact_score, event.trauma_severity)
            const dominantEmotion = getDominantEmotion(event.associated_emotions)
            const isDragging = draggedEvent?.id === event.id
            const isDropTarget = dragOverIndex === index

            return (
              <div key={event.id} className="relative">
                {/* Drop Zone Indicator */}
                {isDropTarget && draggedEvent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-24 bg-primary-500 rounded-full shadow-lg z-10"
                  />
                )}

                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isDragging ? 0.5 : 1,
                    y: 0,
                    scale: isDragging ? 0.95 : 1
                  }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                  className={`
                    relative flex flex-col items-center group cursor-pointer
                    ${isDragging ? 'z-50' : 'z-10'}
                  `}
                  style={{ minWidth: '200px' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => !isDragging && setSelectedEvent(event)}
                >
                {/* Event Card */}
                <motion.div
                  whileHover={!isDragging ? { scale: 1.05, y: -5 } : {}}
                  whileTap={!isDragging ? { scale: 0.95 } : {}}
                  className={`
                    relative p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm transition-all duration-200
                    ${getEventColor(event)}
                    ${isDragging ? 'opacity-50 shadow-2xl border-primary-400' : ''}
                    ${isDropTarget ? 'ring-4 ring-primary-300 ring-opacity-50' : ''}
                    ${!event.is_resolved ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}
                    ${isDragging ? 'cursor-grabbing' : 'cursor-grab hover:cursor-grab'}
                  `}
                  style={{
                    height: `${height}px`,
                    minHeight: '80px'
                  }}
                >
                  {/* Drag Handle */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Event Icon */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-calm-800 rounded-full p-2 border-2 border-current">
                    {getEventIcon(event.event_type, event.trauma_severity)}
                  </div>

                  {/* Event Content */}
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-calm-900 dark:text-calm-100 text-sm mb-1 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="text-xs text-calm-600 dark:text-calm-300 mb-2">
                      {formatDate(event.event_date)}
                    </div>

                    {/* Emotional Impact Indicator */}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="text-xs text-calm-500">
                        Impact: {Math.abs(event.emotional_impact_score)}/10
                      </div>
                    </div>

                    {/* Trauma Severity */}
                    {event.trauma_severity > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {event.trauma_severity}/10
                        </span>
                      </div>
                    )}

                    {/* Dominant Emotion */}
                    {dominantEmotion && (
                      <div className="text-xs text-calm-600 dark:text-calm-300 capitalize">
                        {dominantEmotion}
                      </div>
                    )}

                    {/* Resolution Status */}
                    {!event.is_resolved && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditEvent(event)
                        }}
                        className="p-1 bg-white dark:bg-calm-700 rounded-full shadow-md hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        <Edit3 className="h-3 w-3 text-calm-600 dark:text-calm-300" />
                      </motion.button>

                      {event.trauma_severity > 3 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartReframe(event)
                          }}
                          className="p-1 bg-white dark:bg-calm-700 rounded-full shadow-md hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Brain className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Connection Line to Timeline */}
                <div className="w-0.5 h-8 bg-primary-300 mt-2" />
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {sortedEvents.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-calm-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-calm-600 dark:text-calm-300 mb-2">
                No events yet
              </h3>
              <p className="text-calm-500 dark:text-calm-400">
                Add your first life event to begin mapping your journey
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-calm-800 rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-calm-900 dark:text-calm-100">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-calm-500 hover:text-calm-700 dark:hover:text-calm-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-calm-600 dark:text-calm-300">
                    Date
                  </label>
                  <p className="text-calm-900 dark:text-calm-100">
                    {formatDate(selectedEvent.event_date)}
                  </p>
                </div>

                {selectedEvent.description && (
                  <div>
                    <label className="text-sm font-medium text-calm-600 dark:text-calm-300">
                      Description
                    </label>
                    <p className="text-calm-900 dark:text-calm-100">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-calm-600 dark:text-calm-300">
                      Emotional Impact
                    </label>
                    <p className="text-calm-900 dark:text-calm-100">
                      {selectedEvent.emotional_impact_score}/10
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-calm-600 dark:text-calm-300">
                      Trauma Severity
                    </label>
                    <p className="text-calm-900 dark:text-calm-100">
                      {selectedEvent.trauma_severity}/10
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-calm-600 dark:text-calm-300">
                    Status
                  </label>
                  <p className={`font-medium ${
                    selectedEvent.is_resolved
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {selectedEvent.is_resolved ? 'Resolved' : 'Unresolved'}
                  </p>
                </div>

                {selectedEvent.themes && selectedEvent.themes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-calm-600 dark:text-calm-300">
                      Themes
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedEvent.themes.map((theme, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedEvent(null)
                      onEditEvent(selectedEvent)
                    }}
                    className="btn-secondary flex-1"
                  >
                    Edit Event
                  </button>

                  {selectedEvent.trauma_severity > 3 && (
                    <button
                      onClick={() => {
                        setSelectedEvent(null)
                        onStartReframe(selectedEvent)
                      }}
                      className="btn-primary flex-1"
                    >
                      Start Reframing
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LifeTimeline
