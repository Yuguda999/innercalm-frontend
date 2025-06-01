import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingExercise {
  type: string;
  name: string;
  description: string;
  duration_minutes?: number;
  duration?: number; // Support both formats
  instructions?: string[];
  reason?: string;
}

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: BreathingExercise;
  onComplete?: (effectiveness: number) => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [effectiveness, setEffectiveness] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Breathing patterns for different exercises
  const breathingPatterns = {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    'box_breathing': { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    'heart_coherence': { inhale: 5, hold: 0, exhale: 5, pause: 0 },
    'calm_breathing': { inhale: 4, hold: 0, exhale: 6, pause: 0 }
  };

  const pattern = breathingPatterns[exercise.type as keyof typeof breathingPatterns] || breathingPatterns['calm_breathing'];
  const totalCycleDuration = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;

  // Handle both duration formats (minutes or seconds)
  const exerciseDurationMinutes = exercise.duration_minutes || (exercise.duration ? exercise.duration / 60 : 5);
  const exerciseInstructions = exercise.instructions || [
    "Find a comfortable seated position",
    "Close your eyes or soften your gaze",
    "Follow the breathing pattern shown",
    "Focus on the rhythm and let thoughts pass by"
  ];

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setPhaseTime(prev => prev + 0.1);
        setTotalTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const currentPattern = pattern;
    let newPhase: BreathingPhase = currentPhase;
    let resetPhaseTime = false;

    switch (currentPhase) {
      case 'inhale':
        if (phaseTime >= currentPattern.inhale) {
          newPhase = currentPattern.hold > 0 ? 'hold' : 'exhale';
          resetPhaseTime = true;
        }
        break;
      case 'hold':
        if (phaseTime >= currentPattern.hold) {
          newPhase = 'exhale';
          resetPhaseTime = true;
        }
        break;
      case 'exhale':
        if (phaseTime >= currentPattern.exhale) {
          newPhase = currentPattern.pause > 0 ? 'pause' : 'inhale';
          resetPhaseTime = true;
          if (currentPattern.pause === 0) {
            setCycleCount(prev => prev + 1);
          }
        }
        break;
      case 'pause':
        if (phaseTime >= currentPattern.pause) {
          newPhase = 'inhale';
          resetPhaseTime = true;
          setCycleCount(prev => prev + 1);
        }
        break;
    }

    if (resetPhaseTime) {
      setCurrentPhase(newPhase);
      setPhaseTime(0);
      playPhaseSound(newPhase);
    }

    // Auto-stop after duration
    if (totalTime >= exerciseDurationMinutes * 60) {
      handleStop();
    }
  }, [phaseTime, currentPhase, isActive, pattern, exerciseDurationMinutes, totalTime]);

  const playPhaseSound = (phase: BreathingPhase) => {
    try {
      // Skip audio if AudioContext is not available or blocked by extensions
      if (typeof window === 'undefined' || !window.AudioContext && !(window as any).webkitAudioContext) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Check if context is suspended (common with browser policies)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          // Silently fail if we can't resume audio context
          return;
        });
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different tones for different phases
      const frequencies = {
        inhale: 440,   // A4
        hold: 523,     // C5
        exhale: 349,   // F4
        pause: 294     // D4
      };

      oscillator.frequency.setValueAtTime(frequencies[phase], ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio doesn't work (browser extensions, permissions, etc.)
      console.log('Audio not available:', error);
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setShowInstructions(false);
    setPhaseTime(0);
    setTotalTime(0);
    setCycleCount(0);
    setCurrentPhase('inhale');
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhaseTime(0);
    setCurrentPhase('inhale');
    // Don't reset total time and cycle count to show progress
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseTime(0);
    setTotalTime(0);
    setCycleCount(0);
    setCurrentPhase('inhale');
    setShowInstructions(true);
    setEffectiveness(null);
  };

  const handleComplete = () => {
    if (effectiveness !== null) {
      onComplete?.(effectiveness);
      onClose();
    }
  };

  const getPhaseInstruction = () => {
    const instructions = {
      inhale: 'Breathe in slowly',
      hold: 'Hold your breath',
      exhale: 'Breathe out gently',
      pause: 'Rest and pause'
    };
    return instructions[currentPhase];
  };

  const getPhaseColor = () => {
    const colors = {
      inhale: 'from-blue-400 to-blue-600',
      hold: 'from-purple-400 to-purple-600',
      exhale: 'from-green-400 to-green-600',
      pause: 'from-gray-400 to-gray-600'
    };
    return colors[currentPhase];
  };

  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale': return pattern.inhale;
      case 'hold': return pattern.hold;
      case 'exhale': return pattern.exhale;
      case 'pause': return pattern.pause;
      default: return 4;
    }
  };

  const progress = (phaseTime / getCurrentPhaseDuration()) * 100;
  const totalProgress = (totalTime / (exerciseDurationMinutes * 60)) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{exercise.name}</h2>
              <p className="text-sm text-gray-600">{Math.round(exerciseDurationMinutes)} minutes</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Instructions */}
            {showInstructions && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Instructions</h3>
                <div className="space-y-2">
                  {exerciseInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 font-medium">{index + 1}.</span>
                      <span className="text-gray-700">{instruction}</span>
                    </div>
                  ))}
                </div>
                {exercise.reason && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Why this exercise:</strong> {exercise.reason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Breathing Circle */}
            {!showInstructions && (
              <div className="text-center mb-6">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <motion.div
                    animate={{
                      scale: currentPhase === 'inhale' ? 1.2 : currentPhase === 'exhale' ? 0.8 : 1
                    }}
                    transition={{
                      duration: getCurrentPhaseDuration(),
                      ease: "easeInOut"
                    }}
                    className={`w-full h-full rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-lg flex items-center justify-center`}
                  >
                    <div className="text-white text-center">
                      <div className="text-lg font-medium capitalize">{currentPhase}</div>
                      <div className="text-sm opacity-90">{getPhaseInstruction()}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {Math.ceil(getCurrentPhaseDuration() - phaseTime)}s
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 96 * 0.45}`}
                      strokeDashoffset={`${2 * Math.PI * 96 * 0.45 * (1 - progress / 100)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{cycleCount}</div>
                    <div className="text-sm text-gray-600">Cycles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {Math.floor(totalTime / 60)}:{(Math.floor(totalTime % 60)).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(totalProgress)}%</div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-3 mb-6">
              {showInstructions ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Play size={20} />
                  <span>Start Exercise</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePause}
                    className={`${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white p-3 rounded-lg`}
                  >
                    {isActive ? <Pause size={20} /> : <Play size={20} />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg"
                  >
                    <RotateCcw size={20} />
                  </motion.button>
                </>
              )}
            </div>

            {/* Effectiveness Rating */}
            {totalTime > 60 && !isActive && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">How effective was this exercise?</h4>
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEffectiveness(rating)}
                      className={`p-2 rounded-full transition-colors ${
                        effectiveness === rating
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Heart size={20} fill={effectiveness === rating ? 'white' : 'none'} />
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600 mb-4">
                  {effectiveness && (
                    <span>
                      {effectiveness === 1 && "Not helpful"}
                      {effectiveness === 2 && "Slightly helpful"}
                      {effectiveness === 3 && "Moderately helpful"}
                      {effectiveness === 4 && "Very helpful"}
                      {effectiveness === 5 && "Extremely helpful"}
                    </span>
                  )}
                </div>
                {effectiveness && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleComplete}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
                  >
                    Complete Exercise
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BreathingExerciseModal;
