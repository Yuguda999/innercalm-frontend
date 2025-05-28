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
  Star
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary-500 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-calm-900 dark:text-calm-100">
              Personalized Recommendations
            </h1>
          </div>
          <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            Discover activities and exercises tailored to your emotional needs and wellness goals.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === category
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-calm-800 text-calm-600 dark:text-calm-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 border border-calm-200 dark:border-calm-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
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
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className={`card hover:shadow-xl transition-all duration-200 cursor-pointer ${
                recommendation.is_completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
              }`}
              onClick={() => handleRecommendationClick(recommendation.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  recommendation.is_completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                }`}>
                  {recommendation.is_completed ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    getIcon(recommendation.type)
                  )}
                </div>
                <div className="flex items-center text-sm text-calm-500 dark:text-calm-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {recommendation.estimated_duration_minutes || recommendation.estimated_duration} min
                </div>
              </div>

              <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-2">
                {recommendation.title}
              </h3>
              <p className="text-calm-600 dark:text-calm-400 mb-4 line-clamp-3">
                {recommendation.description}
              </p>

              {recommendation.effectiveness_rating && (
                <div className="flex items-center mb-3">
                  <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                  <span className="text-sm text-calm-600 dark:text-calm-400">{recommendation.effectiveness_rating}/5 effectiveness</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-xs font-medium px-2 py-1 rounded-full">
                  {recommendation.type}
                </span>

                {recommendation.is_completed && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRecommendationClick(recommendation.id)
                  }}
                  className="btn-secondary text-sm px-3 py-2 flex items-center gap-1 flex-1"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </motion.button>

                {!recommendation.is_completed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleComplete(recommendation.id)
                    }}
                    className="btn-primary text-sm px-3 py-2"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Sparkles className="h-16 w-16 text-calm-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-2">
              No recommendations found
            </h3>
            <p className="text-calm-600 dark:text-calm-400">
              Try adjusting your filters or check back later for new recommendations.
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
