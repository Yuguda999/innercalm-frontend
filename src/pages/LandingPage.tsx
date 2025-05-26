import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, TrendingUp, Shield, Sparkles, ArrowRight } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'AI Companion',
      description: 'Chat with our empathetic AI that understands your emotions and provides personalized support.',
    },
    {
      icon: TrendingUp,
      title: 'Mood Tracking',
      description: 'Track your emotional journey with advanced analytics and insights into your mental health patterns.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Recommendations',
      description: 'Receive tailored suggestions for activities, exercises, and resources based on your unique needs.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your mental health data is encrypted and secure. We prioritize your privacy above everything else.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* App Logo and Name */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Heart className="h-12 w-12 text-primary-500" />
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
                  InnerCalm
                </h1>
              </div>
              <p className="text-lg text-calm-600 font-medium">
                Your AI-Powered Mental Health Companion
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl sm:text-6xl font-bold text-calm-900 mb-6">
                Your Journey to{' '}
                <span className="gradient-text">Inner Peace</span>{' '}
                Starts Here
              </h2>
              <p className="text-xl text-calm-600 mb-8 max-w-3xl mx-auto">
                Discover personalized support, mood tracking, and evidence-based recommendations
                to help you achieve emotional wellness and mental clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-accent-400 to-primary-400 rounded-full opacity-20 blur-xl"
        />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-900 mb-4">
              Why Choose InnerCalm?
            </h2>
            <p className="text-xl text-calm-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with evidence-based mental health practices
              to provide you with comprehensive emotional support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover:scale-105 transition-transform duration-200"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-calm-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-calm-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
