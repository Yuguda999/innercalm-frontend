import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Stethoscope,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const TherapistLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Make direct API call to login endpoint
      const loginFormData = new URLSearchParams()
      loginFormData.append('username', formData.email)
      loginFormData.append('password', formData.password)

      const response = await fetch('http://localhost:8000/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginFormData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }))
        throw new Error(errorData.detail || 'Login failed. Please check your credentials.')
      }

      const loginData = await response.json()

      // Check if user is a therapist
      if (loginData.user.user_type !== 'therapist') {
        setError('This login is for therapists only. Please use the regular login for clients.')
        return
      }

      // Store token and user data
      localStorage.setItem('token', loginData.access_token)

      // Navigate to therapist dashboard
      navigate('/therapist/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-4 rounded-2xl shadow-lg mx-auto w-16 h-16 flex items-center justify-center mb-4"
          >
            <Stethoscope className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent mb-2">
            Therapist Portal
          </h1>
          <p className="text-calm-600 dark:text-calm-300">
            Sign in to your professional account
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-8 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50 transition-all duration-200"
                  placeholder="dr.smith@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-calm-400 hover:text-calm-600 dark:hover:text-calm-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-wellness-500 to-serenity-500 text-white py-3 rounded-xl font-medium hover:from-wellness-600 hover:to-serenity-600 focus:outline-none focus:ring-2 focus:ring-wellness-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </motion.button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/therapist/forgot-password"
                className="text-sm text-wellness-600 dark:text-wellness-400 hover:text-wellness-700 dark:hover:text-wellness-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </motion.div>

        {/* Registration Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-calm-600 dark:text-calm-300">
            New to InnerCalm?{' '}
            <Link
              to="/therapist/register"
              className="text-wellness-600 dark:text-wellness-400 hover:text-wellness-700 dark:hover:text-wellness-300 font-medium transition-colors"
            >
              Join as a Therapist
            </Link>
          </p>
          <div className="mt-4 pt-4 border-t border-calm-200 dark:border-calm-700">
            <Link
              to="/login"
              className="text-sm text-calm-500 dark:text-calm-400 hover:text-calm-700 dark:hover:text-calm-300 transition-colors"
            >
              Client Login →
            </Link>
          </div>
        </motion.div>

        {/* Professional Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-wellness-50/50 dark:bg-wellness-900/20 border border-wellness-200/30 dark:border-wellness-800/30 rounded-2xl p-4"
        >
          <div className="flex items-start space-x-3">
            <Stethoscope className="h-5 w-5 text-wellness-600 dark:text-wellness-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-wellness-800 dark:text-wellness-300 mb-1">
                Professional Portal
              </h3>
              <p className="text-xs text-wellness-700 dark:text-wellness-400">
                This portal is exclusively for licensed mental health professionals. 
                All accounts are verified before activation.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default TherapistLoginPage
