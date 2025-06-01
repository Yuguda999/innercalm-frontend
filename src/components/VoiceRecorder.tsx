import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onSentimentUpdate?: (sentiment: any) => void;
  maxDuration?: number; // in seconds
  showRealTimeFeedback?: boolean;
}

interface SentimentData {
  emotions: Record<string, number>;
  sentiment_score: number;
  emotional_intensity: number;
  is_spike: boolean;
  spike_type?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onSentimentUpdate,
  maxDuration = 300, // 5 minutes default
  showRealTimeFeedback = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0); // Recording duration
  const [audioDuration, setAudioDuration] = useState(0); // Audio playback duration
  const [currentTime, setCurrentTime] = useState(0);
  const [realTimeSentiment, setRealTimeSentiment] = useState<SentimentData | null>(null);
  const [emotionSpikes, setEmotionSpikes] = useState<Array<{ time: number; type: string; intensity: number }>>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset previous recording state
      setAudioBlob(null);
      setAudioUrl(null);
      setAudioDuration(0);
      setCurrentTime(0);
      setIsPlaying(false);
      setEmotionSpikes([]);
      setRealTimeSentiment(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Clear real-time data
        setRealTimeSentiment(null);
        setEmotionSpikes([]);

        onRecordingComplete?.(blob);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        setIsPaused(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };

      mediaRecorder.start(1000); // Collect data every second for real-time processing
      setIsRecording(true);
      setDuration(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      // Simulate real-time sentiment analysis (in real app, this would be WebSocket)
      if (showRealTimeFeedback) {
        simulateRealTimeSentiment();
      }

    } catch (error) {
      console.error('Error starting recording:', error);
      // Reset states on error
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Clear real-time sentiment when stopping
      setRealTimeSentiment(null);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const simulateRealTimeSentiment = () => {
    // Enhanced real-time sentiment analysis simulation
    const sentimentInterval = setInterval(() => {
      if (!isRecording) {
        clearInterval(sentimentInterval);
        return;
      }

      // Create more realistic emotion patterns based on recording duration
      const timeBasedVariation = Math.sin(duration * 0.1) * 0.3;
      const baseIntensity = 0.3 + Math.random() * 0.4;

      const mockSentiment: SentimentData = {
        emotions: {
          joy: Math.max(0, Math.min(1, 0.2 + timeBasedVariation + Math.random() * 0.3)),
          sadness: Math.max(0, Math.min(1, 0.15 - timeBasedVariation + Math.random() * 0.25)),
          anger: Math.max(0, Math.min(1, 0.1 + Math.random() * 0.2)),
          fear: Math.max(0, Math.min(1, 0.1 + Math.random() * 0.2)),
          surprise: Math.max(0, Math.min(1, 0.05 + Math.random() * 0.15)),
          disgust: Math.max(0, Math.min(1, 0.05 + Math.random() * 0.1))
        },
        sentiment_score: timeBasedVariation + (Math.random() - 0.5) * 0.8,
        emotional_intensity: baseIntensity,
        is_spike: Math.random() > 0.85, // Less frequent spikes
        spike_type: timeBasedVariation > 0 ? 'positive' : 'negative'
      };

      setRealTimeSentiment(mockSentiment);
      onSentimentUpdate?.(mockSentiment);

      if (mockSentiment.is_spike) {
        setEmotionSpikes(prev => [...prev, {
          time: duration,
          type: mockSentiment.spike_type || 'mixed',
          intensity: mockSentiment.emotional_intensity
        }]);
      }
    }, 1500); // Faster updates for better real-time feel
  };

  const formatTime = (seconds: number) => {
    // Handle invalid numbers
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string, intensity: number) => {
    const colors = {
      joy: `rgba(255, 215, 0, ${intensity})`,
      sadness: `rgba(70, 130, 180, ${intensity})`,
      anger: `rgba(220, 20, 60, ${intensity})`,
      fear: `rgba(128, 0, 128, ${intensity})`,
      surprise: `rgba(255, 20, 147, ${intensity})`,
      disgust: `rgba(85, 107, 47, ${intensity})`
    };
    return colors[emotion as keyof typeof colors] || `rgba(128, 128, 128, ${intensity})`;
  };

  return (
    <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-6 shadow-xl">
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-gradient-to-br from-wellness-400 to-serenity-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent mb-2">
          Your Voice Matters
        </h3>
        <p className="text-sm text-calm-600 dark:text-calm-300 leading-relaxed">
          Share what's in your heart
        </p>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center items-center space-x-6 mb-8">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="relative bg-gradient-to-br from-warmth-400 to-accent-500 hover:from-warmth-500 hover:to-accent-600 text-white p-6 rounded-full shadow-2xl touch-target"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-br from-warmth-400/30 to-accent-500/30 rounded-full"
            />
            <Mic size={32} className="relative z-10" />
          </motion.button>
        ) : (
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={pauseRecording}
              className={`relative ${
                isPaused
                  ? 'bg-gradient-to-br from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600'
                  : 'bg-gradient-to-br from-warmth-400 to-accent-500 hover:from-warmth-500 hover:to-accent-600'
              } text-white p-4 rounded-full shadow-xl touch-target`}
            >
              <motion.div
                animate={{ scale: isPaused ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isPaused ? Infinity : 0, ease: "easeInOut" }}
                className={`absolute inset-0 ${
                  isPaused
                    ? 'bg-gradient-to-br from-wellness-400/30 to-serenity-500/30'
                    : 'bg-gradient-to-br from-warmth-400/30 to-accent-500/30'
                } rounded-full`}
              />
              {isPaused ? <Play size={24} className="relative z-10" /> : <Pause size={24} className="relative z-10" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="relative bg-gradient-to-br from-calm-400 to-calm-600 hover:from-calm-500 hover:to-calm-700 text-white p-4 rounded-full shadow-xl touch-target"
            >
              <Square size={24} className="relative z-10" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Recording Status */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: isRecording ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
          className="text-3xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent mb-3"
        >
          {formatTime(duration)}
        </motion.div>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className={`w-3 h-3 rounded-full ${
                isPaused
                  ? 'bg-warmth-400'
                  : 'bg-gradient-to-r from-accent-400 to-warmth-500'
              }`}
            />
            <span className="text-sm font-medium text-calm-700 dark:text-calm-300">
              {isPaused ? 'Paused - Take your time' : 'Listening to your heart...'}
            </span>
          </motion.div>
        )}
        {!isRecording && audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-wellness-600 dark:text-wellness-400 font-medium"
          >
            Recording complete ✨
          </motion.div>
        )}
      </div>

      {/* Real-time Sentiment Feedback */}
      <AnimatePresence>
        {showRealTimeFeedback && realTimeSentiment && isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-wellness-50/50 dark:bg-wellness-900/20 backdrop-blur-sm border border-wellness-200/30 dark:border-wellness-700/30 rounded-2xl"
          >
            <div className="flex items-center mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 bg-gradient-to-br from-wellness-400 to-serenity-400 rounded-full mr-2 flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
              <h4 className="text-sm font-medium text-wellness-800 dark:text-wellness-300">
                Reading your emotions...
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(realTimeSentiment.emotions).map(([emotion, intensity]) => (
                <motion.div
                  key={emotion}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-3 rounded-full mb-2 overflow-hidden bg-calm-200/50 dark:bg-calm-700/50"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${intensity * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getEmotionColor(emotion, intensity) }}
                    />
                  </motion.div>
                  <span className="text-xs text-calm-600 dark:text-calm-400 capitalize font-medium">
                    {emotion}
                  </span>
                </motion.div>
              ))}
            </div>

            {realTimeSentiment.is_spike && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`mt-4 p-3 rounded-xl text-xs text-center font-medium ${
                  realTimeSentiment.spike_type === 'positive'
                    ? 'bg-wellness-100/70 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300 border border-wellness-300/30'
                    : 'bg-warmth-100/70 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300 border border-warmth-300/30'
                }`}
              >
                ✨ {realTimeSentiment.spike_type === 'positive' ? 'Beautiful moment' : 'Strong feeling'} detected
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Playback */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-serenity-50/50 dark:bg-serenity-900/20 backdrop-blur-sm border border-serenity-200/30 dark:border-serenity-700/30 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-serenity-400 to-accent-400 p-2 rounded-xl mr-3">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-serenity-800 dark:text-serenity-300">
                Your recording
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={playAudio}
              className="bg-gradient-to-br from-serenity-400 to-accent-500 hover:from-serenity-500 hover:to-accent-600 text-white p-3 rounded-full shadow-lg touch-target"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const time = e.currentTarget.currentTime;
              if (isFinite(time) && !isNaN(time)) {
                setCurrentTime(time);
              }
            }}
            onLoadedMetadata={(e) => {
              const duration = e.currentTarget.duration;
              if (isFinite(duration) && !isNaN(duration) && duration > 0) {
                setAudioDuration(duration);
              } else {
                setAudioDuration(0);
              }
            }}
            onError={(e) => {
              console.error('Audio loading error:', e);
              setAudioDuration(0);
              setCurrentTime(0);
            }}
            className="hidden"
          />

          <div className="w-full bg-serenity-200/50 dark:bg-serenity-800/30 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${audioDuration > 0 && isFinite(currentTime) && isFinite(audioDuration)
                  ? Math.min((currentTime / audioDuration) * 100, 100)
                  : 0}%`
              }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-serenity-400 to-accent-500 h-3 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Emotion Spikes Timeline */}
      {emotionSpikes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-accent-50/50 dark:bg-accent-900/20 backdrop-blur-sm border border-accent-200/30 dark:border-accent-700/30 rounded-2xl"
        >
          <div className="flex items-center mb-3">
            <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <h4 className="text-sm font-medium text-accent-800 dark:text-accent-300">
              Emotional Moments
            </h4>
          </div>
          <div className="space-y-2">
            {emotionSpikes.map((spike, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between text-xs bg-white/50 dark:bg-calm-800/50 rounded-xl p-3"
              >
                <span className="text-calm-600 dark:text-calm-400 font-medium">
                  {formatTime(spike.time)}
                </span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  spike.type === 'positive'
                    ? 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300'
                    : 'bg-warmth-100 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300'
                }`}>
                  {spike.type === 'positive' ? '✨' : '💫'} {spike.type} ({Math.round(spike.intensity * 100)}%)
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceRecorder;
