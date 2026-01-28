'use client'

import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Developer {
  name: string
  githubUrl: string
  githubUsername: string
}

const developers: Developer[] = [
  {
    name: 'Piyush Prjapat',
    githubUrl: 'https://github.com/piyushthedev27',
    githubUsername: 'piyushthedev27'
  },
  {
    name: 'Nirmit Angane',
    githubUrl: 'https://github.com/Nirmit-Angane',
    githubUsername: 'Nirmit-Angane'
  }
]

export function Credits() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mt-8 sm:mt-16 mb-6 sm:mb-8"
    >
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
              Built with ❤️ by
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {developers.map((developer, index) => (
                <motion.div
                  key={developer.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                      {developer.name}
                    </p>
                    <a
                      href={developer.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group-hover:scale-105 transform"
                    >
                      <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>@{developer.githubUsername}</span>
                      <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                QuizMaster Platform • Open Source • Made with Next.js & TypeScript
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}