import React from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface MessageFormatterProps {
  content: string
  isUser: boolean
  isStreaming?: boolean
  therapeuticApproach?: string
  timestamp?: string
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({
  content,
  isUser,
  isStreaming = false,
  therapeuticApproach,
  timestamp
}) => {
  // Format the content with better structure
  const formatContent = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())

    return paragraphs.map((paragraph, index) => {
      // Check for lists (lines starting with • or -)
      if (paragraph.includes('\n•') || paragraph.includes('\n-')) {
        const lines = paragraph.split('\n')
        const intro = lines[0]
        const listItems = lines.slice(1).filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))

        return (
          <div key={index} className="mb-4">
            {intro && <p className="mb-2">{intro}</p>}
            <ul className="list-none space-y-1 ml-4">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="text-primary-500 mr-2 mt-1">•</span>
                  <span>{item.replace(/^[•-]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      }

      // Check for quotes (lines starting with ")
      if (paragraph.trim().startsWith('"') && paragraph.trim().endsWith('"')) {
        return (
          <blockquote key={index} className="border-l-4 border-primary-200 dark:border-primary-600 pl-4 py-2 mb-4 italic text-calm-700 dark:text-calm-300 bg-primary-50 dark:bg-primary-900/20 rounded-r-lg">
            {paragraph.trim()}
          </blockquote>
        )
      }

      // Check for emphasis patterns
      const formattedParagraph = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-1 py-0.5 rounded text-sm">$1</code>') // `code`

      return (
        <p
          key={index}
          className="mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      )
    })
  }

  const getApproachBadge = () => {
    if (!therapeuticApproach || isUser) return null

    const approachColors = {
      'cognitive_behavioral': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'mindfulness_based': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'emotion_regulation': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'trauma_informed': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      'person_centered': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200'
    }

    const approachNames = {
      'cognitive_behavioral': 'CBT',
      'mindfulness_based': 'Mindfulness',
      'emotion_regulation': 'Emotion Regulation',
      'trauma_informed': 'Trauma-Informed',
      'person_centered': 'Person-Centered'
    }

    return (
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${approachColors[therapeuticApproach as keyof typeof approachColors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
          {approachNames[therapeuticApproach as keyof typeof approachNames] || therapeuticApproach}
        </span>
        {timestamp && (
          <span className="text-xs text-calm-500 dark:text-calm-400">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 md:mb-6 px-1`}
    >
      <div className={`max-w-[85%] md:max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && getApproachBadge()}

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`
            relative px-4 py-3 md:px-5 md:py-4 rounded-3xl shadow-lg backdrop-blur-sm
            ${isUser
              ? `bg-gradient-to-br from-serenity-500 via-serenity-600 to-wellness-600
                 dark:from-serenity-400 dark:via-serenity-500 dark:to-wellness-500
                 text-white dark:text-calm-900
                 shadow-serenity-500/30 dark:shadow-serenity-400/20
                 rounded-br-lg border border-serenity-400/20`
              : `bg-gradient-to-br from-white/95 via-wellness-50/80 to-white/95
                 dark:from-calm-800/95 dark:via-calm-700/80 dark:to-calm-800/95
                 border border-wellness-200/60 dark:border-calm-600/60
                 shadow-wellness-500/10 dark:shadow-calm-900/20
                 rounded-bl-lg text-calm-900 dark:text-calm-100`
            }
            ${isStreaming ? 'animate-pulse' : ''}
            transition-all duration-300 ease-out
            hover:shadow-xl hover:scale-[1.02]
          `}
        >
          {/* Enhanced content with better typography */}
          <div className={`
            ${isUser
              ? 'text-white dark:text-calm-900 font-medium'
              : 'text-calm-900 dark:text-calm-100'
            }
            leading-relaxed text-sm md:text-base
          `}>
            {formatContent(content)}
          </div>

          {/* Enhanced streaming indicator */}
          {isStreaming && !isUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center mt-3 pt-2 border-t border-wellness-200/50 dark:border-calm-600/50"
            >
              <div className="flex space-x-1">
                <motion.div
                  className="w-2 h-2 bg-gradient-to-r from-serenity-400 to-wellness-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gradient-to-r from-wellness-400 to-accent-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gradient-to-r from-accent-400 to-serenity-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <span className="ml-3 text-xs text-calm-600 dark:text-calm-400 font-medium">
                InnerCalm is reflecting...
              </span>
            </motion.div>
          )}

          {/* Subtle glow effect for user messages */}
          {isUser && (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-serenity-400/20 to-wellness-400/20 dark:from-serenity-300/10 dark:to-wellness-300/10 -z-10 blur-sm"></div>
          )}
        </motion.div>

        {/* Modern message tail with gradient */}
        <div className={`
          w-0 h-0 mt-1 transition-all duration-300
          ${isUser
            ? `ml-auto mr-4
               border-l-[14px] border-l-transparent
               border-t-[14px] border-t-serenity-600
               dark:border-t-serenity-500
               drop-shadow-sm`
            : `ml-4
               border-r-[14px] border-r-transparent
               border-t-[14px] border-t-white
               dark:border-t-calm-800
               drop-shadow-sm`
          }
        `} />
      </div>

      {/* Enhanced Avatar with wellness design */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`
          w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-sm md:text-base font-bold
          shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110
          ${isUser
            ? `bg-gradient-to-br from-serenity-100 via-wellness-100 to-accent-100
               dark:from-serenity-900/40 dark:via-wellness-900/40 dark:to-accent-900/40
               text-serenity-700 dark:text-serenity-300
               border border-serenity-200/50 dark:border-serenity-700/50
               order-1 mr-3 shadow-serenity-500/20`
            : `bg-gradient-to-br from-accent-100 via-wellness-100 to-serenity-100
               dark:from-accent-900/40 dark:via-wellness-900/40 dark:to-serenity-900/40
               text-accent-700 dark:text-accent-300
               border border-accent-200/50 dark:border-accent-700/50
               order-2 ml-3 shadow-accent-500/20`
          }
        `}
      >
        {isUser ? (
          <User className="h-5 w-5 md:h-6 md:w-6" />
        ) : (
          <span className="text-lg md:text-xl">🧘</span>
        )}
      </motion.div>
    </motion.div>
  )
}

export default MessageFormatter
