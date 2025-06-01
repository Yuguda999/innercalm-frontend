import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Heart, Sparkles, MessageSquare, Settings,
  Plus, X, Check, Edit3, Save, RotateCcw
} from 'lucide-react'

interface Persona {
  persona_key: string
  display_name: string
  description: string
  sample_responses: string[]
  best_for: string[]
  communication_style_summary: string
}

interface PersonaCustomizerProps {
  onPersonaChange?: (persona: string) => void
  currentPersona?: string
}

const PersonaCustomizer: React.FC<PersonaCustomizerProps> = ({
  onPersonaChange,
  currentPersona = 'gentle_mentor'
}) => {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState(currentPersona)
  const [customAffirmations, setCustomAffirmations] = useState<string[]>([])
  const [newAffirmation, setNewAffirmation] = useState('')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPersonas()
    loadUserCustomizations()
  }, [])

  const getFallbackPersonas = (): Persona[] => {
    return [
      {
        persona_key: 'gentle_mentor',
        display_name: 'Gentle Mentor',
        description: 'A wise, patient guide who offers gentle wisdom and encouragement',
        sample_responses: [
          'I understand how you\'re feeling right now.',
          'Let\'s explore this together.',
          'You\'re taking an important step by sharing this.'
        ],
        best_for: ['Deep emotional exploration', 'Gentle guidance', 'Supportive conversations'],
        communication_style_summary: 'Very high empathy, very gentle approach'
      },
      {
        persona_key: 'warm_friend',
        display_name: 'Warm Friend',
        description: 'A caring, understanding friend who\'s always there to listen',
        sample_responses: [
          'I hear you, and I\'m here for you.',
          'That sounds really tough.',
          'You don\'t have to go through this alone.'
        ],
        best_for: ['Casual conversations', 'Emotional support', 'Feeling understood'],
        communication_style_summary: 'Very high empathy, gentle approach'
      },
      {
        persona_key: 'wise_elder',
        display_name: 'Wise Elder',
        description: 'A thoughtful, experienced guide with deep wisdom and perspective',
        sample_responses: [
          'In my experience, this feeling often passes.',
          'Consider this perspective...',
          'Wisdom suggests taking a moment to breathe.'
        ],
        best_for: ['Life perspective', 'Thoughtful guidance', 'Reflective conversations'],
        communication_style_summary: 'High empathy, gentle approach'
      }
    ]
  }

  const loadPersonas = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPersonas(getFallbackPersonas())
        return
      }

      const response = await fetch('http://localhost:8000/api/inner-ally/personas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPersonas(data)
      } else {
        setPersonas(getFallbackPersonas())
      }
    } catch (error) {
      console.error('Error loading personas:', error)
      // Fallback to default personas
      setPersonas(getFallbackPersonas())
    } finally {
      setLoading(false)
    }
  }

  const loadUserCustomizations = async () => {
    try {
      // Load user's current affirmations and customizations
      // This would come from user preferences API
      setCustomAffirmations([
        'I am worthy of love and compassion',
        'This feeling will pass',
        'I have the strength to handle this'
      ])
    } catch (error) {
      console.error('Error loading customizations:', error)
    }
  }

  const handlePersonaSelect = (personaKey: string) => {
    setSelectedPersona(personaKey)
    onPersonaChange?.(personaKey)
  }

  const addAffirmation = () => {
    if (newAffirmation.trim() && !customAffirmations.includes(newAffirmation.trim())) {
      setCustomAffirmations([...customAffirmations, newAffirmation.trim()])
      setNewAffirmation('')
    }
  }

  const removeAffirmation = (index: number) => {
    setCustomAffirmations(customAffirmations.filter((_, i) => i !== index))
  }

  const saveCustomizations = async () => {
    setSaving(true)
    try {
      // Save persona customizations
      const response = await fetch('http://localhost:8000/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          agent_persona: selectedPersona,
          custom_persona_name: customName || null,
          custom_persona_description: customDescription || null,
          favorite_affirmations: customAffirmations
        })
      })

      if (response.ok) {
        // Customizations saved successfully
      }
    } catch (error) {
      console.error('Error saving customizations:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setSelectedPersona('gentle_mentor')
    setCustomName('')
    setCustomDescription('')
    setCustomAffirmations([
      'I am worthy of love and compassion',
      'This feeling will pass',
      'I have the strength to handle this'
    ])
    setIsCustomizing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-2">
          Customize Your Inner Ally
        </h2>
        <p className="text-calm-600 dark:text-calm-400">
          Choose how your AI companion communicates and supports you
        </p>
      </div>

      {/* Persona Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Choose Your Companion Style
        </h3>

        <div className="grid gap-4">
          {personas.map((persona) => (
            <motion.div
              key={persona.persona_key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePersonaSelect(persona.persona_key)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPersona === persona.persona_key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-calm-200 dark:border-calm-700 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-semibold text-calm-900 dark:text-calm-100">
                      {persona.display_name}
                    </h4>
                    {selectedPersona === persona.persona_key && (
                      <Check className="h-5 w-5 text-primary-500 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-calm-600 dark:text-calm-400 mb-3">
                    {persona.description}
                  </p>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-calm-700 dark:text-calm-300">
                        Sample responses:
                      </span>
                      <div className="mt-1 space-y-1">
                        {persona.sample_responses.slice(0, 2).map((response, index) => (
                          <p key={index} className="text-xs text-calm-600 dark:text-calm-400 italic">
                            "{response}"
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-calm-700 dark:text-calm-300">
                        Best for:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {persona.best_for.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-calm-100 dark:bg-calm-700 text-xs text-calm-700 dark:text-calm-300 rounded"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom Affirmations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Personal Affirmations
        </h3>

        <div className="space-y-3">
          {customAffirmations.map((affirmation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-3 bg-calm-50 dark:bg-calm-800 rounded-lg"
            >
              <span className="text-calm-900 dark:text-calm-100 flex-1">
                "{affirmation}"
              </span>
              <button
                onClick={() => removeAffirmation(index)}
                className="p-1 text-calm-500 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}

          <div className="flex space-x-2">
            <input
              type="text"
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAffirmation()}
              placeholder="Add a personal affirmation..."
              className="flex-1 input-field"
            />
            <button
              onClick={addAffirmation}
              disabled={!newAffirmation.trim()}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Customization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Advanced Customization
          </h3>
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            {isCustomizing ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Custom Name for Your Companion
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Alex, Sage, Luna..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                  Custom Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe how you'd like your companion to be..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-calm-200 dark:border-calm-700">
        <button
          onClick={saveCustomizations}
          disabled={saving}
          className="btn-primary flex-1 flex items-center justify-center"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Customizations'}
        </button>

        <button
          onClick={resetToDefaults}
          className="btn-secondary flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </button>
      </div>
    </div>
  )
}

export default PersonaCustomizer
