import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  MessageCircle, 
  Users, 
  Heart, 
  AlertTriangle,
  Clock,
  Mail,
  Smartphone
} from 'lucide-react';
import TouchButton from '../TouchButton';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationPreferences {
  circle_messages: boolean;
  message_support: boolean;
  circle_invitations: boolean;
  reflection_helpful: boolean;
  crisis_alerts: boolean;
  daily_check_in: boolean;
  weekly_summary: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  in_app_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    circle_messages: true,
    message_support: true,
    circle_invitations: true,
    reflection_helpful: true,
    crisis_alerts: true,
    daily_check_in: true,
    weekly_summary: true,
    push_notifications: true,
    email_notifications: false,
    in_app_notifications: true,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setPreferences(prev => ({ ...prev, ...updates }));
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    updatePreferences({ [key]: newValue });
  };

  const handleTimeChange = (key: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    updatePreferences({ [key]: value });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="mobile-skeleton h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'circle_messages' as keyof NotificationPreferences,
      title: 'Circle Messages',
      description: 'New messages in your peer circles',
      icon: MessageCircle,
      color: 'text-blue-500'
    },
    {
      key: 'message_support' as keyof NotificationPreferences,
      title: 'Message Support',
      description: 'When someone supports your messages',
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      key: 'circle_invitations' as keyof NotificationPreferences,
      title: 'Circle Invitations',
      description: 'Invitations to join new circles',
      icon: Users,
      color: 'text-green-500'
    },
    {
      key: 'reflection_helpful' as keyof NotificationPreferences,
      title: 'Helpful Reflections',
      description: 'When your reflections help others',
      icon: Heart,
      color: 'text-purple-500'
    },
    {
      key: 'crisis_alerts' as keyof NotificationPreferences,
      title: 'Crisis Support',
      description: 'Important crisis support resources',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      key: 'daily_check_in' as keyof NotificationPreferences,
      title: 'Daily Check-ins',
      description: 'Daily wellness reminders',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      key: 'weekly_summary' as keyof NotificationPreferences,
      title: 'Weekly Summary',
      description: 'Your weekly progress summary',
      icon: Bell,
      color: 'text-indigo-500'
    }
  ];

  const deliveryMethods = [
    {
      key: 'push_notifications' as keyof NotificationPreferences,
      title: 'Push Notifications',
      description: 'Mobile and browser notifications',
      icon: Smartphone,
      color: 'text-blue-500'
    },
    {
      key: 'email_notifications' as keyof NotificationPreferences,
      title: 'Email Notifications',
      description: 'Email alerts for important updates',
      icon: Mail,
      color: 'text-green-500'
    },
    {
      key: 'in_app_notifications' as keyof NotificationPreferences,
      title: 'In-App Notifications',
      description: 'Notifications within the app',
      icon: Bell,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="mobile-heading font-bold text-calm-900 dark:text-calm-100">
          Notification Preferences
        </h2>
        <p className="mobile-text text-calm-600 dark:text-calm-400 mt-2">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Notification Types */}
      <div className="card">
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
          Notification Types
        </h3>
        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            const isEnabled = preferences[type.key];
            
            return (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-calm-50 dark:hover:bg-calm-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${type.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-calm-900 dark:text-calm-100">
                      {type.title}
                    </h4>
                    <p className="text-sm text-calm-600 dark:text-calm-400">
                      {type.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(type.key)}
                  disabled={saving}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${isEnabled 
                      ? 'bg-primary-600' 
                      : 'bg-calm-200 dark:bg-calm-600'
                    }
                    ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="card">
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
          Delivery Methods
        </h3>
        <div className="space-y-4">
          {deliveryMethods.map((method) => {
            const Icon = method.icon;
            const isEnabled = preferences[method.key];
            
            return (
              <motion.div
                key={method.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-calm-50 dark:hover:bg-calm-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${method.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-calm-900 dark:text-calm-100">
                      {method.title}
                    </h4>
                    <p className="text-sm text-calm-600 dark:text-calm-400">
                      {method.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(method.key)}
                  disabled={saving}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${isEnabled 
                      ? 'bg-primary-600' 
                      : 'bg-calm-200 dark:bg-calm-600'
                    }
                    ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="card">
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
          Quiet Hours
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-calm-900 dark:text-calm-100">
              Enable Quiet Hours
            </h4>
            <p className="text-sm text-calm-600 dark:text-calm-400">
              Limit non-urgent notifications during these hours
            </p>
          </div>
          
          <button
            onClick={() => handleToggle('quiet_hours_enabled')}
            disabled={saving}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${preferences.quiet_hours_enabled 
                ? 'bg-primary-600' 
                : 'bg-calm-200 dark:bg-calm-600'
              }
              ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        
        {preferences.quiet_hours_enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                className="input-field"
              />
            </div>
          </motion.div>
        )}
      </div>

      {saving && (
        <div className="text-center">
          <p className="text-sm text-calm-600 dark:text-calm-400">
            Saving preferences...
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
