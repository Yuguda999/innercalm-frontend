import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/api/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/api/auth/register', {
      email,
      username: email, // Use email as username for simplicity
      full_name: name,
      password,
    })
    return response.data
  },

  verifyToken: async (token: string) => {
    const response = await api.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, conversationId?: number) => {
    const response = await api.post('/api/chat', {
      message,
      conversation_id: conversationId
    })
    return response.data
  },

  getConversations: async () => {
    const response = await api.get('/api/chat/conversations')
    return response.data
  },

  getConversation: async (conversationId: number) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}`)
    return response.data
  },

  streamMessage: async (message: string, conversationId?: number, onChunk?: (chunk: any) => void) => {
    const response = await fetch(`${api.defaults.baseURL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No reader available')
    }

    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (onChunk) {
                onChunk(data)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },

  streamQuickChat: async (message: string, urgencyLevel: string = 'normal', onChunk?: (chunk: any) => void) => {
    const response = await fetch(`${api.defaults.baseURL}/api/inner-ally/quick-chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        message,
        urgency_level: urgencyLevel,
        emotional_state: null,
        context: null
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No reader available')
    }

    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (onChunk) {
                onChunk(data)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },
}

// Emotion API
export const emotionAPI = {
  getEmotionAnalyses: async (days?: number) => {
    const params = days ? `?days=${days}` : ''
    const response = await api.get(`/api/emotions/analysis${params}`)
    return response.data
  },

  getEmotionPatterns: async (days: number = 30) => {
    const response = await api.get(`/api/emotions/patterns?days=${days}`)
    return response.data
  },

  getEmotionTrends: async (period: string = 'weekly', days: number = 30) => {
    const response = await api.get(`/api/emotions/trends?period=${period}&days=${days}`)
    return response.data
  },

  // For mood check-in
  submitMoodCheckin: async (mood: string, notes?: string) => {
    // This will be handled through chat API with a special mood check-in message
    const message = notes ? `Daily mood check-in: ${mood}. ${notes}` : `Daily mood check-in: ${mood}`
    const response = await api.post('/api/chat', { message })
    return response.data
  },
}

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async (completed?: boolean) => {
    const params = completed !== undefined ? `?completed=${completed}` : ''
    const response = await api.get(`/api/recommendations${params}`)
    return response.data
  },

  generateRecommendations: async (limit: number = 3) => {
    const response = await api.post(`/api/recommendations/generate?limit=${limit}`)
    return response.data
  },

  getRecommendation: async (recommendationId: number) => {
    const response = await api.get(`/api/recommendations/${recommendationId}`)
    return response.data
  },

  updateRecommendation: async (recommendationId: number, updateData: any) => {
    const response = await api.patch(`/api/recommendations/${recommendationId}`, updateData)
    return response.data
  },

  markAsCompleted: async (recommendationId: number, rating?: number) => {
    const updateData: any = { is_completed: true }
    if (rating) {
      updateData.effectiveness_rating = rating
    }
    const response = await api.patch(`/api/recommendations/${recommendationId}`, updateData)
    return response.data
  },

  getSummary: async () => {
    const response = await api.get('/api/recommendations/summary/stats')
    return response.data
  },
}

// Analytics API
export const analyticsAPI = {
  getDashboard: async (daysBack: number = 30) => {
    const response = await api.get(`/api/analytics/dashboard?days_back=${daysBack}`)
    return response.data
  },

  getMoodTrends: async (daysBack: number = 30) => {
    const response = await api.get(`/api/analytics/mood-trends?days_back=${daysBack}`)
    return response.data
  },

  getProgressMetrics: async (periodType: string = 'weekly') => {
    const response = await api.get(`/api/analytics/progress-metrics?period_type=${periodType}`)
    return response.data
  },

  getInsights: async (insightType?: string, limit: number = 10) => {
    const params = new URLSearchParams()
    if (insightType) params.append('insight_type', insightType)
    params.append('limit', limit.toString())
    const response = await api.get(`/api/analytics/insights?${params}`)
    return response.data
  },

  acknowledgeInsight: async (insightId: number, feedback?: string) => {
    const response = await api.post(`/api/analytics/insights/${insightId}/acknowledge`, { feedback })
    return response.data
  },

  getDailyFocus: async () => {
    const response = await api.get('/api/analytics/daily-focus')
    return response.data
  },
}

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile')
    return response.data
  },

  updateProfile: async (profileData: any) => {
    const response = await api.patch('/api/users/profile', profileData)
    return response.data
  },

  changePassword: async (passwordData: any) => {
    const response = await api.post('/api/users/change-password', passwordData)
    return response.data
  },

  getPreferences: async () => {
    const response = await api.get('/api/users/preferences')
    return response.data
  },

  updatePreferences: async (preferencesData: any) => {
    const response = await api.patch('/api/users/preferences', preferencesData)
    return response.data
  },

  getDashboard: async () => {
    const response = await api.get('/api/users/dashboard')
    return response.data
  },

  deleteProfile: async () => {
    const response = await api.delete('/api/users/profile')
    return response.data
  },
}

// Trauma Mapping API
export const traumaMappingAPI = {
  // Life Events
  getLifeEvents: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    const response = await api.get(`/api/trauma-mapping/life-events?${params}`)
    return response.data
  },

  getLifeEvent: async (eventId: number) => {
    const response = await api.get(`/api/trauma-mapping/life-events/${eventId}`)
    return response.data
  },

  createLifeEvent: async (eventData: any) => {
    const response = await api.post('/api/trauma-mapping/life-events', eventData)
    return response.data
  },

  updateLifeEvent: async (eventId: number, eventData: any) => {
    const response = await api.put(`/api/trauma-mapping/life-events/${eventId}`, eventData)
    return response.data
  },

  deleteLifeEvent: async (eventId: number) => {
    const response = await api.delete(`/api/trauma-mapping/life-events/${eventId}`)
    return response.data
  },

  // Timeline Analysis
  getTimelineAnalysis: async () => {
    const response = await api.get('/api/trauma-mapping/timeline-analysis')
    return response.data
  },

  // Trauma Mappings
  getTraumaMappings: async (lifeEventId?: number) => {
    const params = lifeEventId ? `?life_event_id=${lifeEventId}` : ''
    const response = await api.get(`/api/trauma-mapping/trauma-mappings${params}`)
    return response.data
  },

  createTraumaMapping: async (mappingData: any) => {
    const response = await api.post('/api/trauma-mapping/trauma-mappings', mappingData)
    return response.data
  },

  // Reframe Sessions
  getReframeSessions: async (status?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (status) params.append('status_filter', status)
    if (limit) params.append('limit', limit.toString())
    const response = await api.get(`/api/trauma-mapping/reframe-sessions?${params}`)
    return response.data
  },

  getReframeSession: async (sessionId: number) => {
    const response = await api.get(`/api/trauma-mapping/reframe-sessions/${sessionId}`)
    return response.data
  },

  createReframeSession: async (sessionData: any) => {
    const response = await api.post('/api/trauma-mapping/reframe-sessions', sessionData)
    return response.data
  },

  updateReframeSession: async (sessionId: number, sessionData: any) => {
    const response = await api.put(`/api/trauma-mapping/reframe-sessions/${sessionId}`, sessionData)
    return response.data
  },

  startGuidedSession: async (sessionId: number) => {
    const response = await api.post(`/api/trauma-mapping/reframe-sessions/${sessionId}/guided-session`)
    return response.data
  },

  processSessionResponse: async (sessionId: number, responseData: any) => {
    const response = await api.post(`/api/trauma-mapping/reframe-sessions/${sessionId}/process-response`, responseData)
    return response.data
  },

  completeReframeSession: async (sessionId: number) => {
    const response = await api.post(`/api/trauma-mapping/reframe-sessions/${sessionId}/complete`)
    return response.data
  }
}

// Inner Ally API
export const innerAllyAPI = {
  getStatus: () => api.get('/api/inner-ally/status'),
  quickChat: (data: any) => api.post('/api/inner-ally/quick-chat', data),
  getPersonaPreview: (persona: string) => api.get(`/api/inner-ally/persona-preview/${persona}`),
  updatePersonaCustomization: (data: any) => api.patch('/api/inner-ally/persona-customization', data),
  getPersonalizationSummary: () => api.get('/api/inner-ally/personalization-summary'),
  createMicroCheckIn: (data: any) => api.post('/api/inner-ally/micro-checkins', data),
  getMicroCheckIns: () => api.get('/api/inner-ally/micro-checkins'),
  createWidgetInteraction: (data: any) => api.post('/api/inner-ally/widget-interactions', data),
  getWidgetInteractions: () => api.get('/api/inner-ally/widget-interactions'),
}

// Professional Bridge API
export const professionalBridgeAPI = {
  // Therapist Matching
  findMatches: async (preferences: any) => {
    const response = await api.post('/api/professional-bridge/find-matches', preferences)
    return response.data
  },
  getMatches: async () => {
    const response = await api.get('/api/professional-bridge/matches')
    return response.data
  },
  markMatchViewed: async (matchId: number) => {
    const response = await api.patch(`/api/professional-bridge/matches/${matchId}/view`)
    return response.data
  },
  markMatchContacted: async (matchId: number) => {
    const response = await api.patch(`/api/professional-bridge/matches/${matchId}/contact`)
    return response.data
  },

  // Therapist Search
  searchTherapists: async (filters: any) => {
    const response = await api.get('/api/professional-bridge/therapists', { params: filters })
    return response.data
  },
  getTherapistProfile: async (therapistId: number) => {
    const response = await api.get(`/api/professional-bridge/therapists/${therapistId}`)
    return response.data
  },

  // Appointments
  createAppointment: async (data: any) => {
    const response = await api.post('/api/professional-bridge/appointments', data)
    return response.data
  },
  getAppointments: async (status?: string) => {
    const response = await api.get('/api/professional-bridge/appointments', { params: { status } })
    return response.data
  },
  getAppointment: async (appointmentId: number) => {
    const response = await api.get(`/api/professional-bridge/appointments/${appointmentId}`)
    return response.data
  },
  updateAppointment: async (appointmentId: number, data: any) => {
    const response = await api.patch(`/api/professional-bridge/appointments/${appointmentId}`, data)
    return response.data
  },

  // Practice Plans
  createPracticePlan: async (data: any) => {
    const response = await api.post('/api/professional-bridge/practice-plans', data)
    return response.data
  },
  generatePracticePlan: async (appointmentId: number) => {
    const response = await api.post(`/api/professional-bridge/appointments/${appointmentId}/generate-practice-plan`)
    return response.data
  },
  getPracticePlans: async (status?: string) => {
    const response = await api.get('/api/professional-bridge/practice-plans', { params: { status } })
    return response.data
  },
  getPracticePlan: async (planId: number) => {
    const response = await api.get(`/api/professional-bridge/practice-plans/${planId}`)
    return response.data
  },
  updatePracticePlan: async (planId: number, data: any) => {
    const response = await api.patch(`/api/professional-bridge/practice-plans/${planId}`, data)
    return response.data
  },
}

// Voice Journal API
export const voiceJournalAPI = {
  // Sessions
  createSession: async (sessionData: any) => {
    const response = await api.post('/api/voice-journal/sessions', sessionData)
    return response.data
  },
  getSessions: async (limit?: number, offset?: number, statusFilter?: string) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    if (statusFilter) params.append('status_filter', statusFilter)
    const response = await api.get(`/api/voice-journal/sessions?${params}`)
    return response.data
  },
  getSession: async (sessionId: number) => {
    const response = await api.get(`/api/voice-journal/sessions/${sessionId}`)
    return response.data
  },
  updateSession: async (sessionId: number, updateData: any) => {
    const response = await api.put(`/api/voice-journal/sessions/${sessionId}`, updateData)
    return response.data
  },
  deleteSession: async (sessionId: number) => {
    const response = await api.delete(`/api/voice-journal/sessions/${sessionId}`)
    return response.data
  },

  // Audio Upload
  uploadAudio: async (sessionId: number, audioFile: File) => {
    const formData = new FormData()
    formData.append('audio_file', audioFile)
    const response = await api.post(`/api/voice-journal/sessions/${sessionId}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Entries
  getSessionEntries: async (sessionId: number) => {
    const response = await api.get(`/api/voice-journal/sessions/${sessionId}/entries`)
    return response.data
  },

  // Real-time Sentiment
  updateRealTimeSentiment: async (sessionId: number, sentimentData: any) => {
    const response = await api.post(`/api/voice-journal/sessions/${sessionId}/real-time-sentiment`, sentimentData)
    return response.data
  },

  // Breathing Exercises
  createBreathingExercise: async (exerciseData: any) => {
    const response = await api.post('/api/voice-journal/breathing-exercises', exerciseData)
    return response.data
  },
  getBreathingExercises: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    const response = await api.get(`/api/voice-journal/breathing-exercises?${params}`)
    return response.data
  },
  updateBreathingExercise: async (sessionId: number, updateData: any) => {
    const response = await api.put(`/api/voice-journal/breathing-exercises/${sessionId}`, updateData)
    return response.data
  },

  // Analytics
  getAnalytics: async (days?: number) => {
    const params = days ? `?days=${days}` : ''
    const response = await api.get(`/api/voice-journal/analytics${params}`)
    return response.data
  },
}

