import { Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import RecommendationsPage from './pages/RecommendationsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import TraumaMappingPage from './pages/TraumaMappingPage'
import InnerAllyPage from './pages/InnerAllyPage'
import ProfessionalBridgePage from './pages/ProfessionalBridgePage'
import PracticePlanPage from './pages/PracticePlanPage'
import CommunityPage from './pages/CommunityPage'
import CircleDetailPage from './pages/CircleDetailPage'
import ReflectionChainPage from './pages/ReflectionChainPage'
import VoiceJournalPage from './pages/VoiceJournalPage'
import EmotionArtPage from './pages/EmotionArtPage'
import TherapistLoginPage from './pages/TherapistLoginPage'
import TherapistRegisterPage from './pages/TherapistRegisterPage'
import TherapistDashboard from './pages/TherapistDashboard'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { InnerAllyProvider } from './contexts/InnerAllyContext'
import ProtectedRoute from './components/ProtectedRoute'
import CalmCompanionWidget from './components/CalmCompanionWidget'

function AppContent() {
  const location = useLocation()

  // Hide navbar on landing, login, and register pages
  const hideNavbarPaths = ['/', '/login', '/register']
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-calm-900 dark:via-calm-800 dark:to-calm-900 transition-colors duration-300">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={shouldHideNavbar ? '' : 'pt-16'}
      >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/therapist/login" element={<TherapistLoginPage />} />
            <Route path="/therapist/register" element={<TherapistRegisterPage />} />
            <Route
              path="/therapist/dashboard"
              element={
                <ProtectedRoute>
                  <TherapistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trauma-mapping"
              element={
                <ProtectedRoute>
                  <TraumaMappingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inner-ally"
              element={
                <ProtectedRoute>
                  <InnerAllyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/professional-bridge"
              element={
                <ProtectedRoute>
                  <ProfessionalBridgePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice-plans"
              element={
                <ProtectedRoute>
                  <PracticePlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/circles/:circleId"
              element={
                <ProtectedRoute>
                  <CircleDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/reflections/:chainId"
              element={
                <ProtectedRoute>
                  <ReflectionChainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice-journal"
              element={
                <ProtectedRoute>
                  <VoiceJournalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/emotion-art"
              element={
                <ProtectedRoute>
                  <EmotionArtPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </motion.main>

        {/* Calm Companion Widget - Available on all protected pages */}
        <CalmCompanionWidget />
      </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InnerAllyProvider>
          <AppContent />
        </InnerAllyProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
