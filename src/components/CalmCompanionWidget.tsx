import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, X, Heart, AlertTriangle, Settings,
  Minimize2, Maximize2, Send, Smile, Frown, Meh
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { chatAPI } from '../services/api'

interface QuickChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  isStreaming?: boolean
}

interface WidgetSettings {
  enabled: boolean
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  autoMinimize: boolean
  checkInFrequency: number
  crisisModeEnabled: boolean
  notificationSounds: boolean
  theme: 'light' | 'dark' | 'auto'
}

const CalmCompanionWidget: React.FC = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentView, setCurrentView] = useState<'main' | 'chat' | 'checkin' | 'settings'>('main')
  const [messages, setMessages] = useState<QuickChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [moodRating, setMoodRating] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState<number | null>(null)
  const [companionName, setCompanionName] = useState('Calm Companion')
  const [settings, setSettings] = useState<WidgetSettings>({
    enabled: true,
    position: 'bottom-right',
    autoMinimize: true,
    checkInFrequency: 4,
    crisisModeEnabled: true,
    notificationSounds: true,
    theme: 'auto'
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Auto check-in reminder
    if (settings.enabled && settings.checkInFrequency > 0) {
      const interval = setInterval(() => {
        if (!isOpen) {
          // Show gentle reminder for check-in
          setIsOpen(true)
          setCurrentView('checkin')
        }
      }, settings.checkInFrequency * 60 * 60 * 1000) // Convert hours to milliseconds

      return () => clearInterval(interval)
    }
  }, [settings.checkInFrequency, settings.enabled, isOpen])

  useEffect(() => {
    // Load user preferences to get custom companion name and settings
    const loadUserPreferences = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const prefs = await response.json()
          if (prefs.custom_persona_name) {
            setCompanionName(prefs.custom_persona_name)
          }
          // Update widget settings from preferences
          setSettings(prev => ({
            ...prev,
            enabled: prefs.widget_enabled ?? true,
            checkInFrequency: prefs.micro_checkin_frequency ?? 4,
            crisisModeEnabled: prefs.crisis_contact_enabled ?? true,
            theme: prefs.theme ?? 'auto'
          }))
        }
      } catch (error) {
        console.error('Error loading user preferences:', error)
      }
    }

    if (user) {
      loadUserPreferences()
    }
  }, [user])

  useEffect(() => {
    // Listen for widget settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      const updatedSettings = event.detail
      setSettings(prev => ({
        ...prev,
        ...updatedSettings
      }))
    }

    window.addEventListener('widgetSettingsUpdated', handleSettingsUpdate as EventListener)

    return () => {
      window.removeEventListener('widgetSettingsUpdated', handleSettingsUpdate as EventListener)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleQuickChat = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: QuickChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsLoading(true)

    // Create streaming AI message
    const streamingMessageId = (Date.now() + 1).toString()
    const streamingMessage: QuickChatMessage = {
      id: streamingMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }

    setMessages(prev => [...prev, streamingMessage])

    try {
      let fullResponse = ''

      await chatAPI.streamQuickChat(
        messageToSend,
        'normal', // urgency level
        (chunk) => {
          switch (chunk.type) {
            case 'metadata':
              // Handle persona metadata if needed
              break

            case 'response_chunk':
              if (chunk.content) {
                fullResponse += chunk.content
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: fullResponse }
                      : msg
                  )
                )
              }
              break

            case 'response_complete':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              )
              break

            case 'supportive_phrases':
              // Could display supportive phrases in the UI
              console.log('Supportive phrases:', chunk.content)
              break

            case 'stream_complete':
              // Stream is complete
              break

            case 'error':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? {
                        ...msg,
                        content: chunk.content || "I'm having trouble connecting right now, but I'm still here with you.",
                        isStreaming: false
                      }
                    : msg
                )
              )
              break
          }
        }
      )
    } catch (error) {
      console.error('Error in quick chat:', error)
      // Update streaming message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: "I'm having trouble connecting right now, but I'm still here with you.",
                isStreaming: false
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicroCheckin = async () => {
    if (moodRating === null && stressLevel === null) return

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/inner-ally/micro-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trigger_type: 'user_initiated',
          mood_rating: moodRating,
          stress_level: stressLevel,
          time_context: getTimeContext()
        })
      })

      const data = await response.json()

      // Show AI response
      const aiMessage: QuickChatMessage = {
        id: Date.now().toString(),
        content: data.ai_response || "Thank you for checking in with yourself.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }

      setMessages([aiMessage])
      setCurrentView('chat')
    } catch (error) {
      console.error('Error in micro check-in:', error)
    } finally {
      setIsLoading(false)
      setMoodRating(null)
      setStressLevel(null)
    }
  }

  const getTimeContext = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  const getPositionClasses = () => {
    switch (settings.position) {
      case 'bottom-left':
        return 'bottom-6 left-6'
      case 'top-right':
        return 'top-6 right-6'
      case 'top-left':
        return 'top-6 left-6'
      default:
        return 'bottom-6 right-6'
    }
  }

  // Don't render widget if user is not authenticated or widget is disabled
  if (!settings.enabled || !user || !localStorage.getItem('token')) return null

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999] max-h-screen`}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <Heart className="h-8 w-8" />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`bg-white dark:bg-calm-800 rounded-2xl shadow-2xl border border-calm-200 dark:border-calm-700 ${
              isMinimized ? 'w-80 h-16' : 'w-80 max-h-[32rem]'
            } transition-all duration-300 flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-calm-200 dark:border-calm-700">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary-500" />
                <span className="font-medium text-calm-900 dark:text-calm-100">
                  {companionName}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-calm-100 dark:hover:bg-calm-700 rounded"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4 text-calm-600 dark:text-calm-400" />
                  ) : (
                    <Minimize2 className="h-4 w-4 text-calm-600 dark:text-calm-400" />
                  )}
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="p-1 hover:bg-calm-100 dark:hover:bg-calm-700 rounded"
                >
                  <Settings className="h-4 w-4 text-calm-600 dark:text-calm-400" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-calm-100 dark:hover:bg-calm-700 rounded"
                >
                  <X className="h-4 w-4 text-calm-600 dark:text-calm-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col min-h-0">
                {currentView === 'main' && (
                  <div className="flex-1 p-4 space-y-3">
                    <p className="text-sm text-calm-600 dark:text-calm-400 text-center">
                      How can I support you right now?
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={() => setCurrentView('chat')}
                        className="w-full p-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="h-5 w-5 text-primary-500" />
                          <div>
                            <div className="font-medium text-calm-900 dark:text-calm-100">Quick Chat</div>
                            <div className="text-xs text-calm-600 dark:text-calm-400">Share what's on your mind</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setCurrentView('checkin')}
                        className="w-full p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Heart className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-medium text-calm-900 dark:text-calm-100">Check-in</div>
                            <div className="text-xs text-calm-600 dark:text-calm-400">How are you feeling?</div>
                          </div>
                        </div>
                      </button>

                      <button
                        className="w-full p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="font-medium text-calm-900 dark:text-calm-100">SOS Support</div>
                            <div className="text-xs text-calm-600 dark:text-calm-400">Need immediate help</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {currentView === 'chat' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-2 rounded-lg text-sm ${
                              message.sender === 'user'
                                ? 'bg-primary-500 text-white'
                                : 'bg-calm-100 dark:bg-calm-700 text-calm-900 dark:text-calm-100'
                            }`}
                          >
                            {message.content}
                            {message.isStreaming && (
                              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse ml-1"></span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="flex-shrink-0 p-4 border-t border-calm-200 dark:border-calm-700">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleQuickChat()}
                          placeholder="Type a quick message..."
                          className="flex-1 px-3 py-2 text-sm border border-calm-300 dark:border-calm-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-calm-800"
                          disabled={isLoading}
                        />
                        <button
                          onClick={handleQuickChat}
                          disabled={isLoading || !inputMessage.trim()}
                          className="p-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 'checkin' && (
                  <div className="flex-1 p-4 space-y-4">
                    <div className="text-center">
                      <h3 className="font-medium text-calm-900 dark:text-calm-100 mb-2">
                        Quick Check-in
                      </h3>
                      <p className="text-sm text-calm-600 dark:text-calm-400">
                        How are you feeling right now?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                          Mood (1-10)
                        </label>
                        <div className="flex justify-between items-center">
                          <Frown className="h-5 w-5 text-red-500" />
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setMoodRating(rating)}
                                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                                  moodRating === rating
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-calm-200 dark:bg-calm-600 text-calm-700 dark:text-calm-300 hover:bg-calm-300 dark:hover:bg-calm-500'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                          <Smile className="h-5 w-5 text-green-500" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                          Stress Level (1-10)
                        </label>
                        <div className="flex justify-between items-center">
                          <Smile className="h-5 w-5 text-green-500" />
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setStressLevel(rating)}
                                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                                  stressLevel === rating
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-calm-200 dark:bg-calm-600 text-calm-700 dark:text-calm-300 hover:bg-calm-300 dark:hover:bg-calm-500'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      </div>

                      <button
                        onClick={handleMicroCheckin}
                        disabled={isLoading || (moodRating === null && stressLevel === null)}
                        className="w-full py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                      >
                        {isLoading ? 'Checking in...' : 'Submit Check-in'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {currentView !== 'main' && currentView !== 'chat' && (
                  <div className="flex-shrink-0 p-4 border-t border-calm-200 dark:border-calm-700">
                    <button
                      onClick={() => setCurrentView('main')}
                      className="text-sm text-primary-500 hover:text-primary-600"
                    >
                      ← Back to main
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CalmCompanionWidget
