import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { usersAPI } from '../services/api'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    theme: 'light',
    daily_reminders: true,
    weekly_reports: true,
    recommendations: true,
    achievements: false,
    language: 'en',
    timezone: 'UTC'
  })

  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    password: false,
    preferences: false
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ]

  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userPrefs = await usersAPI.getPreferences()
        setPreferences(userPrefs)
      } catch (error) {
        console.error('Error loading preferences:', error)
        // Use default preferences if loading fails
      }
    }

    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      loadPreferences()
    }
  }, [user])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (loadingStates.profile) return

    setLoadingStates(prev => ({ ...prev, profile: true }))

    try {
      // Validate form
      if (!formData.full_name.trim()) {
        showMessage('error', 'Full name is required')
        return
      }



      // Update profile
      const updateData: any = {}
      if (formData.full_name !== user?.full_name) updateData.full_name = formData.full_name
      if (formData.username !== user?.username) updateData.username = formData.username

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await usersAPI.updateProfile(updateData)
        updateUser(updatedUser)
        showMessage('success', 'Profile updated successfully!')
      } else {
        showMessage('success', 'No changes to save')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to update profile'
      showMessage('error', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, profile: false }))
    }
  }

  const handleSavePassword = async () => {
    if (loadingStates.password) return

    setLoadingStates(prev => ({ ...prev, password: true }))

    try {
      // Validate passwords
      if (!formData.currentPassword) {
        showMessage('error', 'Current password is required')
        return
      }

      if (!formData.newPassword) {
        showMessage('error', 'New password is required')
        return
      }

      if (formData.newPassword.length < 8) {
        showMessage('error', 'New password must be at least 8 characters long')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showMessage('error', 'New passwords do not match')
        return
      }

      await usersAPI.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      })

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      showMessage('success', 'Password changed successfully!')
    } catch (error: any) {
      console.error('Error changing password:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to change password'
      showMessage('error', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, password: false }))
    }
  }

  const handleSavePreferences = async () => {
    if (loadingStates.preferences) return

    setLoadingStates(prev => ({ ...prev, preferences: true }))

    try {
      await usersAPI.updatePreferences(preferences)
      showMessage('success', 'Preferences saved successfully!')
    } catch (error: any) {
      console.error('Error saving preferences:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to save preferences'
      showMessage('error', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, preferences: false }))
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-calm-900 dark:text-calm-100 mb-2">
            Profile Settings
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-calm-600 dark:text-calm-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="card">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-6">
                    Profile Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400 dark:text-calm-500" />
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400 dark:text-calm-500" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400 dark:text-calm-500" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="input-field pl-10 bg-calm-50 dark:bg-calm-800 text-calm-500 dark:text-calm-400 cursor-not-allowed"
                          placeholder="Email address (used for authentication)"
                        />
                      </div>
                      <p className="text-xs text-calm-500 dark:text-calm-400 mt-1">
                        Email cannot be changed as it's used for authentication
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={loadingStates.profile}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates.profile ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loadingStates.profile ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-6">
                    Security Settings
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="input-field pl-10 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-calm-400 hover:text-calm-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSavePassword}
                      disabled={loadingStates.password}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates.password ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loadingStates.password ? 'Updating...' : 'Update Password'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-6">
                    Notification Preferences
                  </h2>
                  <div className="space-y-6">
                    {[
                      { key: 'daily_reminders', label: 'Daily Reminders', description: 'Receive daily check-in reminders' },
                      { key: 'weekly_reports', label: 'Weekly Reports', description: 'Get weekly progress reports' },
                      { key: 'recommendations', label: 'Recommendations', description: 'Receive personalized activity recommendations' },
                      { key: 'achievements', label: 'Achievements', description: 'Get notified about achievements and milestones' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-calm-900 dark:text-calm-100">
                            {label}
                          </h3>
                          <p className="text-sm text-calm-600 dark:text-calm-400">
                            {description}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange(key, !preferences[key as keyof typeof preferences])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences[key as keyof typeof preferences] ? 'bg-primary-500' : 'bg-calm-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              preferences[key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSavePreferences}
                      disabled={loadingStates.preferences}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates.preferences ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loadingStates.preferences ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-6">
                    App Preferences
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setTheme('light')
                            handlePreferenceChange('theme', 'light')
                          }}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            theme === 'light'
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-calm-200 hover:border-primary-300 dark:border-calm-600 dark:hover:border-primary-400'
                          }`}
                        >
                          <div className="w-full h-8 bg-white rounded mb-2 border border-calm-200 shadow-sm" />
                          <span className="text-sm font-medium dark:text-calm-200">Light</span>
                        </button>
                        <button
                          onClick={() => {
                            setTheme('dark')
                            handlePreferenceChange('theme', 'dark')
                          }}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            theme === 'dark'
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-calm-200 hover:border-primary-300 dark:border-calm-600 dark:hover:border-primary-400'
                          }`}
                        >
                          <div className="w-full h-8 bg-calm-800 rounded mb-2 shadow-sm" />
                          <span className="text-sm font-medium dark:text-calm-200">Dark</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="input-field"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                        className="input-field"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSavePreferences}
                      disabled={loadingStates.preferences}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates.preferences ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loadingStates.preferences ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
