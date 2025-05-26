import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  TrendingUp,
  Heart,
  Sparkles,
  Calendar,
  ArrowRight,
  Smile,
  Frown,
  Meh
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { emotionAPI, analyticsAPI } from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [moodToday, setMoodToday] = useState('')
  const [recentEmotion, setRecentEmotion] = useState<any>(null)
  const [moodTrends, setMoodTrends] = useState<any>(null)
  const [dailyFocus, setDailyFocus] = useState<any>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [emotionAnalyses, trends, focus, progress] = await Promise.all([
          emotionAPI.getEmotionAnalyses(7),
          analyticsAPI.getMoodTrends(7),
          analyticsAPI.getDailyFocus(),
          analyticsAPI.getProgressMetrics('weekly')
        ])

        if (emotionAnalyses.length > 0) {
          setRecentEmotion(emotionAnalyses[0])
        }
        setMoodTrends(trends)
        setDailyFocus(focus)

        // Debug logging
        console.log('Weekly Progress Data:', progress)

        // Handle case where API returns "No data available" message
        if (progress && progress.message && progress.message.includes('No data available')) {
          // Fallback: try to get real data from conversations API
          try {
            const conversations = await chatAPI.getConversations()
            const weeklyConversations = conversations.filter((conv: any) => {
              const convDate = new Date(conv.created_at)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return convDate >= weekAgo
            })

            // Calculate basic mood from recent emotions if available
            let avgMood = 0.5
            if (emotionAnalyses.length > 0) {
              const sentimentScores = emotionAnalyses.map((e: any) => e.sentiment_score || 0)
              avgMood = sentimentScores.reduce((a: number, b: number) => a + b, 0) / sentimentScores.length
              // Convert from -1,1 range to 0,1 range
              avgMood = (avgMood + 1) / 2
            }

            const fallbackProgress = {
              engagement_metrics: {
                total_conversations: weeklyConversations.length,
                total_messages: 0
              },
              emotional_metrics: {
                average_mood_score: avgMood
              },
              therapeutic_metrics: {
                recommendations_completed: 0
              }
            }
            setWeeklyProgress(fallbackProgress)
          } catch (fallbackError) {
            console.error('Fallback calculation failed:', fallbackError)
            // Ultimate fallback with default values
            setWeeklyProgress({
              engagement_metrics: { total_conversations: 0, total_messages: 0 },
              emotional_metrics: { average_mood_score: 0.5 },
              therapeutic_metrics: { recommendations_completed: 0 }
            })
          }
        } else {
          setWeeklyProgress(progress)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleMoodSubmit = async () => {
    if (!moodToday) return

    try {
      await emotionAPI.submitMoodCheckin(moodToday)
      // Refresh data
      const emotionAnalyses = await emotionAPI.getEmotionAnalyses(7)
      if (emotionAnalyses.length > 0) {
        setRecentEmotion(emotionAnalyses[0])
      }
      setMoodToday('')
    } catch (error) {
      console.error('Error submitting mood:', error)
    }
  }

  const getDominantEmotion = (emotionData: any) => {
    if (!emotionData) return null

    const emotions = {
      joy: emotionData.joy || 0,
      sadness: emotionData.sadness || 0,
      anger: emotionData.anger || 0,
      fear: emotionData.fear || 0,
      surprise: emotionData.surprise || 0,
      disgust: emotionData.disgust || 0
    }

    return Object.entries(emotions).reduce((a, b) => emotions[a[0]] > emotions[b[0]] ? a : b)[0]
  }

  const getMoodIcon = (emotion: string) => {
    if (!emotion) return <Meh className="h-6 w-6 text-yellow-500" />

    const positiveEmotions = ['joy', 'happiness', 'love', 'optimism', 'surprise']
    const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust']

    const emotionLower = emotion.toLowerCase()
    if (positiveEmotions.some(e => emotionLower.includes(e))) {
      return <Smile className="h-6 w-6 text-green-500" />
    } else if (negativeEmotions.some(e => emotionLower.includes(e))) {
      return <Frown className="h-6 w-6 text-red-500" />
    }
    return <Meh className="h-6 w-6 text-yellow-500" />
  }

  const quickActions = [
    {
      title: 'Chat with AI',
      description: 'Talk to your empathetic AI companion',
      icon: MessageCircle,
      link: '/chat',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'View Analytics',
      description: 'Track your emotional journey',
      icon: TrendingUp,
      link: '/analytics',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Get Recommendations',
      description: 'Personalized wellness activities',
      icon: Sparkles,
      link: '/recommendations',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-calm-900 dark:text-calm-100 mb-2">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400">
            How are you feeling today? Let's check in on your emotional wellness.
          </p>
        </motion.div>

        {/* Mood Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex items-center mb-4">
            <Heart className="h-6 w-6 text-primary-500 mr-2" />
            <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100">Daily Mood Check-in</h2>
          </div>

          <div className="space-y-4">
            <textarea
              value={moodToday}
              onChange={(e) => setMoodToday(e.target.value)}
              placeholder="How are you feeling today? Share your thoughts..."
              className="input-field h-24 resize-none"
            />
            <button
              onClick={handleMoodSubmit}
              disabled={!moodToday.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Mood
            </button>
          </div>

          {recentEmotion && (
            <div className="mt-6 p-4 bg-calm-50 dark:bg-calm-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getMoodIcon(getDominantEmotion(recentEmotion) || '')}
                  <div className="ml-3">
                    <p className="font-medium text-calm-900 dark:text-calm-100">
                      Recent Emotion: {getDominantEmotion(recentEmotion) || 'Unknown'}
                    </p>
                    <p className="text-sm text-calm-600 dark:text-calm-400">
                      Confidence: {(recentEmotion.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-sm text-calm-500">
                  {new Date(recentEmotion.analyzed_at || recentEmotion.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-calm-900 dark:text-calm-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="card hover:shadow-xl transition-all duration-200"
              >
                <Link to={action.link} className="block">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-calm-600 dark:text-calm-400 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="card">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
                {dailyFocus?.focus_title || "Today's Focus"}
              </h3>
            </div>
            <p className="text-calm-600 dark:text-calm-400 mb-4">
              {dailyFocus?.focus_description || "Take a moment to practice mindfulness and connect with your inner self."}
            </p>
            {dailyFocus?.focus_activity && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  💡 Today's Activity: {dailyFocus.focus_activity}
                </p>
              </div>
            )}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-calm-800 dark:text-calm-200">
                "{dailyFocus?.focus_quote || "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh"}"
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">Weekly Progress</h3>
            </div>
            {weeklyProgress ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {weeklyProgress.engagement_metrics?.total_conversations || 0}
                    </p>
                    <p className="text-xs text-calm-600 dark:text-calm-400">Conversations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-600">
                      {Math.round((weeklyProgress.emotional_metrics?.average_mood_score || 0) * 10)}
                    </p>
                    <p className="text-xs text-calm-600 dark:text-calm-400">Avg Mood</p>
                  </div>
                </div>

                {moodTrends?.trend_analysis && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-calm-800 dark:text-calm-200">
                      📈 Mood trend: {moodTrends.trend_analysis.trend_type === 'improving' ? 'Improving' :
                                     moodTrends.trend_analysis.trend_type === 'declining' ? 'Needs attention' : 'Stable'}
                    </p>
                    {(weeklyProgress.therapeutic_metrics?.recommendations_completed || 0) > 0 && (
                      <p className="text-xs text-calm-600 dark:text-calm-400 mt-1">
                        ✅ {weeklyProgress.therapeutic_metrics?.recommendations_completed} recommendations completed
                      </p>
                    )}
                  </div>
                )}

                {(weeklyProgress.engagement_metrics?.total_conversations || 0) === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      🌱 Start your wellness journey by having your first conversation!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-calm-600 dark:text-calm-400">
                Start tracking your emotions to see your progress here.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
