import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Users,
  BarChart3,
  User,
  Heart,
  Brain,
  Calendar
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number;
}

const MobileNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/inner-ally', icon: Heart, label: 'Ally' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="mobile-nav z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                touch-target flex flex-col items-center justify-center relative
                transition-all duration-200 rounded-lg
                ${active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-calm-500 dark:text-calm-400 hover:text-calm-700 dark:hover:text-calm-300'
                }
              `}
            >
              <div className={`
                p-2 rounded-lg transition-all duration-200
                ${active
                  ? 'bg-primary-100 dark:bg-primary-900/30 scale-110'
                  : 'hover:bg-calm-100 dark:hover:bg-calm-700/50'
                }
              `}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`
                text-xs mt-1 font-medium transition-all duration-200
                ${active ? 'text-primary-600 dark:text-primary-400' : ''}
              `}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
