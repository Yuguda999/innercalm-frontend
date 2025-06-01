import React, { useState, useRef, useEffect } from 'react';
import { Palette, Download, Share2, Heart, RotateCcw, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionArtCanvasProps {
  emotionData?: Record<string, number>;
  onArtGenerated?: (artData: any) => void;
  onCustomization?: (customization: any) => void;
  initialArt?: string; // SVG content
  editable?: boolean;
}

interface ArtStyle {
  id: string;
  name: string;
  description: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

const EmotionArtCanvas: React.FC<EmotionArtCanvasProps> = ({
  emotionData = {},
  onArtGenerated,
  onCustomization,
  initialArt,
  editable = true
}) => {
  const [currentArt, setCurrentArt] = useState<string>(initialArt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('abstract');
  const [selectedPalette, setSelectedPalette] = useState<string>('emotion-based');
  const [complexity, setComplexity] = useState<number>(3);
  const [showCustomization, setShowCustomization] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const artStyles: ArtStyle[] = [
    { id: 'abstract', name: 'Abstract', description: 'Flowing, organic shapes' },
    { id: 'geometric', name: 'Geometric', description: 'Clean lines and shapes' },
    { id: 'organic', name: 'Organic', description: 'Nature-inspired forms' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple, clean design' },
    { id: 'expressive', name: 'Expressive', description: 'Bold, dynamic forms' }
  ];

  const colorPalettes: ColorPalette[] = [
    {
      id: 'emotion-based',
      name: 'Emotion-Based',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    },
    {
      id: 'warm',
      name: 'Warm Tones',
      colors: ['#FF6B35', '#F7931E', '#FFD23F', '#EE4B2B', '#C73E1D']
    },
    {
      id: 'cool',
      name: 'Cool Tones',
      colors: ['#4A90E2', '#7B68EE', '#20B2AA', '#3CB371', '#6495ED']
    },
    {
      id: 'monochrome',
      name: 'Monochrome',
      colors: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1']
    }
  ];

  useEffect(() => {
    if (initialArt) {
      setCurrentArt(initialArt);
    }
  }, [initialArt]);

  const generateArt = async () => {
    setIsGenerating(true);

    try {
      // Simulate art generation (in real app, this would call the API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSvg = generateMockSVG();
      setCurrentArt(mockSvg);

      onArtGenerated?.({
        svg_content: mockSvg,
        style: selectedStyle,
        palette: selectedPalette,
        complexity: complexity,
        emotion_data: emotionData
      });

    } catch (error) {
      console.error('Error generating art:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockSVG = (): string => {
    const width = 400;
    const height = 400;
    const palette = colorPalettes.find(p => p.id === selectedPalette)?.colors || colorPalettes[0].colors;

    // Generate shapes based on emotion data
    const shapes: string[] = [];
    const emotions = Object.entries(emotionData);

    emotions.forEach(([emotion, intensity], index) => {
      const color = palette[index % palette.length];
      const size = 20 + (intensity * 60);
      const x = 50 + (index * 60);
      const y = 200 + (Math.sin(index) * 50);

      if (selectedStyle === 'geometric') {
        shapes.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" opacity="0.7" transform="rotate(${index * 45} ${x + size/2} ${y + size/2})"/>`);
      } else if (selectedStyle === 'minimalist') {
        shapes.push(`<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" opacity="0.6"/>`);
      } else {
        // Abstract/organic shapes
        const path = `M ${x} ${y} Q ${x + size} ${y - size/2} ${x + size/2} ${y + size} Q ${x - size/2} ${y + size/2} ${x} ${y}`;
        shapes.push(`<path d="${path}" fill="${color}" opacity="0.7"/>`);
      }
    });

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="${palette[0]}" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="${palette[1]}" stop-opacity="0.05"/>
          </radialGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
        ${shapes.join('\n        ')}
      </svg>
    `;
  };

  const downloadArt = () => {
    if (!currentArt) return;

    const blob = new Blob([currentArt], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-art-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareArt = () => {
    setIsShared(!isShared);
    // In real app, this would call the share API
    console.log('Sharing art...');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In real app, this would update the favorite status
  };

  const customizeColor = (colorIndex: number, newColor: string) => {
    // In real app, this would apply color customization
    onCustomization?.({
      type: 'color',
      parameters: { colorIndex, newColor }
    });
  };

  const resetArt = () => {
    setCurrentArt('');
    setComplexity(3);
    setSelectedStyle('abstract');
    setSelectedPalette('emotion-based');
  };

  return (
    <div className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-3xl shadow-xl p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3"
          >
            <Palette className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-300">
            Emotion Art Generator
          </h3>
        </div>
        <p className="text-sm text-calm-600 dark:text-calm-400 leading-relaxed">
          Transform your feelings into visual art
        </p>
      </div>

      {/* Art Canvas */}
      <div className="relative mb-6">
        <div
          ref={canvasRef}
          className="w-full h-96 border-2 border-dashed border-accent-300/50 dark:border-calm-600/50 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-50/30 to-warmth-50/30 dark:from-calm-900/30 dark:to-calm-800/30 overflow-hidden"
        >
          {isGenerating ? (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-accent-400 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-accent-600 dark:text-accent-400 font-medium">
                Creating your emotion art...
              </p>
            </div>
          ) : currentArt ? (
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: currentArt }}
            />
          ) : (
            <div className="text-center text-calm-500 dark:text-calm-400">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Palette size={48} className="mx-auto mb-4 opacity-60" />
              </motion.div>
              <p className="font-medium mb-2">Your emotion art will appear here</p>
              <p className="text-sm opacity-75">Click "Generate Art" to begin your creative journey</p>
            </div>
          )}
        </div>

        {/* Art Controls */}
        {currentArt && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={`p-3 rounded-2xl shadow-lg transition-all duration-200 ${
                isFavorite
                  ? 'bg-gradient-to-r from-warmth-400 to-accent-500 text-white'
                  : 'bg-white/90 dark:bg-calm-800/90 text-calm-600 dark:text-calm-400'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'white' : 'none'} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={downloadArt}
              className="p-3 bg-white/90 dark:bg-calm-800/90 text-calm-600 dark:text-calm-400 rounded-2xl shadow-lg"
            >
              <Download size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={shareArt}
              className={`p-3 rounded-2xl shadow-lg transition-all duration-200 ${
                isShared
                  ? 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white'
                  : 'bg-white/90 dark:bg-calm-800/90 text-calm-600 dark:text-calm-400'
              }`}
            >
              <Share2 size={16} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Generation Controls */}
      {editable && (
        <div className="space-y-6 mb-6">
          {/* Art Style Selection */}
          <div>
            <label className="block text-sm font-medium text-accent-800 dark:text-accent-300 mb-3">
              Art Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {artStyles.map((style) => (
                <motion.button
                  key={style.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 text-left rounded-2xl border-2 transition-all duration-200 ${
                    selectedStyle === style.id
                      ? 'border-accent-400 bg-accent-50/50 dark:bg-accent-900/30 dark:border-accent-500'
                      : 'border-calm-200/50 dark:border-calm-700/50 hover:border-accent-300 dark:hover:border-accent-600 bg-white/50 dark:bg-calm-800/50'
                  }`}
                >
                  <div className="font-medium text-sm text-accent-800 dark:text-accent-300">
                    {style.name}
                  </div>
                  <div className="text-xs text-calm-600 dark:text-calm-400 mt-1">
                    {style.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color Palette Selection */}
          <div>
            <label className="block text-sm font-medium text-accent-800 dark:text-accent-300 mb-3">
              Color Palette
            </label>
            <div className="grid grid-cols-2 gap-3">
              {colorPalettes.map((palette) => (
                <motion.button
                  key={palette.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPalette(palette.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedPalette === palette.id
                      ? 'border-accent-400 bg-accent-50/50 dark:bg-accent-900/30 dark:border-accent-500'
                      : 'border-calm-200/50 dark:border-calm-700/50 hover:border-accent-300 dark:hover:border-accent-600 bg-white/50 dark:bg-calm-800/50'
                  }`}
                >
                  <div className="font-medium text-sm mb-3 text-accent-800 dark:text-accent-300">
                    {palette.name}
                  </div>
                  <div className="flex space-x-2">
                    {palette.colors.map((color, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        className="w-5 h-5 rounded-full border-2 border-white dark:border-calm-700 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Complexity Slider */}
          <div>
            <label className="block text-sm font-medium text-accent-800 dark:text-accent-300 mb-3">
              Complexity: {complexity}
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="5"
                value={complexity}
                onChange={(e) => setComplexity(parseInt(e.target.value))}
                className="w-full h-3 bg-calm-200/50 dark:bg-calm-700/50 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(var(--accent-400)) 0%, rgb(var(--accent-400)) ${(complexity - 1) * 25}%, rgb(var(--calm-200)) ${(complexity - 1) * 25}%, rgb(var(--calm-200)) 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-calm-500 dark:text-calm-400 mt-2">
              <span>Simple</span>
              <span>Complex</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateArt}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600 disabled:from-calm-400 disabled:to-calm-500 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 shadow-lg"
        >
          {isGenerating ? 'Creating magic...' : 'Generate Art'}
        </motion.button>

        {currentArt && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCustomization(!showCustomization)}
              className="bg-gradient-to-r from-serenity-400 to-wellness-500 hover:from-serenity-500 hover:to-wellness-600 text-white py-4 px-4 rounded-2xl shadow-lg"
            >
              <Sliders size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetArt}
              className="bg-calm-500 hover:bg-calm-600 dark:bg-calm-600 dark:hover:bg-calm-700 text-white py-4 px-4 rounded-2xl shadow-lg"
            >
              <RotateCcw size={20} />
            </motion.button>
          </>
        )}
      </div>

      {/* Customization Panel */}
      <AnimatePresence>
        {showCustomization && currentArt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-serenity-50/50 dark:bg-serenity-900/20 backdrop-blur-sm border border-serenity-200/30 dark:border-serenity-700/30 rounded-2xl"
          >
            <h4 className="font-medium text-serenity-800 dark:text-serenity-300 mb-4">
              Customize Your Art
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-serenity-600 dark:text-serenity-400 mb-3">
                  Adjust Colors
                </label>
                <div className="flex space-x-3">
                  {colorPalettes.find(p => p.id === selectedPalette)?.colors.map((color, index) => (
                    <motion.input
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      type="color"
                      value={color}
                      onChange={(e) => customizeColor(index, e.target.value)}
                      className="w-10 h-10 rounded-xl border-2 border-white dark:border-calm-700 cursor-pointer shadow-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion Data Display */}
      {Object.keys(emotionData).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-wellness-50/50 dark:bg-wellness-900/20 backdrop-blur-sm border border-wellness-200/30 dark:border-wellness-700/30 rounded-2xl"
        >
          <h4 className="text-sm font-medium text-wellness-800 dark:text-wellness-300 mb-4">
            Source Emotions
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(emotionData).map(([emotion, intensity], index) => (
              <motion.div
                key={emotion}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-xs text-wellness-600 dark:text-wellness-400 capitalize mb-2 font-medium">
                  {emotion}
                </div>
                <div className="w-full bg-wellness-200/50 dark:bg-wellness-800/30 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${intensity * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-wellness-400 to-serenity-500 h-3 rounded-full"
                  />
                </div>
                <div className="text-xs text-wellness-500 dark:text-wellness-400 mt-2">
                  {Math.round(intensity * 100)}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EmotionArtCanvas;
