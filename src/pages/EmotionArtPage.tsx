import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Image, Heart, Share2, Download, Plus, Grid, List, Sparkles, Eye, X } from 'lucide-react';
import EmotionArtCanvas from '../components/EmotionArtCanvas';
import { emotionArtAPI } from '../services/api';

interface EmotionArtwork {
  id: number;
  title: string;
  created_at: string;
  art_style: string;
  dominant_emotion: string;
  emotional_intensity: number;
  svg_data_url: string;
  is_favorite: boolean;
  is_shared: boolean;
  view_count: number;
}

interface ArtGallery {
  id: number;
  name: string;
  description: string;
  total_pieces: number;
  artworks: EmotionArtwork[];
}

const EmotionArtPage: React.FC = () => {
  const [artworks, setArtworks] = useState<EmotionArtwork[]>([]);
  const [galleries, setGalleries] = useState<ArtGallery[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<EmotionArtwork | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [analytics, setAnalytics] = useState<any>(null);

  // Mock emotion data for generation
  const mockEmotionData = {
    joy: 0.3,
    sadness: 0.2,
    anger: 0.1,
    fear: 0.15,
    surprise: 0.1,
    calm: 0.4
  };

  useEffect(() => {
    loadArtworks();
    loadGalleries();
    loadAnalytics();
  }, []);

  const loadArtworks = async () => {
    try {
      const response = await emotionArtAPI.getArtworks(20, 0);
      setArtworks(response || []);
    } catch (error) {
      console.error('Error loading artworks:', error);
      setArtworks([]);
    }
  };

  const loadGalleries = async () => {
    try {
      const response = await emotionArtAPI.getGalleries();
      setGalleries(response || []);
    } catch (error) {
      console.error('Error loading galleries:', error);
      setGalleries([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await emotionArtAPI.getAnalytics(30);
      setAnalytics(response || {
        total_artworks: 0,
        favorite_count: 0,
        shared_count: 0,
        total_views: 0,
        most_used_styles: [],
        emotion_distribution: {}
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        total_artworks: 0,
        favorite_count: 0,
        shared_count: 0,
        total_views: 0,
        most_used_styles: [],
        emotion_distribution: {}
      });
    }
  };

  const handleArtGenerated = async (artData: any) => {
    try {
      const generationRequest = {
        emotion_data: artData.emotion_data,
        art_style: artData.style,
        complexity_level: artData.complexity || 3,
        title: `Artwork ${new Date().toLocaleDateString()}`,
        description: "Generated emotion artwork",
        source_type: "manual",
        source_id: null
      };

      await emotionArtAPI.generateArt(generationRequest);

      // Reload artworks and analytics
      setTimeout(() => {
        loadArtworks();
        loadAnalytics();
      }, 2000);

      setShowGenerator(false);
    } catch (error) {
      console.error('Error generating artwork:', error);
    }
  };

  const toggleFavorite = (artworkId: number) => {
    setArtworks(prev => prev.map(artwork =>
      artwork.id === artworkId
        ? { ...artwork, is_favorite: !artwork.is_favorite }
        : artwork
    ));
  };

  const shareArtwork = (artworkId: number) => {
    setArtworks(prev => prev.map(artwork =>
      artwork.id === artworkId
        ? { ...artwork, is_shared: !artwork.is_shared }
        : artwork
    ));
  };

  const downloadArtwork = (artwork: EmotionArtwork) => {
    // Convert data URL to blob and download
    const link = document.createElement('a');
    link.href = artwork.svg_data_url;
    link.download = `${artwork.title.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: 'bg-warmth-100 text-warmth-800 dark:bg-warmth-900/30 dark:text-warmth-300',
      sadness: 'bg-serenity-100 text-serenity-800 dark:bg-serenity-900/30 dark:text-serenity-300',
      anger: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
      fear: 'bg-calm-100 text-calm-800 dark:bg-calm-700 dark:text-calm-300',
      calm: 'bg-wellness-100 text-wellness-800 dark:bg-wellness-900/30 dark:text-wellness-300',
      surprise: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
    };
    return colors[emotion as keyof typeof colors] || 'bg-calm-100 text-calm-800 dark:bg-calm-700 dark:text-calm-300';
  };

  const filteredArtworks = filterStyle === 'all'
    ? artworks
    : artworks.filter(artwork => artwork.art_style === filterStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      <div className="max-w-md md:max-w-4xl lg:max-w-7xl mx-auto px-4 py-safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-6"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-accent-400 to-warmth-400 p-3 rounded-2xl shadow-lg mr-3"
            >
              <Palette className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-accent-600 to-warmth-600 bg-clip-text text-transparent">
              Emotion Art Studio
            </h1>
          </div>
          <p className="text-calm-600 dark:text-calm-300 text-sm md:text-base leading-relaxed">
            Transform your feelings into beautiful visual art
          </p>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-accent-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Artworks</p>
                  <p className="text-xl font-bold text-accent-800 dark:text-accent-300">{analytics?.total_artworks || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-warmth-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-warmth-400 to-accent-500 p-2 rounded-xl mr-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Favorites</p>
                  <p className="text-xl font-bold text-warmth-800 dark:text-warmth-300">{analytics?.favorite_count || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-2 rounded-xl mr-3">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Shared</p>
                  <p className="text-xl font-bold text-wellness-800 dark:text-wellness-300">{analytics?.shared_count || 0}</p>
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
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-calm-600 dark:text-calm-400">Views</p>
                  <p className="text-xl font-bold text-serenity-800 dark:text-serenity-300">{analytics?.total_views || 0}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0"
        >
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center space-x-2 shadow-lg touch-target"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={20} />
              </motion.div>
              <span>Create Art</span>
            </motion.button>

            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-700/30 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 text-calm-800 dark:text-calm-200 touch-target"
            >
              <option value="all">All Styles</option>
              <option value="abstract">Abstract</option>
              <option value="geometric">Geometric</option>
              <option value="organic">Organic</option>
              <option value="minimalist">Minimalist</option>
              <option value="expressive">Expressive</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-2xl touch-target transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-accent-400 to-warmth-500 text-white shadow-lg'
                  : 'bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-700/30 text-calm-600 dark:text-calm-400'
              }`}
            >
              <Grid size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-2xl touch-target transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-accent-400 to-warmth-500 text-white shadow-lg'
                  : 'bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-700/30 text-calm-600 dark:text-calm-400'
              }`}
            >
              <List size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Art Generator Modal */}
        <AnimatePresence>
          {showGenerator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/95 dark:bg-calm-900/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-accent-200/30 dark:border-calm-700/30"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-accent-400 to-warmth-400 p-2 rounded-xl mr-3">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-300">
                        Create Emotion Art
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowGenerator(false)}
                      className="bg-calm-200/50 dark:bg-calm-700/50 hover:bg-calm-300/50 dark:hover:bg-calm-600/50 text-calm-600 dark:text-calm-400 p-2 rounded-xl transition-colors touch-target"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                  <EmotionArtCanvas
                    emotionData={mockEmotionData}
                    onArtGenerated={handleArtGenerated}
                    editable={true}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Artworks Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}
        >
          {filteredArtworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-calm-200/30 dark:border-calm-700/30 rounded-3xl shadow-xl overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}
            >
              {/* Artwork Image */}
              <div className={`${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} relative group`}>
                <img
                  src={artwork.svg_data_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover rounded-t-3xl"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-t-3xl">
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(artwork.id)}
                      className={`p-3 rounded-2xl shadow-lg transition-all duration-200 ${
                        artwork.is_favorite
                          ? 'bg-gradient-to-r from-warmth-400 to-accent-500 text-white'
                          : 'bg-white/90 dark:bg-calm-800/90 text-calm-600 dark:text-calm-400'
                      }`}
                    >
                      <Heart size={18} fill={artwork.is_favorite ? 'white' : 'none'} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => shareArtwork(artwork.id)}
                      className={`p-3 rounded-2xl shadow-lg transition-all duration-200 ${
                        artwork.is_shared
                          ? 'bg-gradient-to-r from-wellness-400 to-serenity-500 text-white'
                          : 'bg-white/90 dark:bg-calm-800/90 text-calm-600 dark:text-calm-400'
                      }`}
                    >
                      <Share2 size={18} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadArtwork(artwork)}
                      className="p-3 bg-white/90 dark:bg-calm-800/90 text-calm-600 dark:text-calm-400 rounded-2xl shadow-lg"
                    >
                      <Download size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Artwork Info */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="font-semibold text-calm-800 dark:text-calm-200 mb-3 text-lg">
                  {artwork.title}
                </h3>

                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEmotionColor(artwork.dominant_emotion)}`}>
                    {artwork.dominant_emotion}
                  </span>
                  <span className="text-xs text-calm-500 dark:text-calm-400 capitalize bg-calm-100/50 dark:bg-calm-700/50 px-2 py-1 rounded-full">
                    {artwork.art_style}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-calm-600 dark:text-calm-400 mb-4">
                  <span>{new Date(artwork.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{artwork.view_count}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-calm-600 dark:text-calm-400">
                      Emotional Intensity
                    </span>
                    <span className="text-xs text-calm-500 dark:text-calm-400">
                      {Math.round(artwork.emotional_intensity * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-calm-200/50 dark:bg-calm-700/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${artwork.emotional_intensity * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-accent-400 to-warmth-500 h-3 rounded-full"
                    />
                  </div>
                </div>

                {viewMode === 'list' && (
                  <div className="mt-4 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedArtwork(artwork)}
                      className="bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      View Details
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredArtworks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-accent-400 to-warmth-400 p-6 rounded-3xl mx-auto mb-6 w-fit"
            >
              <Palette size={48} className="text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold text-calm-800 dark:text-calm-200 mb-3">
              No artworks found
            </h3>
            <p className="text-calm-600 dark:text-calm-400 mb-6 max-w-md mx-auto leading-relaxed">
              {filterStyle === 'all'
                ? "Your creative journey begins here. Transform your emotions into beautiful art!"
                : `No artworks found with ${filterStyle} style. Try a different style or create something new.`}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-to-r from-accent-400 to-warmth-500 hover:from-accent-500 hover:to-warmth-600 text-white px-8 py-4 rounded-2xl font-medium shadow-lg flex items-center space-x-2 mx-auto"
            >
              <Sparkles size={20} />
              <span>Create Your First Artwork</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmotionArtPage;
