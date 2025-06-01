import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Home,
  MessageCircle,
  Users,
  BarChart3,
  Palette,
  Mic,
  Brain,
  Stethoscope,
  Calendar,
  Lightbulb,
  Map,
  Wrench
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  // Hide navbar on landing, login, and register pages
  const hideNavbarPaths = ['/', '/login', '/register']
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowUserMenu(false)
  }

  // Don't render navbar on specified pages
  if (shouldHideNavbar) {
    return null
  }

  const primaryNavItems = user
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Chat', path: '/chat', icon: MessageCircle },
        { name: 'Community', path: '/community', icon: Users },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' },
      ]

  const toolsDropdown = [
    { name: 'Voice Journal', path: '/voice-journal', icon: Mic },
    { name: 'Emotion Art', path: '/emotion-art', icon: Palette },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Trauma Mapping', path: '/trauma-mapping', icon: Map },
  ]

  const supportDropdown = [
    { name: 'Inner Ally', path: '/inner-ally', icon: Brain },
    { name: 'Professional Bridge', path: '/professional-bridge', icon: Stethoscope },
    { name: 'Practice Plans', path: '/practice-plans', icon: Calendar },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
  ]

  const isActiveDropdown = (items: any[]) => {
    return items.some(item => location.pathname === item.path)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm dark:bg-calm-800/80 dark:border-calm-700/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <Heart className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">InnerCalm</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Primary Navigation Items */}
            {primaryNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Tools Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'tools' ? null : 'tools')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActiveDropdown(toolsDropdown)
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  <span>Tools</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'tools' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'tools' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-calm-200 py-2 dark:bg-calm-800 dark:border-calm-700"
                    >
                      {toolsDropdown.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors duration-200 ${
                              location.pathname === item.path
                                ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                                : 'text-calm-700 hover:bg-calm-50 dark:text-calm-300 dark:hover:bg-calm-700'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Support Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActiveDropdown(supportDropdown)
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Support</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'support' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'support' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-calm-200 py-2 dark:bg-calm-800 dark:border-calm-700"
                    >
                      {supportDropdown.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors duration-200 ${
                              location.pathname === item.path
                                ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                                : 'text-calm-700 hover:bg-calm-50 dark:text-calm-300 dark:hover:bg-calm-700'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-md text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>{user.full_name || user.username}</span>
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-calm-200 py-1 dark:bg-calm-800 dark:border-calm-700"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-calm-700 hover:bg-calm-50 dark:text-calm-300 dark:hover:bg-calm-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-calm-700 hover:bg-calm-50 dark:text-calm-300 dark:hover:bg-calm-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-calm-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-calm-200 dark:border-calm-700"
          >
            <div className="flex flex-col space-y-2">
              {/* Primary Navigation Items */}
              {primaryNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                        : 'text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* Tools Section */}
              {user && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-calm-500 dark:text-calm-400 uppercase tracking-wider">
                    Tools
                  </div>
                  {toolsDropdown.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          location.pathname === item.path
                            ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                            : 'text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}

                  {/* Support Section */}
                  <div className="px-3 py-2 text-xs font-semibold text-calm-500 dark:text-calm-400 uppercase tracking-wider">
                    Support
                  </div>
                  {supportDropdown.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          location.pathname === item.path
                            ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                            : 'text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </>
              )}

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors duration-200"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                )}
              </button>

              {user && (
                <>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md text-sm font-medium text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-calm-600 hover:text-primary-600 hover:bg-primary-50 dark:text-calm-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors duration-200 text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
