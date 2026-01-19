import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

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
  // Simple logic: you can customize this based on your needs
  const idNumber = parseFloat(questionId)
  if (idNumber <= 1.3) return 'EASY'
  if (idNumber <= 1.7) return 'MEDIUM'
  return 'HARD'
}

// Helper function to determine category based on question content
function determineCategory(question: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('capital') || lowerQuestion.includes('ocean') || lowerQuestion.includes('continent')) {
    return 'Geography'
  }
  if (lowerQuestion.includes('programming') || lowerQuestion.includes('language')) {
    return 'Technology'
  }
  if (lowerQuestion.includes('chemical') || lowerQuestion.includes('planet')) {
    return 'Science'
  }
  if (lowerQuestion.includes('wrote') || lowerQuestion.includes('play')) {
    return 'Literature'
  }
  if (lowerQuestion.includes('war') || lowerQuestion.includes('year')) {
    return 'History'
  }
  if (lowerQuestion.includes('prime') || lowerQuestion.includes('2 + 2')) {
    return 'Mathematics'
  }
  
  return 'General Knowledge'
}

async function main() {
  console.log('Starting database seeding...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration')
    console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Check if questions already exist to prevent duplicate seeding
  const { count, error: countError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('❌ Error checking existing questions:', countError.message)
    process.exit(1)
  }
  
  if (count && count > 0) {
    console.log(`Database already contains ${count} questions. Skipping seeding.`)
    return
  }

  // Load questions from JSON file
  const questionsPath = path.join(__dirname, 'questions.json')
  
  if (!fs.existsSync(questionsPath)) {
    console.error('Questions JSON file not found at:', questionsPath)
    process.exit(1)
  }

  const questionsData: QuestionData[] = JSON.parse(
    fs.readFileSync(questionsPath, 'utf-8')
  )

  console.log(`Loading ${questionsData.length} questions from JSON file...`)

  // Prepare questions for insertion
  const questionsToInsert = questionsData.map(questionData => ({
    question: questionData.question,
    options: questionData.options,
    answer: questionData.answer,
    difficulty: determineDifficulty(questionData.id),
    category: determineCategory(questionData.question)
  }))

  // Insert questions in batches of 100
  const batchSize = 100
  let insertedCount = 0

  for (let i = 0; i < questionsToInsert.length; i += batchSize) {
    const batch = questionsToInsert.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('questions')
      .insert(batch)
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      continue
    }
    
    insertedCount += batch.length
    console.log(`📝 Inserted ${insertedCount} questions...`)
  }

  console.log(`✅ Successfully seeded ${insertedCount} questions into the database!`)
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Seeding completed.')
  })