import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface InnerAllyStatus {
  is_active: boolean
  current_persona: string
  last_interaction?: string
  total_interactions: number
  recent_mood_trend: string
  available_interventions: string[]
  next_check_in?: string
}

interface PersonalizationSummary {
  total_memories: number
  active_triggers: number
  preferred_coping_strategies: string[]
  favorite_phrases: string[]
  conversation_preferences: Record<string, any>
  recent_insights: any[]
}

interface InnerAllyInsight {
  id: string
  type: 'pattern' | 'preference' | 'growth' | 'recommendation'
  title: string
  description: string
  confidence: number
  discovered_at: string
  interaction_count: number
  examples: string[]
  suggested_actions?: string[]
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

interface InnerAllyContextType {
  status: InnerAllyStatus | null
  personalization: PersonalizationSummary | null
  insights: InnerAllyInsight[]
  widgetSettings: WidgetSettings
  isLoading: boolean
  error: string | null

  // Actions
  refreshStatus: () => Promise<void>
  refreshPersonalization: () => Promise<void>
  refreshInsights: () => Promise<void>
  updateWidgetSettings: (settings: Partial<WidgetSettings>) => Promise<void>
  sendQuickChat: (message: string, urgencyLevel?: string) => Promise<any>
  submitMicroCheckin: (data: any) => Promise<any>
  logWidgetInteraction: (type: string, state: string) => Promise<void>
}

const InnerAllyContext = createContext<InnerAllyContextType | undefined>(undefined)

interface InnerAllyProviderProps {
  children: ReactNode
}

export const InnerAllyProvider: React.FC<InnerAllyProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [status, setStatus] = useState<InnerAllyStatus | null>(null)
  const [personalization, setPersonalization] = useState<PersonalizationSummary | null>(null)
  const [insights, setInsights] = useState<InnerAllyInsight[]>([])
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    enabled: true,
    position: 'bottom-right',
    autoMinimize: true,
    checkInFrequency: 4,
    crisisModeEnabled: true,
    notificationSounds: true,
    theme: 'auto'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      refreshStatus()
      refreshPersonalization()
      refreshInsights()
      loadWidgetSettings()
    }
  }, [user])

  const loadWidgetSettings = async () => {
    try {
      const preferences = await makeApiCall('/users/preferences')
      setWidgetSettings({
        enabled: preferences.widget_enabled ?? true,
        position: 'bottom-right', // Default position
        autoMinimize: true,
        checkInFrequency: preferences.micro_checkin_frequency ?? 4,
        crisisModeEnabled: preferences.crisis_contact_enabled ?? true,
        notificationSounds: true,
        theme: preferences.theme ?? 'auto'
      })
    } catch (err) {
      console.error('Error loading widget settings:', err)
    }
  }

  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token available')
    }

    const response = await fetch(`http://localhost:8000/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  const refreshStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await makeApiCall('/inner-ally/status')
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status')
      console.error('Error refreshing Inner Ally status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPersonalization = async () => {
    try {
      setError(null)
      const data = await makeApiCall('/inner-ally/personalization-summary')
      setPersonalization(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personalization')
      console.error('Error refreshing personalization:', err)
    }
  }

  const refreshInsights = async () => {
    try {
      setError(null)
      // Generate insights based on user interactions and patterns
      const insights = await generateInnerAllyInsights()
      setInsights(insights)
    } catch (err) {
      console.error('Error refreshing insights:', err)
      // Don't set error for insights as they're not critical
    }
  }

  const generateInnerAllyInsights = async (): Promise<InnerAllyInsight[]> => {
    // For now, generate insights based on available data
    // In a real implementation, this would analyze user patterns from the backend
    const insights: InnerAllyInsight[] = []

    try {
      // Get user interaction data
      const [statusData, personalizationData] = await Promise.all([
        makeApiCall('/inner-ally/status').catch(() => null),
        makeApiCall('/inner-ally/personalization-summary').catch(() => null)
      ])

      if (statusData && statusData.total_interactions > 5) {
        insights.push({
          id: 'interaction-pattern-1',
          type: 'pattern',
          title: 'Regular Check-in Pattern',
          description: `You've been consistently engaging with your Inner Ally (${statusData.total_interactions} interactions). This shows a commitment to self-reflection and emotional awareness.`,
          confidence: 0.8,
          discovered_at: new Date().toISOString(),
          interaction_count: statusData.total_interactions,
          examples: ['Daily mood check-ins', 'Quick chat sessions', 'Stress level monitoring'],
          suggested_actions: ['Continue your regular check-ins', 'Try exploring deeper emotional topics']
        })
      }

      if (personalizationData && personalizationData.preferred_coping_strategies.length > 0) {
        insights.push({
          id: 'coping-preference-1',
          type: 'preference',
          title: 'Preferred Coping Strategies',
          description: `You've shown preference for ${personalizationData.preferred_coping_strategies.slice(0, 2).join(' and ')} as coping mechanisms.`,
          confidence: 0.9,
          discovered_at: new Date().toISOString(),
          interaction_count: personalizationData.preferred_coping_strategies.length,
          examples: personalizationData.preferred_coping_strategies,
          suggested_actions: ['Practice these strategies regularly', 'Explore similar techniques']
        })
      }

      if (statusData && statusData.recent_mood_trend === 'improving') {
        insights.push({
          id: 'growth-trend-1',
          type: 'growth',
          title: 'Positive Mood Trend',
          description: 'Your recent interactions show an improving mood trend. This indicates positive progress in your emotional well-being journey.',
          confidence: 0.7,
          discovered_at: new Date().toISOString(),
          interaction_count: statusData.total_interactions,
          examples: ['Consistent positive responses', 'Reduced stress indicators', 'Increased engagement'],
          suggested_actions: ['Reflect on what\'s working well', 'Continue current practices']
        })
      }

      // Add a recommendation based on interaction patterns
      if (statusData && statusData.total_interactions > 10) {
        insights.push({
          id: 'recommendation-1',
          type: 'recommendation',
          title: 'Explore Deeper Conversations',
          description: 'Based on your engagement patterns, you might benefit from exploring more in-depth emotional topics during our conversations.',
          confidence: 0.6,
          discovered_at: new Date().toISOString(),
          interaction_count: statusData.total_interactions,
          examples: ['Share specific challenges', 'Discuss relationship patterns', 'Explore childhood influences'],
          suggested_actions: ['Try the full chat feature', 'Share more detailed experiences', 'Ask for specific guidance']
        })
      }

    } catch (error) {
      console.error('Error generating insights:', error)
    }

    return insights
  }

  const updateWidgetSettings = async (newSettings: Partial<WidgetSettings>) => {
    try {
      setError(null)
      const updatedSettings = { ...widgetSettings, ...newSettings }

      // Update local state immediately for better UX
      setWidgetSettings(updatedSettings)

      // Save to backend
      await makeApiCall('/users/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          widget_enabled: updatedSettings.enabled,
          micro_checkin_frequency: updatedSettings.checkInFrequency,
          crisis_contact_enabled: updatedSettings.crisisModeEnabled,
          theme: updatedSettings.theme
        })
      })

      // Trigger widget update event for the actual widget component
      window.dispatchEvent(new CustomEvent('widgetSettingsUpdated', {
        detail: updatedSettings
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      console.error('Error updating widget settings:', err)
      // Revert local state on error
      setWidgetSettings(widgetSettings)
    }
  }

  const sendQuickChat = async (message: string, urgencyLevel: string = 'normal') => {
    try {
      setError(null)
      const response = await makeApiCall('/inner-ally/quick-chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          urgency_level: urgencyLevel,
          emotional_state: null,
          context: null
        })
      })

      // Log the interaction
      await logWidgetInteraction('quick_chat', 'expanded')

      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('Error sending quick chat:', err)
      throw err
    }
  }

  const submitMicroCheckin = async (data: {
    trigger_type: string
    mood_rating?: number
    stress_level?: number
    user_response?: string
    location_context?: string
    emotional_context?: any
  }) => {
    try {
      setError(null)

      // Determine time context
      const currentHour = new Date().getHours()
      let time_context: string
      if (currentHour >= 5 && currentHour < 12) time_context = 'morning'
      else if (currentHour >= 12 && currentHour < 17) time_context = 'afternoon'
      else if (currentHour >= 17 && currentHour < 21) time_context = 'evening'
      else time_context = 'night'

      const response = await makeApiCall('/inner-ally/micro-checkin', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          time_context
        })
      })

      // Refresh status after check-in
      await refreshStatus()

      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in')
      console.error('Error submitting micro check-in:', err)
      throw err
    }
  }

  const logWidgetInteraction = async (type: string, state: string) => {
    try {
      // Log widget interactions for analytics
      await makeApiCall('/inner-ally/widget-interaction', {
        method: 'POST',
        body: JSON.stringify({
          interaction_type: type,
          widget_state: state,
          page_context: window.location.pathname
        })
      })
    } catch (err) {
      // Don't throw error for logging failures - fail silently
    }
  }

  const value: InnerAllyContextType = {
    status,
    personalization,
    insights,
    widgetSettings,
    isLoading,
    error,
    refreshStatus,
    refreshPersonalization,
    refreshInsights,
    updateWidgetSettings,
    sendQuickChat,
    submitMicroCheckin,
    logWidgetInteraction
  }

  return (
    <InnerAllyContext.Provider value={value}>
      {children}
    </InnerAllyContext.Provider>
  )
}

export const useInnerAlly = (): InnerAllyContextType => {
  const context = useContext(InnerAllyContext)
  if (context === undefined) {
    throw new Error('useInnerAlly must be used within an InnerAllyProvider')
  }
  return context
}

export default InnerAllyContext
