import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ReflectionChain from '../components/ReflectionChain';

const ReflectionChainPage: React.FC = () => {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();

  if (!chainId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-calm-900 dark:text-calm-100 mb-4">Reflection chain not found</h2>
          <button
            onClick={() => navigate('/community')}
            className="btn-primary"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-6"
        >
          <button
            onClick={() => navigate('/community')}
            className="p-2 text-calm-600 dark:text-calm-400 hover:text-calm-900 dark:hover:text-calm-100 hover:bg-white dark:hover:bg-calm-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-calm-900 dark:text-calm-100">Reflection Chain</h1>
            <p className="text-calm-600 dark:text-calm-400">Share wisdom and support others on their healing journey</p>
          </div>
        </motion.div>

        {/* Reflection Chain Component */}
        <ReflectionChain chainId={parseInt(chainId)} />
      </div>
    </div>
  );
};

export default ReflectionChainPage;
