import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Users,
  MessageSquare,
  Calendar,
  Shield,
  Info
} from 'lucide-react';

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

interface CircleInfoPanelProps {
  circle: PeerCircle;
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

const CircleInfoPanel: React.FC<CircleInfoPanelProps> = ({
  circle,
  isCollapsed = false,
  onToggle,
  className = ""
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);

  const collapsed = onToggle ? isCollapsed : internalCollapsed;
  const handleToggle = onToggle || (() => setInternalCollapsed(!internalCollapsed));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysActive = () => {
    return Math.floor((Date.now() - new Date(circle.created_at).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`bg-gradient-to-br from-white via-wellness-50/30 to-serenity-50/30 dark:from-calm-800 dark:via-calm-700 dark:to-calm-800 rounded-2xl shadow-xl dark:shadow-2xl border border-wellness-200/50 dark:border-calm-600/50 overflow-hidden backdrop-blur-sm ${className}`}>
      {/* Modern Header - Always visible */}
      <button
        onClick={handleToggle}
        className="w-full p-4 md:p-5 bg-gradient-to-r from-wellness-50/80 via-white/90 to-serenity-50/80 dark:from-calm-700/90 dark:via-calm-600/90 dark:to-calm-700/90 border-b border-wellness-200/50 dark:border-calm-600/50 flex items-center justify-between hover:from-wellness-100/80 hover:to-serenity-100/80 dark:hover:from-calm-600/90 dark:hover:to-calm-500/90 transition-all duration-300 backdrop-blur-md focus-visible-enhanced"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-serenity-500 to-serenity-600 dark:from-serenity-400 dark:to-serenity-500 rounded-xl shadow-lg serenity-glow">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-calm-900" />
          </div>
          <h3 className="text-sm md:text-lg font-bold bg-gradient-to-r from-calm-900 to-serenity-700 dark:from-calm-100 dark:to-serenity-300 bg-clip-text text-transparent">
            Circle Information
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
            <div className="p-4 md:p-6 space-y-6 bg-gradient-to-b from-transparent via-wellness-50/10 to-transparent dark:via-calm-700/10">
              {/* Modern Circle Description */}
              <div className="p-4 bg-gradient-to-r from-wellness-50/80 to-serenity-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-wellness-200/50 dark:border-calm-500/50">
                <h4 className="text-sm font-bold text-calm-800 dark:text-calm-100 mb-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-wellness-500 rounded-full"></div>
                  <span>Description</span>
                </h4>
                <p className="text-sm text-calm-700 dark:text-calm-300 leading-relaxed font-medium">
                  {circle.description}
                </p>
              </div>

              {/* Modern Circle Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-serenity-50 to-serenity-100 dark:from-serenity-900/20 dark:to-serenity-800/20 rounded-2xl border border-serenity-200/50 dark:border-serenity-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-serenity-500 dark:bg-serenity-400 rounded-xl shadow-lg">
                      <Users className="w-4 h-4 text-white dark:text-calm-900" />
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-serenity-700 dark:text-serenity-300">
                    {circle.member_count}
                  </div>
                  <div className="text-xs text-calm-600 dark:text-calm-400 font-medium">
                    of {circle.max_members} members
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-wellness-50 to-wellness-100 dark:from-wellness-900/20 dark:to-wellness-800/20 rounded-2xl border border-wellness-200/50 dark:border-wellness-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-wellness-500 dark:bg-wellness-400 rounded-xl shadow-lg">
                      <MessageSquare className="w-4 h-4 text-white dark:text-calm-900" />
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-wellness-700 dark:text-wellness-300">
                    {circle.message_count}
                  </div>
                  <div className="text-xs text-calm-600 dark:text-calm-400 font-medium">Messages</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-purple-500 dark:bg-purple-400 rounded-xl shadow-lg">
                      <Calendar className="w-4 h-4 text-white dark:text-calm-900" />
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-purple-700 dark:text-purple-300">
                    {getDaysActive()}
                  </div>
                  <div className="text-xs text-calm-600 dark:text-calm-400 font-medium">Days Active</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl border border-pink-200/50 dark:border-pink-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-pink-500 dark:bg-pink-400 rounded-xl shadow-lg">
                      <Shield className="w-4 h-4 text-white dark:text-calm-900" />
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-pink-700 dark:text-pink-300">
                    {circle.is_private ? 'Private' : 'Public'}
                  </div>
                  <div className="text-xs text-calm-600 dark:text-calm-400 font-medium">Circle Type</div>
                </div>
              </div>

              {/* Modern Circle Status */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-wellness-50/80 to-serenity-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-wellness-200/50 dark:border-calm-500/50">
                <span className="text-sm font-bold text-calm-800 dark:text-calm-100 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-wellness-500 rounded-full"></div>
                  <span>Status</span>
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-wellness-100 to-wellness-200 dark:from-wellness-800/50 dark:to-wellness-700/50 text-wellness-800 dark:text-wellness-200 rounded-2xl text-sm font-bold shadow-lg">
                  {circle.status}
                </span>
              </div>

              {/* Modern Created Date */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-serenity-50/80 to-wellness-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-serenity-200/50 dark:border-calm-500/50">
                <span className="text-sm font-bold text-calm-800 dark:text-calm-100 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-serenity-500 rounded-full"></div>
                  <span>Created</span>
                </span>
                <span className="text-sm text-calm-700 dark:text-calm-300 font-medium">
                  {formatDate(circle.created_at)}
                </span>
              </div>

              {/* Modern Last Activity */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-purple-200/50 dark:border-calm-500/50">
                <span className="text-sm font-bold text-calm-800 dark:text-calm-100 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Last Activity</span>
                </span>
                <span className="text-sm text-calm-700 dark:text-calm-300 font-medium">
                  {formatDate(circle.last_activity_at)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircleInfoPanel;
