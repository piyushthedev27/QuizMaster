import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

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

// Helper function to determine difficulty based on question ID
function determineDifficulty(questionId: string): 'EASY' | 'MEDIUM' | 'HARD' {
  const idNumber = parseInt(questionId)
  if (idNumber <= 15) return 'EASY'
  if (idNumber <= 35) return 'MEDIUM'
  return 'HARD'
}

// Helper function to determine category based on question content
function determineCategory(question: string): string {
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes('six sigma') || lowerQuestion.includes('tqm') || lowerQuestion.includes('total quality') || lowerQuestion.includes('pdca') || lowerQuestion.includes('iso') || lowerQuestion.includes('kaizen')) {
    return 'Quality Management'
  }
  if (lowerQuestion.includes('lean') || lowerQuestion.includes('kanban') || lowerQuestion.includes('tpm') || lowerQuestion.includes('5s') || lowerQuestion.includes('poka-yoke') || lowerQuestion.includes('value stream')) {
    return 'Lean & Operations'
  }
  if (lowerQuestion.includes('erp') || lowerQuestion.includes('crm') || lowerQuestion.includes('warehouse') || lowerQuestion.includes('wms') || lowerQuestion.includes('rfid') || lowerQuestion.includes('tms')) {
    return 'IT & ERP Systems'
  }
  if (lowerQuestion.includes('marketing') || lowerQuestion.includes('customer') || lowerQuestion.includes('demand') || lowerQuestion.includes('digital') || lowerQuestion.includes('mobile') || lowerQuestion.includes('seo')) {
    return 'Marketing Management'
  }
  if (lowerQuestion.includes('supply chain') || lowerQuestion.includes('logistics') || lowerQuestion.includes('supplier') || lowerQuestion.includes('manufacturer') || lowerQuestion.includes('warehouse') || lowerQuestion.includes('samsung')) {
    return 'Supply Chain & Logistics'
  }
  if (lowerQuestion.includes('recruitment') || lowerQuestion.includes('hrm') || lowerQuestion.includes('human resource') || lowerQuestion.includes('training') || lowerQuestion.includes('selection') || lowerQuestion.includes('supervisor')) {
    return 'Human Resource Management'
  }
  if (lowerQuestion.includes('event') || lowerQuestion.includes('service') || lowerQuestion.includes('servicescape')) {
    return 'Services & Events'
  }

  return 'Business Management'
}

async function main() {
  console.log('🚀 Starting Unit-2 database seeding with Prisma...')

  try {
    // Check if Unit-2 questions already exist to prevent duplicate seeding
    const count = await prisma.unit2Question.count({
      where: { unit: 'unit-2' }
    })

    if (count > 0) {
      console.log(`⚠️  Database already contains ${count} Unit-2 questions. Skipping seeding to prevent duplicates.`)
      return
    }

    // Load questions from JSON file
    const questionsPath = path.join(__dirname, 'unit-2.json')

    if (!fs.existsSync(questionsPath)) {
      console.error('❌ Unit-2 questions JSON file not found at:', questionsPath)
      process.exit(1)
    }

    const questionsData: QuestionData[] = JSON.parse(
      fs.readFileSync(questionsPath, 'utf-8')
    )

    console.log(`📂 Loaded ${questionsData.length} Unit-2 questions from JSON file`)

    // Prepare questions for insertion
    const questionsToInsert = questionsData.map(questionData => ({
      question: questionData.question,
      options: questionData.options,
      answer: questionData.answer,
      difficulty: determineDifficulty(questionData.id),
      category: determineCategory(questionData.question),
      unit: 'unit-2'
    }))

    // Insert questions in batches of 50
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
      const batch = questionsToInsert.slice(i, i + batchSize)

      await prisma.unit2Question.createMany({
        data: batch
      })

      insertedCount += batch.length
      console.log(`📝 Inserted ${insertedCount}/${questionsToInsert.length} Unit-2 questions...`)
    }

    console.log(`✅ Successfully seeded ${insertedCount} Unit-2 questions into the database!`)
  } catch (error) {
    console.error('❌ Error during Unit-2 seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
