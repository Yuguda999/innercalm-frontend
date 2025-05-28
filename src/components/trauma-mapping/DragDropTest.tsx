import React, { useState } from 'react'
import LifeTimeline from './LifeTimeline'

// Mock data for testing
const mockEvents = [
  {
    id: 1,
    title: "Started School",
    description: "First day of elementary school",
    event_date: "2010-09-01",
    event_type: "MILESTONE" as const,
    category: "EDUCATION",
    emotional_impact_score: 3,
    trauma_severity: 0,
    is_resolved: true,
    timeline_position: 0
  },
  {
    id: 2,
    title: "Parents Divorced",
    description: "Family separation",
    event_date: "2012-03-15",
    event_type: "TRAUMATIC" as const,
    category: "FAMILY",
    emotional_impact_score: -8,
    trauma_severity: 7,
    is_resolved: false,
    timeline_position: 1
  },
  {
    id: 3,
    title: "Won Science Fair",
    description: "First place in regional competition",
    event_date: "2014-05-20",
    event_type: "POSITIVE" as const,
    category: "ACHIEVEMENT",
    emotional_impact_score: 8,
    trauma_severity: 0,
    is_resolved: true,
    timeline_position: 2
  },
  {
    id: 4,
    title: "Moved to New City",
    description: "Family relocated for work",
    event_date: "2015-08-10",
    event_type: "NEUTRAL" as const,
    category: "OTHER",
    emotional_impact_score: -2,
    trauma_severity: 2,
    is_resolved: true,
    timeline_position: 3
  },
  {
    id: 5,
    title: "Graduated High School",
    description: "Completed secondary education",
    event_date: "2018-06-15",
    event_type: "MILESTONE" as const,
    category: "EDUCATION",
    emotional_impact_score: 7,
    trauma_severity: 0,
    is_resolved: true,
    timeline_position: 4
  }
]

const DragDropTest = () => {
  const [events, setEvents] = useState(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const handleEditEvent = (event: any) => {
    console.log('Edit event:', event)
    setSelectedEvent(event)
  }

  const handleStartReframe = (event: any) => {
    console.log('Start reframe:', event)
  }

  const handleReorderEvents = (reorderedEvents: any[]) => {
    console.log('Events reordered:', reorderedEvents.map(e => ({ 
      id: e.id, 
      title: e.title, 
      timeline_position: e.timeline_position 
    })))
    setEvents(reorderedEvents)
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Drag & Drop Timeline Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <LifeTimeline
            events={events}
            onEditEvent={handleEditEvent}
            onStartReframe={handleStartReframe}
            onReorderEvents={handleReorderEvents}
          />
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Current Event Order
          </h2>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={event.id} className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-mono text-sm text-gray-500">#{index + 1}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{event.title}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{event.event_date}</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  Position: {event.timeline_position}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DragDropTest
