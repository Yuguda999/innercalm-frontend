import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: DataPoint[];
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  showLegend?: boolean;
  className?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  data,
  type,
  height = 200,
  showLegend = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'
  ];

  const renderLineChart = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (point.value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }}>
        <motion.polyline
          fill="none"
          stroke={colors[0]}
          strokeWidth="2"
          points={points}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (point.value / maxValue) * 80;
          return (
            <motion.circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={colors[0]}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    const barWidth = 80 / data.length;
    
    return (
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }}>
        {data.map((point, index) => {
          const x = 10 + (index * barWidth);
          const barHeight = (point.value / maxValue) * 80;
          const y = 90 - barHeight;
          
          return (
            <motion.rect
              key={index}
              x={x}
              y={y}
              width={barWidth * 0.8}
              height={barHeight}
              fill={point.color || colors[index % colors.length]}
              initial={{ height: 0, y: 90 }}
              animate={{ height: barHeight, y }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            />
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, point) => sum + point.value, 0);
    let currentAngle = 0;
    
    return (
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }}>
        {data.map((point, index) => {
          const percentage = point.value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <motion.path
              key={index}
              d={pathData}
              fill={point.color || colors[index % colors.length]}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            />
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderLineChart(); // Simplified - could add area fill
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-100">
          {title}
        </h3>
      </div>
      
      <div className="mb-4">
        {renderChart()}
      </div>
      
      {showLegend && (
        <div className="flex flex-wrap gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: point.color || colors[index % colors.length] }}
              />
              <span className="text-sm text-calm-600 dark:text-calm-400">
                {point.label}: {point.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
