import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Settings,
  Shield,
  Heart,
  Menu,
  X,
  Info,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CircleChatEnhanced from '../components/CircleChatEnhanced';
import CircleInfoPanel from '../components/CircleInfoPanel';
import MemberListPanel from '../components/MemberListPanel';
import CircleGuidelinesPanel from '../components/CircleGuidelinesPanel';
import LoadingSpinner from '../components/LoadingSpinner';

interface PeerCircle {
  id: number;
  name: string;
  description: string;
  status: string;
  max_members: number;
  is_private: boolean;
  requires_invitation: boolean;
  facilitator_id: number;
  professional_moderator_id: number;
  last_activity_at: string;
  message_count: number;
  created_at: string;
  member_count: number;
  user_membership_status: string;
}

interface CircleMember {
  id: number;
  user_id: number;
  user_name: string;
  role: string;
  joined_at: string;
  last_seen_at: string;
  message_count: number;
}

const CircleDetailPage: React.FC = () => {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [circle, setCircle] = useState<PeerCircle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Panel collapse states
  const [infoCollapsed, setInfoCollapsed] = useState(true);
  const [membersCollapsed, setMembersCollapsed] = useState(true);
  const [guidelinesCollapsed, setGuidelinesCollapsed] = useState(true);

  useEffect(() => {
    if (circleId) {
      fetchCircleData();
    }
  }, [circleId]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('circle-sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const fetchCircleData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch circle details from the API
      const circleResponse = await fetch(`http://localhost:8000/api/community/circles/${circleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!circleResponse.ok) {
        if (circleResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch circle details');
      }

      const circleData = await circleResponse.json();

      // Fetch circle members
      const membersResponse = await fetch(`http://localhost:8000/api/community/circles/${circleId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!membersResponse.ok) {
        throw new Error('Failed to fetch circle members');
      }

      const membersData = await membersResponse.json();

      // Transform the data to match our frontend types
      const transformedCircle: PeerCircle = {
        id: circleData.id,
        name: circleData.name,
        description: circleData.description,
        status: circleData.status,
        max_members: circleData.max_members,
        is_private: circleData.is_private,
        requires_invitation: circleData.requires_invitation,
        facilitator_id: circleData.facilitator_id,
        professional_moderator_id: circleData.professional_moderator_id,
        last_activity_at: circleData.last_activity_at,
        message_count: circleData.message_count,
        created_at: circleData.created_at,
        member_count: membersData.length,
        user_membership_status: 'active', // This would come from the membership data
      };

      const transformedMembers: CircleMember[] = membersData.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        user_name: member.user?.full_name || member.user?.username || `User ${member.user_id}`,
        role: member.role,
        joined_at: member.joined_at,
        last_seen_at: member.last_seen_at,
        message_count: member.message_count,
      }));

      setCircle(transformedCircle);
      setMembers(transformedMembers);

    } catch (error) {
      console.error('Error fetching circle data:', error);
      // If there's an error, we could show an error message or redirect
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Circle not found</h2>
          <button
            onClick={() => navigate('/community')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
      {/* Mobile-first Layout */}
      <div className="flex h-screen">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          id="circle-sidebar"
          initial={false}
          animate={{
            x: isMobile && !sidebarOpen ? '-100%' : 0,
            width: isMobile ? '320px' : '380px'
          }}
          className={`${
            isMobile ? 'fixed' : 'relative'
          } h-full bg-white dark:bg-calm-800 border-r border-calm-200 dark:border-calm-700 z-50 flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-3 md:p-4 border-b border-calm-200 dark:border-calm-700 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-calm-800 dark:to-calm-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <button
                  onClick={() => navigate('/community')}
                  className="p-1.5 text-calm-600 dark:text-calm-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm md:text-lg font-bold text-calm-900 dark:text-calm-100 truncate">
                    {circle.name}
                  </h1>
                  <p className="text-xs text-calm-600 dark:text-calm-400 truncate">{circle.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                  {circle.status}
                </span>
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 text-calm-600 dark:text-calm-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Content - Collapsible Panels */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            <CircleInfoPanel
              circle={circle}
              isCollapsed={infoCollapsed}
              onToggle={() => setInfoCollapsed(!infoCollapsed)}
            />

            <MemberListPanel
              members={members}
              maxMembers={circle.max_members}
              isCollapsed={membersCollapsed}
              onToggle={() => setMembersCollapsed(!membersCollapsed)}
            />

            <CircleGuidelinesPanel
              isCollapsed={guidelinesCollapsed}
              onToggle={() => setGuidelinesCollapsed(!guidelinesCollapsed)}
            />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Mobile Header with Menu Button */}
          {isMobile && (
            <div className="p-3 border-b border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-calm-600 dark:text-calm-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="font-semibold text-calm-900 dark:text-calm-100 truncate">
                  {circle.name}
                </h2>
              </div>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
          )}

          {/* Chat Component - Full Height */}
          <div className="flex-1 min-h-0">
            <CircleChatEnhanced circleId={circle.id} circleName={circle.name} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleDetailPage;
