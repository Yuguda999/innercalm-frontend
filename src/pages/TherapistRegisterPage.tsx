import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  Award,
  Clock,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Stethoscope
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const TherapistRegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // User fields
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    
    // Therapist profile fields
    phone: '',
    license_number: '',
    credentials: [] as string[],
    specialties: [] as string[],
    years_experience: 0,
    bio: '',
    hourly_rate: 0,
    accepts_insurance: false,
    insurance_providers: [] as string[],
    timezone: 'UTC'
  })

  const therapyModalities = [
    'cognitive_behavioral_therapy',
    'emdr',
    'somatic_therapy',
    'dialectical_behavior_therapy',
    'psychodynamic',
    'humanistic',
    'trauma_informed',
    'mindfulness_based',
    'family_therapy',
    'group_therapy'
  ]

  const commonCredentials = [
    'Licensed Clinical Social Worker (LCSW)',
    'Licensed Professional Counselor (LPC)',
    'Licensed Marriage and Family Therapist (LMFT)',
    'Licensed Clinical Mental Health Counselor (LCMHC)',
    'Psychologist (PhD/PsyD)',
    'Psychiatrist (MD)',
    'Licensed Professional Clinical Counselor (LPCC)',
    'Licensed Clinical Professional Counselor (LCPC)'
  ]

  const insuranceProviders = [
    'Aetna',
    'Blue Cross Blue Shield',
    'Cigna',
    'UnitedHealth',
    'Humana',
    'Kaiser Permanente',
    'Anthem',
    'Medicaid',
    'Medicare'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }))
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.username || !formData.password || !formData.full_name) {
      setError('Please fill in all required fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.license_number || formData.credentials.length === 0 || formData.specialties.length === 0) {
      setError('Please fill in all required professional information')
      return false
    }
    if (formData.years_experience < 0 || formData.hourly_rate <= 0) {
      setError('Please enter valid experience and rate information')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/auth/register-therapist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_type: 'therapist'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      
      navigate('/therapist/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
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
        className="w-full max-w-2xl"
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
            Join InnerCalm as a Therapist
          </h1>
          <p className="text-calm-600 dark:text-calm-300">
            Help clients on their healing journey with AI-powered insights
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-wellness-500 text-white'
                    : 'bg-calm-200 dark:bg-calm-700 text-calm-500 dark:text-calm-400'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNum ? 'bg-wellness-500' : 'bg-calm-200 dark:bg-calm-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-8 shadow-xl"
        >
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-calm-800 dark:text-calm-200 mb-4">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                        placeholder="Dr. Jane Smith"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                        placeholder="drjanesmith"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                      placeholder="jane@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-calm-800 dark:text-calm-200 mb-4">
                  Professional Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    License Number *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                      placeholder="LIC123456"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Credentials *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {commonCredentials.map((credential) => (
                      <label key={credential} className="flex items-center space-x-2 p-2 hover:bg-wellness-50 dark:hover:bg-calm-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.credentials.includes(credential)}
                          onChange={(e) => handleArrayChange('credentials', credential, e.target.checked)}
                          className="rounded border-calm-300 text-wellness-600 focus:ring-wellness-500"
                        />
                        <span className="text-sm text-calm-700 dark:text-calm-300">{credential}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Therapy Specialties *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {therapyModalities.map((modality) => (
                      <label key={modality} className="flex items-center space-x-2 p-2 hover:bg-wellness-50 dark:hover:bg-calm-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(modality)}
                          onChange={(e) => handleArrayChange('specialties', modality, e.target.checked)}
                          className="rounded border-calm-300 text-wellness-600 focus:ring-wellness-500"
                        />
                        <span className="text-sm text-calm-700 dark:text-calm-300 capitalize">
                          {modality.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Years of Experience *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                      <input
                        type="number"
                        name="years_experience"
                        value={formData.years_experience}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                        placeholder="5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Hourly Rate (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-calm-400" />
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                        max="1000"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                        placeholder="150.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Professional Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-calm-400" />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                      placeholder="Tell potential clients about your approach, experience, and what makes you unique..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Insurance & Availability */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-calm-800 dark:text-calm-200 mb-4">
                  Insurance & Final Details
                </h2>

                <div>
                  <label className="flex items-center space-x-3 p-4 border border-calm-300 dark:border-calm-600 rounded-xl hover:bg-wellness-50 dark:hover:bg-calm-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accepts_insurance"
                      checked={formData.accepts_insurance}
                      onChange={handleInputChange}
                      className="rounded border-calm-300 text-wellness-600 focus:ring-wellness-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-calm-700 dark:text-calm-300">
                        I accept insurance
                      </span>
                      <p className="text-xs text-calm-500 dark:text-calm-400">
                        Check this if you accept insurance payments from clients
                      </p>
                    </div>
                  </label>
                </div>

                {formData.accepts_insurance && (
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Accepted Insurance Providers
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {insuranceProviders.map((provider) => (
                        <label key={provider} className="flex items-center space-x-2 p-2 hover:bg-wellness-50 dark:hover:bg-calm-700 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.insurance_providers.includes(provider)}
                            onChange={(e) => handleArrayChange('insurance_providers', provider, e.target.checked)}
                            className="rounded border-calm-300 text-wellness-600 focus:ring-wellness-500"
                          />
                          <span className="text-sm text-calm-700 dark:text-calm-300">{provider}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-calm-300 dark:border-calm-600 rounded-xl focus:ring-2 focus:ring-wellness-500 focus:border-transparent bg-white/50 dark:bg-calm-700/50"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div className="bg-wellness-50 dark:bg-wellness-900/20 border border-wellness-200 dark:border-wellness-800 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-wellness-600 dark:text-wellness-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-wellness-800 dark:text-wellness-300 mb-1">
                        Verification Process
                      </h3>
                      <p className="text-xs text-wellness-700 dark:text-wellness-400">
                        Your account will be reviewed by our team within 24-48 hours. You'll receive an email once verified and can start accepting clients.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center space-x-2 px-6 py-3 text-calm-600 dark:text-calm-300 hover:text-wellness-600 dark:hover:text-wellness-400 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-4">
                <Link
                  to="/therapist/login"
                  className="px-6 py-3 text-calm-600 dark:text-calm-300 hover:text-wellness-600 dark:hover:text-wellness-400 transition-colors"
                >
                  Already have an account?
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-wellness-500 to-serenity-500 text-white px-8 py-3 rounded-xl font-medium hover:from-wellness-600 hover:to-serenity-600 focus:outline-none focus:ring-2 focus:ring-wellness-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? 'Processing...' : step === 3 ? 'Complete Registration' : 'Next'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default TherapistRegisterPage
