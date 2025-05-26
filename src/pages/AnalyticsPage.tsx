import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Smile,
  Frown,
  Meh,
  Heart,
  Award
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
    if (score >= 7) return <Smile className="h-6 w-6 text-green-500" />
    if (score >= 4) return <Meh className="h-6 w-6 text-yellow-500" />
    return <Frown className="h-6 w-6 text-red-500" />
  }

  const getMoodColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50'
    if (score >= 4) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
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

  // Show message if no data is available
  if (!progress && !moodTrends) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary-500 mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-calm-900">
                Your Wellness Analytics
              </h1>
            </div>
            <div className="card max-w-md mx-auto">
              <p className="text-lg text-calm-600 mb-4">
                No analytics data available yet.
              </p>
              <p className="text-calm-500">
                Start having conversations and tracking your emotions to see your wellness analytics here.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-primary-500 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-calm-900">
              Your Wellness Analytics
            </h1>
          </div>
          <p className="text-lg text-calm-600 max-w-2xl mx-auto">
            Track your emotional journey and see how you're progressing towards better mental health.
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-calm-200">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.value
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-calm-600 hover:text-primary-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-calm-900 mb-1">
              {progress?.totalSessions || 0}
            </h3>
            <p className="text-calm-600">Total Sessions</p>
          </div>

          <div className="card text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${getMoodColor(progress?.averageMood || 0)}`}>
              {getMoodIcon(progress?.averageMood || 0)}
            </div>
            <h3 className="text-2xl font-bold text-calm-900 mb-1">
              {progress?.averageMood?.toFixed(1) || '0.0'}
            </h3>
            <p className="text-calm-600">Average Mood</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-calm-900 mb-1">
              {progress?.streakDays || 0}
            </h3>
            <p className="text-calm-600">Day Streak</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-calm-900 mb-1">
              {progress?.completedRecommendations || 0}
            </h3>
            <p className="text-calm-600">Completed Activities</p>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-primary-500 mr-2" />
              <h3 className="text-xl font-semibold text-calm-900">Mood Trends</h3>
            </div>

            <div className="space-y-6">
              {moodTrends ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-calm-900 mb-2">
                      {moodTrends.dominant_emotion?.charAt(0).toUpperCase() + moodTrends.dominant_emotion?.slice(1) || 'Neutral'}
                    </div>
                    <p className="text-calm-600">Dominant Emotion</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-calm-700">Trend Direction</span>
                      <span className={`font-semibold capitalize ${
                        moodTrends.trend_type === 'improving' ? 'text-green-600' :
                        moodTrends.trend_type === 'declining' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {moodTrends.trend_type || 'Stable'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-calm-700">Emotional Stability</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-calm-200 rounded-full mr-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(moodTrends.emotion_stability || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-calm-900">
                          {Math.round((moodTrends.emotion_stability || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-calm-700">Average Sentiment</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-calm-200 rounded-full mr-2">
                          <div
                            className="h-2 bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${((moodTrends.average_sentiment || 0) + 1) * 50}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-calm-900">
                          {((moodTrends.average_sentiment || 0) * 10).toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-calm-500">No mood data available yet. Start tracking your emotions to see trends!</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-calm-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                <span className="text-sm text-calm-600">Positive</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                <span className="text-sm text-calm-600">Neutral</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                <span className="text-sm text-calm-600">Negative</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center mb-6">
              <Heart className="h-6 w-6 text-primary-500 mr-2" />
              <h3 className="text-xl font-semibold text-calm-900">Wellness Score</h3>
            </div>

            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress?.improvementScore || 0) * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-calm-900">
                    {progress?.improvementScore || 0}%
                  </span>
                </div>
              </div>
              <p className="text-calm-600 mt-2">Overall Improvement</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-calm-700">Consistency</span>
                <span className="font-semibold text-calm-900">
                  {progress?.improvementScore >= 80 ? 'Excellent' :
                   progress?.improvementScore >= 60 ? 'Good' :
                   progress?.improvementScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-calm-700">Engagement</span>
                <span className="font-semibold text-calm-900">
                  {progress?.totalSessions >= 10 ? 'High' :
                   progress?.totalSessions >= 5 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-calm-700">Progress Rate</span>
                <span className="font-semibold text-calm-900">
                  {moodTrends?.trend_type === 'improving' ? 'Improving' :
                   moodTrends?.trend_type === 'declining' ? 'Declining' : 'Steady'}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
              <p className="text-sm text-calm-800 font-medium">
                {progress?.improvementScore >= 70 ?
                  '🎉 Great progress! You\'re on track to achieve your wellness goals.' :
                  progress?.improvementScore >= 40 ?
                  '💪 Keep going! You\'re making steady progress on your wellness journey.' :
                  '🌱 Every step counts! Continue building your wellness habits.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
