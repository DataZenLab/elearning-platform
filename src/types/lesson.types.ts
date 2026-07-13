// ===== LESSON TYPES =====

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  videoUrl: string;
  duration: number; // minutes
  order: number;
  isFree: boolean;
  chapter?: string;
  courseId: number;
  quiz: Quiz | null;
  attachments?: import('./course.types').StrapiMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonListItem {
  id: number;
  title: string;
  slug: string;
  duration: number;
  order: number;
  isFree: boolean;
  isCompleted?: boolean;
}

// ===== CATEGORY =====
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
  createdAt: string;
}

// ===== INSTRUCTOR =====
export interface Instructor {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio: string;
  avatar: import('./course.types').StrapiMedia | null;
  title: string;
  expertise: string[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  createdAt: string;
}

// ===== QUIZ =====
export interface Quiz {
  id: number;
  documentId: string;
  title: string;
  description: string;
  timeLimit: number; // minutes
  passingScore: number; // percentage
  questions: Question[];
  lessonId: number;
}

export interface Question {
  id: number;
  text: string;
  type: 'single_choice' | 'multiple_choice';
  options: QuestionOption[];
  explanation: string;
  points: number;
  order: number;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  quizId: number;
  answers: Record<number, number[]>; // questionId -> selected option indices
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number; // seconds
}
