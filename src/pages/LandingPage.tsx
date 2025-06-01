import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Brain,
  Users,
  Target,
  Zap,
  CheckCircle,
  Star,
  Quote,
  Play,
  Award,
  Globe,
  Lock,
  Headphones,
  Palette,
  Calendar,
  BarChart3
} from 'lucide-react'

const LandingPage = () => {
  const coreFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Inner Ally',
      description: 'Your personal AI companion that understands your emotions and provides 24/7 empathetic support.',
      gradient: 'from-wellness-400 to-serenity-500'
    },
    {
      icon: Headphones,
      title: 'Voice Journaling',
      description: 'Express yourself naturally with voice recordings and receive real-time emotional insights.',
      gradient: 'from-serenity-400 to-accent-500'
    },
    {
      icon: Palette,
      title: 'Emotion Art',
      description: 'Transform your feelings into beautiful, personalized artwork that reflects your emotional journey.',
      gradient: 'from-accent-400 to-warmth-500'
    },
    {
      icon: Users,
      title: 'Community Circles',
      description: 'Connect with others who share similar experiences in safe, moderated support groups.',
      gradient: 'from-warmth-400 to-wellness-500'
    },
    {
      icon: Target,
      title: 'Practice Plans',
      description: 'Follow personalized therapeutic homework and track your progress with accountability tools.',
      gradient: 'from-wellness-400 to-serenity-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Gain deep insights into your emotional patterns with comprehensive mood tracking and trends.',
      gradient: 'from-serenity-400 to-accent-500'
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'End-to-end encryption and HIPAA-compliant data protection for your peace of mind.'
    },
    {
      icon: Zap,
      title: 'Instant Support',
      description: 'Get immediate emotional support whenever you need it, day or night.'
    },
    {
      icon: Award,
      title: 'Evidence-Based',
      description: 'Built on proven therapeutic techniques and validated by mental health professionals.'
    },
    {
      icon: Globe,
      title: 'Accessible Anywhere',
      description: 'Access your mental health toolkit from any device, anywhere in the world.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Marketing Professional',
      content: 'InnerCalm has transformed how I manage stress and anxiety. The AI companion feels like having a therapist available 24/7.',
      rating: 5
    },
    {
      name: 'David L.',
      role: 'College Student',
      content: 'The voice journaling feature helped me process my emotions in ways I never thought possible. Highly recommend!',
      rating: 5
    },
    {
      name: 'Maria R.',
      role: 'Healthcare Worker',
      content: 'As someone in a high-stress job, InnerCalm provides the emotional support I need to stay balanced and focused.',
      rating: 5
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '1M+', label: 'Journal Entries' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '24/7', label: 'AI Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-50/30 via-serenity-50/20 to-accent-50/30 dark:from-calm-950 dark:via-calm-900 dark:to-calm-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* App Logo and Name */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-gradient-to-br from-wellness-400 to-serenity-400 p-3 rounded-2xl shadow-lg"
                  >
                    <Heart className="h-8 w-8 text-white" />
                  </motion.div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-wellness-600 to-serenity-600 bg-clip-text text-transparent">
                    InnerCalm
                  </h1>
                </div>
                <p className="text-lg text-wellness-600 dark:text-wellness-400 font-medium">
                  Your AI-Powered Mental Health Companion
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-calm-900 dark:text-calm-100 mb-6 leading-tight">
                  Transform Your{' '}
                  <span className="bg-gradient-to-r from-wellness-500 to-serenity-500 bg-clip-text text-transparent">
                    Mental Health
                  </span>{' '}
                  Journey
                </h2>
                <p className="text-xl text-calm-600 dark:text-calm-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Experience personalized AI support, voice journaling, emotion art, and community connections
                  designed to help you achieve lasting emotional wellness.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-wellness-400 to-serenity-500 hover:from-wellness-500 hover:to-serenity-600 text-white text-lg px-8 py-4 rounded-2xl font-semibold flex items-center justify-center shadow-lg transition-all duration-200"
                    >
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 text-wellness-700 dark:text-wellness-300 text-lg px-8 py-4 rounded-2xl font-semibold hover:bg-wellness-50/70 dark:hover:bg-calm-700/70 transition-all duration-200 shadow-lg"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-calm-600 dark:text-calm-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-wellness-500" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-serenity-500" />
                    <span>End-to-End Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent-500" />
                    <span>Evidence-Based</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-8 shadow-2xl">
                {/* Mock App Interface */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-wellness-400 to-serenity-500 rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-wellness-800 dark:text-wellness-300">Inner Ally</h3>
                        <p className="text-sm text-calm-600 dark:text-calm-400">Online now</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-wellness-400 rounded-full animate-pulse"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-wellness-100/70 dark:bg-wellness-900/30 p-4 rounded-2xl">
                      <p className="text-wellness-700 dark:text-wellness-300 text-sm">
                        "I notice you've been feeling stressed lately. Would you like to try a breathing exercise or talk about what's on your mind?"
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="bg-serenity-100/70 dark:bg-serenity-900/30 text-serenity-700 dark:text-serenity-400 px-4 py-2 rounded-xl text-sm font-medium">
                        Breathing Exercise
                      </button>
                      <button className="bg-accent-100/70 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 px-4 py-2 rounded-xl text-sm font-medium">
                        Let's Talk
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-accent-400 to-warmth-500 text-white p-4 rounded-2xl shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-xs opacity-90">User Satisfaction</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-br from-serenity-400 to-wellness-500 text-white p-4 rounded-2xl shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs opacity-90">AI Support</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-wellness-400/20 to-serenity-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-accent-400/20 to-warmth-400/20 rounded-full blur-xl"
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-wellness-500 to-serenity-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-calm-600 dark:text-calm-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-900 dark:text-calm-100 mb-4">
              Comprehensive Mental Health Tools
            </h2>
            <p className="text-xl text-calm-600 dark:text-calm-300 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge AI technology with evidence-based mental health practices
              to provide you with a complete emotional wellness toolkit.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-calm-600 dark:text-calm-300 text-center leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-900 dark:text-calm-100 mb-4">
              Why Choose InnerCalm?
            </h2>
            <p className="text-xl text-calm-600 dark:text-calm-300 max-w-2xl mx-auto leading-relaxed">
              Built with your privacy, security, and well-being as our top priorities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-warmth-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-calm-900 dark:text-calm-100 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-calm-600 dark:text-calm-300 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-900 dark:text-calm-100 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-calm-600 dark:text-calm-300 max-w-2xl mx-auto leading-relaxed">
              See how InnerCalm has helped people transform their mental health journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/70 dark:bg-calm-800/70 backdrop-blur-sm border border-wellness-200/30 dark:border-calm-700/30 rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-wellness-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-wellness-400 mb-4" />
                <p className="text-calm-700 dark:text-calm-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-calm-900 dark:text-calm-100">
                    {testimonial.name}
                  </div>
                  <div className="text-calm-600 dark:text-calm-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-wellness-500 to-serenity-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Mental Health?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of users who have found peace, clarity, and emotional wellness with InnerCalm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="bg-white text-wellness-600 text-lg px-8 py-4 rounded-2xl font-semibold flex items-center justify-center shadow-lg hover:bg-wellness-50 transition-all duration-200"
                >
                  Start Your Free Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-200"
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
