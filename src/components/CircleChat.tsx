import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Users, MoreVertical, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface CircleChatProps {
  circleId: number;
  circleName: string;
}

const CircleChat: React.FC<CircleChatProps> = ({ circleId, circleName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages (in production, use WebSocket)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [circleId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
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
        setMessages(data.reverse()); // Reverse to show newest at bottom
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:8000/community/circles/${circleId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peer_circle_id: circleId,
          content: newMessage,
          message_type: 'text',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const supportMessage = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(`http://localhost:8000/community/messages/${messageId}/support`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          support_type: 'heart',
        }),
      });

      fetchMessages(); // Refresh to show updated support count
    } catch (error) {
      console.error('Error supporting message:', error);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'support':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'check_in':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'border-l-pink-400 bg-pink-50';
      case 'check_in':
        return 'border-l-blue-400 bg-blue-50';
      case 'reflection':
        return 'border-l-purple-400 bg-purple-50';
      default:
        return 'border-l-gray-300 bg-white';
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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-indigo-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <span>{circleName}</span>
        </h3>
        <p className="text-sm text-gray-600">Safe space for sharing and support</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border-l-4 p-4 rounded-r-lg ${getMessageTypeColor(message.message_type)}`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getMessageTypeIcon(message.message_type)}
                  <span className="font-medium text-gray-800">
                    {message.user_name}
                    {message.user_id === user?.id && ' (You)'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Message Content */}
              <p className="text-gray-700 mb-3 leading-relaxed">{message.content}</p>

              {/* Message Actions */}
              <div className="flex items-center space-x-4 text-sm">
                <button
                  onClick={() => supportMessage(message.id)}
                  className={`flex items-center space-x-1 transition-colors ${
                    message.user_has_supported
                      ? 'text-pink-600'
                      : 'text-gray-500 hover:text-pink-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${message.user_has_supported ? 'fill-current' : ''}`} />
                  <span>{message.support_count}</span>
                </button>

                <button
                  onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply ({message.reply_count})</span>
                </button>
              </div>

              {/* Replies */}
              {message.replies && message.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="bg-white bg-opacity-50 rounded p-3 ml-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {reply.user_name}
                          {reply.user_id === user?.id && ' (You)'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === message.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 ml-4"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a supportive reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && replyContent.trim()) {
                          // Handle reply submission
                          setReplyContent('');
                          setReplyingTo(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        // Handle reply submission
                        setReplyContent('');
                        setReplyingTo(null);
                      }}
                      disabled={!replyContent.trim()}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts, feelings, or support..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Send</span>
          </button>
        </div>

        {/* Message Type Selector */}
        <div className="flex space-x-2 mt-2">
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            💬 Share
          </button>
          <button className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors">
            💝 Support
          </button>
          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
            👋 Check-in
          </button>
          <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
            🤔 Reflection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircleChat;
