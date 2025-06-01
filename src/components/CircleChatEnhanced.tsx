import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Heart, MessageCircle, Users, MoreVertical, Wifi, WifiOff,
  Smile, Paperclip, Mic, MicOff, Phone, Video, Settings, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface CircleMessage {
  id: number;
  content: string;
  message_type: string;
  user_id: number;
  user_name: string;
  support_count: number;
  reply_count: number;
  created_at: string;
  user_has_supported: boolean;
  replies: CircleMessageReply[];
  supports: MessageSupport[];
}

interface CircleMessageReply {
  id: number;
  content: string;
  user_id: number;
  user_name: string;
  created_at: string;
}

interface MessageSupport {
  id: number;
  user_id: number;
  user_name: string;
  support_type: string;
  created_at: string;
}

interface OnlineUser {
  user_id: number;
  user_name: string;
}

interface CircleChatEnhancedProps {
  circleId: number;
  circleName: string;
}

const CircleChatEnhanced: React.FC<CircleChatEnhancedProps> = ({ circleId, circleName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [selectedMessageType, setSelectedMessageType] = useState('text');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Define fetchInitialMessages first
  const fetchInitialMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/community/circles/${circleId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.reverse());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  // WebSocket connection
  const token = localStorage.getItem('token');
  const wsUrl = `ws://localhost:8000/ws/circles/${circleId}?token=${token}`;

  // Memoize WebSocket callbacks to prevent reconnections
  const handleWebSocketConnect = useCallback(() => {
    console.log('Connected to circle chat');
    fetchInitialMessages();
  }, [fetchInitialMessages]);

  const handleWebSocketDisconnect = useCallback(() => {
    console.log('Disconnected from circle chat');
  }, []);

  const {
    isConnected,
    isConnecting,
    sendMessage: sendWebSocketMessage,
    lastMessage,
    connectionError,
    reconnect
  } = useWebSocket(wsUrl, {
    onMessage: handleWebSocketMessage,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect
  });

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle WebSocket messages
  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'new_message':
        setMessages(prev => [...prev, message.message]);
        break;
      case 'message_supported':
        setMessages(prev => prev.map(msg =>
          msg.id === message.message_id
            ? { ...msg, support_count: msg.support_count + 1 }
            : msg
        ));
        break;
      case 'user_joined':
        // Handle user joined notification
        break;
      case 'user_left':
        // Handle user left notification
        break;
      case 'typing':
        handleTypingIndicator(message);
        break;
      case 'error':
        console.error('WebSocket error:', message.message);
        break;
    }
  }

  const handleTypingIndicator = (message: any) => {
    const { user_name, is_typing } = message;

    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (is_typing) {
        newSet.add(user_name);
      } else {
        newSet.delete(user_name);
      }
      return newSet;
    });

    // Auto-remove typing indicator after 3 seconds
    if (is_typing) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(user_name);
          return newSet;
        });
      }, 3000);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !isConnected) return;

    setSending(true);

    try {
      sendWebSocketMessage({
        type: 'chat_message',
        content: newMessage,
        message_type: selectedMessageType
      });

      setNewMessage('');
      setSelectedMessageType('text');

      // Reset textarea height
      if (messageInputRef.current) {
        messageInputRef.current.style.height = 'auto';
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const supportMessage = async (messageId: number) => {
    if (!isConnected) return;

    sendWebSocketMessage({
      type: 'support_message',
      message_id: messageId,
      support_type: 'heart'
    });
  };

  const handleTyping = () => {
    if (!isConnected) return;

    sendWebSocketMessage({
      type: 'typing',
      is_typing: true
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendWebSocketMessage({
        type: 'typing',
        is_typing: false
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    handleTyping();

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'support':
        return <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      case 'check_in':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'reflection':
        return <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <MessageCircle className="w-4 h-4 text-calm-600 dark:text-calm-400" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'chat-bubble-support';
      case 'check_in':
        return 'chat-bubble-checkin';
      case 'reflection':
        return 'chat-bubble-reflection';
      default:
        return 'chat-bubble-other';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-wellness-50/30 to-serenity-50/30 dark:from-calm-800 dark:via-calm-700 dark:to-calm-800 rounded-3xl shadow-2xl dark:shadow-3xl border border-wellness-200/50 dark:border-calm-600/50 overflow-hidden backdrop-blur-sm">
      {/* Modern Minimized Header */}
      <div className="p-3 md:p-4 border-b border-wellness-200/50 dark:border-calm-600/50 bg-gradient-to-r from-wellness-50/80 via-white/90 to-serenity-50/80 dark:from-calm-700/90 dark:via-calm-600/90 dark:to-calm-700/90 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-gradient-to-br from-serenity-500 to-serenity-600 dark:from-serenity-400 dark:to-serenity-500 rounded-2xl shadow-lg serenity-glow">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-calm-900 flex-shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm md:text-lg font-bold bg-gradient-to-r from-calm-900 to-serenity-700 dark:from-calm-100 dark:to-serenity-300 bg-clip-text text-transparent truncate">{circleName}</h3>
              {!isMobile && (
                <p className="text-xs text-calm-600 dark:text-calm-400 font-medium">✨ Safe space for sharing and support</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            {/* Modern Connection status */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-calm-600/60 backdrop-blur-sm border border-wellness-200/50 dark:border-calm-500/50">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-wellness-500 rounded-full animate-pulse"></div>
                  <Wifi className="w-3 h-3 md:w-4 md:h-4 text-wellness-600 dark:text-wellness-400" />
                </>
              ) : isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-serenity-600 dark:border-serenity-400"></div>
                  <span className="text-xs text-serenity-600 dark:text-serenity-400 font-medium">Connecting...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <WifiOff className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                </>
              )}
              {!isMobile && isConnected && (
                <span className="text-xs text-wellness-600 dark:text-wellness-400 font-medium">
                  Connected
                </span>
              )}
            </div>

            {/* Modern Online users count */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-serenity-50 to-wellness-50 dark:from-calm-600/60 dark:to-calm-500/60 backdrop-blur-sm border border-serenity-200/50 dark:border-calm-500/50">
              <Users className="w-3 h-3 md:w-4 md:h-4 text-serenity-600 dark:text-serenity-400" />
              <span className="text-xs font-bold text-serenity-700 dark:text-serenity-300">{onlineUsers.length}</span>
              {!isMobile && (
                <span className="text-xs text-serenity-600 dark:text-serenity-400 font-medium">online</span>
              )}
            </div>
          </div>
        </div>

        {/* Modern Connection error */}
        {connectionError && (
          <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-warmth-50 dark:from-red-900/20 dark:to-warmth-900/20 border border-red-200/50 dark:border-red-700/50 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-red-100 dark:bg-red-800/50 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">{connectionError}</span>
              </div>
              <button
                onClick={reconnect}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages - Modern Chat-focused design */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-gradient-to-b from-transparent via-wellness-50/10 to-transparent dark:via-calm-700/10">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`group relative flex ${
                message.user_id === user?.id
                  ? 'justify-end mr-6 md:mr-16'
                  : 'justify-start ml-6 md:ml-16'
              }`}
            >
              {/* Modern Message Bubble with Enhanced Design */}
              <div className={`relative p-4 md:p-5 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 inline-block max-w-[85%] ${
                message.user_id === user?.id
                  ? 'chat-bubble-user rounded-br-lg transform hover:scale-[1.02]'
                  : `${getMessageTypeColor(message.message_type)} rounded-bl-lg transform hover:scale-[1.02]`
              }`}>
                {/* Modern Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    {message.user_id !== user?.id && (
                      <div className="p-1.5 bg-white/20 dark:bg-calm-800/50 rounded-xl backdrop-blur-sm">
                        {getMessageTypeIcon(message.message_type)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className={`font-bold text-sm md:text-base truncate block ${
                        message.user_id === user?.id
                          ? 'text-white dark:text-calm-900'
                          : 'text-calm-800 dark:text-calm-100'
                      }`}>
                        {message.user_name}
                        {message.user_id === user?.id && ' (You)'}
                      </span>
                      <span className={`text-xs flex-shrink-0 ${
                        message.user_id === user?.id
                          ? 'text-white/80 dark:text-calm-700'
                          : 'text-calm-600 dark:text-calm-400'
                      }`}>
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                  {!isMobile && (
                    <button className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-xl hover:bg-white/10 dark:hover:bg-calm-800/50 ${
                      message.user_id === user?.id
                        ? 'text-white/70 hover:text-white'
                        : 'text-calm-600 dark:text-calm-400 hover:text-calm-700 dark:hover:text-calm-300'
                    }`}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Enhanced Message Content */}
                <p className={`leading-relaxed text-sm md:text-base break-words font-medium ${
                  message.user_id === user?.id
                    ? 'text-white dark:text-calm-900'
                    : 'text-calm-900 dark:text-calm-100'
                }`}>
                  {message.content}
                </p>

                {/* Modern Message Actions */}
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={() => supportMessage(message.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-target ${
                      message.user_has_supported
                        ? message.user_id === user?.id
                          ? 'bg-pink-200/30 text-pink-100 dark:bg-pink-800/30 dark:text-pink-300'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-800/50 dark:text-pink-300'
                        : message.user_id === user?.id
                          ? 'bg-white/10 text-white/80 hover:bg-pink-200/20 hover:text-pink-100 dark:bg-calm-800/30 dark:text-calm-300 dark:hover:bg-pink-800/30'
                          : 'bg-calm-100 text-calm-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-calm-600/50 dark:text-calm-400 dark:hover:bg-pink-800/30 dark:hover:text-pink-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${message.user_has_supported ? 'fill-current' : ''}`} />
                    <span className="font-bold text-sm">{message.support_count}</span>
                  </button>

                  <button
                    onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-target ${
                      message.user_id === user?.id
                        ? 'bg-white/10 text-white/80 hover:bg-serenity-200/20 hover:text-serenity-100 dark:bg-calm-800/30 dark:text-calm-300 dark:hover:bg-serenity-800/30'
                        : 'bg-calm-100 text-calm-600 hover:bg-serenity-100 hover:text-serenity-600 dark:bg-calm-600/50 dark:text-calm-400 dark:hover:bg-serenity-800/30 dark:hover:text-serenity-400'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-bold text-sm">{message.reply_count}</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Reply Input */}
              {replyingTo === message.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="mt-4"
                >
                  <div className="flex space-x-3 p-3 bg-gradient-to-r from-wellness-50/80 to-serenity-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-wellness-200/50 dark:border-calm-500/50">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="✨ Write a supportive reply..."
                      className="flex-1 chat-input-enhanced text-sm focus-visible-enhanced"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && replyContent.trim()) {
                          setReplyContent('');
                          setReplyingTo(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setReplyContent('');
                        setReplyingTo(null);
                      }}
                      disabled={!replyContent.trim()}
                      className="chat-send-button min-w-[44px] px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      type="button"
                      aria-label="Send reply"
                    >
                      <Send className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Typing indicators */}
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center space-x-3 px-4 py-3 mx-4 bg-gradient-to-r from-wellness-50/80 to-serenity-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-wellness-200/50 dark:border-calm-500/50"
          >
            <div className="flex space-x-1">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <span className="text-sm text-calm-700 dark:text-calm-300 font-medium">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Enhanced Message Input */}
      <div className="p-4 md:p-6 border-t border-wellness-200/50 dark:border-calm-600/50 bg-gradient-to-r from-wellness-50/80 via-white/90 to-serenity-50/80 dark:from-calm-700/90 dark:via-calm-600/90 dark:to-calm-700/90 backdrop-blur-md flex-shrink-0">
        {/* Enhanced Message Type Selector */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
          {[
            { type: 'text', label: '💬 Share', color: 'serenity', gradient: 'from-serenity-100 to-serenity-200' },
            { type: 'support', label: '💝 Support', color: 'pink', gradient: 'from-pink-100 to-pink-200' },
            { type: 'check_in', label: '👋 Check-in', color: 'blue', gradient: 'from-blue-100 to-blue-200' },
            { type: 'reflection', label: '🤔 Reflection', color: 'purple', gradient: 'from-purple-100 to-purple-200' },
          ].map(({ type, label, color, gradient }) => (
            <button
              key={type}
              onClick={() => setSelectedMessageType(type)}
              className={`px-4 md:px-5 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus-visible-enhanced ${
                selectedMessageType === type
                  ? `bg-gradient-to-r ${gradient} text-${color}-800 dark:from-${color}-800/80 dark:to-${color}-700/80 dark:text-${color}-200 shadow-lg ${color === 'serenity' ? 'serenity-glow' : color === 'pink' ? 'shadow-pink-500/20' : color === 'blue' ? 'shadow-blue-500/20' : 'shadow-purple-500/20'}`
                  : `bg-gradient-to-r from-white/80 to-wellness-50/80 text-${color}-700 hover:${gradient} hover:text-${color}-800 dark:from-calm-600/50 dark:to-calm-500/50 dark:text-${color}-300 dark:hover:from-${color}-800/50 dark:hover:to-${color}-700/50 shadow-sm hover:shadow-md`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          <textarea
            ref={messageInputRef}
            value={newMessage}
            onChange={handleInputChange}
            placeholder="✨ Share your thoughts, feelings, or support..."
            className="flex-1 chat-input-enhanced resize-none text-sm md:text-base focus-visible-enhanced"
            rows={1}
            style={{ minHeight: '52px', maxHeight: '120px' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || !isConnected}
            className={`chat-send-button flex items-center justify-center space-x-2 min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isMobile ? 'min-w-[52px] px-3' : 'px-4 md:px-6 py-3'
            }`}
            type="button"
            aria-label="Send message"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-calm-900"></div>
            ) : (
              <Send className="w-5 h-5 flex-shrink-0" />
            )}
            {!isMobile && <span className="font-bold">Send</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircleChatEnhanced;