// Emotion Art API
export const emotionArtAPI = {
  // Art Generation
  generateArt: async (generationData: any) => {
    const response = await api.post('/api/emotion-art/generate', generationData)
    return response.data
  },
  getArtworks: async (limit?: number, offset?: number, styleFilter?: string, statusFilter?: string) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    if (styleFilter) params.append('style_filter', styleFilter)
    if (statusFilter) params.append('status_filter', statusFilter)
    const response = await api.get(`/api/emotion-art/artworks?${params}`)
    return response.data
  },
  getArtwork: async (artworkId: number) => {
    const response = await api.get(`/api/emotion-art/artworks/${artworkId}`)
    return response.data
  },
  updateArtwork: async (artworkId: number, updateData: any) => {
    const response = await api.put(`/api/emotion-art/artworks/${artworkId}`, updateData)
    return response.data
  },
  deleteArtwork: async (artworkId: number) => {
    const response = await api.delete(`/api/emotion-art/artworks/${artworkId}`)
    return response.data
  },

  // Customization
  customizeArtwork: async (artworkId: number, customizationData: any) => {
    const response = await api.post(`/api/emotion-art/artworks/${artworkId}/customize`, customizationData)
    return response.data
  },
  getArtworkCustomizations: async (artworkId: number) => {
    const response = await api.get(`/api/emotion-art/artworks/${artworkId}/customizations`)
    return response.data
  },

  // Galleries
  createGallery: async (galleryData: any) => {
    const response = await api.post('/api/emotion-art/galleries', galleryData)
    return response.data
  },
  getGalleries: async (includePublic?: boolean) => {
    const params = includePublic ? '?include_public=true' : ''
    const response = await api.get(`/api/emotion-art/galleries${params}`)
    return response.data
  },
  getGallery: async (galleryId: number) => {
    const response = await api.get(`/api/emotion-art/galleries/${galleryId}`)
    return response.data
  },
  updateGallery: async (galleryId: number, updateData: any) => {
    const response = await api.put(`/api/emotion-art/galleries/${galleryId}`, updateData)
    return response.data
  },

  // Sharing
  shareArtwork: async (artworkId: number, shareData: any) => {
    const response = await api.post(`/api/emotion-art/artworks/${artworkId}/share`, shareData)
    return response.data
  },
  getSharedArtworks: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    const response = await api.get(`/api/emotion-art/shared-artworks?${params}`)
    return response.data
  },

  // Analytics
  getAnalytics: async (days?: number) => {
    const params = days ? `?days=${days}` : ''
    const response = await api.get(`/api/emotion-art/analytics${params}`)
    return response.data
  },
}

export default api
