import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'neutral',
  className = ''
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    danger: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    neutral: 'bg-white border-calm-200 dark:bg-calm-800 dark:border-calm-700'
  };

  const iconColorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
    neutral: 'text-calm-600 dark:text-calm-400'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-calm-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-calm-600 dark:text-calm-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-xl border p-6 transition-all duration-200 hover:shadow-lg
        ${colorClasses[color]} ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon && (
              <div className={`${iconColorClasses[color]}`}>
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-calm-600 dark:text-calm-400">
              {title}
            </h3>
          </div>
          
          <div className="mb-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold text-calm-900 dark:text-calm-100"
            >
              {value}
            </motion.span>
          </div>
          
          {subtitle && (
            <p className="text-sm text-calm-500 dark:text-calm-500 mb-2">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {Math.abs(trend.value)}%
              </span>
              {trend.period && (
                <span className="text-sm text-calm-500 dark:text-calm-500">
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsCard;
