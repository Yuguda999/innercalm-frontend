import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'
import { chatAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MessageFormatter from '../components/MessageFormatter'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  therapeuticApproach?: string
  isStreaming?: boolean
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversations = await chatAPI.getConversations()
        if (conversations.length > 0) {
          // Load the most recent conversation
          const latestConversation = conversations[0]
          setCurrentConversationId(latestConversation.id)

          // Convert conversation messages to our format
          const conversationMessages = latestConversation.messages || []
          const formattedMessages = conversationMessages.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            sender: msg.is_user_message ? 'user' : 'ai',
            timestamp: msg.timestamp
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setLoading(true)

    // Create streaming AI message
    const streamingMessageId = (Date.now() + 1).toString()
    const streamingMessage: Message = {
      id: streamingMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }

    setMessages(prev => [...prev, streamingMessage])

    try {
      let fullResponse = ''
      let therapeuticApproach = ''
      let newConversationId = currentConversationId

      await chatAPI.streamMessage(
        messageToSend,
        currentConversationId || undefined,
        (chunk) => {
          switch (chunk.type) {
            case 'conversation_id':
              if (!newConversationId) {
                newConversationId = parseInt(chunk.content)
                setCurrentConversationId(newConversationId)
              }
              break

            case 'metadata':
              therapeuticApproach = chunk.metadata?.therapeutic_approach || ''
              break

            case 'response_chunk':
              if (chunk.content) {
                fullResponse += chunk.content
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: fullResponse, therapeuticApproach }
                      : msg
                  )
                )
              }
              break

            case 'response_complete':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? { ...msg, isStreaming: false, therapeuticApproach }
                    : msg
                )
              )
              break

            case 'error':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? {
                        ...msg,
                        content: chunk.content || "I'm sorry, I'm having trouble responding right now. Please try again.",
                        isStreaming: false
                      }
                    : msg
                )
              )
              break
          }
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      // Update streaming message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: "I'm sorry, I'm having trouble responding right now. Please try again.",
                isStreaming: false
              }
            : msg
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      <div className="max-w-4xl mx-auto h-screen flex flex-col relative">
        {/* Minimized Header - Collapsible on mobile */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-md border-b border-wellness-200/30 dark:border-calm-700/30 px-4 py-3 md:px-6 md:py-4 relative z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-serenity-400 via-wellness-400 to-accent-400 rounded-2xl flex items-center justify-center shadow-lg shadow-serenity-500/20 dark:shadow-serenity-400/10">
                <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-semibold text-calm-900 dark:text-calm-100 tracking-tight">AI Companion</h1>
                <p className="text-xs md:text-sm text-calm-600 dark:text-calm-400 font-medium">
                  Your wellness guide
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-calm-900 dark:text-calm-100">AI Companion</h1>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-wellness-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-calm-600 dark:text-calm-400 hidden md:inline">Online</span>
            </div>
          </div>
        </motion.div>

        {/* Messages - Chat-focused with enhanced mobile design */}
        <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 space-y-3 md:space-y-4 scroll-smooth">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center py-8 md:py-12 px-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-serenity-400 via-wellness-400 to-accent-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-serenity-500/30 dark:shadow-serenity-400/20">
                    <Bot className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-wellness-400 rounded-full animate-pulse"></div>
                </div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl font-semibold text-calm-900 dark:text-calm-100 mb-3 tracking-tight"
                >
                  Hello {user?.full_name || user?.username}! 👋
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm md:text-base text-calm-600 dark:text-calm-400 max-w-sm md:max-w-md mx-auto leading-relaxed"
                >
                  I'm here to listen and support you. Share what's on your mind, and I'll help you process your thoughts and emotions with care.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-calm-500 dark:text-calm-500"
                >
                  <span className="px-3 py-1 bg-wellness-100 dark:bg-wellness-900/20 rounded-full">Mindful</span>
                  <span className="px-3 py-1 bg-serenity-100 dark:bg-serenity-900/20 rounded-full">Supportive</span>
                  <span className="px-3 py-1 bg-accent-100 dark:bg-accent-900/20 rounded-full">Confidential</span>
                </motion.div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: index * 0.05
                }}
                layout
              >
                <MessageFormatter
                  content={message.content}
                  isUser={message.sender === 'user'}
                  isStreaming={message.isStreaming}
                  therapeuticApproach={message.therapeuticApproach}
                  timestamp={message.timestamp}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Enhanced Input - Mobile-first with wellness design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-calm-800/80 backdrop-blur-md border-t border-wellness-200/40 dark:border-calm-700/40 px-3 py-4 md:px-6 md:py-6 relative z-10"
        >
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3 md:space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share your thoughts with care..."
                className="w-full bg-gradient-to-r from-white/90 to-wellness-50/90 dark:from-calm-700/90 dark:to-calm-600/90
                         border border-wellness-200/60 dark:border-calm-500/60
                         focus:border-serenity-400 focus:ring-2 focus:ring-serenity-200/50
                         dark:focus:border-serenity-300 dark:focus:ring-serenity-400/30
                         rounded-2xl px-4 py-3 md:px-5 md:py-4
                         text-sm md:text-base text-calm-900 dark:text-calm-100
                         placeholder-calm-500 dark:placeholder-calm-400
                         transition-all duration-300 ease-in-out
                         min-h-[48px] md:min-h-[52px]
                         shadow-sm hover:shadow-md focus:shadow-lg
                         backdrop-blur-sm"
                disabled={loading}
                autoComplete="off"
                autoCapitalize="sentences"
              />

              {/* Typing indicator */}
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-serenity-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-serenity-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-serenity-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-br from-serenity-500 via-wellness-500 to-accent-500
                       hover:from-serenity-600 hover:via-wellness-600 hover:to-accent-600
                       dark:from-serenity-400 dark:via-wellness-400 dark:to-accent-400
                       dark:hover:from-serenity-500 dark:hover:via-wellness-500 dark:hover:to-accent-500
                       text-white dark:text-calm-900
                       shadow-lg hover:shadow-xl shadow-serenity-500/30 dark:shadow-serenity-400/20
                       transform hover:scale-105 active:scale-95
                       transition-all duration-200 ease-out
                       rounded-2xl min-h-[48px] min-w-[48px] md:min-h-[52px] md:min-w-[52px]
                       px-4 md:px-5 flex items-center justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       relative z-10 cursor-pointer
                       touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </motion.button>
          </form>

          {/* Wellness reminder */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-calm-500 dark:text-calm-500 text-center mt-3 md:mt-4"
          >
            Your conversations are private and secure 🔒
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default ChatPage
