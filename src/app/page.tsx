'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Credits } from '@/components/ui/credits'
import { Trophy, Clock, Users, Target, ArrowRight, Zap } from 'lucide-react'
import Script from 'next/script'

export default function HomePage() {
  const { user } = useAuth()

  const features = [
    {
      icon: Clock,
      title: "Timed Challenges",
      description: "10-second questions keep you on your toes"
    },
    {
      icon: Trophy,
      title: "Real-time Leaderboard",
      description: "Compete with players worldwide"
    },
    {
      icon: Target,
      title: "Instant Feedback",
      description: "Learn from every answer immediately"
    },
    {
      icon: Users,
      title: "Global Competition",
      description: "See how you rank against others"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2732790539794546"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Navigation */}
      <nav className="relative z-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <span className="text-lg sm:text-2xl font-bold text-gray-900">QuizMaster</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center space-x-2 sm:space-x-4"
          >
            {user ? (
              <Button asChild size="sm" className="sm:size-default">
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                  <Link href="/auth/login">
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="sm:size-default">
                  <Link href="/auth/register">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Master Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Knowledge
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Challenge yourself with timed quizzes, get instant feedback, and compete 
              with players worldwide on our real-time leaderboard.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
            >
              {user ? (
                <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-auto w-full sm:w-auto">
                  <Link href="/dashboard" className="flex items-center gap-2 justify-center">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-auto w-full sm:w-auto">
                    <Link href="/auth/register" className="flex items-center gap-2 justify-center">
                      Start Quiz Now
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-auto w-full sm:w-auto">
                    <Link href="/leaderboard" className="flex items-center justify-center">
                      View Leaderboard
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 sm:mt-32"
        >
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose QuizMaster?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the most engaging way to test and improve your knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/70 backdrop-blur-sm">
                  <CardContent className="pt-6 sm:pt-8 pb-6 px-4 sm:px-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mb-4 sm:mb-6">
                      <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 sm:mt-32 text-center px-4"
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white">
              <CardContent className="py-12 sm:py-16 px-6 sm:px-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Ready to Test Your Knowledge?
                </h2>
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-indigo-100">
                  Join thousands of quiz enthusiasts and start your journey today
                </p>
                <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-auto w-full sm:w-auto">
                  <Link href="/auth/register" className="flex items-center gap-2 justify-center">
                    Create Free Account
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Credits Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Credits />
      </div>
    </div>
  )
}