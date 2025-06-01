import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Settings,
  Sparkles,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface SharedWoundGroup {
  id: number;
  name: string;
  description: string;
  emotional_pattern: Record<string, number>;
  trauma_themes: string[];
  healing_stage: string;
  member_count: number;
  circle_count: number;
}

interface PeerCircle {
  id: number;
  name: string;
  description: string;
  member_count: number;
  max_members: number;
  last_activity_at: string;
  user_membership_status?: string;
  status: string;
  is_private: boolean;
  requires_invitation: boolean;
  facilitator_id?: number;
  shared_wound_group_id: number;
}

interface ReflectionEntry {
  id: number;
  content: string;
  reflection_type: string;
  helpful_count: number;
  created_at: string;
  user_name: string;
}

interface ReflectionChain {
  id: number;
  title: string;
  description: string;
  healing_module: string;
  entry_count: number;
}

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'groups' | 'circles' | 'reflections'>('groups');

  // Data states
  const [availableGroups, setAvailableGroups] = useState<SharedWoundGroup[]>([]);
  const [userCircles, setUserCircles] = useState<PeerCircle[]>([]);
  const [recentReflections, setRecentReflections] = useState<ReflectionEntry[]>([]);
  const [suggestedChains, setSuggestedChains] = useState<ReflectionChain[]>([]);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHealingStage, setSelectedHealingStage] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [groupCircles, setGroupCircles] = useState<Record<number, PeerCircle[]>>({});
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [selectedGroupForCircle, setSelectedGroupForCircle] = useState<number | null>(null);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/api/community/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableGroups(data.available_groups || []);
        setUserCircles(data.user_circles || []);
        setRecentReflections(data.recent_reflections || []);
        setSuggestedChains(data.suggested_chains || []);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = async (groupId: number) => {
    const newExpanded = new Set(expandedGroups);

    if (expandedGroups.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
      // Fetch circles for this group if not already loaded
      if (!groupCircles[groupId]) {
        await fetchGroupCircles(groupId);
      }
    }

    setExpandedGroups(newExpanded);
  };

  const fetchGroupCircles = async (groupId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/community/groups/${groupId}/circles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const circles = await response.json();
        setGroupCircles(prev => ({ ...prev, [groupId]: circles }));
      }
    } catch (error) {
      console.error('Error fetching group circles:', error);
    }
  };

  const requestToJoinCircle = async (circleId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/community/circles/${circleId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchCommunityData(); // Refresh data
        // Refresh the specific group's circles
        const circle = Object.values(groupCircles).flat().find(c => c.id === circleId);
        if (circle) {
          await fetchGroupCircles(circle.shared_wound_group_id);
        }
      } else {
        const error = await response.json();
        alert(`Failed to join circle: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error requesting to join circle:', error);
      alert('Failed to join circle. Please try again.');
    }
  };

  const createCircle = async (groupId: number, circleData: { name: string; description: string; maxMembers: number; isPrivate: boolean }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/community/circles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shared_wound_group_id: groupId,
          name: circleData.name,
          description: circleData.description,
          max_members: circleData.maxMembers,
          is_private: circleData.isPrivate,
          requires_invitation: circleData.isPrivate,
        }),
      });

      if (response.ok) {
        setShowCreateCircleModal(false);
        setSelectedGroupForCircle(null);
        fetchCommunityData(); // Refresh data
        await fetchGroupCircles(groupId); // Refresh group circles
      } else {
        const error = await response.json();
        alert(`Failed to create circle: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating circle:', error);
      alert('Failed to create circle. Please try again.');
    }
  };

  const getEmotionColor = (emotion: string, intensity: number) => {
    const colors = {
      joy: `rgba(34, 197, 94, ${intensity})`,
      sadness: `rgba(59, 130, 246, ${intensity})`,
      anger: `rgba(239, 68, 68, ${intensity})`,
      fear: `rgba(168, 85, 247, ${intensity})`,
      surprise: `rgba(245, 158, 11, ${intensity})`,
      disgust: `rgba(107, 114, 128, ${intensity})`,
    };
    return colors[emotion as keyof typeof colors] || `rgba(107, 114, 128, ${intensity})`;
  };

  const filteredGroups = availableGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !selectedHealingStage || group.healing_stage === selectedHealingStage;
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-full mr-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-calm-900 dark:text-calm-100">
              Community & Peer Circles
            </h1>
          </div>
          <p className="text-base sm:text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto px-4">
            Connect with others who share similar healing journeys. Find support, share wisdom, and grow together.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white/90 dark:bg-calm-800/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/30 dark:border-calm-600/30 w-full max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {[
                { key: 'groups', label: 'Groups', fullLabel: 'Shared Wound Groups', icon: Users },
                { key: 'circles', label: 'My Circles', fullLabel: 'My Circles', icon: MessageCircle },
                { key: 'reflections', label: 'Reflections', fullLabel: 'Reflection Chains', icon: Heart },
              ].map(({ key, label, fullLabel, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-3 sm:px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 touch-target ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                      : 'text-calm-600 dark:text-calm-400 hover:bg-calm-100 dark:hover:bg-calm-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-medium">
                    <span className="sm:hidden">{label}</span>
                    <span className="hidden sm:inline">{fullLabel}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'groups' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-calm-400 dark:text-calm-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 sm:pl-12 text-sm sm:text-base"
                  />
                </div>
                <div className="relative sm:w-48">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-calm-400 dark:text-calm-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <select
                    value={selectedHealingStage}
                    onChange={(e) => setSelectedHealingStage(e.target.value)}
                    className="input-field pl-10 sm:pl-12 pr-8 text-sm sm:text-base appearance-none cursor-pointer"
                  >
                    <option value="">All Stages</option>
                    <option value="early">Early</option>
                    <option value="processing">Processing</option>
                    <option value="integration">Integration</option>
                    <option value="growth">Growth</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-calm-400 dark:text-calm-500 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Available Groups */}
            <div className="space-y-4 sm:space-y-6">
              {filteredGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  {/* Group Header */}
                  <div className="p-4 sm:p-6 border-b border-calm-200 dark:border-calm-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-calm-900 dark:text-calm-100 flex-1">
                        {group.name}
                      </h3>
                      <span className="px-3 py-1 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-800 dark:text-primary-200 rounded-full text-xs sm:text-sm font-medium self-start">
                        {group.healing_stage}
                      </span>
                    </div>

                    <p className="text-calm-600 dark:text-calm-400 mb-4 text-sm sm:text-base leading-relaxed">
                      {group.description}
                    </p>

                    {/* Emotional Pattern Visualization */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Sparkles className="h-4 w-4 text-primary-500 mr-2" />
                        <h4 className="text-sm font-medium text-calm-700 dark:text-calm-300">Emotional Pattern</h4>
                      </div>
                      <div className="flex space-x-1 rounded-lg overflow-hidden">
                        {Object.entries(group.emotional_pattern).map(([emotion, intensity]) => (
                          <div
                            key={emotion}
                            className="h-3 flex-1 transition-all duration-200 hover:h-4"
                            style={{ backgroundColor: getEmotionColor(emotion, intensity as number) }}
                            title={`${emotion}: ${Math.round((intensity as number) * 100)}%`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Trauma Themes */}
                    {group.trauma_themes && group.trauma_themes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Heart className="h-4 w-4 text-accent-500 mr-2" />
                          <h4 className="text-sm font-medium text-calm-700 dark:text-calm-300">Common Themes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.trauma_themes.slice(0, 3).map((theme) => (
                            <span key={theme} className="px-2 py-1 bg-calm-100 dark:bg-calm-700 text-calm-700 dark:text-calm-300 rounded-lg text-xs font-medium">
                              {theme}
                            </span>
                          ))}
                          {group.trauma_themes.length > 3 && (
                            <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg text-xs font-medium">
                              +{group.trauma_themes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center space-x-4 text-sm text-calm-500 dark:text-calm-400">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{group.member_count} members</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{group.circle_count} circles</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGroupForCircle(group.id);
                            setShowCreateCircleModal(true);
                          }}
                          className="btn-primary flex items-center justify-center space-x-2 text-sm py-2 px-4"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Circle</span>
                        </button>
                        <button
                          onClick={() => toggleGroupExpansion(group.id)}
                          className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm py-2 px-4 shadow-md hover:shadow-lg"
                        >
                          {expandedGroups.has(group.id) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span className="hidden sm:inline">Hide Circles</span>
                              <span className="sm:hidden">Hide</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span className="hidden sm:inline">View Circles</span>
                              <span className="sm:hidden">View</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Circles List */}
                  <AnimatePresence>
                    {expandedGroups.has(group.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 sm:p-6 bg-calm-50 dark:bg-calm-800/50"
                      >
                      <div className="flex items-center mb-4">
                        <MessageCircle className="h-5 w-5 text-primary-500 mr-2" />
                        <h4 className="text-base sm:text-lg font-semibold text-calm-900 dark:text-calm-100">Peer Circles</h4>
                      </div>
                      {groupCircles[group.id] ? (
                        groupCircles[group.id].length > 0 ? (
                          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            {groupCircles[group.id].map((circle) => (
                              <motion.div
                                key={circle.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/90 dark:bg-calm-800/90 backdrop-blur-sm rounded-lg p-4 border border-calm-200 dark:border-calm-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-lg"
                              >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                  <h5 className="font-semibold text-calm-900 dark:text-calm-100 text-sm sm:text-base">
                                    {circle.name}
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    {circle.is_private && (
                                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs font-medium flex items-center">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Private
                                      </span>
                                    )}
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                      circle.status === 'active'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-calm-100 dark:bg-calm-700 text-calm-800 dark:text-calm-200'
                                    }`}>
                                      {circle.status}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-calm-600 dark:text-calm-400 text-xs sm:text-sm mb-3 leading-relaxed">
                                  {circle.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  <div className="flex items-center text-xs sm:text-sm text-calm-500 dark:text-calm-400">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span>{circle.member_count}/{circle.max_members} members</span>
                                  </div>
                                  <button
                                    onClick={() => requestToJoinCircle(circle.id)}
                                    disabled={circle.member_count >= circle.max_members}
                                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 transition-all duration-200 touch-target ${
                                      circle.member_count >= circle.max_members
                                        ? 'bg-calm-300 dark:bg-calm-600 text-calm-500 dark:text-calm-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                    }`}
                                  >
                                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>
                                      {circle.member_count >= circle.max_members ? 'Full' : 'Join'}
                                    </span>
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6">
                              <MessageCircle className="w-12 h-12 text-calm-400 dark:text-calm-500 mx-auto mb-3" />
                              <p className="text-calm-600 dark:text-calm-400 mb-4 text-sm sm:text-base">
                                No circles in this group yet.
                              </p>
                              <button
                                onClick={() => {
                                  setSelectedGroupForCircle(group.id);
                                  setShowCreateCircleModal(true);
                                }}
                                className="btn-primary flex items-center space-x-2 mx-auto text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Create First Circle</span>
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                          <p className="text-calm-500 dark:text-calm-400 mt-2 text-sm">Loading circles...</p>
                        </div>
                      )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-800/50 dark:to-calm-700/50 rounded-xl p-8">
                  <Users className="w-16 h-16 text-calm-400 dark:text-calm-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-calm-700 dark:text-calm-300 mb-2">No groups found</h3>
                  <p className="text-calm-500 dark:text-calm-400">Try adjusting your search or filters.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'circles' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {userCircles.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userCircles.map((circle) => (
                  <motion.div
                    key={circle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                    onClick={() => window.location.href = `/community/circles/${circle.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-calm-500 dark:text-calm-400">Active</span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-calm-900 dark:text-calm-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {circle.name}
                    </h3>
                    <p className="text-calm-600 dark:text-calm-400 mb-4 text-sm sm:text-base leading-relaxed line-clamp-2">
                      {circle.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <div className="flex items-center text-xs sm:text-sm text-calm-500 dark:text-calm-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{circle.member_count} members</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-calm-500 dark:text-calm-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(circle.last_activity_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        circle.user_membership_status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {circle.user_membership_status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-8">
                  <MessageCircle className="w-16 h-16 text-calm-400 dark:text-calm-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-calm-700 dark:text-calm-300 mb-2">No circles yet</h3>
                  <p className="text-calm-500 dark:text-calm-400 mb-6 max-w-md mx-auto">
                    Create or join circles in shared wound groups to start connecting with peers.
                  </p>
                  <button
                    onClick={() => setActiveTab('groups')}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Explore Groups</span>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'reflections' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Suggested Chains */}
            <div className="bg-white dark:bg-calm-800 rounded-lg p-6 shadow-lg dark:shadow-2xl border border-calm-200 dark:border-calm-700">
              <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">Suggested Reflection Chains</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {suggestedChains.map((chain) => (
                  <div
                    key={chain.id}
                    className="border border-calm-200 dark:border-calm-600 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer bg-white dark:bg-calm-700"
                    onClick={() => window.location.href = `/community/reflections/${chain.id}`}
                  >
                    <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">{chain.title}</h4>
                    <p className="text-calm-600 dark:text-calm-400 text-sm mb-2">{chain.description}</p>
                    <div className="flex justify-between items-center text-sm text-calm-600 dark:text-calm-400">
                      <span>{chain.healing_module}</span>
                      <span>{chain.entry_count} reflections</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reflections */}
            <div className="bg-white dark:bg-calm-800 rounded-lg p-6 shadow-lg dark:shadow-2xl border border-calm-200 dark:border-calm-700">
              <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4">Recent Reflections</h3>
              <div className="space-y-4">
                {recentReflections.map((reflection) => (
                  <div key={reflection.id} className="border-l-4 border-primary-200 dark:border-primary-600 pl-4 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-r-lg">
                    <p className="text-calm-900 dark:text-calm-100 mb-2">{reflection.content}</p>
                    <div className="flex justify-between items-center text-sm text-calm-600 dark:text-calm-400">
                      <span>by {reflection.user_name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{reflection.helpful_count}</span>
                        </span>
                        <span>{new Date(reflection.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Create Circle Modal */}
        {showCreateCircleModal && selectedGroupForCircle && (
          <CreateCircleModal
            groupId={selectedGroupForCircle}
            onClose={() => {
              setShowCreateCircleModal(false);
              setSelectedGroupForCircle(null);
            }}
            onCreateCircle={createCircle}
          />
        )}
      </div>
    </div>
  );
};

// Create Circle Modal Component
const CreateCircleModal: React.FC<{
  groupId: number;
  onClose: () => void;
  onCreateCircle: (groupId: number, circleData: { name: string; description: string; maxMembers: number; isPrivate: boolean }) => void;
}> = ({ groupId, onClose, onCreateCircle }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onCreateCircle(groupId, { name: name.trim(), description: description.trim(), maxMembers, isPrivate });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 dark:bg-calm-800/95 backdrop-blur-md rounded-xl p-6 w-full max-w-md shadow-2xl border border-white/30 dark:border-calm-600/30"
      >
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg mr-3">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100">Create New Circle</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Circle Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter circle name..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe the purpose of this circle..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
              Maximum Members
            </label>
            <select
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              className="input-field appearance-none cursor-pointer"
            >
              <option value={4}>4 members</option>
              <option value={6}>6 members</option>
              <option value={8}>8 members</option>
              <option value={10}>10 members</option>
              <option value={12}>12 members</option>
            </select>
          </div>

          <div className="flex items-center p-3 bg-calm-50 dark:bg-calm-700/50 rounded-lg">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-calm-300 dark:border-calm-600 rounded"
            />
            <label htmlFor="isPrivate" className="ml-3 flex items-center text-sm text-calm-700 dark:text-calm-300">
              <Shield className="h-4 w-4 mr-1" />
              Private circle (requires invitation)
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-calm-300 dark:border-calm-600 text-calm-700 dark:text-calm-300 rounded-lg hover:bg-calm-50 dark:hover:bg-calm-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Create Circle
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
