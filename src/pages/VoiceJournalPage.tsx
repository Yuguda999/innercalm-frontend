import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronDown, History, Sparkles, FileAudio, TrendingUp, Calendar } from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import BreathingExerciseModal from '../components/BreathingExerciseModal';
import { voiceJournalAPI } from '../services/api';

interface VoiceJournalSession {
  id: number;
  title: string;
  created_at: string;
  audio_duration: number | null;
  status: string;
  overall_sentiment?: {
    dominant_emotion: string;
    emotional_intensity: number;
  };
  emotion_spikes?: Array<{
    timestamp: number;
    spike_type: string;
    intensity: number;
  }>;
  recommended_exercises?: Array<{
    type: string;
    name: string;
    description: string;
    duration_minutes: number;
    instructions: string[];
    reason: string;
  }>;
}

interface VoiceJournalAnalytics {
  total_sessions: number;
  total_duration_minutes: number;
  average_session_duration: number;
  most_common_emotions: Array<{
    emotion: string;
    count: number;
  }>;
  emotion_trends: Record<string, number[]>;
  spike_frequency: {
    positive: number;
    negative: number;
    mixed: number;
  };
  recommended_exercises_used: Array<{
    exercise_type: string;
    usage_count: number;
  }>;
  improvement_metrics: {
    session_frequency: number;
    average_emotional_intensity: number;
    completion_rate: number;
  };
}

