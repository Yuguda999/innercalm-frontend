import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileNavigation from './MobileNavigation';
import { ArrowLeft, Menu, X } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showNavigation?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBackClick,
  showNavigation = true,
  headerActions,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: -100, opacity: 0 }
  };

  return (
    <div className={`min-h-screen-safe bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 ${className}`}>
      {/* Mobile Header */}
      <motion.header
        variants={headerVariants}
        animate={scrollY > 100 ? 'hidden' : 'visible'}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-calm-200 dark:bg-calm-800/95 dark:border-calm-700 safe-area-top"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="touch-target p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-calm-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-calm-900 dark:text-calm-100 truncate">
                {title}
              </h1>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {headerActions}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="touch-target p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-calm-700 transition-colors lg:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-calm-800 shadow-xl"
            >
              <div className="p-6 safe-area-top">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="touch-target p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-calm-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Menu content would go here */}
                <div className="space-y-4">
                  <p className="text-calm-600 dark:text-calm-400">
                    Menu items would be implemented here
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 ${showNavigation ? 'pb-20' : 'pb-4'}`}>
        <div className="mobile-container py-4">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      {showNavigation && <MobileNavigation />}
    </div>
  );
};

export default MobileLayout;
