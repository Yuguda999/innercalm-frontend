import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Calendar,
  Star,
  Clock,
  MapPin,
  Shield,
  Heart,
  Brain,
  Search,
  Filter,
  ChevronRight,
  Video,
  Phone,
  Mail,
  Sparkles,
  Activity,
  Zap,
  Compass
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { professionalBridgeAPI } from '../services/api'

interface TherapistProfile {
  id: number
  full_name: string
  email: string
  credentials: string[]
  specialties: string[]
  years_experience: number
  bio: string
  hourly_rate: number
  accepts_insurance: boolean
  insurance_providers: string[]
  average_rating: number
  total_reviews: number
  is_accepting_new_clients: boolean
}

interface TherapistMatch {
  id: number
  therapist: TherapistProfile
  compatibility_score: number
  match_reasons: string[]
  is_viewed: boolean
  is_contacted: boolean
}

const ProfessionalBridgePage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'matches' | 'search' | 'appointments'>('matches')
  const [searchFilters, setSearchFilters] = useState({
    specialties: [] as string[],
    max_hourly_rate: 300,
    accepts_insurance: false,
    min_rating: 0
  })
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [matchingPreferences, setMatchingPreferences] = useState({
    preferred_modalities: ['cognitive_behavioral_therapy'] as string[],
    trauma_categories: ['general'] as string[],
    healing_stage: 'acceptance',
    max_hourly_rate: 250,
    insurance_required: false
  })

  // Fetch existing matches
  const {
    data: matchesData,
    isLoading: matchesLoading,
    error: matchesError
  } = useQuery({
    queryKey: ['therapist-matches'],
    queryFn: () => professionalBridgeAPI.getMatches(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // Ensure matches is always an array
  const matches = Array.isArray(matchesData) ? matchesData : []

  // Fetch therapists for search
  const {
    data: therapistsData,
    isLoading: therapistsLoading,
    error: therapistsError
  } = useQuery({
    queryKey: ['therapists', searchFilters],
    queryFn: () => professionalBridgeAPI.searchTherapists(searchFilters),
    enabled: activeTab === 'search',
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  })

  // Ensure therapists is always an array
  const therapists = Array.isArray(therapistsData) ? therapistsData : []

  // Find new matches mutation
  const findMatchesMutation = useMutation({
    mutationFn: (preferences: any) => {
      console.log('Sending preferences:', preferences)
      return professionalBridgeAPI.findMatches(preferences)
    },
    onSuccess: (data) => {
      console.log('Match success:', data)
      queryClient.invalidateQueries({ queryKey: ['therapist-matches'] })
      setShowMatchingModal(false)
    },
    onError: (error) => {
      console.error('Match error:', error)
    },
  })

  // Mark match as viewed mutation
  const markViewedMutation = useMutation({
    mutationFn: (matchId: number) => professionalBridgeAPI.markMatchViewed(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-matches'] })
    },
  })

  const handleFindMatches = () => {
    // Ensure at least one modality is selected
    if (matchingPreferences.preferred_modalities.length === 0) {
      setMatchingPreferences(prev => ({
        ...prev,
        preferred_modalities: ['cognitive_behavioral_therapy']
      }))
    }

    // Ensure trauma categories is not empty
    const preferences = {
      ...matchingPreferences,
      preferred_modalities: matchingPreferences.preferred_modalities.length > 0
        ? matchingPreferences.preferred_modalities
        : ['cognitive_behavioral_therapy'],
      trauma_categories: matchingPreferences.trauma_categories.length > 0
        ? matchingPreferences.trauma_categories
        : ['general']
    }

    findMatchesMutation.mutate(preferences)
  }

  const handleViewMatch = (match: TherapistMatch) => {
    if (!match.is_viewed) {
      markViewedMutation.mutate(match.id)
    }
  }

  const getSpecialtyIcon = (specialty: string) => {
    const icons: { [key: string]: any } = {
      'cognitive_behavioral_therapy': Brain,
      'emdr': Heart,
      'trauma_informed': Shield,
      'mindfulness_based': Heart,
      'somatic_therapy': Users,
      'dialectical_behavior_therapy': Brain,
      'psychodynamic': Users,
      'humanistic': Heart,
      'family_therapy': Users,
      'group_therapy': Users
    }
    return icons[specialty] || Brain
  }

  const formatSpecialtyName = (specialty: string) => {
    const names: { [key: string]: string } = {
      'cognitive_behavioral_therapy': 'CBT',
      'emdr': 'EMDR',
      'trauma_informed': 'Trauma-Informed',
      'mindfulness_based': 'Mindfulness',
      'somatic_therapy': 'Somatic',
      'dialectical_behavior_therapy': 'DBT',
      'psychodynamic': 'Psychodynamic',
      'humanistic': 'Humanistic',
      'family_therapy': 'Family Therapy',
      'group_therapy': 'Group Therapy'
    }
    return names[specialty] || specialty
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
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
                  className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg mr-3"
                >
                  <Users className="h-6 w-6 text-white" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
                  Professional Bridge
                </h1>
              </div>
              <p className="text-calm-600 dark:text-calm-300 leading-relaxed max-w-2xl">
                Connect with vetted therapists matched to your healing journey
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMatchingModal(true)}
              className="bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 shadow-lg touch-target"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              Find New Matches
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-wellness-200/30 dark:border-calm-700/30">
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'matches', label: 'AI Matches', icon: Heart },
                { key: 'search', label: 'Search Therapists', icon: Search },
                { key: 'appointments', label: 'Appointments', icon: Calendar }
              ].map(({ key, label, icon: Icon }, index) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 touch-target ${
                    activeTab === key
                      ? (() => {
                          switch(index) {
                            case 0: return 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white shadow-lg'
                            case 1: return 'bg-gradient-to-r from-serenity-400 to-accent-500 text-white shadow-lg'
                            case 2: return 'bg-gradient-to-r from-accent-400 to-warmth-500 text-white shadow-lg'
                            default: return 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white shadow-lg'
                          }
                        })()
                      : 'text-calm-600 dark:text-calm-400 hover:text-wellness-600 dark:hover:text-wellness-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {matchesLoading ? (
                <div className="flex items-center justify-center py-12">
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
                      Finding your perfect matches...
                    </motion.p>
                  </motion.div>
                </div>
              ) : matchesError ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-accent-400 to-warmth-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-300 mb-2">
                    Unable to load matches
                  </h3>
                  <p className="text-calm-600 dark:text-calm-300 mb-6 leading-relaxed">
                    There was an error loading your therapist matches. Please try again.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMatchingModal(true)}
                    className="bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg"
                  >
                    Find New Matches
                  </motion.button>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-wellness-800 dark:text-wellness-300 mb-2">
                    No matches yet
                  </h3>
                  <p className="text-calm-600 dark:text-calm-300 mb-6 leading-relaxed">
                    Let our AI find therapists perfectly matched to your healing journey
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMatchingModal(true)}
                    className="bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg"
                  >
                    Find My Matches
                  </motion.button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {matches.map((match: TherapistMatch, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                        !match.is_viewed ? 'ring-2 ring-wellness-300/50 dark:ring-wellness-600/50' : ''
                      }`}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => handleViewMatch(match)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {match.therapist.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-wellness-800 dark:text-wellness-300 mb-2">
                              {match.therapist.full_name}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="flex items-center space-x-1 bg-serenity-100/70 dark:bg-serenity-900/30 px-2 py-1 rounded-full">
                                <Star className="w-4 h-4 fill-current text-serenity-500" />
                                <span className="text-serenity-700 dark:text-serenity-400 font-medium">{match.therapist.average_rating.toFixed(1)}</span>
                              </div>
                              <div className="bg-accent-100/70 dark:bg-accent-900/30 px-2 py-1 rounded-full">
                                <span className="text-accent-700 dark:text-accent-400 font-medium">{match.therapist.years_experience} years</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="relative">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                              className="w-20 h-20 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-2xl flex items-center justify-center shadow-lg"
                            >
                              <span className="text-2xl font-bold text-white">
                                {Math.round(match.compatibility_score * 100)}%
                              </span>
                            </motion.div>
                          </div>
                          <div className="text-sm text-wellness-600 dark:text-wellness-400 font-medium mt-2">
                            compatibility
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-calm-700 dark:text-calm-300 leading-relaxed">
                          {match.therapist.bio}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-6">
                        {match.therapist.specialties.slice(0, 3).map((specialty, specIndex) => {
                          const Icon = getSpecialtyIcon(specialty)
                          return (
                            <motion.span
                              key={specialty}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 + specIndex * 0.1 }}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-serenity-100/70 dark:bg-serenity-900/30 text-serenity-700 dark:text-serenity-400 rounded-2xl text-sm font-medium"
                            >
                              <Icon className="w-4 h-4" />
                              <span>{formatSpecialtyName(specialty)}</span>
                            </motion.span>
                          )
                        })}
                      </div>

                      <div className="border-t border-wellness-200/30 dark:border-calm-700/30 pt-6 mb-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-medium text-accent-800 dark:text-accent-300">
                            Why this match:
                          </h4>
                        </div>
                        <ul className="space-y-2">
                          {match.match_reasons.slice(0, 3).map((reason, reasonIndex) => (
                            <motion.li
                              key={reasonIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + reasonIndex * 0.1 }}
                              className="text-sm text-accent-700 dark:text-accent-400 flex items-center space-x-3 bg-accent-50/50 dark:bg-accent-900/20 p-3 rounded-xl"
                            >
                              <ChevronRight className="w-4 h-4 text-accent-500" />
                              <span>{reason}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-wellness-200/30 dark:border-calm-700/30">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2 bg-warmth-100/70 dark:bg-warmth-900/30 px-3 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-warmth-500" />
                            <span className="text-warmth-700 dark:text-warmth-400 font-medium">${match.therapist.hourly_rate}/hour</span>
                          </div>
                          {match.therapist.accepts_insurance && (
                            <div className="flex items-center space-x-2 bg-wellness-100/70 dark:bg-wellness-900/30 px-3 py-2 rounded-xl">
                              <Shield className="w-4 h-4 text-wellness-500" />
                              <span className="text-wellness-700 dark:text-wellness-400 font-medium">Insurance</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-serenity-100/70 dark:bg-serenity-900/30 text-serenity-600 dark:text-serenity-400 rounded-xl hover:bg-serenity-200/70 dark:hover:bg-serenity-800/30 transition-colors"
                          >
                            <Mail className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-accent-100/70 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 rounded-xl hover:bg-accent-200/70 dark:hover:bg-accent-800/30 transition-colors"
                          >
                            <Phone className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
                          >
                            Schedule
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-calm-800 rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
                  Search Filters
                </h3>
                {/* Add search filters UI here */}
                <p className="text-calm-600 dark:text-calm-300">
                  Search filters coming soon...
                </p>
              </div>

              {/* Therapist search results */}
              <div className="grid gap-6">
                {therapists.map((therapist: TherapistProfile) => (
                  <motion.div
                    key={therapist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-calm-800 dark:text-calm-200">
                            {therapist.full_name}
                          </h3>
                          <p className="text-calm-600 dark:text-calm-400">
                            {therapist.years_experience} years experience
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-calm-700 dark:text-calm-300">
                            {therapist.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-wellness-600 dark:text-wellness-400">
                          ${therapist.hourly_rate}/hr
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-calm-600 dark:text-calm-400 text-sm leading-relaxed">
                        {therapist.bio || 'Experienced therapist specializing in trauma-informed care and emotional healing.'}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {therapist.specialties.slice(0, 3).map((specialty: string) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-wellness-100 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-300 rounded-full text-xs font-medium"
                          >
                            {specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                        {therapist.specialties.length > 3 && (
                          <span className="px-3 py-1 bg-calm-100 dark:bg-calm-700 text-calm-600 dark:text-calm-400 rounded-full text-xs">
                            +{therapist.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-calm-600 dark:text-calm-400">
                        {therapist.accepts_insurance && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Insurance</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Available</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 border border-wellness-300 dark:border-wellness-600 text-wellness-600 dark:text-wellness-400 rounded-xl hover:bg-wellness-50 dark:hover:bg-wellness-900/20 transition-colors"
                        >
                          View Profile
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gradient-to-r from-wellness-500 to-serenity-500 text-white rounded-xl hover:from-wellness-600 hover:to-serenity-600 transition-all duration-200 shadow-lg"
                        >
                          Book Session
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-calm-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-2">
                  Appointments
                </h3>
                <p className="text-calm-600 dark:text-calm-300">
                  Appointment management coming soon...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Matching Preferences Modal */}
      <AnimatePresence>
        {showMatchingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMatchingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-calm-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">
                Find Your Perfect Match
              </h3>
              <p className="text-calm-600 dark:text-calm-300 mb-6">
                Tell us about your preferences to find therapists matched to your needs.
              </p>

              {/* Matching preferences form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-calm-900 dark:text-calm-100 mb-2">
                    Preferred Therapy Approaches
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { display: 'CBT', value: 'cognitive_behavioral_therapy' },
                      { display: 'EMDR', value: 'emdr' },
                      { display: 'Mindfulness', value: 'mindfulness_based' },
                      { display: 'Trauma-Informed', value: 'trauma_informed' }
                    ].map((modality) => (
                      <label key={modality.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={matchingPreferences.preferred_modalities.includes(modality.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMatchingPreferences(prev => ({
                                ...prev,
                                preferred_modalities: [...prev.preferred_modalities, modality.value]
                              }))
                            } else {
                              setMatchingPreferences(prev => ({
                                ...prev,
                                preferred_modalities: prev.preferred_modalities.filter(m => m !== modality.value)
                              }))
                            }
                          }}
                          className="rounded border-calm-300 text-calm-600 focus:ring-calm-500"
                        />
                        <span className="text-sm text-calm-700 dark:text-calm-300">{modality.display}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-900 dark:text-calm-100 mb-2">
                    Maximum Hourly Rate: ${matchingPreferences.max_hourly_rate}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={matchingPreferences.max_hourly_rate}
                    onChange={(e) => setMatchingPreferences(prev => ({
                      ...prev,
                      max_hourly_rate: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={matchingPreferences.insurance_required}
                    onChange={(e) => setMatchingPreferences(prev => ({
                      ...prev,
                      insurance_required: e.target.checked
                    }))}
                    className="rounded border-calm-300 text-calm-600 focus:ring-calm-500"
                  />
                  <span className="text-sm text-calm-700 dark:text-calm-300">
                    Must accept insurance
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowMatchingModal(false)}
                  className="flex-1 px-4 py-2 border border-calm-300 dark:border-calm-600 text-calm-700 dark:text-calm-300 rounded-lg hover:bg-calm-50 dark:hover:bg-calm-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFindMatches}
                  disabled={findMatchesMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-calm-600 to-calm-700 text-white px-4 py-2 rounded-lg hover:from-calm-700 hover:to-calm-800 transition-all duration-200 disabled:opacity-50"
                >
                  {findMatchesMutation.isPending ? 'Finding...' : 'Find Matches'}
                </button>
              </div>

              {findMatchesMutation.error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Error finding matches. Please try again.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfessionalBridgePage
