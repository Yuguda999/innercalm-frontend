import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Users,
  Clock,
  Star,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  MessageSquare,
  BarChart3,
  Award,
  Activity,
  Stethoscope
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface DashboardData {
  profile: {
    id: number
    full_name: string
    email: string
    specialties: string[]
    years_experience: number
    average_rating: number
    is_verified: boolean
    is_accepting_new_clients: boolean
  }
  upcoming_appointments: Array<{
    id: number
    scheduled_datetime: string
    user: { full_name: string }
    session_type: string
    status: string
  }>
  recent_appointments: Array<{
    id: number
    scheduled_datetime: string
    user: { full_name: string }
    session_rating?: number
    status: string
  }>
  statistics: {
    total_appointments: number
    completed_appointments: number
    active_practice_plans: number
    average_rating: number
    completion_rate: number
  }
}

const TherapistDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/therapist/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wellness-500 mx-auto mb-4"></div>
          <p className="text-calm-600 dark:text-calm-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg"
              >
                <Stethoscope className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
                  Welcome back, Dr. {dashboardData.profile.full_name.split(' ')[0]}
                </h1>
                <p className="text-calm-600 dark:text-calm-300">
                  {dashboardData.profile.is_verified ? 'Verified Therapist' : 'Pending Verification'} • 
                  {dashboardData.profile.specialties.length} Specialties
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!dashboardData.profile.is_verified && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">Verification Pending</span>
                  </div>
                </div>
              )}
              
              <Link
                to="/therapist/settings"
                className="p-2 text-calm-600 dark:text-calm-300 hover:text-wellness-600 dark:hover:text-wellness-400 transition-colors"
              >
                <Settings className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-calm-600 dark:text-calm-400">Total Appointments</p>
                <p className="text-2xl font-bold text-calm-800 dark:text-calm-200">
                  {dashboardData.statistics.total_appointments}
                </p>
              </div>
              <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-calm-600 dark:text-calm-400">Completion Rate</p>
                <p className="text-2xl font-bold text-calm-800 dark:text-calm-200">
                  {dashboardData.statistics.completion_rate}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-calm-600 dark:text-calm-400">Average Rating</p>
                <p className="text-2xl font-bold text-calm-800 dark:text-calm-200">
                  {dashboardData.statistics.average_rating.toFixed(1)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-serenity-400 to-wellness-400 p-3 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-calm-600 dark:text-calm-400">Active Plans</p>
                <p className="text-2xl font-bold text-calm-800 dark:text-calm-200">
                  {dashboardData.statistics.active_practice_plans}
                </p>
              </div>
              <div className="bg-gradient-to-br from-warmth-400 to-accent-400 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-calm-800 dark:text-calm-200">
                  Upcoming Appointments
                </h2>
                <Link
                  to="/therapist/appointments"
                  className="text-wellness-600 dark:text-wellness-400 hover:text-wellness-700 dark:hover:text-wellness-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {dashboardData.upcoming_appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-calm-400 mx-auto mb-4" />
                    <p className="text-calm-600 dark:text-calm-400">No upcoming appointments</p>
                  </div>
                ) : (
                  dashboardData.upcoming_appointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-wellness-50/50 dark:bg-wellness-900/20 rounded-2xl border border-wellness-200/30 dark:border-wellness-800/30"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-calm-800 dark:text-calm-200">
                            {appointment.user.full_name}
                          </p>
                          <p className="text-sm text-calm-600 dark:text-calm-400">
                            {formatDate(appointment.scheduled_datetime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          {appointment.status}
                        </span>
                        <button className="p-1 text-calm-600 dark:text-calm-400 hover:text-wellness-600 dark:hover:text-wellness-400">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-calm-800 dark:text-calm-200 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/therapist/practice-plans/create"
                  className="flex items-center space-x-3 p-3 bg-wellness-50 dark:bg-wellness-900/20 rounded-xl hover:bg-wellness-100 dark:hover:bg-wellness-900/30 transition-colors"
                >
                  <Plus className="h-5 w-5 text-wellness-600 dark:text-wellness-400" />
                  <span className="text-calm-700 dark:text-calm-300">Create Practice Plan</span>
                </Link>
                
                <Link
                  to="/therapist/appointments"
                  className="flex items-center space-x-3 p-3 bg-serenity-50 dark:bg-serenity-900/20 rounded-xl hover:bg-serenity-100 dark:hover:bg-serenity-900/30 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-serenity-600 dark:text-serenity-400" />
                  <span className="text-calm-700 dark:text-calm-300">Manage Schedule</span>
                </Link>
                
                <Link
                  to="/therapist/clients"
                  className="flex items-center space-x-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-xl hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors"
                >
                  <Users className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                  <span className="text-calm-700 dark:text-calm-300">View Clients</span>
                </Link>
                
                <Link
                  to="/therapist/analytics"
                  className="flex items-center space-x-3 p-3 bg-warmth-50 dark:bg-warmth-900/20 rounded-xl hover:bg-warmth-100 dark:hover:bg-warmth-900/30 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-warmth-600 dark:text-warmth-400" />
                  <span className="text-calm-700 dark:text-calm-300">Analytics</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-calm-800 dark:text-calm-200 mb-4">
                Recent Sessions
              </h2>
              <div className="space-y-3">
                {dashboardData.recent_appointments.slice(0, 3).map((appointment, index) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-calm-700 dark:text-calm-300">
                        {appointment.user.full_name}
                      </p>
                      <p className="text-xs text-calm-500 dark:text-calm-400">
                        {formatDate(appointment.scheduled_datetime)}
                      </p>
                    </div>
                    {appointment.session_rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-calm-600 dark:text-calm-400">
                          {appointment.session_rating}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TherapistDashboard
