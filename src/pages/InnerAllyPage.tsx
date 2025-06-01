import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart, User, BarChart3, Settings, MessageSquare,
  Clock, TrendingUp, Brain, Sparkles, Shield,
  Activity, Zap, Star, Compass
} from 'lucide-react'
import { useInnerAlly } from '../contexts/InnerAllyContext'
import PersonaCustomizer from '../components/PersonaCustomizer'
import LoadingSpinner from '../components/LoadingSpinner'

const InnerAllyPage: React.FC = () => {
  const {
    status,
    personalization,
    insights,
    widgetSettings,
    isLoading,
    error,
    refreshStatus,
    refreshPersonalization,
    refreshInsights,
    updateWidgetSettings
  } = useInnerAlly()

  const [activeTab, setActiveTab] = useState<'overview' | 'persona' | 'insights' | 'settings'>('overview')

  useEffect(() => {
    refreshStatus()
    refreshPersonalization()
    refreshInsights()
  }, [])

  if (isLoading && !status) {
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
            Connecting with your Inner Ally...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto px-4 py-8">
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
              <Heart className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
              Your Inner Ally
            </h1>
          </div>
          <p className="text-base md:text-lg text-calm-600 dark:text-calm-300 max-w-2xl mx-auto leading-relaxed">
            Your personalized AI companion that learns and grows with you,
            providing empathetic support tailored to your unique needs.
          </p>
        </motion.div>

        {/* Status Cards */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                status.is_active
                  ? 'bg-gradient-to-br from-wellness-400 to-serenity-500'
                  : 'bg-gradient-to-br from-calm-400 to-calm-500'
              }`}>
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-wellness-800 dark:text-wellness-300 mb-1">
                {status.is_active ? 'Active' : 'Resting'}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Connection Status</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-serenity-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-serenity-400 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-serenity-800 dark:text-serenity-300 mb-1">
                {status.total_interactions}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Conversations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-warmth-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-accent-800 dark:text-accent-300 mb-1 capitalize">
                {status.recent_mood_trend}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Mood Trend</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-2xl p-4 md:p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-warmth-400 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-warmth-800 dark:text-warmth-300 mb-1 capitalize">
                {status.current_persona.replace('_', ' ')}
              </h3>
              <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400">Persona</p>
            </motion.div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl shadow-xl mb-8"
        >
          <div className="flex flex-wrap border-b border-wellness-200/30 dark:border-calm-700/30">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'persona', label: 'Persona', icon: User },
              { id: 'insights', label: 'Insights', icon: Brain },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 md:px-6 py-4 text-sm font-medium transition-all duration-200 touch-target ${
                  activeTab === tab.id
                    ? (() => {
                        switch(index) {
                          case 0: return 'text-wellness-600 dark:text-wellness-400 border-b-2 border-wellness-500 bg-wellness-50/50 dark:bg-wellness-900/20'
                          case 1: return 'text-serenity-600 dark:text-serenity-400 border-b-2 border-serenity-500 bg-serenity-50/50 dark:bg-serenity-900/20'
                          case 2: return 'text-accent-600 dark:text-accent-400 border-b-2 border-accent-500 bg-accent-50/50 dark:bg-accent-900/20'
                          case 3: return 'text-warmth-600 dark:text-warmth-400 border-b-2 border-warmth-500 bg-warmth-50/50 dark:bg-warmth-900/20'
                          default: return 'text-wellness-600 dark:text-wellness-400 border-b-2 border-wellness-500 bg-wellness-50/50 dark:bg-wellness-900/20'
                        }
                      })()
                    : 'text-calm-600 dark:text-calm-400 hover:text-wellness-600 dark:hover:text-wellness-400'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Interventions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-wellness-50/70 dark:bg-wellness-900/20 backdrop-blur-sm border border-wellness-200/30 dark:border-wellness-700/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-wellness-800 dark:text-wellness-300">
                        Available Interventions
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {status?.available_interventions.length ? (
                        status.available_interventions.map((intervention, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center p-4 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-xl"
                          >
                            <div className="bg-gradient-to-br from-serenity-400 to-wellness-400 p-2 rounded-lg mr-3">
                              <Shield className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-wellness-800 dark:text-wellness-300 font-medium">{intervention}</span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                          >
                            <Activity className="h-8 w-8 text-white" />
                          </motion.div>
                          <p className="text-wellness-600 dark:text-wellness-400 leading-relaxed">
                            Your Inner Ally is learning your preferences. Personalized interventions will appear here as you interact more.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Next Check-in */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-serenity-50/70 dark:bg-serenity-900/20 backdrop-blur-sm border border-serenity-200/30 dark:border-serenity-700/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-serenity-800 dark:text-serenity-300">
                        Next Check-in
                      </h3>
                    </div>
                    {status?.next_check_in ? (
                      <div className="text-center">
                        <motion.p
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-3xl font-bold text-serenity-600 dark:text-serenity-400 mb-2"
                        >
                          {new Date(status.next_check_in).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </motion.p>
                        <p className="text-serenity-600 dark:text-serenity-400 font-medium">
                          {new Date(status.next_check_in).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="bg-gradient-to-br from-serenity-400 to-accent-400 p-4 rounded-2xl mx-auto mb-4 w-fit"
                        >
                          <Compass className="h-8 w-8 text-white" />
                        </motion.div>
                        <p className="text-serenity-600 dark:text-serenity-400 leading-relaxed">
                          No scheduled check-ins. You can enable automatic check-ins in settings.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Personalization Summary */}
                {personalization && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-accent-50/70 dark:bg-accent-900/20 backdrop-blur-sm border border-accent-200/30 dark:border-accent-700/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-300">
                        Personalization Summary
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center p-4 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-xl"
                      >
                        <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{personalization.total_memories}</p>
                        <p className="text-sm text-accent-600 dark:text-accent-400 font-medium">Memories</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center p-4 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-xl"
                      >
                        <p className="text-2xl font-bold text-warmth-600 dark:text-warmth-400">{personalization.active_triggers}</p>
                        <p className="text-sm text-warmth-600 dark:text-warmth-400 font-medium">Active Triggers</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center p-4 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-xl"
                      >
                        <p className="text-2xl font-bold text-wellness-600 dark:text-wellness-400">{personalization.preferred_coping_strategies.length}</p>
                        <p className="text-sm text-wellness-600 dark:text-wellness-400 font-medium">Coping Strategies</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-center p-4 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-serenity-200/30 dark:border-calm-700/30 rounded-xl"
                      >
                        <p className="text-2xl font-bold text-serenity-600 dark:text-serenity-400">{personalization.favorite_phrases.length}</p>
                        <p className="text-sm text-serenity-600 dark:text-serenity-400 font-medium">Favorite Phrases</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Persona Tab */}
            {activeTab === 'persona' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PersonaCustomizer
                  currentPersona={status?.current_persona}
                  onPersonaChange={(persona) => {
                    // Update persona and refresh status
                    refreshStatus()
                  }}
                />
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {insights.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
                        Your Personal Insights
                      </h3>
                      <button
                        onClick={refreshInsights}
                        className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        Refresh Insights
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {insights.map((insight) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-calm-50 dark:bg-calm-900/50 rounded-lg p-6 border border-calm-200 dark:border-calm-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-full ${
                                insight.type === 'pattern' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                insight.type === 'preference' ? 'bg-green-100 dark:bg-green-900/20' :
                                insight.type === 'growth' ? 'bg-purple-100 dark:bg-purple-900/20' :
                                'bg-orange-100 dark:bg-orange-900/20'
                              }`}>
                                {insight.type === 'pattern' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                                {insight.type === 'preference' && <Heart className="h-4 w-4 text-green-600" />}
                                {insight.type === 'growth' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                                {insight.type === 'recommendation' && <Sparkles className="h-4 w-4 text-orange-600" />}
                              </div>
                              <div>
                                <h4 className="font-semibold text-calm-900 dark:text-calm-100">
                                  {insight.title}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  insight.type === 'pattern' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                                  insight.type === 'preference' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                                  insight.type === 'growth' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                                  'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                }`}>
                                  {insight.type}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-calm-500 dark:text-calm-400">
                                Confidence: {Math.round(insight.confidence * 100)}%
                              </div>
                              <div className="text-xs text-calm-500 dark:text-calm-400">
                                {insight.interaction_count} interactions
                              </div>
                            </div>
                          </div>

                          <p className="text-calm-700 dark:text-calm-300 mb-4">
                            {insight.description}
                          </p>

                          {insight.examples.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-calm-600 dark:text-calm-400 mb-2">
                                Examples:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {insight.examples.slice(0, 3).map((example, index) => (
                                  <span
                                    key={index}
                                    className="text-xs px-2 py-1 bg-calm-100 dark:bg-calm-700 text-calm-700 dark:text-calm-300 rounded"
                                  >
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {insight.suggested_actions && insight.suggested_actions.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-calm-600 dark:text-calm-400 mb-2">
                                Suggested Actions:
                              </h5>
                              <ul className="text-sm text-calm-700 dark:text-calm-300 space-y-1">
                                {insight.suggested_actions.map((action, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-primary-500 mr-2">•</span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-calm-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-2">
                      Building Your Insights
                    </h3>
                    <p className="text-calm-600 dark:text-calm-400 max-w-md mx-auto mb-4">
                      Your Inner Ally is learning about your patterns and preferences.
                      Personalized insights will appear here as you interact more.
                    </p>
                    <button
                      onClick={refreshInsights}
                      className="btn-secondary"
                    >
                      Check for Insights
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
                    Widget Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-calm-700 dark:text-calm-300">
                          Enable Widget
                        </label>
                        <button
                          onClick={() => updateWidgetSettings({ enabled: !widgetSettings.enabled })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            widgetSettings.enabled ? 'bg-primary-600' : 'bg-calm-200 dark:bg-calm-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              widgetSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-calm-700 dark:text-calm-300">
                          Crisis Mode
                        </label>
                        <button
                          onClick={() => updateWidgetSettings({ crisisModeEnabled: !widgetSettings.crisisModeEnabled })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            widgetSettings.crisisModeEnabled ? 'bg-primary-600' : 'bg-calm-200 dark:bg-calm-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              widgetSettings.crisisModeEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                          Check-in Frequency (hours)
                        </label>
                        <select
                          value={widgetSettings.checkInFrequency}
                          onChange={(e) => updateWidgetSettings({ checkInFrequency: parseInt(e.target.value) })}
                          className="input-field"
                        >
                          <option value={1}>Every hour</option>
                          <option value={2}>Every 2 hours</option>
                          <option value={4}>Every 4 hours</option>
                          <option value={6}>Every 6 hours</option>
                          <option value={12}>Every 12 hours</option>
                          <option value={24}>Daily</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                          Widget Position
                        </label>
                        <select
                          value={widgetSettings.position}
                          onChange={(e) => updateWidgetSettings({ position: e.target.value as any })}
                          className="input-field"
                        >
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="top-left">Top Left</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default InnerAllyPage
