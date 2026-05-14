import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Test question count
    const questionCount = await prisma.question.count();
    const unit1QuestionCount = await prisma.unit1Question.count();
    const unit2QuestionCount = await prisma.unit2Question.count();
    const unit3QuestionCount = await prisma.unit3Question.count();
    const unit4QuestionCount = await prisma.unit4Question.count();
    const unit5QuestionCount = await prisma.unit5Question.count();

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        questionCount,
        unit1QuestionCount,
        unit2QuestionCount,
        unit3QuestionCount,
        unit4QuestionCount,
        unit5QuestionCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}