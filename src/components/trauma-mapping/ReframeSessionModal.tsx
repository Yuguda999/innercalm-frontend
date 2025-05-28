import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Brain, 
  Heart, 
  MessageCircle, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Target,
  Play,
  Pause
} from 'lucide-react'
import { traumaMappingAPI } from '../../services/api'

interface LifeEvent {
  id: number
  title: string
  description?: string
  event_date: string
  event_type: 'positive' | 'negative' | 'neutral' | 'traumatic' | 'milestone'
  category: string
  emotional_impact_score: number
  trauma_severity: number
  is_resolved: boolean
}

interface ReframeSessionModalProps {
  isOpen: boolean
  onClose: () => void
  event: LifeEvent | null
}

interface SessionPhase {
  name: string
  duration: number
  description: string
}

interface SessionPlan {
  session_title: string
  estimated_duration: number
  techniques: string[]
  ai_prompts: any[]
  exercises: any[]
  phases: SessionPhase[]
}

const ReframeSessionModal = ({ isOpen, onClose, event }: ReframeSessionModalProps) => {
  const [currentStep, setCurrentStep] = useState<'setup' | 'session' | 'complete'>('setup')
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [userResponse, setUserResponse] = useState('')
  const [sessionData, setSessionData] = useState({
    original_narrative: '',
    session_title: '',
    session_description: ''
  })
  const [aiGuidance, setAiGuidance] = useState<any>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && event) {
      setCurrentStep('setup')
      setSessionPlan(null)
      setSessionId(null)
      setCurrentPhase(0)
      setUserResponse('')
      setInsights([])
      setError('')
      setSessionData({
        original_narrative: '',
        session_title: `Reframing: ${event.title}`,
        session_description: `Cognitive reframing session for the event: ${event.title}`
      })
    }
  }, [isOpen, event])

  const handleStartSession = async () => {
    if (!event || !sessionData.original_narrative.trim()) {
      setError('Please provide your current narrative about this event')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create the reframe session
      const session = await traumaMappingAPI.createReframeSession({
        life_event_id: event.id,
        session_title: sessionData.session_title,
        session_description: sessionData.session_description,
        original_narrative: sessionData.original_narrative
      })

      setSessionId(session.id)

      // Start the guided session
      const guidedSession = await traumaMappingAPI.startGuidedSession(session.id)
      setSessionPlan(guidedSession.session_plan)
      setCurrentStep('session')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!sessionId || !userResponse.trim()) {
      setError('Please provide a response')
      return
    }

    setLoading(true)
    setError('')

    try {
      const currentPhaseName = sessionPlan?.phases[currentPhase]?.name.toLowerCase() || 'exploration'
      
      const result = await traumaMappingAPI.processSessionResponse(sessionId, {
        response: userResponse,
        phase: currentPhaseName
      })

      setAiGuidance(result.guidance)
      
      if (result.analysis?.insights) {
        setInsights(prev => [...prev, ...result.analysis.insights])
      }

      setUserResponse('')

      // Move to next phase or complete
      if (currentPhase < (sessionPlan?.phases.length || 0) - 1) {
        setCurrentPhase(prev => prev + 1)
      } else {
        await handleCompleteSession()
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process response')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSession = async () => {
    if (!sessionId) return

    setLoading(true)
    try {
      await traumaMappingAPI.completeReframeSession(sessionId)
      setCurrentStep('complete')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete session')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPhasePrompts = () => {
    if (!sessionPlan || !sessionPlan.ai_prompts[currentPhase]) return []
    return sessionPlan.ai_prompts[currentPhase].ai_generated_prompts || 
           sessionPlan.ai_prompts[currentPhase].standard_prompts || []
  }

  if (!isOpen || !event) return null

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
          className="bg-white dark:bg-calm-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary-500" />
                <div>
                  <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100">
                    AI-Guided Reframing Session
                  </h2>
                  <p className="text-calm-600 dark:text-calm-300">
                    {event.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-calm-500 hover:text-calm-700 dark:hover:text-calm-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Setup Phase */}
            {currentStep === 'setup' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                    About This Session
                  </h3>
                  <p className="text-primary-700 dark:text-primary-300 text-sm">
                    This AI-guided session will help you explore and reframe your experience through 
                    cognitive restructuring, perspective-taking, and self-compassion exercises. 
                    The session typically takes 30-45 minutes.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={sessionData.session_title}
                    onChange={(e) => setSessionData(prev => ({ ...prev, session_title: e.target.value }))}
                    className="input-field"
                    placeholder="Give this session a meaningful title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Session Description (Optional)
                  </label>
                  <textarea
                    value={sessionData.session_description}
                    onChange={(e) => setSessionData(prev => ({ ...prev, session_description: e.target.value }))}
                    className="input-field"
                    rows={2}
                    placeholder="What do you hope to achieve in this session?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Your Current Narrative *
                  </label>
                  <textarea
                    value={sessionData.original_narrative}
                    onChange={(e) => setSessionData(prev => ({ ...prev, original_narrative: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Describe how you currently think and feel about this event. What story do you tell yourself about what happened?"
                    required
                  />
                  <p className="text-xs text-calm-500 dark:text-calm-400 mt-1">
                    Be honest and open. This is your starting point for reframing.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="btn-secondary flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSession}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading || !sessionData.original_narrative.trim()}
                  >
                    {loading ? (
                      'Starting...'
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Session
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Active Session */}
            {currentStep === 'session' && sessionPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Progress Bar */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentPhase + 1) / sessionPlan.phases.length) * 100}%` }}
                  />
                </div>

                {/* Current Phase */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-2">
                    Phase {currentPhase + 1}: {sessionPlan.phases[currentPhase]?.name}
                  </h3>
                  <p className="text-calm-600 dark:text-calm-300">
                    {sessionPlan.phases[currentPhase]?.description}
                  </p>
                </div>

                {/* AI Guidance */}
                {aiGuidance && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          AI Guidance
                        </h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                          {aiGuidance.message}
                        </p>
                        {aiGuidance.encouragement && (
                          <p className="text-blue-600 dark:text-blue-400 text-sm italic">
                            {aiGuidance.encouragement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Prompts */}
                <div className="space-y-3">
                  <h4 className="font-medium text-calm-900 dark:text-calm-100">
                    Reflection Prompts:
                  </h4>
                  {getCurrentPhasePrompts().map((prompt: string, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-calm-700 p-3 rounded-lg">
                      <p className="text-calm-700 dark:text-calm-300">{prompt}</p>
                    </div>
                  ))}
                </div>

                {/* User Response */}
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Take your time to reflect and respond thoughtfully..."
                  />
                </div>

                {/* Insights Gained */}
                {insights.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                          Insights Gained
                        </h4>
                        <ul className="space-y-1">
                          {insights.map((insight, index) => (
                            <li key={index} className="text-green-700 dark:text-green-300 text-sm">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Session
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading || !userResponse.trim()}
                  >
                    {loading ? (
                      'Processing...'
                    ) : currentPhase < sessionPlan.phases.length - 1 ? (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Complete Session
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Completion */}
            {currentStep === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                    Session Complete!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Congratulations on completing your reframing session. You've taken an important 
                    step in your healing journey.
                  </p>
                </div>

                {insights.length > 0 && (
                  <div className="text-left bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Key Insights from Your Session:
                    </h4>
                    <ul className="space-y-2">
                      {insights.map((insight, index) => (
                        <li key={index} className="text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
                    Next Steps
                  </h4>
                  <ul className="text-primary-700 dark:text-primary-300 text-sm space-y-1">
                    <li>• Practice self-compassion as you integrate these insights</li>
                    <li>• Notice when old thought patterns arise and gently redirect them</li>
                    <li>• Consider scheduling follow-up sessions for continued growth</li>
                    <li>• Celebrate the courage you showed in this healing work</li>
                  </ul>
                </div>

                <button
                  onClick={onClose}
                  className="btn-primary w-full"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Close Session
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ReframeSessionModal
