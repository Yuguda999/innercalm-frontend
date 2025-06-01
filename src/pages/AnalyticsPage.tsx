import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Smile,
  Frown,
  Meh,
  Heart,
  Award,
  Sparkles,
  Activity,
  Brain
} from 'lucide-react'
import { analyticsAPI } from '../services/api'

const AnalyticsPage = () => {
  const [moodTrends, setMoodTrends] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const daysBack = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90

        const [dashboardData, trendsData, progressData] = await Promise.all([
          analyticsAPI.getDashboard(daysBack),
          analyticsAPI.getMoodTrends(daysBack),
          analyticsAPI.getProgressMetrics('weekly')
        ])

        // Process trends data for chart display
        if (trendsData.trend_analysis) {
          setMoodTrends({
            trend_type: trendsData.trend_analysis.trend_type,
            trend_strength: trendsData.trend_analysis.trend_strength,
            dominant_emotion: trendsData.trend_analysis.dominant_emotion,
            average_sentiment: trendsData.trend_analysis.average_sentiment,
            emotion_stability: trendsData.trend_analysis.emotion_stability
          })
        }

        // Process progress data
        if (progressData.progress_indicators) {
          setProgress({
            totalSessions: dashboardData.progress_metrics?.therapeutic_engagement || 0,
            averageMood: (dashboardData.mood_trend?.average_sentiment || 0) * 10, // Convert to 0-10 scale
            streakDays: dashboardData.progress_metrics?.streak_days || 0,
            completedRecommendations: progressData.therapeutic_metrics?.recommendations_completed || 0,
            improvementScore: Math.round((progressData.progress_indicators?.overall_progress_score || 0) * 100)
          })
        } else {
          // Fallback to dashboard data
          setProgress({
            totalSessions: dashboardData.progress_metrics?.therapeutic_engagement || 0,
            averageMood: (dashboardData.mood_trend?.average_sentiment || 0) * 10,
            streakDays: dashboardData.progress_metrics?.streak_days || 0,
            completedRecommendations: dashboardData.progress_metrics?.recommendations_completed || 0,
            improvementScore: Math.round((dashboardData.progress_metrics?.overall_progress_score || 0) * 100)
          })
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        // Set empty state on error - no fake data
        setMoodTrends(null)
        setProgress(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedPeriod])

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' }
  ]

  const getMoodIcon = (score: number) => {
    if (score >= 7) return <Smile className="h-6 w-6 text-wellness-500 dark:text-wellness-400" />
    if (score >= 4) return <Meh className="h-6 w-6 text-warmth-500 dark:text-warmth-400" />
    return <Frown className="h-6 w-6 text-accent-500 dark:text-accent-400" />
  }

  const getMoodColor = (score: number) => {
    if (score >= 7) return 'bg-gradient-to-br from-wellness-400 to-serenity-500'
    if (score >= 4) return 'bg-gradient-to-br from-warmth-400 to-accent-500'
    return 'bg-gradient-to-br from-accent-400 to-warmth-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-wellness-200/30 dark:border-wellness-700/30 border-t-wellness-500 rounded-full mx-auto mb-4"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-wellness-600 dark:text-wellness-400 font-medium"
          >
            Analyzing your wellness journey...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Show message if no data is available
  if (!progress && !moodTrends) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg mr-3"
              >
                <BarChart3 className="h-6 w-6 text-white" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
                Your Wellness Analytics
              </h1>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-8 max-w-md mx-auto shadow-xl"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-4 rounded-2xl mx-auto mb-6 w-fit"
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-lg text-wellness-800 dark:text-wellness-300 mb-4 font-medium">
                Your wellness journey awaits
              </p>
              <p className="text-calm-600 dark:text-calm-400 leading-relaxed">
                Start conversations and track your emotions to unlock personalized insights about your mental wellness.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 pt-6"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg mr-3"
            >
              <BarChart3 className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
              Your Wellness Analytics
            </h1>
          </div>
          <p className="text-base md:text-lg text-calm-600 dark:text-calm-300 max-w-2xl mx-auto leading-relaxed">
            Track your emotional journey and see how you're progressing towards better mental health.
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-wellness-200/30 dark:border-calm-700/30">
              {periods.map((period) => (
                <motion.button
                  key={period.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-target ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white shadow-lg'
                      : 'text-calm-600 dark:text-calm-400 hover:text-wellness-600 dark:hover:text-wellness-400'
                  }`}
                >
                  {period.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-wellness-800 dark:text-wellness-300 mb-1">
              {progress?.totalSessions || 0}
            </h3>
            <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Total Sessions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-serenity-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${getMoodColor(progress?.averageMood || 0)}`}>
              {getMoodIcon(progress?.averageMood || 0)}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-serenity-800 dark:text-serenity-300 mb-1">
              {progress?.averageMood?.toFixed(1) || '0.0'}
            </h3>
            <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Average Mood</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-warmth-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-accent-800 dark:text-accent-300 mb-1">
              {progress?.streakDays || 0}
            </h3>
            <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Day Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-warmth-400 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-warmth-800 dark:text-warmth-300 mb-1">
              {progress?.completedRecommendations || 0}
            </h3>
            <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Completed Activities</p>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Mood Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-wellness-800 dark:text-wellness-300">Mood Trends</h3>
            </div>

            <div className="space-y-6">
              {moodTrends ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-wellness-800 dark:text-wellness-300 mb-2">
                      {moodTrends.dominant_emotion?.charAt(0).toUpperCase() + moodTrends.dominant_emotion?.slice(1) || 'Neutral'}
                    </div>
                    <p className="text-calm-600 dark:text-calm-400">Dominant Emotion</p>
                  </motion.div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex justify-between items-center p-3 bg-wellness-50/50 dark:bg-wellness-900/20 rounded-2xl"
                    >
                      <span className="text-wellness-700 dark:text-wellness-400 font-medium">Trend Direction</span>
                      <span className={`font-semibold capitalize px-3 py-1 rounded-full text-sm ${
                        moodTrends.trend_type === 'improving' ? 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300' :
                        moodTrends.trend_type === 'declining' ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300' :
                        'bg-warmth-100 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300'
                      }`}>
                        {moodTrends.trend_type || 'Stable'}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-between items-center p-3 bg-serenity-50/50 dark:bg-serenity-900/20 rounded-2xl"
                    >
                      <span className="text-serenity-700 dark:text-serenity-400 font-medium">Emotional Stability</span>
                      <div className="flex items-center">
                        <div className="w-24 h-3 bg-serenity-200/50 dark:bg-serenity-800/30 rounded-full mr-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(moodTrends.emotion_stability || 0) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-3 bg-gradient-to-r from-serenity-400 to-wellness-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium text-serenity-800 dark:text-serenity-300">
                          {Math.round((moodTrends.emotion_stability || 0) * 100)}%
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-between items-center p-3 bg-accent-50/50 dark:bg-accent-900/20 rounded-2xl"
                    >
                      <span className="text-accent-700 dark:text-accent-400 font-medium">Average Sentiment</span>
                      <div className="flex items-center">
                        <div className="w-24 h-3 bg-accent-200/50 dark:bg-accent-800/30 rounded-full mr-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((moodTrends.average_sentiment || 0) + 1) * 50}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-3 bg-gradient-to-r from-accent-400 to-warmth-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium text-accent-800 dark:text-accent-300">
                          {((moodTrends.average_sentiment || 0) * 10).toFixed(1)}/10
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                  >
                    <Activity className="h-8 w-8 text-white" />
                  </motion.div>
                  <p className="text-calm-500 dark:text-calm-400">No mood data available yet. Start tracking your emotions to see trends!</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-wellness-200/30 dark:border-calm-700/30">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-wellness-400 to-serenity-500 rounded-full mr-2" />
                <span className="text-sm text-calm-600 dark:text-calm-400">Positive</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-warmth-400 to-accent-500 rounded-full mr-2" />
                <span className="text-sm text-calm-600 dark:text-calm-400">Neutral</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-accent-400 to-warmth-500 rounded-full mr-2" />
                <span className="text-sm text-calm-600 dark:text-calm-400">Negative</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-300">Wellness Score</h3>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="rgb(var(--calm-200))"
                    strokeWidth="8"
                    fill="none"
                    className="dark:stroke-calm-700"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="url(#wellnessGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 314" }}
                    animate={{ strokeDasharray: `${(progress?.improvementScore || 0) * 3.14} 314` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(var(--accent-400))" />
                      <stop offset="100%" stopColor="rgb(var(--warmth-500))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-3xl font-bold text-accent-800 dark:text-accent-300"
                  >
                    {progress?.improvementScore || 0}%
                  </motion.span>
                </div>
              </div>
              <p className="text-calm-600 dark:text-calm-400 mt-2">Overall Improvement</p>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-between items-center p-3 bg-accent-50/50 dark:bg-accent-900/20 rounded-2xl"
              >
                <span className="text-accent-700 dark:text-accent-400 font-medium">Consistency</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  progress?.improvementScore >= 80 ? 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300' :
                  progress?.improvementScore >= 60 ? 'bg-serenity-100 text-serenity-800 dark:bg-serenity-900/30 dark:text-serenity-300' :
                  progress?.improvementScore >= 40 ? 'bg-warmth-100 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300' :
                  'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
                }`}>
                  {progress?.improvementScore >= 80 ? 'Excellent' :
                   progress?.improvementScore >= 60 ? 'Good' :
                   progress?.improvementScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex justify-between items-center p-3 bg-warmth-50/50 dark:bg-warmth-900/20 rounded-2xl"
              >
                <span className="text-warmth-700 dark:text-warmth-400 font-medium">Engagement</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  progress?.totalSessions >= 10 ? 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300' :
                  progress?.totalSessions >= 5 ? 'bg-serenity-100 text-serenity-800 dark:bg-serenity-900/30 dark:text-serenity-300' :
                  'bg-warmth-100 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300'
                }`}>
                  {progress?.totalSessions >= 10 ? 'High' :
                   progress?.totalSessions >= 5 ? 'Medium' : 'Low'}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-between items-center p-3 bg-serenity-50/50 dark:bg-serenity-900/20 rounded-2xl"
              >
                <span className="text-serenity-700 dark:text-serenity-400 font-medium">Progress Rate</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  moodTrends?.trend_type === 'improving' ? 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300' :
                  moodTrends?.trend_type === 'declining' ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300' :
                  'bg-serenity-100 text-serenity-800 dark:bg-serenity-900/30 dark:text-serenity-300'
                }`}>
                  {moodTrends?.trend_type === 'improving' ? 'Improving' :
                   moodTrends?.trend_type === 'declining' ? 'Declining' : 'Steady'}
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 p-4 bg-gradient-to-r from-wellness-50/70 to-serenity-50/70 dark:from-wellness-900/20 dark:to-serenity-900/20 backdrop-blur-sm border border-wellness-200/30 dark:border-wellness-700/30 rounded-2xl"
            >
              <p className="text-sm text-wellness-800 dark:text-wellness-300 font-medium leading-relaxed">
                {progress?.improvementScore >= 70 ?
                  '🎉 Great progress! You\'re on track to achieve your wellness goals.' :
                  progress?.improvementScore >= 40 ?
                  '💪 Keep going! You\'re making steady progress on your wellness journey.' :
                  '🌱 Every step counts! Continue building your wellness habits.'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
