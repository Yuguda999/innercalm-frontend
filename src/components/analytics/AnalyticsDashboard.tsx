import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp,
  Calendar,
  Activity,
  Target
} from 'lucide-react';
import MetricsCard from './MetricsCard';
import AnalyticsChart from './AnalyticsChart';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data from API
      const response = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // Mock data for development
        setDashboardData({
          overview: {
            total_conversations: 24,
            total_messages: 156,
            average_mood_score: 7.2,
            emotional_growth: 15.3,
            recommendations_completed: 8,
            crisis_episodes: 0,
            breakthrough_moments: 3
          },
          trends: {
            mood_trend: [
              { label: 'Mon', value: 6.5 },
              { label: 'Tue', value: 7.1 },
              { label: 'Wed', value: 6.8 },
              { label: 'Thu', value: 7.5 },
              { label: 'Fri', value: 7.2 },
              { label: 'Sat', value: 7.8 },
              { label: 'Sun', value: 7.4 }
            ],
            emotion_distribution: [
              { label: 'Joy', value: 35, color: '#10b981' },
              { label: 'Calm', value: 28, color: '#0ea5e9' },
              { label: 'Sadness', value: 20, color: '#8b5cf6' },
              { label: 'Anxiety', value: 12, color: '#f59e0b' },
              { label: 'Anger', value: 5, color: '#ef4444' }
            ],
            activity_pattern: [
              { label: '6AM', value: 2 },
              { label: '9AM', value: 8 },
              { label: '12PM', value: 12 },
              { label: '3PM', value: 15 },
              { label: '6PM', value: 18 },
              { label: '9PM', value: 10 },
              { label: '12AM', value: 3 }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="mobile-skeleton h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-calm-600 dark:text-calm-400">
          No analytics data available yet. Start using the app to see your progress!
        </p>
      </div>
    );
  }

  const { overview, trends } = dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="mobile-heading font-bold text-calm-900 dark:text-calm-100">
          Your Analytics
        </h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="input-field text-sm py-2 px-3"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="mobile-grid">
        <MetricsCard
          title="Conversations"
          value={overview.total_conversations}
          subtitle="Total sessions"
          icon={<MessageCircle size={20} />}
          color="primary"
          trend={{
            value: 12,
            direction: 'up',
            period: 'vs last week'
          }}
        />
        
        <MetricsCard
          title="Mood Score"
          value={`${overview.average_mood_score}/10`}
          subtitle="Average this week"
          icon={<Heart size={20} />}
          color="success"
          trend={{
            value: 8,
            direction: 'up',
            period: 'improvement'
          }}
        />
        
        <MetricsCard
          title="Growth"
          value={`${overview.emotional_growth}%`}
          subtitle="Emotional progress"
          icon={<TrendingUp size={20} />}
          color="primary"
          trend={{
            value: 5,
            direction: 'up',
            period: 'this month'
          }}
        />
        
        <MetricsCard
          title="Breakthroughs"
          value={overview.breakthrough_moments}
          subtitle="Positive moments"
          icon={<Target size={20} />}
          color="success"
        />
        
        <MetricsCard
          title="Recommendations"
          value={overview.recommendations_completed}
          subtitle="Completed"
          icon={<Activity size={20} />}
          color="warning"
        />
        
        <MetricsCard
          title="Community"
          value="Active"
          subtitle="Engagement level"
          icon={<Users size={20} />}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <AnalyticsChart
          title="Mood Trend"
          data={trends.mood_trend}
          type="line"
          height={200}
        />
        
        <AnalyticsChart
          title="Emotion Distribution"
          data={trends.emotion_distribution}
          type="pie"
          height={250}
        />
        
        <AnalyticsChart
          title="Activity Pattern"
          data={trends.activity_pattern}
          type="bar"
          height={200}
        />
      </div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100 mb-4">
          Recent Insights
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              🎉 Your mood has improved by 15% this week! Keep up the great work.
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 You're most active in the afternoon. Consider scheduling important conversations then.
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              🌱 You've completed 8 recommendations this week - that's 60% more than last week!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
