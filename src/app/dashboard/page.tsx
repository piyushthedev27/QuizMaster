'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Credits } from '@/components/ui/credits'
import { 
  Play, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  LogOut,
  BarChart3,
  Zap
} from 'lucide-react'

interface UserStats {
  id: string
  userId: string
  score: number
  accuracy: number
  timeTaken: number
  answers: any[]
  createdAt: string
  globalRank: number
  totalAttempts: number
  user: {
    id: string
    email: string
    username: string | null
  }
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch('/api/user/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch user statistics')
        }

        const data = await response.json()
        setUserStats(data.userStats)
      } catch (err) {
        console.error('Error fetching user stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">QuizMaster</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Welcome back, {user.username || user.email}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href="/leaderboard" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="sm:hidden">
                <Link href="/leaderboard">
                  <Trophy className="h-4 w-4" />
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="hidden sm:flex">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Ready for a Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready for a Challenge?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Choose your quiz length and test your knowledge with our engaging questions
            </p>
          </div>

          {/* Question Count Options */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {[
              { count: 10, label: 'Quick Quiz', time: '~2-5 min', icon: Clock, color: 'bg-green-100', iconColor: 'text-green-600' },
              { count: 30, label: 'Standard Quiz', time: '~5-15 min', icon: Target, color: 'bg-blue-100', iconColor: 'text-blue-600' },
              { count: 50, label: 'Long Quiz', time: '~8-25 min', icon: TrendingUp, color: 'bg-purple-100', iconColor: 'text-purple-600' },
              { count: 100, label: 'Marathon Quiz', time: '~17-50 min', icon: Trophy, color: 'bg-yellow-100', iconColor: 'text-yellow-600' }
            ].map((option, index) => (
              <motion.div
                key={option.count}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm cursor-pointer group">
                  <CardContent className="pt-4 sm:pt-8 pb-4 sm:pb-6 px-3 sm:px-6">
                    <Link href={`/quiz?questions=${option.count}`} className="block text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 ${option.color} rounded-full mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <option.icon className={`h-5 w-5 sm:h-8 sm:w-8 ${option.iconColor}`} />
                      </div>
                      <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-1">{option.count}</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.time}</div>
                      <div className="text-xs text-gray-400 mt-1">Choose your pace</div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Unit-Based Quizzes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Unit-Based Quizzes
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Practice specific topics with curated question sets
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Unit-1 Quiz Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-purple-50 cursor-pointer group">
                  <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                    <Link href={`/quiz?unit=unit-1&questions=30`} className="block text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                      </div>
                      <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-1">Unit-1</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Management Fundamentals</div>
                      <div className="text-xs text-gray-500 mb-2 sm:mb-3">30 questions from 195 available</div>
                      <div className="text-xs text-indigo-600 font-medium">Choose your timing</div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Unit-2 Quiz Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 cursor-pointer group">
                  <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                    <Link href={`/quiz?unit=unit-2&questions=30`} className="block text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                      </div>
                      <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-1">Unit-2</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Quality & Operations</div>
                      <div className="text-xs text-gray-500 mb-2 sm:mb-3">30 questions from 110 available</div>
                      <div className="text-xs text-emerald-600 font-medium">Choose your timing</div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Unit-3 Quiz Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="relative hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-amber-50 cursor-pointer group">
                  <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                    <Link href={`/quiz?unit=unit-3&questions=30`} className="block text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                      </div>
                      <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-1">Unit-3</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Marketing Management</div>
                      <div className="text-xs text-gray-500 mb-2 sm:mb-3">30 questions from 162 available</div>
                      <div className="text-xs text-orange-600 font-medium">Choose your timing</div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Unit-4 Quiz Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 cursor-pointer group">
                  <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                    <Link href={`/quiz?unit=unit-4&questions=30`} className="block text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                      <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-1">Unit-4</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Financial Planning</div>
                      <div className="text-xs text-gray-500 mb-2 sm:mb-3">30 questions from 100 available</div>
                      <div className="text-xs text-blue-600 font-medium">Choose your timing</div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Unit-5 Quiz Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="relative hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-rose-50 to-pink-50 cursor-pointer group">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-0 shadow-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      New
                    </Badge>
                  </div>
                  <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                    <Link href={`/quiz?unit=unit-5&questions=30`} className="block text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-rose-600" />
                      </div>
                      <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-1">Unit-5</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Supply Chain & HR</div>
                      <div className="text-xs text-gray-500 mb-2 sm:mb-3">30 questions from 145 available</div>
                      <div className="text-xs text-rose-600 font-medium">Choose your timing</div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Default Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Link href="/quiz" className="flex items-center gap-2">
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Start Quick Quiz (10 Questions)</span>
                <span className="sm:hidden">Start Quiz</span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Statistics Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          >
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4 sm:py-6">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4 sm:py-6 text-center">
                <p className="text-red-600 text-sm sm:text-base">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : userStats ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="py-4 sm:py-6 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Best Score</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{userStats.score}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                    <Target className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="py-4 sm:py-6 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Accuracy</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{userStats.accuracy.toFixed(1)}%</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="py-4 sm:py-6 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Rank</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">#{userStats.globalRank}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
                    <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="py-4 sm:py-6 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Attempts</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{userStats.totalAttempts}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="text-center">
              <CardContent className="py-8 sm:py-12 px-4 sm:px-6">
                <Target className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Quiz Attempts Yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Take your first quiz to see your statistics here
                </p>
                <Button asChild size="sm">
                  <Link href="/quiz" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Take Your First Quiz
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Performance Summary */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Best Time</span>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(userStats.timeTaken / 60)}m {userStats.timeTaken % 60}s
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Last Attempt</span>
                    <span className="text-xs sm:text-sm text-gray-900">
                      {new Date(userStats.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Ranking Status</span>
                    <Badge variant={userStats.globalRank <= 10 ? "default" : "secondary"} className="text-xs">
                      {userStats.globalRank <= 3 ? "🏆 Top 3" : 
                       userStats.globalRank <= 10 ? "🥇 Top 10" : 
                       `#${userStats.globalRank}`}
                    </Badge>
                  </div>
                </div>
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