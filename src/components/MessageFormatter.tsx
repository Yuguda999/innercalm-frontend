import React from 'react'
import { motion } from 'framer-motion'

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && getApproachBadge()}

        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm
            ${isUser
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-white dark:bg-calm-800 border border-calm-200 dark:border-calm-700 rounded-bl-md'
            }
            ${isStreaming ? 'animate-pulse' : ''}
          `}
        >
          <div className={`${isUser ? 'text-white' : 'text-calm-800 dark:text-calm-200'}`}>
            {formatContent(content)}
          </div>

          {isStreaming && !isUser && (
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="ml-2 text-xs text-calm-500 dark:text-calm-400">InnerCalm is typing...</span>
            </div>
          )}
        </div>

        {/* Message tail */}
        <div className={`
          w-0 h-0 mt-1
          ${isUser
            ? 'ml-auto mr-3 border-l-[12px] border-l-transparent border-t-[12px] border-t-primary-500'
            : 'ml-3 border-r-[12px] border-r-transparent border-t-[12px] border-t-white dark:border-t-calm-800'
          }
        `} />
      </div>

      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${isUser
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 order-1 mr-3'
          : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 order-2 ml-3'
        }
      `}>
        {isUser ? 'You' : '🧘'}
      </div>
    </motion.div>
  )
}

export default MessageFormatter
