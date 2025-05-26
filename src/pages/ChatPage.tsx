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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-calm-800/80 backdrop-blur-sm border-b border-white/20 dark:border-calm-700/20 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-calm-900 dark:text-calm-100">AI Companion</h1>
              <p className="text-sm text-calm-600 dark:text-calm-400">Your empathetic mental health support</p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Bot className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-2">
                  Hello {user?.full_name || user?.username}! 👋
                </h2>
                <p className="text-calm-600 dark:text-calm-400 max-w-md mx-auto">
                  I'm here to listen and support you. Feel free to share what's on your mind,
                  and I'll do my best to help you process your thoughts and emotions.
                </p>
              </motion.div>
            )}

            {messages.map((message) => (
              <MessageFormatter
                key={message.id}
                content={message.content}
                isUser={message.sender === 'user'}
                isStreaming={message.isStreaming}
                therapeuticApproach={message.therapeuticApproach}
                timestamp={message.timestamp}
              />
            ))}


          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-calm-800/80 backdrop-blur-sm border-t border-white/20 dark:border-calm-700/20 p-6"
        >
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ChatPage
