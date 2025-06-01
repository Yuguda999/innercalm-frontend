import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Plus, Star, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ReflectionEntry {
  id: number;
  content: string;
  reflection_type: string;
  target_stage: string;
  target_emotions: string[];
  helpful_count: number;
  view_count: number;
  created_at: string;
  user_name: string;
  is_helpful_to_user: boolean;
}

interface ReflectionChain {
  id: number;
  title: string;
  description: string;
  healing_module: string;
  difficulty_level: string;
  entry_count: number;
  created_at: string;
}

interface ReflectionChainProps {
  chainId: number;
}

const ReflectionChain: React.FC<ReflectionChainProps> = ({ chainId }) => {
  const { user } = useAuth();
  const [chain, setChain] = useState<ReflectionChain | null>(null);
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReflection, setShowAddReflection] = useState(false);
  const [newReflection, setNewReflection] = useState({
    content: '',
    reflection_type: 'encouragement',
    target_stage: '',
    target_emotions: [] as string[],
  });
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchChainData();
  }, [chainId]);

  const fetchChainData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch chain entries
      const entriesResponse = await fetch(`http://localhost:8000/api/community/reflection-chains/${chainId}/entries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData);
      }

      // For now, we'll create a mock chain object since we don't have a specific endpoint
      // In production, you'd fetch this from /community/reflection-chains/{chainId}
      setChain({
        id: chainId,
        title: 'Healing from Childhood Trauma',
        description: 'A supportive chain for those working through childhood experiences',
        healing_module: 'Inner Child Work',
        difficulty_level: 'intermediate',
        entry_count: entriesData?.length || 0,
        created_at: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error fetching chain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReflection = async () => {
    if (!newReflection.content.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/community/reflection-entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chain_id: chainId,
          ...newReflection,
        }),
      });

      if (response.ok) {
        setNewReflection({
          content: '',
          reflection_type: 'encouragement',
          target_stage: '',
          target_emotions: [],
        });
        setShowAddReflection(false);
        fetchChainData(); // Refresh entries
      }
    } catch (error) {
      console.error('Error adding reflection:', error);
    }
  };

  const toggleExpanded = (entryId: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const getReflectionTypeIcon = (type: string) => {
    switch (type) {
      case 'encouragement':
        return <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      case 'insight':
        return <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'tip':
        return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'story':
        return <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <MessageCircle className="w-5 h-5 text-calm-600 dark:text-calm-400" />;
    }
  };

  const getReflectionTypeColor = (type: string) => {
    switch (type) {
      case 'encouragement':
        return 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800';
      case 'insight':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
      case 'tip':
        return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
      case 'story':
        return 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800';
      default:
        return 'bg-white dark:bg-calm-700 border border-calm-200 dark:border-calm-600';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-calm-100 dark:bg-calm-700 text-calm-800 dark:text-calm-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Chain Header */}
      {chain && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-calm-800 rounded-lg p-6 shadow-lg dark:shadow-2xl border border-calm-200 dark:border-calm-700 mb-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-2">{chain.title}</h1>
              <p className="text-calm-600 dark:text-calm-400 mb-4">{chain.description}</p>
              <div className="flex items-center space-x-4 text-sm text-calm-600 dark:text-calm-400">
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{chain.healing_module}</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(chain.difficulty_level)}`}>
                  {chain.difficulty_level}
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{chain.entry_count} reflections</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowAddReflection(!showAddReflection)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Pay It Forward</span>
            </button>
          </div>

          {/* Add Reflection Form */}
          <AnimatePresence>
            {showAddReflection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-calm-200 dark:border-calm-600 pt-4"
              >
                <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">Share Your Wisdom</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                      Your reflection
                    </label>
                    <textarea
                      value={newReflection.content}
                      onChange={(e) => setNewReflection({ ...newReflection, content: e.target.value })}
                      placeholder="Share something that helped you, an insight you gained, or words of encouragement for someone just starting this journey..."
                      className="input-field"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Type
                      </label>
                      <select
                        value={newReflection.reflection_type}
                        onChange={(e) => setNewReflection({ ...newReflection, reflection_type: e.target.value })}
                        className="input-field"
                      >
                        <option value="encouragement">Encouragement</option>
                        <option value="insight">Insight</option>
                        <option value="tip">Practical Tip</option>
                        <option value="story">Personal Story</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                        Target Stage (Optional)
                      </label>
                      <select
                        value={newReflection.target_stage}
                        onChange={(e) => setNewReflection({ ...newReflection, target_stage: e.target.value })}
                        className="input-field"
                      >
                        <option value="">All stages</option>
                        <option value="early">Early healing</option>
                        <option value="processing">Processing</option>
                        <option value="integration">Integration</option>
                        <option value="growth">Growth</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={addReflection}
                        disabled={!newReflection.content.trim()}
                        className="w-full btn-primary"
                      >
                        Share Reflection
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Reflection Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">Reflections from the Community</h2>

        {entries.length > 0 ? (
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg shadow-lg dark:shadow-2xl ${getReflectionTypeColor(entry.reflection_type)}`}
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getReflectionTypeIcon(entry.reflection_type)}
                    <div>
                      <span className="font-medium text-calm-900 dark:text-calm-100 capitalize">
                        {entry.reflection_type}
                      </span>
                      {entry.target_stage && (
                        <span className="ml-2 px-2 py-1 bg-white/50 dark:bg-calm-700/50 rounded text-xs text-calm-700 dark:text-calm-300">
                          For: {entry.target_stage}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-calm-600 dark:text-calm-400">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{entry.helpful_count}</span>
                    </span>
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Entry Content */}
                <div className="mb-4">
                  <p className="text-calm-900 dark:text-calm-100 leading-relaxed">
                    {expandedEntries.has(entry.id) || entry.content.length <= 200
                      ? entry.content
                      : `${entry.content.substring(0, 200)}...`}
                  </p>

                  {entry.content.length > 200 && (
                    <button
                      onClick={() => toggleExpanded(entry.id)}
                      className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center space-x-1"
                    >
                      {expandedEntries.has(entry.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Show less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Read more</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Target Emotions */}
                {entry.target_emotions && entry.target_emotions.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm text-calm-600 dark:text-calm-400">Helpful for: </span>
                    <div className="inline-flex flex-wrap gap-1">
                      {entry.target_emotions.map((emotion) => (
                        <span
                          key={emotion}
                          className="px-2 py-1 bg-white/50 dark:bg-calm-700/50 rounded text-xs text-calm-700 dark:text-calm-300"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-calm-600 dark:text-calm-400">
                    Shared by {entry.user_name}
                  </span>
                  <button
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      entry.is_helpful_to_user
                        ? 'bg-pink-200 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'
                        : 'bg-white/50 dark:bg-calm-700/50 text-calm-600 dark:text-calm-400 hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${entry.is_helpful_to_user ? 'fill-current' : ''}`} />
                    <span>Helpful</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-calm-800 rounded-lg shadow-lg dark:shadow-2xl border border-calm-200 dark:border-calm-700">
            <MessageCircle className="w-16 h-16 text-calm-400 dark:text-calm-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-calm-600 dark:text-calm-400 mb-2">No reflections yet</h3>
            <p className="text-calm-500 dark:text-calm-500 mb-4">Be the first to share your wisdom and help others on their healing journey.</p>
            <button
              onClick={() => setShowAddReflection(true)}
              className="btn-primary"
            >
              Share Your Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionChain;
