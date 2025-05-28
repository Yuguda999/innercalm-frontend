import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Heart, Tag, AlertTriangle } from 'lucide-react'
import { traumaMappingAPI } from '../../services/api'

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

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event?: LifeEvent | null
  onSave: () => void
}

const EventModal = ({ isOpen, onClose, event, onSave }: EventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_type: 'NEUTRAL' as const,
    category: 'OTHER',
    emotional_impact_score: 0,
    trauma_severity: 0,
    is_resolved: false,
    triggers: [] as string[],
    themes: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTrigger, setNewTrigger] = useState('')
  const [newTheme, setNewTheme] = useState('')

  const eventTypes = [
    { value: 'POSITIVE', label: 'Positive', color: 'text-green-600' },
    { value: 'NEGATIVE', label: 'Negative', color: 'text-orange-600' },
    { value: 'NEUTRAL', label: 'Neutral', color: 'text-gray-600' },
    { value: 'TRAUMATIC', label: 'Traumatic', color: 'text-red-600' },
    { value: 'MILESTONE', label: 'Milestone', color: 'text-purple-600' }
  ]

  const categories = [
    'FAMILY', 'RELATIONSHIPS', 'CAREER', 'HEALTH', 'EDUCATION',
    'LOSS', 'ACHIEVEMENT', 'TRAUMA', 'OTHER'
  ]

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date.split('T')[0], // Format for date input
        event_type: event.event_type,
        category: event.category,
        emotional_impact_score: event.emotional_impact_score,
        trauma_severity: event.trauma_severity,
        is_resolved: event.is_resolved,
        triggers: event.triggers || [],
        themes: event.themes || []
      })
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_type: 'NEUTRAL',
        category: 'OTHER',
        emotional_impact_score: 0,
        trauma_severity: 0,
        is_resolved: false,
        triggers: [],
        themes: []
      })
    }
    setError('')
  }, [event, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (event) {
        // Update existing event
        await traumaMappingAPI.updateLifeEvent(event.id, formData)
      } else {
        // Create new event
        await traumaMappingAPI.createLifeEvent(formData)
      }
      onSave()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const addTrigger = () => {
    if (newTrigger.trim() && !formData.triggers.includes(newTrigger.trim())) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, newTrigger.trim()]
      }))
      setNewTrigger('')
    }
  }

  const removeTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }))
  }

  const addTheme = () => {
    if (newTheme.trim() && !formData.themes.includes(newTheme.trim())) {
      setFormData(prev => ({
        ...prev,
        themes: [...prev.themes, newTheme.trim()]
      }))
      setNewTheme('')
    }
  }

  const removeTheme = (theme: string) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.filter(t => t !== theme)
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-calm-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                {event ? 'Edit Life Event' : 'Add Life Event'}
              </h2>
              <button
                onClick={onClose}
                className="text-calm-500 hover:text-calm-700 dark:hover:text-calm-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="Brief description of the event"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value as any }))}
                    className="input-field"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Detailed description of what happened..."
                />
              </div>

              {/* Impact Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Emotional Impact Score: {formData.emotional_impact_score}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={formData.emotional_impact_score}
                    onChange={(e) => setFormData(prev => ({ ...prev, emotional_impact_score: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-calm-500 dark:text-calm-400 mt-1">
                    <span>Very Negative (-10)</span>
                    <span>Neutral (0)</span>
                    <span>Very Positive (+10)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    <Heart className="h-4 w-4 inline mr-1 text-red-500" />
                    Trauma Severity: {formData.trauma_severity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.trauma_severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, trauma_severity: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-calm-500 dark:text-calm-400 mt-1">
                    <span>No Trauma (0)</span>
                    <span>Severe Trauma (10)</span>
                  </div>
                </div>
              </div>

              {/* Resolution Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_resolved"
                  checked={formData.is_resolved}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_resolved: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="is_resolved" className="text-sm font-medium text-calm-700 dark:text-calm-300">
                  This event has been resolved/healed
                </label>
              </div>

              {/* Triggers */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Triggers
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                    className="input-field flex-1"
                    placeholder="Add a trigger..."
                  />
                  <button
                    type="button"
                    onClick={addTrigger}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.triggers.map((trigger, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                    >
                      {trigger}
                      <button
                        type="button"
                        onClick={() => removeTrigger(trigger)}
                        className="text-orange-500 hover:text-orange-700 dark:hover:text-orange-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Themes
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                    className="input-field flex-1"
                    placeholder="Add a theme..."
                  />
                  <button
                    type="button"
                    onClick={addTheme}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.themes.map((theme, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                    >
                      {theme}
                      <button
                        type="button"
                        onClick={() => removeTheme(theme)}
                        className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-calm-200 dark:border-calm-600">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading || !formData.title || !formData.event_date}
                >
                  {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EventModal
