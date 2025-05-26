import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Clock,
  Target,
  Star,
  CheckCircle,
  Heart,
  Book,
  Music,
  Activity,
  Coffee,
  Sunrise,
  Sparkles,
  BarChart3,
  Calendar,
  User
} from 'lucide-react'
import { recommendationsAPI } from '../services/api'

interface RecommendationModalProps {
  recommendationId: number | null
  isOpen: boolean
  onClose: () => void
  onComplete: (id: number, rating?: number) => void
}

interface FullRecommendation {
  id: number
  title: string
  description: string
  instructions: string
  type: string
  target_emotions: string[]
  difficulty_level: number
  estimated_duration: number
  is_completed: boolean
  effectiveness_rating?: number
  notes?: string
  created_at: string
  completed_at?: string
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  recommendationId,
  isOpen,
  onClose,
  onComplete
}) => {
  const [recommendation, setRecommendation] = useState<FullRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [showRating, setShowRating] = useState(false)

  useEffect(() => {
    if (recommendationId && isOpen) {
      fetchRecommendation()
    }
  }, [recommendationId, isOpen])

  const fetchRecommendation = async () => {
    if (!recommendationId) return
    
    setLoading(true)
    try {
      const data = await recommendationsAPI.getRecommendation(recommendationId)
      setRecommendation(data)
      setNotes(data.notes || '')
      if (data.is_completed && !data.effectiveness_rating) {
        setShowRating(true)
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error)
    } finally {
      setLoading(false)
    }
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
    return <IconComponent className="h-8 w-8" />
  }

  const getTypeImage = (type: string) => {
    const images: { [key: string]: string } = {
      meditation: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop&crop=center',
      journaling: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=200&fit=crop&crop=center',
      breathing: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&crop=center',
      music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop&crop=center',
      mindfulness: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=200&fit=crop&crop=center',
      exercise: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center',
      relaxation: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=400&h=200&fit=crop&crop=center'
    }
    return images[type.toLowerCase()] || images.relaxation
  }

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || colors[1]
  }

  const getDifficultyText = (level: number) => {
    const texts = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Moderate',
      4: 'Advanced',
      5: 'Expert'
    }
    return texts[level as keyof typeof texts] || 'Beginner'
  }

  const handleComplete = async () => {
    if (!recommendation) return
    
    try {
      await recommendationsAPI.updateRecommendation(recommendation.id, {
        is_completed: true,
        effectiveness_rating: rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined
      })
      
      onComplete(recommendation.id, rating > 0 ? rating : undefined)
      setShowRating(true)
      
      // Update local state
      setRecommendation(prev => prev ? {
        ...prev,
        is_completed: true,
        effectiveness_rating: rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined
      } : null)
    } catch (error) {
      console.error('Error completing recommendation:', error)
    }
  }

  const handleRatingSubmit = async () => {
    if (!recommendation || rating === 0) return
    
    try {
      await recommendationsAPI.updateRecommendation(recommendation.id, {
        effectiveness_rating: rating,
        notes: notes.trim() || undefined
      })
      
      setRecommendation(prev => prev ? {
        ...prev,
        effectiveness_rating: rating,
        notes: notes.trim() || undefined
      } : null)
      
      setShowRating(false)
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"
              />
              <p className="mt-4 text-calm-600">Loading recommendation...</p>
            </div>
          ) : recommendation ? (
            <div>
              {/* Header with Image */}
              <div className="relative">
                <img
                  src={getTypeImage(recommendation.type)}
                  alt={recommendation.type}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
                      {getIcon(recommendation.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{recommendation.title}</h2>
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
                        {recommendation.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Status and Metadata */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-calm-600">
                    <Clock className="h-4 w-4" />
                    <span>{recommendation.estimated_duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-calm-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendation.difficulty_level)}`}>
                      {getDifficultyText(recommendation.difficulty_level)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-calm-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(recommendation.created_at).toLocaleDateString()}</span>
                  </div>
                  {recommendation.is_completed && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-calm-900 mb-2">Description</h3>
                  <p className="text-calm-700 leading-relaxed">{recommendation.description}</p>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-calm-900 mb-2">Instructions</h3>
                  <div className="bg-calm-50 rounded-lg p-4">
                    <p className="text-calm-700 leading-relaxed whitespace-pre-line">{recommendation.instructions}</p>
                  </div>
                </div>

                {/* Target Emotions */}
                {recommendation.target_emotions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-calm-900 mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Target Emotions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.target_emotions.map((emotion, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating Section */}
                {recommendation.is_completed && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-calm-900 mb-2 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Effectiveness Rating
                    </h3>
                    {recommendation.effectiveness_rating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= recommendation.effectiveness_rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-calm-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-calm-600">
                          ({recommendation.effectiveness_rating}/5)
                        </span>
                      </div>
                    ) : showRating ? (
                      <div className="space-y-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`h-8 w-8 ${
                                star <= rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-calm-300 hover:text-yellow-300'
                              } transition-colors`}
                            >
                              <Star className="h-full w-full" />
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleRatingSubmit}
                          disabled={rating === 0}
                          className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Rating
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRating(true)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Rate This Recommendation
                      </button>
                    )}
                  </div>
                )}

                {/* Notes Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-calm-900 mb-2">Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your thoughts or notes about this recommendation..."
                    className="w-full p-3 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!recommendation.is_completed ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleComplete}
                      className="btn-primary flex-1"
                    >
                      Mark as Completed
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="h-5 w-5" />
                      <span>Completed</span>
                      {recommendation.completed_at && (
                        <span className="text-sm text-calm-500">
                          on {new Date(recommendation.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="btn-secondary px-6"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-calm-600">Recommendation not found</p>
              <button onClick={onClose} className="btn-primary mt-4">
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RecommendationModal
