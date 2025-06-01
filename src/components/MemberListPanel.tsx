import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Crown,
  Shield,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';

interface CircleMember {
  id: number;
  user_id: number;
  user_name: string;
  role: string;
  joined_at: string;
  last_seen_at: string;
  message_count: number;
}

interface MemberListPanelProps {
  members: CircleMember[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  maxMembers?: number;
}

const MemberListPanel: React.FC<MemberListPanelProps> = ({
  members,
  isCollapsed = false,
  onToggle,
  className = "",
  maxMembers
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);

  const collapsed = onToggle ? isCollapsed : internalCollapsed;
  const handleToggle = onToggle || (() => setInternalCollapsed(!internalCollapsed));

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'facilitator':
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
      default:
        return <User className="w-3 h-3 text-calm-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'facilitator':
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-calm-100 text-calm-800 dark:bg-calm-700 dark:text-calm-300';
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <Users className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-calm-900" />
          </div>
          <div className="flex flex-col items-start">
            <h3 className="text-sm md:text-lg font-bold bg-gradient-to-r from-calm-900 to-serenity-700 dark:from-calm-100 dark:to-serenity-300 bg-clip-text text-transparent">
              Circle Members
            </h3>
            <span className="text-xs text-calm-600 dark:text-calm-400 font-medium">
              ({members.length}{maxMembers ? ` of ${maxMembers}` : ''})
            </span>
          </div>
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
            <div className="p-4 md:p-6 space-y-4 bg-gradient-to-b from-transparent via-wellness-50/10 to-transparent dark:via-calm-700/10">
              {/* Modern Members List */}
              <div className="space-y-4">
                {members.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white/80 to-wellness-50/80 dark:from-calm-600/50 dark:to-calm-500/50 rounded-2xl backdrop-blur-sm border border-wellness-200/50 dark:border-calm-500/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Modern Avatar */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-serenity-400 to-serenity-600 dark:from-serenity-300 dark:to-serenity-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg serenity-glow">
                        <span className="text-white dark:text-calm-900 font-bold text-sm md:text-lg">
                          {member.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Enhanced Member Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-bold text-calm-900 dark:text-calm-100 text-sm md:text-base truncate">
                            {member.user_name}
                          </span>
                          <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-wellness-100 to-serenity-100 dark:from-wellness-800/50 dark:to-serenity-800/50 rounded-xl">
                            {getRoleIcon(member.role)}
                            <span className={`text-xs font-bold ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-calm-600 dark:text-calm-400">
                          <div className="flex items-center space-x-2 px-2 py-1 bg-wellness-50 dark:bg-calm-700/50 rounded-lg">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">Joined {formatJoinDate(member.joined_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2 px-2 py-1 bg-serenity-50 dark:bg-calm-700/50 rounded-lg">
                            <MessageSquare className="w-3 h-3" />
                            <span className="font-medium">{member.message_count} messages</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modern Last Seen */}
                    <div className="text-right text-xs flex-shrink-0 ml-3">
                      <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                        <div className="text-calm-600 dark:text-calm-400 font-medium">Last seen</div>
                        <div className="font-bold text-calm-800 dark:text-calm-200">{formatLastSeen(member.last_seen_at)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Modern Empty State */}
              {members.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-serenity-100 to-wellness-100 dark:from-serenity-900/20 dark:to-wellness-900/20 rounded-2xl inline-block mb-4">
                    <Users className="w-12 h-12 text-serenity-500 dark:text-serenity-400 mx-auto" />
                  </div>
                  <p className="text-calm-700 dark:text-calm-300 font-medium">No members found</p>
                  <p className="text-calm-600 dark:text-calm-400 text-sm mt-1">Members will appear here once they join the circle</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberListPanel;
