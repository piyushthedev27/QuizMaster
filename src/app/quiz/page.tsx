'use client';

import { useAuth } from '@/hooks/useAuth';
import { QuizInterface } from '@/components/quiz/QuizInterface';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function QuizContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get question count from URL parameters, default to 10
  const questionCount = parseInt(searchParams.get('questions') || '10');
  const validQuestionCount = [10, 30, 50, 100].includes(questionCount) ? questionCount : 10;
  
  // Get unit parameter from URL
  const unit = searchParams.get('unit') || undefined;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <QuizInterface userId={user.id} questionCount={validQuestionCount} unit={unit} />
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}