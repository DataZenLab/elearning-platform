import { notFound } from 'next/navigation';
import { lessonApi } from '@/services/api/lesson.api';
import { QuizClient } from './quiz-client';

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ courseSlug?: string }>;
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { quizId } = await params;
  const { courseSlug } = await searchParams;

  // Fetch quiz data from Strapi - quizId can be a documentId or numeric id
  let quiz = null;

  // Try by documentId first (string), then by numeric id
  if (isNaN(Number(quizId))) {
    // it's a documentId
    quiz = await lessonApi.getQuizByDocumentId(quizId);
  } else {
    // it's a numeric id
    quiz = await lessonApi.getQuizById(quizId);
  }

  if (!quiz) {
    notFound();
  }

  return <QuizClient quiz={quiz} courseSlug={courseSlug} />;
}
