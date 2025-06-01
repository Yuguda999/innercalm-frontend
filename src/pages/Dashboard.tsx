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
  Meh,
  Mic,
  Palette,
  Users,
  Brain,
  BarChart3,
  Plus,
  Target,
  Activity,
  Zap,
  Award,
  Clock,
  CheckCircle,
  Star
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

  const quickActions = [
    {
      name: 'Inner Ally Chat',
      path: '/chat',
      icon: Brain,
      gradient: 'from-wellness-400 to-serenity-500',
      description: 'Talk with your AI companion',
      bgColor: 'bg-wellness-50/50 dark:bg-wellness-900/20'
    },
    {
      name: 'Voice Journal',
      path: '/voice-journal',
      icon: Mic,
      gradient: 'from-serenity-400 to-accent-500',
      description: 'Record your thoughts',
      bgColor: 'bg-serenity-50/50 dark:bg-serenity-900/20'
    },
    {
      name: 'Emotion Art',
      path: '/emotion-art',
      icon: Palette,
      gradient: 'from-accent-400 to-warmth-500',
      description: 'Express through art',
      bgColor: 'bg-accent-50/50 dark:bg-accent-900/20'
    },
    {
      name: 'Community',
      path: '/community',
      icon: Users,
      gradient: 'from-warmth-400 to-wellness-500',
      description: 'Connect with others',
      bgColor: 'bg-warmth-50/50 dark:bg-warmth-900/20'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-6"
        >
          <div className="flex items-center mb-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg mr-4"
            >
              <Heart className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent mb-1">
                Welcome back, {user?.full_name || user?.username}!
              </h1>
              <p className="text-base md:text-lg text-calm-600 dark:text-calm-300 leading-relaxed">
                How are you feeling today? Let's check in on your emotional wellness.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-serenity-800 dark:text-serenity-300">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  to={action.path}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className={`${action.bgColor} backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`bg-gradient-to-r ${action.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-calm-900 dark:text-calm-100 text-base mb-2">
                      {action.name}
                    </h3>
                    <p className="text-sm text-calm-600 dark:text-calm-400 leading-relaxed">
                      {action.description}
                    </p>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Mood Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-wellness-800 dark:text-wellness-300">Daily Mood Check-in</h2>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={moodToday}
                onChange={(e) => setMoodToday(e.target.value)}
                placeholder="How are you feeling today? Share your thoughts..."
                className="w-full h-24 md:h-28 p-4 bg-wellness-50/50 dark:bg-wellness-900/20 border border-wellness-200/50 dark:border-wellness-700/50 rounded-2xl resize-none text-wellness-800 dark:text-wellness-200 placeholder-wellness-500 dark:placeholder-wellness-400 focus:outline-none focus:ring-2 focus:ring-wellness-400 dark:focus:ring-wellness-500 focus:border-transparent transition-all duration-200"
                rows={3}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMoodSubmit}
              disabled={!moodToday.trim()}
              className="bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Submit Mood
            </motion.button>
          </div>

          {recentEmotion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 bg-serenity-50/50 dark:bg-serenity-900/20 border border-serenity-200/50 dark:border-serenity-700/50 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                    {getMoodIcon(getDominantEmotion(recentEmotion) || '')}
                  </div>
                  <div>
                    <p className="font-medium text-serenity-800 dark:text-serenity-300 mb-1">
                      Recent Emotion: {getDominantEmotion(recentEmotion) || 'Unknown'}
                    </p>
                    <p className="text-sm text-serenity-600 dark:text-serenity-400">
                      Confidence: {(recentEmotion.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-sm text-serenity-500 dark:text-serenity-400 bg-serenity-100/70 dark:bg-serenity-900/30 px-3 py-1 rounded-xl">
                  {new Date(recentEmotion.analyzed_at || recentEmotion.timestamp).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>



        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-300">
                {dailyFocus?.focus_title || "Today's Focus"}
              </h3>
            </div>
            <p className="text-accent-700 dark:text-accent-300 mb-6 leading-relaxed">
              {dailyFocus?.focus_description || "Take a moment to practice mindfulness and connect with your inner self."}
            </p>
            {dailyFocus?.focus_activity && (
              <div className="mb-6 p-4 bg-accent-50/50 dark:bg-accent-900/20 border border-accent-200/50 dark:border-accent-700/50 rounded-2xl">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-accent-800 dark:text-accent-200">
                    Today's Activity: {dailyFocus.focus_activity}
                  </p>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-accent-50/50 to-warmth-50/50 dark:from-accent-900/20 dark:to-warmth-900/20 p-4 rounded-2xl border border-accent-200/30 dark:border-accent-700/30">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3 mt-1">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-accent-800 dark:text-accent-200 italic leading-relaxed">
                  "{dailyFocus?.focus_quote || "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh"}"
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-serenity-400 to-wellness-400 p-2 rounded-xl mr-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-serenity-800 dark:text-serenity-300">Weekly Progress</h3>
            </div>
            {weeklyProgress ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-serenity-50/50 dark:bg-serenity-900/20 p-4 rounded-2xl border border-serenity-200/50 dark:border-serenity-700/50">
                    <div className="flex items-center justify-center mb-2">
                      <div className="bg-gradient-to-br from-serenity-400 to-wellness-400 p-2 rounded-xl mr-2">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-serenity-700 dark:text-serenity-400 mb-1">
                      {weeklyProgress.engagement_metrics?.total_conversations || 0}
                    </p>
                    <p className="text-sm text-serenity-600 dark:text-serenity-400 font-medium">Conversations</p>
                  </div>
                  <div className="text-center bg-wellness-50/50 dark:bg-wellness-900/20 p-4 rounded-2xl border border-wellness-200/50 dark:border-wellness-700/50">
                    <div className="flex items-center justify-center mb-2">
                      <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-2">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-wellness-700 dark:text-wellness-400 mb-1">
                      {Math.round((weeklyProgress.emotional_metrics?.average_mood_score || 0) * 10)}
                    </p>
                    <p className="text-sm text-wellness-600 dark:text-wellness-400 font-medium">Avg Mood</p>
                  </div>
                </div>

                {moodTrends?.trend_analysis && (
                  <div className="bg-gradient-to-r from-wellness-50/50 to-serenity-50/50 dark:from-wellness-900/20 dark:to-serenity-900/20 p-4 rounded-2xl border border-wellness-200/30 dark:border-wellness-700/30">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-wellness-800 dark:text-wellness-200 mb-1">
                          Mood trend: {moodTrends.trend_analysis.trend_type === 'improving' ? 'Improving' :
                                       moodTrends.trend_analysis.trend_type === 'declining' ? 'Needs attention' : 'Stable'}
                        </p>
                        {(weeklyProgress.therapeutic_metrics?.recommendations_completed || 0) > 0 && (
                          <p className="text-sm text-wellness-600 dark:text-wellness-400">
                            {weeklyProgress.therapeutic_metrics?.recommendations_completed} recommendations completed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(weeklyProgress.engagement_metrics?.total_conversations || 0) === 0 && (
                  <div className="bg-serenity-50/50 dark:bg-serenity-900/20 p-4 rounded-2xl border border-serenity-200/50 dark:border-serenity-700/50">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-serenity-800 dark:text-serenity-200">
                        Start your wellness journey by having your first conversation!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-serenity-400 to-wellness-400 p-4 rounded-2xl mx-auto mb-4 w-fit">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <p className="text-serenity-700 dark:text-serenity-300 leading-relaxed">
                  Start tracking your emotions to see your progress here.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analytics Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="mt-8 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/analytics"
              className="group inline-flex items-center bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span>View Detailed Analytics</span>
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
