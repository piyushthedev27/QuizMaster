import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local first, then .env
config({ path: '.env.local' })
config({ path: '.env' })

console.log('Using connection string:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'))

interface QuestionData {
  id: string
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  answer: 'a' | 'b' | 'c' | 'd'
}

// Helper function to determine difficulty based on question ID or content
function determineDifficulty(questionId: string): 'EASY' | 'MEDIUM' | 'HARD' {
  const idNumber = parseInt(questionId)
  if (idNumber <= 15) return 'EASY'
  if (idNumber <= 35) return 'MEDIUM'
  return 'HARD'
}

// Helper function to determine category based on question content
function determineCategory(question: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('management') || lowerQuestion.includes('fayol') || lowerQuestion.includes('taylor')) {
    return 'Management Theory'
  }
  if (lowerQuestion.includes('planning') || lowerQuestion.includes('organizing') || lowerQuestion.includes('controlling')) {
    return 'Management Functions'
  }
  if (lowerQuestion.includes('leadership') || lowerQuestion.includes('motivation') || lowerQuestion.includes('team')) {
    return 'Leadership & Teams'
  }
  if (lowerQuestion.includes('project') || lowerQuestion.includes('gantt') || lowerQuestion.includes('pert') || lowerQuestion.includes('agile')) {
    return 'Project Management'
  }
  if (lowerQuestion.includes('decision') || lowerQuestion.includes('problem') || lowerQuestion.includes('smart')) {
    return 'Decision Making'
  }
  
  return 'General Management'
}

async function main() {
  console.log('Starting Unit-1 questions seeding into unit_questions table...')
  
  // Use the same configuration as the main app
  let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set')
  }

  const pool = new Pool({ 
    connectionString,
    max: 5, // Smaller pool for seeding
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Longer timeout for seeding
  })

  const adapter = new PrismaPg(pool)
  
  // Create Prisma client with adapter
  const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })

  try {
    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Check if Unit-1 questions already exist in unit_questions table
    const existingCount = await prisma.unitQuestion.count({
      where: { unit: 'unit-1' }
    })
    
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} Unit-1 questions in unit_questions table. Skipping seeding.`)
      return
    }

    // Load questions from JSON file
    const questionsPath = path.join(process.cwd(), 'prisma', 'unit-1.json')
    
    if (!fs.existsSync(questionsPath)) {
      console.error('Unit-1 questions JSON file not found at:', questionsPath)
      process.exit(1)
    }

    const questionsData: QuestionData[] = JSON.parse(
      fs.readFileSync(questionsPath, 'utf-8')
    )

    console.log(`Loading ${questionsData.length} Unit-1 questions from JSON file...`)

    // Prepare questions for insertion into unit_questions table
    const questionsToInsert = questionsData.map(questionData => ({
      question: questionData.question,
      options: questionData.options,
      answer: questionData.answer,
      difficulty: determineDifficulty(questionData.id),
      category: determineCategory(questionData.question),
      unit: 'unit-1'
    }))

    // Insert questions in smaller batches to avoid timeout
    const batchSize = 10
    let insertedCount = 0

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
      const batch = questionsToInsert.slice(i, i + batchSize)
      
      try {
        await prisma.unitQuestion.createMany({
          data: batch,
          skipDuplicates: true
        })
        
        insertedCount += batch.length
        console.log(`📝 Inserted ${insertedCount}/${questionsToInsert.length} Unit-1 questions...`)
        
        // Small delay between batches to prevent overwhelming the connection
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`✅ Successfully seeded ${insertedCount} Unit-1 questions into unit_questions table!`)
    
  } catch (error) {
    console.error('❌ Database connection or seeding error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
    console.log('Database connection closed.')
  }
}

main()
  .catch((e) => {
    console.error('Error during Unit-1 questions seeding:', e)
    process.exit(1)
  })
  .finally(() => {
    console.log('Unit-1 seeding completed.')
  })