const VoiceJournalPage: React.FC = () => {
  const [sessions, setSessions] = useState<VoiceJournalSession[]>([]);
  const [currentSession, setCurrentSession] = useState<VoiceJournalSession | null>(null);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [humeStatus, setHumeStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showSessionHistory, setShowSessionHistory] = useState(false);

  const [analytics, setAnalytics] = useState<VoiceJournalAnalytics | null>(null);

  // Debug analytics changes
  useEffect(() => {
    console.log('Analytics state changed:', analytics);
  }, [analytics]);

  useEffect(() => {
    loadSessions();
    loadAnalytics();
    checkHumeStatus();
  }, []);

  const checkHumeStatus = async () => {
    try {
      // For production, we'll assume Hume AI is connected if the backend is healthy
      const response = await fetch('http://localhost:8000/health');

      if (response.ok) {
        // If backend is healthy, assume Hume AI is configured and ready
        setHumeStatus('connected');
      } else {
        setHumeStatus('error');
      }
    } catch (error) {
      console.log('Backend health check failed:', error);
      setHumeStatus('error');
    }
  };

  const loadSessions = async () => {
    try {
      const response = await voiceJournalAPI.getSessions(20, 0);
      const loadedSessions = response || [];
      setSessions(loadedSessions);
      console.log('Loaded sessions from backend:', loadedSessions.length);

      // Generate analytics after sessions are loaded
      const analytics = generateLocalAnalyticsFromSessions(loadedSessions);
      setAnalytics(analytics);
    } catch (error) {
      console.log('Backend not available, loading from localStorage:', error);
      // Load from localStorage as fallback
      const localSessions = loadSessionsFromLocalStorage();
      setSessions(localSessions);

      // Generate analytics from local sessions
      const analytics = generateLocalAnalyticsFromSessions(localSessions);
      setAnalytics(analytics);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await voiceJournalAPI.getAnalytics(30);
      if (response) {
        setAnalytics(response);
      }
      // If no backend analytics, they'll be generated in loadSessions
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Analytics will be generated in loadSessions
    }
  };

  const generateLocalAnalyticsFromSessions = (sessionsList: any[]) => {
    const completedSessions = sessionsList.filter(s => s.status === 'completed');
    const totalDuration = completedSessions.reduce((sum, session) =>
      sum + (session.audio_duration || 0), 0);

    // Calculate positive moments (sessions with positive emotion spikes)
    const positiveSpikes = completedSessions.filter(s =>
      (s as any).emotion_spikes?.some((spike: any) => spike.type === 'positive')).length;
    const negativeSpikes = completedSessions.filter(s =>
      (s as any).emotion_spikes?.some((spike: any) => spike.type === 'negative')).length;

    // Calculate average emotional intensity
    const avgIntensity = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) =>
          sum + ((s as any).overall_sentiment?.emotional_intensity || 0), 0) / completedSessions.length
      : 0;

    const avgDurationMinutes = completedSessions.length > 0
      ? Math.round(totalDuration / completedSessions.length / 60 * 100) / 100
      : 0;

    return {
      total_sessions: completedSessions.length,
      total_duration_minutes: Math.round(totalDuration / 60 * 100) / 100, // More precise calculation
      average_session_duration: avgDurationMinutes,
      most_common_emotions: [],
      emotion_trends: {},
      spike_frequency: {
        positive: positiveSpikes,
        negative: negativeSpikes,
        mixed: 0
      },
      recommended_exercises_used: [],
      improvement_metrics: {
        session_frequency: completedSessions.length,
        average_emotional_intensity: avgIntensity,
        completion_rate: 100
      }
    };
  };

  const generateLocalAnalyticsWithSession = (newSession: any) => {
    // Include the new session in calculations
    const allSessions = [newSession, ...sessions.filter(s => s.status === 'completed')];
    const totalDuration = allSessions.reduce((sum, session) =>
      sum + (session.audio_duration || 0), 0);

    const positiveSpikes = allSessions.filter(s =>
      (s as any).emotion_spikes?.some((spike: any) => spike.type === 'positive')).length;
    const negativeSpikes = allSessions.filter(s =>
      (s as any).emotion_spikes?.some((spike: any) => spike.type === 'negative')).length;

    // Calculate average emotional intensity
    const avgIntensity = allSessions.length > 0
      ? allSessions.reduce((sum, s) =>
          sum + ((s as any).overall_sentiment?.emotional_intensity || 0), 0) / allSessions.length
      : 0;

    return {
      total_sessions: allSessions.length,
      total_duration_minutes: Math.round(totalDuration / 60 * 100) / 100, // More precise calculation
      average_session_duration: allSessions.length > 0
        ? Math.round(totalDuration / allSessions.length / 60 * 100) / 100
        : 0,
      most_common_emotions: [],
      emotion_trends: {},
      spike_frequency: {
        positive: positiveSpikes,
        negative: negativeSpikes,
        mixed: 0
      },
      recommended_exercises_used: [],
      improvement_metrics: {
        session_frequency: allSessions.length,
        average_emotional_intensity: avgIntensity,
        completion_rate: 100
      }
    };
  };

  const saveSessionWithAnalysis = async (session: any) => {
    try {
      if (session.isLocal) {
        // For local sessions, just log that we're saving locally
        console.log('Saving local session with analysis:', session);
        return;
      }

      // Try to update the backend session with analysis results
      const updateData = {
        status: session.status,
        audio_duration: session.audio_duration,
        overall_sentiment: session.overall_sentiment,
        emotion_spikes: session.emotion_spikes,
        ai_insights: session.ai_insights
      };

      await voiceJournalAPI.updateSession(session.id, updateData);
      console.log('Session updated in backend with analysis');
    } catch (error) {
      console.log('Could not save to backend, using local storage only:', error);
    }
  };

  const saveSessionsToLocalStorage = (sessions: any[]) => {
    try {
      const sessionsToSave = sessions.map(session => ({
        ...session,
        // Mark as locally stored
        isLocallyStored: true
      }));
      localStorage.setItem('voiceJournalSessions', JSON.stringify(sessionsToSave));
      console.log('Sessions saved to localStorage:', sessionsToSave.length);
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  };

  const loadSessionsFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('voiceJournalSessions');
      if (stored) {
        const parsedSessions = JSON.parse(stored);
        console.log('Loaded sessions from localStorage:', parsedSessions.length);
        return parsedSessions;
      }
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
    }
    return [];
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      console.log('Recording completed, analyzing...', audioBlob);

      // Create a session for analysis and persistence
      const sessionData = {
        title: `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        description: "Voice journal session"
      };

      // Try to create session in backend first
      let newSession;
      try {
        newSession = await voiceJournalAPI.createSession(sessionData);
        console.log('Session created in backend:', newSession);
      } catch (apiError) {
        console.log('Backend not available, creating local session:', apiError);
        // Create local session if backend fails
        newSession = {
          id: Date.now(),
          title: sessionData.title,
          description: sessionData.description,
          created_at: new Date().toISOString(),
          status: 'analyzing',
          audio_duration: 0,
          user_id: 1,
          isLocal: true // Flag to indicate this is a local session
        };
      }

      setCurrentSession(newSession);

      // Process audio for analysis
      await processAudioForAnalysis(audioBlob, newSession);

    } catch (error) {
      console.error('Error analyzing recording:', error);
    }
  };

  const processAudioForAnalysis = async (audioBlob: Blob, session: any) => {
    try {
      // Update status to analyzing
      setCurrentSession(prev => prev ? { ...prev, status: 'analyzing' } : null);

      // Send audio to Hume AI for analysis
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:8000/voice-analysis/analyze-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Hume AI analysis result:', result);

      if (result.status === 'success' && result.analysis) {
        await processHumeAnalysisResults(result.analysis, session);
      } else {
        throw new Error(`Hume AI analysis failed: ${result.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error in Hume AI analysis:', error);
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Analysis failed'
      } : null);
      throw error;
    }
  };

  const processHumeAnalysisResults = async (humeAnalysis: any, session: any) => {
    try {
      console.log('Processing Hume AI analysis results:', humeAnalysis);

      // Extract analysis data from Hume AI response
      const overallSentiment = humeAnalysis.overall_sentiment || {};
      const emotions = humeAnalysis.emotions || {};
      const emotionSpikes = humeAnalysis.emotion_spikes || [];
      const metadata = humeAnalysis.analysis_metadata || {};

      // Generate insights based on Hume AI results
      const insights = generateInsightsFromHumeData(overallSentiment, emotions, emotionSpikes, metadata);

      // Generate recommendations based on detected emotions
      const recommendations = generateRecommendationsFromEmotions(overallSentiment, emotions);

      // Calculate audio duration from metadata or estimate
      const audioDurationSeconds = metadata.analysis_duration || Math.floor(session.audio_duration || 30);

      // Create completed session with Hume AI results
      const completedSession = {
        ...session,
        status: 'completed',
        audio_duration: audioDurationSeconds,
        overall_sentiment: overallSentiment,
        emotion_spikes: emotionSpikes,
        recommended_exercises: recommendations,
        ai_insights: { insights: insights },
        analysis_provider: 'hume_ai'
      };

      setCurrentSession(completedSession);

      // Save session with analysis results
      await saveSessionWithAnalysis(completedSession);

      // Add to sessions list and update analytics
      setSessions(prev => {
        const newSessions = [completedSession, ...prev.slice(0, 9)];
        saveSessionsToLocalStorage(newSessions);
        return newSessions;
      });

      // Update analytics
      setTimeout(() => {
        const newAnalytics = generateLocalAnalyticsWithSession(completedSession);
        console.log('Updating analytics with Hume AI session:', newAnalytics);
        setAnalytics(newAnalytics);
      }, 200);

    } catch (error) {
      console.error('Error processing Hume AI results:', error);
      throw error;
    }
  };

  const generateInsightsFromHumeData = (sentiment: any, emotions: any, spikes: any[], metadata: any) => {
    const insights: string[] = [];

    if (sentiment.dominant_emotion) {
      const emotion = sentiment.dominant_emotion;
      const intensity = sentiment.emotional_intensity || 0;

      if (intensity > 0.7) {
        insights.push(`Strong ${emotion} detected in your voice - this suggests deep emotional processing`);
      } else if (intensity > 0.4) {
        insights.push(`Moderate ${emotion} present - you're experiencing meaningful emotions`);
      } else {
        insights.push(`Subtle ${emotion} detected - gentle emotional awareness is emerging`);
      }
    }

    if (spikes.length > 0) {
      insights.push(`${spikes.length} emotional peak${spikes.length > 1 ? 's' : ''} detected - moments of heightened feeling`);
    }

    // Add insights about secondary emotions
    if (emotions && Object.keys(emotions).length > 1) {
      const sortedEmotions = Object.entries(emotions)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3);

      if (sortedEmotions.length > 1) {
        const secondaryEmotion = sortedEmotions[1][0];
        insights.push(`Secondary emotion detected: ${secondaryEmotion} - showing emotional complexity`);
      }
    }

    if (metadata.provider === 'hume_ai') {
      insights.push('Analysis powered by advanced voice emotion AI for accurate emotional insights');
    }

    return insights.length > 0 ? insights : ['Your voice patterns suggest you\'re processing emotions in a healthy way'];
  };

  const generateRecommendationsFromEmotions = (sentiment: any, emotions: any) => {
    const recommendations = [];
    const dominantEmotion = sentiment.dominant_emotion;
    const intensity = sentiment.emotional_intensity || 0;

    // Check for secondary emotions to provide additional recommendations
    const hasStrongSecondaryEmotions = emotions && Object.values(emotions).some((score: any) => score > 0.3);

    // Generate recommendations based on dominant emotion
    if (dominantEmotion === 'sadness' || dominantEmotion === 'distressed') {
      recommendations.push({
        name: "Gentle Self-Compassion",
        description: "A guided practice to offer yourself kindness during difficult moments",
        reason: "Your voice shows signs of sadness - self-compassion can provide comfort",
        type: "mindfulness",
        duration: 600
      });
    } else if (dominantEmotion === 'anger' || dominantEmotion === 'frustrated') {
      recommendations.push({
        name: "Cooling Breath",
        description: "Breathing technique to help process and release anger safely",
        reason: "Detected anger in your voice - breathing can help regulate these feelings",
        type: "breathing",
        duration: 300
      });
    } else if (dominantEmotion === 'fear' || dominantEmotion === 'anxiety') {
      recommendations.push({
        name: "Grounding Exercise",
        description: "5-4-3-2-1 technique to help you feel more present and secure",
        reason: "Your voice suggests anxiety - grounding can help you feel more stable",
        type: "grounding",
        duration: 300
      });
    } else if (dominantEmotion === 'joy' || dominantEmotion === 'excitement') {
      recommendations.push({
        name: "Gratitude Reflection",
        description: "Moment to appreciate and anchor positive feelings",
        reason: "Beautiful positive energy in your voice - let's celebrate and anchor it",
        type: "gratitude",
        duration: 300
      });
    } else {
      recommendations.push({
        name: "Mindful Check-in",
        description: "Brief practice to deepen awareness of your current emotional state",
        reason: "Continue exploring your emotional landscape with gentle awareness",
        type: "mindfulness",
        duration: 300
      });
    }

    // Add intensity-based recommendation
    if (intensity > 0.6) {
      recommendations.push({
        name: "Emotional Integration",
        description: "Practice to help process and integrate intense emotions",
        reason: "High emotional intensity detected - integration can help you process these feelings",
        type: "integration",
        duration: 600
      });
    }

    // Add recommendation for complex emotional states
    if (hasStrongSecondaryEmotions) {
      recommendations.push({
        name: "Emotional Awareness",
        description: "Practice to explore and understand multiple emotions present",
        reason: "Multiple emotions detected - awareness can help you navigate complexity",
        type: "awareness",
        duration: 400
      });
    }

    return recommendations;
  };



  const handleSentimentUpdate = (sentiment: any) => {
    console.log('Real-time sentiment:', sentiment);
    // Handle real-time sentiment updates
  };

  const startBreathingExercise = (exercise: any) => {
    setSelectedExercise(exercise);
    setShowBreathingExercise(true);
  };

  const handleExerciseComplete = (effectiveness: number) => {
    console.log('Exercise completed with effectiveness:', effectiveness);
    // Save exercise completion data
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: 'text-yellow-600 bg-yellow-100',
      sadness: 'text-blue-600 bg-blue-100',
      anger: 'text-red-600 bg-red-100',
      fear: 'text-purple-600 bg-purple-100',
      calm: 'text-green-600 bg-green-100',
      mixed: 'text-gray-600 bg-gray-100'
    };
    return colors[emotion as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-warmth-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-6"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg mr-3"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
              Voice Journal
            </h1>
          </div>
          <p className="text-calm-600 dark:text-calm-300 text-sm leading-relaxed">
            Share your heart, discover your emotions
          </p>

          {/* Hume AI Status Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex justify-center"
          >
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium backdrop-blur-sm ${
              humeStatus === 'connected' ? 'bg-wellness-100/80 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300' :
              humeStatus === 'error' ? 'bg-warmth-100/80 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300' :
              'bg-serenity-100/80 text-serenity-800 dark:bg-serenity-900/30 dark:text-serenity-300'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                humeStatus === 'connected' ? 'bg-wellness-400' :
                humeStatus === 'error' ? 'bg-warmth-400' :
                'bg-serenity-400 animate-pulse'
              }`}></div>
              {humeStatus === 'connected' ? 'AI Ready' :
               humeStatus === 'error' ? 'AI Offline' :
               'Connecting...'}
            </div>
          </motion.div>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                  <FileAudio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Sessions</p>
                  <p className="text-xl font-bold text-wellness-800 dark:text-wellness-300">{analytics?.total_sessions || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-serenity-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Total Time</p>
                  <p className="text-xl font-bold text-serenity-800 dark:text-serenity-300">
                    {analytics?.total_duration_minutes
                      ? analytics.total_duration_minutes >= 1
                        ? `${Math.round(analytics.total_duration_minutes * 10) / 10}m`
                        : `${Math.round(analytics.total_duration_minutes * 60)}s`
                      : '0m'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Avg Duration</p>
                  <p className="text-xl font-bold text-accent-800 dark:text-accent-300">
                    {analytics?.average_session_duration
                      ? analytics.average_session_duration >= 1
                        ? `${Math.round(analytics.average_session_duration)}m`
                        : `${Math.round(analytics.average_session_duration * 60)}s`
                      : '0m'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-warmth-400 to-accent-500 p-2 rounded-xl mr-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Positive Moments</p>
                  <p className="text-xl font-bold text-warmth-800 dark:text-warmth-300">{analytics?.spike_frequency?.positive || 0}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Recorder Section */}
          <div className="space-y-6">
          {/* Recording Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-4"
          >
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-medium text-wellness-800 dark:text-wellness-300">
                Tips for meaningful recording
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-calm-600 dark:text-calm-400">
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-wellness-400 rounded-full mr-2"></div>
                Speak naturally
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-serenity-400 rounded-full mr-2"></div>
                Find quiet space
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-warmth-400 rounded-full mr-2"></div>
                15+ seconds
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mr-2"></div>
                Express freely
              </div>
            </div>
          </motion.div>

          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onSentimentUpdate={handleSentimentUpdate}
            maxDuration={600} // 10 minutes
            showRealTimeFeedback={true}
          />

          {/* Current Session Processing */}
          {currentSession && (currentSession.status === "processing" || currentSession.status === "analyzing") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-serenity-50/70 dark:bg-serenity-900/30 backdrop-blur-sm border border-serenity-200/30 dark:border-serenity-700/30 rounded-2xl p-4"
            >
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-serenity-400 border-t-transparent rounded-full"
                ></motion.div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-serenity-800 dark:text-serenity-300">
                    {currentSession.status === "analyzing" ? "Reading your emotions..." : "Processing recording..."}
                  </h3>
                  <p className="text-xs text-serenity-600 dark:text-serenity-400">
                    {currentSession.status === "analyzing"
                      ? "AI is listening to your heart"
                      : "Preparing for emotional analysis"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {currentSession && currentSession.status === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warmth-50/70 dark:bg-warmth-900/30 backdrop-blur-sm border border-warmth-200/30 dark:border-warmth-700/30 rounded-2xl p-4"
            >
              <div className="flex items-start">
                <div className="bg-warmth-100 dark:bg-warmth-800 p-2 rounded-xl mr-3 mt-0.5">
                  <Heart className="w-4 h-4 text-warmth-600 dark:text-warmth-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-warmth-800 dark:text-warmth-300">Let's try again</h3>
                  <p className="text-xs text-warmth-600 dark:text-warmth-400 mt-1">
                    {(currentSession as any).error || "We couldn't analyze your recording. Your voice matters to us."}
                  </p>
                  {(currentSession as any).error?.includes("speak more clearly") && (
                    <div className="mt-3 p-3 bg-wellness-50/50 dark:bg-wellness-900/20 border border-wellness-200/30 dark:border-wellness-700/30 rounded-xl">
                      <p className="text-xs text-wellness-800 dark:text-wellness-300 font-medium mb-2">💡 Gentle suggestions:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-wellness-600 dark:text-wellness-400">
                        <div>• Speak closer</div>
                        <div>• Quiet space</div>
                        <div>• Clear voice</div>
                        <div>• 15+ seconds</div>
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentSession(null)}
                    className="mt-3 bg-gradient-to-r from-wellness-400 to-serenity-400 hover:from-wellness-500 hover:to-serenity-500 text-white px-4 py-2 rounded-xl text-sm font-medium touch-target"
                  >
                    Try Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Insights */}
          {currentSession && currentSession.status === "completed" && (currentSession as any).ai_insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-wellness-50/70 dark:bg-wellness-900/30 backdrop-blur-sm border border-wellness-200/30 dark:border-wellness-700/30 rounded-2xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-wellness-800 dark:text-wellness-300">Your Emotional Journey</h3>
              </div>
              <div className="space-y-3">
                {(currentSession as any).ai_insights.insights?.map((insight: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-wellness-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-wellness-700 dark:text-wellness-300 leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>

              {currentSession.overall_sentiment && (
                <div className="mt-6 pt-4 border-t border-wellness-200/30 dark:border-wellness-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-wellness-800 dark:text-wellness-300">
                      Primary emotion: {currentSession.overall_sentiment.dominant_emotion}
                    </span>
                    <span className="text-xs text-wellness-600 dark:text-wellness-400 bg-wellness-100/50 dark:bg-wellness-800/30 px-2 py-1 rounded-full">
                      {Math.round(((currentSession.overall_sentiment as any).confidence || 0) * 100)}% confidence
                    </span>
                  </div>
                  <div className="w-full bg-wellness-200/50 dark:bg-wellness-800/30 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, (currentSession.overall_sentiment.emotional_intensity || 0) * 100))}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-wellness-400 to-serenity-400 h-3 rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Recommended Exercises */}
          {currentSession && currentSession.recommended_exercises && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-2xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-300">Recommended for You</h3>
              </div>
              <div className="space-y-3">
                {currentSession.recommended_exercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/50 dark:bg-calm-700/50 border border-accent-200/30 dark:border-calm-600/30 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-accent-800 dark:text-accent-300">{exercise.name}</h4>
                        <p className="text-sm text-accent-600 dark:text-accent-400 mt-1">{exercise.description}</p>
                        <p className="text-xs text-warmth-600 dark:text-warmth-400 mt-2 italic">{exercise.reason}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startBreathingExercise(exercise)}
                        className="bg-gradient-to-r from-accent-400 to-warmth-400 hover:from-accent-500 hover:to-warmth-500 text-white px-4 py-2 rounded-xl text-sm font-medium touch-target ml-4"
                      >
                        Start
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          </div>

          {/* Session History - Desktop: Right Column, Mobile: Collapsible */}
          <div className="lg:block">
            {/* Mobile: Collapsible Header */}
            <div className="lg:hidden">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSessionHistory(!showSessionHistory)}
                className="w-full bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-700/30 rounded-2xl p-4 touch-target mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-calm-400 to-serenity-400 p-2 rounded-xl mr-3">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-calm-800 dark:text-calm-300">Session History</h3>
                      <p className="text-sm text-calm-600 dark:text-calm-400">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showSessionHistory ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-calm-600 dark:text-calm-400" />
                  </motion.div>
                </div>
              </motion.button>
            </div>

            {/* Desktop: Always Visible Header */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-calm-400 to-serenity-400 p-2 rounded-xl mr-3">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-calm-800 dark:text-calm-300">Session History</h3>
                  <p className="text-sm text-calm-600 dark:text-calm-400">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              </div>
            </div>

            {/* Session List - Responsive */}
            <div className={`${showSessionHistory ? 'block' : 'hidden'} lg:block`}>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-calm-800 dark:text-calm-300 text-sm truncate flex-1">
                          {session.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          session.status === 'completed' ? 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300' :
                          session.status === 'processing' ? 'bg-warmth-100 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300' :
                          'bg-calm-100 text-calm-800 dark:bg-calm-700 dark:text-calm-300'
                        }`}>
                          {session.status}
                        </span>
                      </div>

                      <div className="text-xs text-calm-600 dark:text-calm-400 mb-3">
                        {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Unknown date'} • {formatDuration(session.audio_duration)}
                      </div>

                      {session.overall_sentiment && session.overall_sentiment.dominant_emotion && (
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(session.overall_sentiment.dominant_emotion)}`}>
                            {session.overall_sentiment.dominant_emotion}
                          </span>
                          <div className="flex-1 bg-calm-200/50 dark:bg-calm-700/50 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-wellness-400 to-serenity-400 h-2 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, (session.overall_sentiment.emotional_intensity || 0) * 100))}%` }}
                            />
                          </div>
                          <span className="text-xs text-calm-500 dark:text-calm-400">
                            {Math.round((session.overall_sentiment.emotional_intensity || 0) * 100)}%
                          </span>
                        </div>
                      )}

                      {session.emotion_spikes && session.emotion_spikes.length > 0 && (
                        <div className="text-xs text-calm-500 dark:text-calm-400 mb-3">
                          {session.emotion_spikes.length} emotional moment{session.emotion_spikes.length !== 1 ? 's' : ''} detected
                        </div>
                      )}

                      {session.recommended_exercises && session.recommended_exercises.length > 0 && (
                        <div className="flex items-center justify-between pt-3 border-t border-calm-200/30 dark:border-calm-700/30">
                          <span className="text-xs text-calm-600 dark:text-calm-400">
                            {session.recommended_exercises.length} exercise{session.recommended_exercises.length !== 1 ? 's' : ''} suggested
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startBreathingExercise(session.recommended_exercises![0])}
                            className="text-serenity-500 hover:text-serenity-600 dark:text-serenity-400 dark:hover:text-serenity-300 text-xs font-medium"
                          >
                            Try Now
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Breathing Exercise Modal */}
      {showBreathingExercise && selectedExercise && (
        <BreathingExerciseModal
          isOpen={showBreathingExercise}
          onClose={() => setShowBreathingExercise(false)}
          exercise={selectedExercise}
          onComplete={handleExerciseComplete}
        />
      )}
    </div>
  );
};

export default VoiceJournalPage;
