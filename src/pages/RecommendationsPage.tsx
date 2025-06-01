import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  CheckCircle,
  Clock,
  Heart,
  Book,
  Music,
  Activity,
  Coffee,
  Sunrise,
  Eye,
  Star,
  Zap,
  Target,
  Compass
} from 'lucide-react'
import { recommendationsAPI } from '../services/api'
import RecommendationModal from '../components/RecommendationModal'

interface Recommendation {
  id: number
  title: string
  description: string
  type: string
  estimated_duration_minutes?: number
  estimated_duration?: number
  is_completed: boolean
  effectiveness_rating?: number
  created_at: string
  image_url?: string
  gif_url?: string
  illustration_prompt?: string
}

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // First try to get existing recommendations
        let data = await recommendationsAPI.getRecommendations()

        // If no recommendations exist, generate some
        if (data.length === 0) {
          console.log('No existing recommendations, generating new ones...')
          data = await recommendationsAPI.generateRecommendations(5)
        }

        setRecommendations(data)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        // Try to generate recommendations if fetching fails
        try {
          const generatedData = await recommendationsAPI.generateRecommendations(3)
          setRecommendations(generatedData)
        } catch (generateError) {
          console.error('Error generating recommendations:', generateError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const handleComplete = async (id: number, rating?: number) => {
    try {
      await recommendationsAPI.markAsCompleted(id, rating)
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === id ? {
            ...rec,
            is_completed: true,
            effectiveness_rating: rating
          } : rec
        )
      )
    } catch (error) {
      console.error('Error marking recommendation as completed:', error)
      // Update locally for demo
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === id ? {
            ...rec,
            is_completed: true,
            effectiveness_rating: rating
          } : rec
        )
      )
    }
  }

  const handleRecommendationClick = (id: number) => {
    setSelectedRecommendationId(id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecommendationId(null)
  }

  const getIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      meditation: Sunrise,
      journaling: Book,
      breathing: Activity,
      music: Music,
      mindfulness: Coffee,
      exercise: Heart,
      relaxation: Sparkles
    }
    const IconComponent = icons[type.toLowerCase()] || Sparkles
    return <IconComponent className="h-6 w-6" />
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true
    if (filter === 'completed') return rec.is_completed
    if (filter === 'pending') return !rec.is_completed
    return rec.type.toLowerCase() === filter
  })

  const categories = ['all', 'pending', 'completed', 'meditation', 'journaling', 'breathing', 'music', 'mindfulness', 'exercise']

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
            Curating your personalized recommendations...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 pt-6"
        >
          <div className="flex items-center justify-center mb-4">
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
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
              Personalized Recommendations
            </h1>
          </div>
          <p className="text-base md:text-lg text-calm-600 dark:text-calm-300 max-w-2xl mx-auto leading-relaxed">
            Discover activities and exercises tailored to your emotional needs and wellness goals.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(category)}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-200 touch-target ${
                  filter === category
                    ? (() => {
                        switch(index % 4) {
                          case 0: return 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white shadow-lg'
                          case 1: return 'bg-gradient-to-r from-serenity-400 to-accent-500 text-white shadow-lg'
                          case 2: return 'bg-gradient-to-r from-accent-400 to-warmth-500 text-white shadow-lg'
                          case 3: return 'bg-gradient-to-r from-warmth-400 to-wellness-500 text-white shadow-lg'
                          default: return 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white shadow-lg'
                        }
                      })()
                    : 'bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 text-calm-600 dark:text-calm-300 hover:text-wellness-600 dark:hover:text-wellness-400 shadow-lg'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className={`bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                recommendation.is_completed ? 'ring-2 ring-wellness-300/50 dark:ring-wellness-600/50' : ''
              }`}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => handleRecommendationClick(recommendation.id)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  recommendation.is_completed
                    ? 'bg-gradient-to-br from-wellness-400 to-serenity-500 text-white'
                    : (() => {
                        switch(index % 4) {
                          case 0: return 'bg-gradient-to-br from-wellness-400 to-serenity-500 text-white'
                          case 1: return 'bg-gradient-to-br from-serenity-400 to-accent-500 text-white'
                          case 2: return 'bg-gradient-to-br from-accent-400 to-warmth-500 text-white'
                          case 3: return 'bg-gradient-to-br from-warmth-400 to-wellness-500 text-white'
                          default: return 'bg-gradient-to-br from-wellness-400 to-serenity-500 text-white'
                        }
                      })()
                }`}>
                  {recommendation.is_completed ? (
                    <CheckCircle className="h-7 w-7" />
                  ) : (
                    getIcon(recommendation.type)
                  )}
                </div>
                <div className="flex items-center bg-warmth-100/70 dark:bg-warmth-900/30 px-3 py-2 rounded-xl">
                  <Clock className="h-4 w-4 mr-2 text-warmth-500" />
                  <span className="text-sm text-warmth-700 dark:text-warmth-400 font-medium">
                    {recommendation.estimated_duration_minutes || recommendation.estimated_duration} min
                  </span>
                </div>
              </div>

              <h3 className={`text-lg font-semibold mb-3 ${
                (() => {
                  switch(index % 4) {
                    case 0: return 'text-wellness-800 dark:text-wellness-300'
                    case 1: return 'text-serenity-800 dark:text-serenity-300'
                    case 2: return 'text-accent-800 dark:text-accent-300'
                    case 3: return 'text-warmth-800 dark:text-warmth-300'
                    default: return 'text-wellness-800 dark:text-wellness-300'
                  }
                })()
              }`}>
                {recommendation.title}
              </h3>
              <p className="text-calm-600 dark:text-calm-300 leading-relaxed mb-4 line-clamp-3">
                {recommendation.description}
              </p>

              {recommendation.effectiveness_rating && (
                <div className="flex items-center mb-4 bg-serenity-100/70 dark:bg-serenity-900/30 px-3 py-2 rounded-xl">
                  <Star className="h-4 w-4 mr-2 text-serenity-500 fill-current" />
                  <span className="text-sm text-serenity-700 dark:text-serenity-400 font-medium">{recommendation.effectiveness_rating}/5 effectiveness</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  (() => {
                    switch(index % 4) {
                      case 0: return 'bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400'
                      case 1: return 'bg-serenity-100/70 dark:bg-serenity-900/30 text-serenity-700 dark:text-serenity-400'
                      case 2: return 'bg-accent-100/70 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                      case 3: return 'bg-warmth-100/70 dark:bg-warmth-900/30 text-warmth-700 dark:text-warmth-400'
                      default: return 'bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400'
                    }
                  })()
                }`}>
                  {recommendation.type}
                </span>

                {recommendation.is_completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-600 dark:text-wellness-400 text-sm px-3 py-1 rounded-full font-medium"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRecommendationClick(recommendation.id)
                  }}
                  className="bg-white/70 dark:bg-calm-700/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-600/30 text-calm-600 dark:text-calm-300 hover:text-calm-800 dark:hover:text-calm-100 text-sm px-4 py-2 rounded-xl flex items-center gap-2 flex-1 font-medium transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </motion.button>

                {!recommendation.is_completed && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleComplete(recommendation.id)
                    }}
                    className={`text-white text-sm px-4 py-2 rounded-xl font-medium shadow-lg transition-all duration-200 ${
                      (() => {
                        switch(index % 4) {
                          case 0: return 'bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600'
                          case 1: return 'bg-gradient-to-r from-serenity-400 to-accent-500 hover:from-serenity-500 hover:to-accent-600'
                          case 2: return 'bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600'
                          case 3: return 'bg-gradient-to-r from-warmth-400 to-wellness-500 hover:from-warmth-500 hover:to-wellness-600'
                          default: return 'bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600'
                        }
                      })()
                    }`}
                  >
                    Complete
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-4 rounded-2xl mx-auto mb-6 w-fit"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold text-wellness-800 dark:text-wellness-300 mb-3">
              No recommendations found
            </h3>
            <p className="text-calm-600 dark:text-calm-300 leading-relaxed max-w-md mx-auto">
              Try adjusting your filters or check back later for new personalized recommendations.
            </p>
          </motion.div>
        )}

        {/* Recommendation Modal */}
        <RecommendationModal
          recommendationId={selectedRecommendationId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}

export default RecommendationsPage
