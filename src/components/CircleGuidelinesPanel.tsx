import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Shield,
  Heart,
  Lock,
  MessageCircle,
  Ban,
  AlertTriangle,
  Smartphone
} from 'lucide-react';

interface CircleGuidelinesPanelProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

const CircleGuidelinesPanel: React.FC<CircleGuidelinesPanelProps> = ({
  isCollapsed = false,
  onToggle,
  className = ""
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);

  const collapsed = onToggle ? isCollapsed : internalCollapsed;
  const handleToggle = onToggle || (() => setInternalCollapsed(!internalCollapsed));

  const guidelines = [
    {
      icon: Heart,
      title: 'Respect & Kindness',
      description: 'Treat all members with respect, empathy, and kindness. We\'re all here to heal and support each other.',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: Lock,
      title: 'Confidentiality',
      description: 'What\'s shared in the circle stays in the circle. Respect everyone\'s privacy and personal stories.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: MessageCircle,
      title: 'Supportive Communication',
      description: 'Use "I" statements, avoid giving unsolicited advice, and focus on sharing your own experiences.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Ban,
      title: 'No Judgment',
      description: 'This is a judgment-free zone. Everyone\'s healing journey is unique and valid.',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: AlertTriangle,
      title: 'Crisis Support',
      description: 'If you\'re in crisis, please reach out to professional help immediately. This circle is for peer support, not crisis intervention.',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: Smartphone,
      title: 'Healthy Boundaries',
      description: 'Take breaks when needed, set your own pace, and remember that self-care comes first.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <div className={`bg-gradient-to-br from-white via-wellness-50/30 to-serenity-50/30 dark:from-calm-800 dark:via-calm-700 dark:to-calm-800 rounded-2xl shadow-xl dark:shadow-2xl border border-wellness-200/50 dark:border-calm-600/50 overflow-hidden backdrop-blur-sm ${className}`}>
      {/* Modern Header - Always visible */}
      <button
        onClick={handleToggle}
        className="w-full p-4 md:p-5 bg-gradient-to-r from-wellness-50/80 via-white/90 to-serenity-50/80 dark:from-calm-700/90 dark:via-calm-600/90 dark:to-calm-700/90 border-b border-wellness-200/50 dark:border-calm-600/50 flex items-center justify-between hover:from-wellness-100/80 hover:to-serenity-100/80 dark:hover:from-calm-600/90 dark:hover:to-calm-500/90 transition-all duration-300 backdrop-blur-md focus-visible-enhanced"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-serenity-500 to-serenity-600 dark:from-serenity-400 dark:to-serenity-500 rounded-xl shadow-lg serenity-glow">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-calm-900" />
          </div>
          <h3 className="text-sm md:text-lg font-bold bg-gradient-to-r from-calm-900 to-serenity-700 dark:from-calm-100 dark:to-serenity-300 bg-clip-text text-transparent">
            Circle Guidelines
          </h3>
        </div>
        <div className={`p-2 rounded-xl transition-all duration-300 ${collapsed ? 'bg-wellness-100 dark:bg-calm-600' : 'bg-serenity-100 dark:bg-serenity-800/50'}`}>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-wellness-600 dark:text-wellness-400" />
          ) : (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-serenity-600 dark:text-serenity-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-3 md:p-4 space-y-4">
              {/* Introduction */}
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-4 border-primary-500">
                <p className="text-sm text-calm-900 dark:text-calm-100 leading-relaxed">
                  These guidelines help create a safe, supportive environment where everyone can share,
                  heal, and grow together. Please take a moment to read and understand them.
                </p>
              </div>

              {/* Guidelines List */}
              <div className="space-y-3">
                {guidelines.map((guideline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 md:p-4 rounded-lg border border-calm-200 dark:border-calm-600 ${guideline.bgColor} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-white dark:bg-calm-700 shadow-sm flex-shrink-0`}>
                        <guideline.icon className={`w-4 h-4 md:w-5 md:h-5 ${guideline.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-calm-700 dark:text-calm-200 mb-2 text-sm md:text-base">
                          {guideline.title}
                        </h4>
                        <p className="text-sm text-calm-600 dark:text-calm-400 leading-relaxed">
                          {guideline.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Emergency Resources */}
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      Emergency Resources
                    </h4>
                    <div className="text-sm text-red-700 dark:text-red-200 space-y-1">
                      <p>• National Suicide Prevention Lifeline: <strong>988</strong></p>
                      <p>• Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></p>
                      <p>• Emergency Services: <strong>911</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="p-3 bg-calm-50 dark:bg-calm-700/50 rounded-lg text-center">
                <p className="text-xs text-calm-600 dark:text-calm-400">
                  By participating in this circle, you agree to follow these guidelines and
                  help maintain a safe, supportive environment for all members.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircleGuidelinesPanel;
