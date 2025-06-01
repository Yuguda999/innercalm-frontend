import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  Circle,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Star,
  BookOpen,
  Heart,
  Brain,
  Award,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  Zap,
  Compass
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { professionalBridgeAPI } from '../services/api'

interface PracticePlan {
  id: number
  title: string
  description: string
  goals: string[]
  daily_tasks: Array<{
    id: string
    name: string
    description: string
    time_of_day: string
    options: string[]
    required: boolean
    estimated_minutes: number
  }>
  weekly_goals: Array<{
    id: string
    name: string
    description: string
    target_metric: string
    target_value: number
    reward: string
  }>
  exercises: Array<{
    id: string
    name: string
    description: string
    category: string
    frequency: string
    duration_minutes: number
    instructions: string[]
  }>
  completion_percentage: number
  completed_tasks: string[]
  task_feedback: Record<string, any>
  start_date: string
  end_date: string
  status: string
  effectiveness_rating?: number
  user_notes?: string
  progress_insights?: string[]
}

const PracticePlanPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<PracticePlan | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // Fetch practice plans
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError
  } = useQuery({
    queryKey: ['practice-plans', activeTab],
    queryFn: () => professionalBridgeAPI.getPracticePlans(activeTab === 'all' ? undefined : activeTab),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // Ensure plans is always an array
  const plans = Array.isArray(plansData) ? plansData : []

  // Update practice plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: any }) =>
      professionalBridgeAPI.updatePracticePlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-plans'] })
    },
  })

  const handleCompleteTask = (plan: PracticePlan, taskId: string) => {
    const completedTasks = [...plan.completed_tasks, taskId]
    const totalTasks = plan.daily_tasks.length + plan.weekly_goals.length + plan.exercises.length
    const completionPercentage = (completedTasks.length / totalTasks) * 100

    updatePlanMutation.mutate({
      planId: plan.id,
      data: {
        completed_tasks: completedTasks,
        completion_percentage: Math.min(completionPercentage, 100)
      }
    })
  }

  const handleTaskFeedback = (plan: PracticePlan, taskId: string, feedback: any) => {
    const updatedFeedback = {
      ...plan.task_feedback,
      [taskId]: feedback
    }

    updatePlanMutation.mutate({
      planId: plan.id,
      data: {
        task_feedback: updatedFeedback
      }
    })
  }

  const getTaskIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'cognitive_behavioral_therapy': Brain,
      'mindfulness_based': Heart,
      'trauma_informed': Heart,
      'morning': Clock,
      'midday': Clock,
      'evening': Clock,
      'default': BookOpen
    }
    return icons[category] || icons.default
  }

  const formatTimeOfDay = (timeOfDay: string) => {
    const times: { [key: string]: string } = {
      'morning': 'Morning',
      'midday': 'Midday',
      'evening': 'Evening',
      'anytime': 'Anytime'
    }
    return times[timeOfDay] || timeOfDay
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const activePlans = plans.filter((plan: PracticePlan) => plan.status === 'active')
  const todaysTasks = selectedPlan?.daily_tasks || []

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
                  <Target className="h-6 w-6 text-white" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
                  Practice Plans
                </h1>
              </div>
              <p className="text-calm-600 dark:text-calm-300 leading-relaxed max-w-2xl">
                Your personalized homework and accountability tracking
              </p>
            </div>
            {activePlans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-6 text-center shadow-lg"
              >
                <div className="text-3xl font-bold text-wellness-600 dark:text-wellness-400 mb-1">
                  {Math.round(activePlans.reduce((acc, plan) => acc + plan.completion_percentage, 0) / activePlans.length)}%
                </div>
                <div className="text-sm text-wellness-600 dark:text-wellness-400 font-medium">
                  Average Progress
                </div>
              </motion.div>
            )}
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
                { key: 'active', label: 'Active Plans', icon: Play },
                { key: 'completed', label: 'Completed', icon: CheckCircle },
                { key: 'all', label: 'All Plans', icon: BookOpen }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-serenity-800 dark:text-serenity-300">
                Your Plans
              </h3>
            </div>
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-wellness-200/30 dark:border-wellness-700/30 border-t-wellness-500 rounded-full mx-auto mb-4"
                  />
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-wellness-600 dark:text-wellness-400 font-medium"
                  >
                    Loading your plans...
                  </motion.p>
                </motion.div>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-serenity-400 to-accent-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-calm-600 dark:text-calm-300 leading-relaxed">
                  No practice plans yet. Complete a therapy session to get your first plan!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan: PracticePlan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                      selectedPlan?.id === plan.id ? 'ring-2 ring-wellness-300/50 dark:ring-wellness-600/50' : ''
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-wellness-800 dark:text-wellness-300 text-base">
                        {plan.title}
                      </h4>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        plan.status === 'active'
                          ? 'bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400'
                          : 'bg-accent-100/70 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-serenity-600 dark:text-serenity-400 font-medium">Progress</span>
                        <span className="text-serenity-700 dark:text-serenity-300 font-bold">
                          {Math.round(plan.completion_percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-serenity-100/50 dark:bg-serenity-900/30 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${plan.completion_percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-serenity-400 to-accent-500 h-3 rounded-full shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-wellness-100/70 dark:bg-wellness-900/30 px-3 py-1 rounded-xl">
                        <Target className="w-3 h-3 mr-1 text-wellness-500" />
                        <span className="text-xs text-wellness-700 dark:text-wellness-400 font-medium">{plan.goals.length} goals</span>
                      </div>
                      <div className="flex items-center bg-accent-100/70 dark:bg-accent-900/30 px-3 py-1 rounded-xl">
                        <Clock className="w-3 h-3 mr-1 text-accent-500" />
                        <span className="text-xs text-accent-700 dark:text-accent-400 font-medium">{plan.daily_tasks.length} tasks</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Plan Details */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <motion.div
                key={selectedPlan.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Plan Header */}
                <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-wellness-800 dark:text-wellness-300 mb-3">
                        {selectedPlan.title}
                      </h2>
                      <p className="text-calm-600 dark:text-calm-300 leading-relaxed">
                        {selectedPlan.description}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.3 }}
                          className="w-24 h-24 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-2xl flex items-center justify-center shadow-lg mb-2"
                        >
                          <span className="text-2xl font-bold text-white">
                            {Math.round(selectedPlan.completion_percentage)}%
                          </span>
                        </motion.div>
                      </div>
                      <div className="text-sm text-wellness-600 dark:text-wellness-400 font-medium">
                        Complete
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center bg-wellness-100/70 dark:bg-wellness-900/30 p-4 rounded-2xl"
                    >
                      <div className="text-2xl font-bold text-wellness-700 dark:text-wellness-400 mb-1">
                        {selectedPlan.goals.length}
                      </div>
                      <div className="text-sm text-wellness-600 dark:text-wellness-400 font-medium">Goals</div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center bg-serenity-100/70 dark:bg-serenity-900/30 p-4 rounded-2xl"
                    >
                      <div className="text-2xl font-bold text-serenity-700 dark:text-serenity-400 mb-1">
                        {selectedPlan.daily_tasks.length}
                      </div>
                      <div className="text-sm text-serenity-600 dark:text-serenity-400 font-medium">Daily Tasks</div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-center bg-accent-100/70 dark:bg-accent-900/30 p-4 rounded-2xl"
                    >
                      <div className="text-2xl font-bold text-accent-700 dark:text-accent-400 mb-1">
                        {selectedPlan.exercises.length}
                      </div>
                      <div className="text-sm text-accent-600 dark:text-accent-400 font-medium">Exercises</div>
                    </motion.div>
                  </div>
                </div>

                {/* Goals */}
                <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-wellness-800 dark:text-wellness-300">
                      Goals
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedPlan.goals.map((goal, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 bg-wellness-50/50 dark:bg-wellness-900/20 p-4 rounded-2xl"
                      >
                        <div className="w-3 h-3 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-full shadow-sm" />
                        <span className="text-wellness-700 dark:text-wellness-300 leading-relaxed">{goal}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Today's Tasks */}
                <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-serenity-800 dark:text-serenity-300">
                      Today's Tasks
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {todaysTasks.map((task, index) => {
                      const isCompleted = selectedPlan.completed_tasks.includes(task.id)
                      const Icon = getTaskIcon(task.time_of_day)

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-wellness-50/50 dark:bg-wellness-900/20 border-wellness-200/50 dark:border-wellness-800/50'
                              : 'bg-serenity-50/50 dark:bg-serenity-900/20 border-serenity-200/50 dark:border-serenity-800/50 hover:border-serenity-300/70 dark:hover:border-serenity-700/70'
                          }`}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => !isCompleted && handleCompleteTask(selectedPlan, task.id)}
                            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isCompleted
                                ? 'bg-gradient-to-br from-wellness-400 to-serenity-500 border-wellness-400 text-white shadow-lg'
                                : 'border-serenity-300 dark:border-serenity-600 hover:border-serenity-500 dark:hover:border-serenity-400 hover:bg-serenity-50 dark:hover:bg-serenity-900/30'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="w-5 h-5" />}
                          </motion.button>

                          <div className={`p-2 rounded-xl ${isCompleted ? 'bg-wellness-100/70 dark:bg-wellness-900/30' : 'bg-serenity-100/70 dark:bg-serenity-900/30'}`}>
                            <Icon className={`w-5 h-5 ${isCompleted ? 'text-wellness-600' : 'text-serenity-600'}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${isCompleted ? 'text-wellness-800 dark:text-wellness-300' : 'text-serenity-800 dark:text-serenity-300'}`}>
                                {task.name}
                              </h4>
                              <div className={`px-3 py-1 rounded-xl text-xs font-medium ${
                                isCompleted
                                  ? 'bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400'
                                  : 'bg-accent-100/70 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
                              }`}>
                                {formatTimeOfDay(task.time_of_day)} • {task.estimated_minutes}min
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed ${isCompleted ? 'text-wellness-700 dark:text-wellness-300' : 'text-serenity-700 dark:text-serenity-300'}`}>
                              {task.description}
                            </p>
                          </div>

                          <ChevronRight className={`w-5 h-5 ${isCompleted ? 'text-wellness-500' : 'text-serenity-500'}`} />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Exercises */}
                {selectedPlan.exercises.length > 0 && (
                  <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-300">
                        Therapeutic Exercises
                      </h3>
                    </div>
                    <div className="grid gap-4">
                      {selectedPlan.exercises.map((exercise, index) => {
                        const isCompleted = selectedPlan.completed_tasks.includes(exercise.id)
                        const Icon = getTaskIcon(exercise.category)

                        return (
                          <motion.div
                            key={exercise.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-wellness-50/50 dark:bg-wellness-900/20 border-wellness-200/50 dark:border-wellness-800/50'
                                : 'bg-accent-50/50 dark:bg-accent-900/20 border-accent-200/50 dark:border-accent-800/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-xl ${isCompleted ? 'bg-wellness-100/70 dark:bg-wellness-900/30' : 'bg-accent-100/70 dark:bg-accent-900/30'}`}>
                                  <Icon className={`w-5 h-5 ${isCompleted ? 'text-wellness-600' : 'text-accent-600'}`} />
                                </div>
                                <div>
                                  <h4 className={`font-medium mb-1 ${isCompleted ? 'text-wellness-800 dark:text-wellness-300' : 'text-accent-800 dark:text-accent-300'}`}>
                                    {exercise.name}
                                  </h4>
                                  <p className={`text-sm leading-relaxed ${isCompleted ? 'text-wellness-700 dark:text-wellness-300' : 'text-accent-700 dark:text-accent-300'}`}>
                                    {exercise.description}
                                  </p>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => !isCompleted && handleCompleteTask(selectedPlan, exercise.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  isCompleted
                                    ? 'bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400'
                                    : 'bg-accent-100/70 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 hover:bg-accent-200/70 dark:hover:bg-accent-800/30'
                                }`}
                              >
                                {isCompleted ? 'Completed' : 'Mark Done'}
                              </motion.button>
                            </div>

                            <div className={`px-3 py-2 rounded-xl text-xs font-medium mb-4 ${
                              isCompleted
                                ? 'bg-wellness-100/70 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400'
                                : 'bg-warmth-100/70 dark:bg-warmth-900/30 text-warmth-700 dark:text-warmth-400'
                            }`}>
                              {exercise.frequency} • {exercise.duration_minutes} minutes
                            </div>

                            <div className="space-y-2">
                              {exercise.instructions.slice(0, 3).map((instruction, instrIndex) => (
                                <motion.div
                                  key={instrIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 + instrIndex * 0.05 }}
                                  className={`flex items-center space-x-3 text-sm p-3 rounded-xl ${
                                    isCompleted
                                      ? 'bg-wellness-50/50 dark:bg-wellness-900/20 text-wellness-700 dark:text-wellness-300'
                                      : 'bg-accent-50/50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-wellness-400' : 'bg-accent-400'}`} />
                                  <span>{instruction}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl shadow-xl">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-serenity-400 to-accent-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                  >
                    <BookOpen className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-serenity-800 dark:text-serenity-300 mb-2">
                    Select a Practice Plan
                  </h3>
                  <p className="text-calm-600 dark:text-calm-300 leading-relaxed">
                    Choose a plan from the left to view details and track progress
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticePlanPage
