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

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', {
      email,
      username: email, // Use email as username for simplicity
      full_name: name,
      password,
    })
    return response.data
  },

  verifyToken: async (token: string) => {
    const response = await api.get('/auth/me', {
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
    const response = await api.post('/chat', {
      message,
      conversation_id: conversationId
    })
    return response.data
  },

  getConversations: async () => {
    const response = await api.get('/chat/conversations')
    return response.data
  },

  getConversation: async (conversationId: number) => {
    const response = await api.get(`/chat/conversations/${conversationId}`)
    return response.data
  },

  streamMessage: async (message: string, conversationId?: number, onChunk?: (chunk: any) => void) => {
    const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
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
}

// Emotion API
export const emotionAPI = {
  getEmotionAnalyses: async (days?: number) => {
    const params = days ? `?days=${days}` : ''
    const response = await api.get(`/emotions/analysis${params}`)
    return response.data
  },

  getEmotionPatterns: async (days: number = 30) => {
    const response = await api.get(`/emotions/patterns?days=${days}`)
    return response.data
  },

  getEmotionTrends: async (period: string = 'weekly', days: number = 30) => {
    const response = await api.get(`/emotions/trends?period=${period}&days=${days}`)
    return response.data
  },

  // For mood check-in
  submitMoodCheckin: async (mood: string, notes?: string) => {
    // This will be handled through chat API with a special mood check-in message
    const message = notes ? `Daily mood check-in: ${mood}. ${notes}` : `Daily mood check-in: ${mood}`
    const response = await api.post('/chat', { message })
    return response.data
  },
}

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async (completed?: boolean) => {
    const params = completed !== undefined ? `?completed=${completed}` : ''
    const response = await api.get(`/recommendations${params}`)
    return response.data
  },

  generateRecommendations: async (limit: number = 3) => {
    const response = await api.post(`/recommendations/generate?limit=${limit}`)
    return response.data
  },

  getRecommendation: async (recommendationId: number) => {
    const response = await api.get(`/recommendations/${recommendationId}`)
    return response.data
  },

  updateRecommendation: async (recommendationId: number, updateData: any) => {
    const response = await api.patch(`/recommendations/${recommendationId}`, updateData)
    return response.data
  },

  markAsCompleted: async (recommendationId: number, rating?: number) => {
    const updateData: any = { is_completed: true }
    if (rating) {
      updateData.effectiveness_rating = rating
    }
    const response = await api.patch(`/recommendations/${recommendationId}`, updateData)
    return response.data
  },

  getSummary: async () => {
    const response = await api.get('/recommendations/summary/stats')
    return response.data
  },
}

// Analytics API
export const analyticsAPI = {
  getDashboard: async (daysBack: number = 30) => {
    const response = await api.get(`/analytics/dashboard?days_back=${daysBack}`)
    return response.data
  },

  getMoodTrends: async (daysBack: number = 30) => {
    const response = await api.get(`/analytics/mood-trends?days_back=${daysBack}`)
    return response.data
  },

  getProgressMetrics: async (periodType: string = 'weekly') => {
    const response = await api.get(`/analytics/progress-metrics?period_type=${periodType}`)
    return response.data
  },

  getInsights: async (insightType?: string, limit: number = 10) => {
    const params = new URLSearchParams()
    if (insightType) params.append('insight_type', insightType)
    params.append('limit', limit.toString())
    const response = await api.get(`/analytics/insights?${params}`)
    return response.data
  },

  acknowledgeInsight: async (insightId: number, feedback?: string) => {
    const response = await api.post(`/analytics/insights/${insightId}/acknowledge`, { feedback })
    return response.data
  },

  getDailyFocus: async () => {
    const response = await api.get('/analytics/daily-focus')
    return response.data
  },
}

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  updateProfile: async (profileData: any) => {
    const response = await api.patch('/users/profile', profileData)
    return response.data
  },

  changePassword: async (passwordData: any) => {
    const response = await api.post('/users/change-password', passwordData)
    return response.data
  },

  getPreferences: async () => {
    const response = await api.get('/users/preferences')
    return response.data
  },

  updatePreferences: async (preferencesData: any) => {
    const response = await api.patch('/users/preferences', preferencesData)
    return response.data
  },

  getDashboard: async () => {
    const response = await api.get('/users/dashboard')
    return response.data
  },

  deleteProfile: async () => {
    const response = await api.delete('/users/profile')
    return response.data
  },
}

export default api
