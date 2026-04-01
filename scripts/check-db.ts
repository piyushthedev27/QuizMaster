import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()

  try {
    const unit1Questions = await prisma.unit1Question.findMany({
      where: { unit: 'unit-1' }
    })
    console.log('Unit-1 questions count in unit_questions table:', unit1Questions.length)

    // Check main questions table for unit-1
    // Note: We'll need to cast to any since unit isn't in the schema for Question
    const questionsWithUnit = await (prisma.question as any).findMany({
      where: { unit: 'unit-1' }
    }).catch(() => [])
    console.log('Unit-1 questions count in questions table:', questionsWithUnit.length)

  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
