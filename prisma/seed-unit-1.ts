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
  console.log('Starting Unit-1 database seeding...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration')
    console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Check if Unit-1 questions already exist to prevent duplicate seeding
  const { count, error: countError } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('unit', 'unit-1')
  
  if (countError) {
    console.error('❌ Error checking existing Unit-1 questions:', countError.message)
    console.log('This might be because the questions table doesn\'t exist yet or the unit column is missing.')
    console.log('Proceeding with seeding...')
  } else if (count && count > 0) {
    console.log(`Database already contains ${count} Unit-1 questions. Skipping seeding.`)
    return
  }

  // Load questions from JSON file
  const questionsPath = path.join(__dirname, 'unit-1.json')
  
  if (!fs.existsSync(questionsPath)) {
    console.error('Unit-1 questions JSON file not found at:', questionsPath)
    process.exit(1)
  }

  const questionsData: QuestionData[] = JSON.parse(
    fs.readFileSync(questionsPath, 'utf-8')
  )

  console.log(`Loading ${questionsData.length} Unit-1 questions from JSON file...`)

  // Prepare questions for insertion
  const questionsToInsert = questionsData.map(questionData => ({
    // Don't include id - let Supabase generate it
    question: questionData.question,
    options: questionData.options,
    answer: questionData.answer,
    difficulty: determineDifficulty(questionData.id),
    category: determineCategory(questionData.question),
    unit: 'unit-1' // Mark all questions as Unit-1
  }))

  // Insert questions in batches of 50
  const batchSize = 50
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
    console.log(`📝 Inserted ${insertedCount} Unit-1 questions...`)
  }

  console.log(`✅ Successfully seeded ${insertedCount} Unit-1 questions into the database!`)
}

main()
  .catch((e) => {
    console.error('Error during Unit-1 seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Unit-1 seeding completed.')
  })