// ===== REVIEW TYPES =====

export interface Review {
  id: number;
  documentId: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  firebaseUid: string;
  isApproved: boolean;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDTO {
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  firebaseUid: string;
  courseId: number;
}

// ===== CERTIFICATE TYPES =====

export interface Certificate {
  id: string;
  certificateId: string;
  firebaseUid: string;
  userName: string;
  courseTitle: string;
  courseThumbnail?: string;
  instructorName: string;
  issuedAt: string;
  completionPercentage: number;
  downloadUrl?: string;
}

// ===== ENROLLMENT TYPES =====

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export interface Enrollment {
  id: number;
  documentId: string;
  firebaseUid: string;
  userName: string;
  userEmail: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  courseId: number;
  course?: import('./course.types').CourseCard;
}

// ===== PROGRESS TYPES (FIRESTORE) =====

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  currentLessonId: string;
  percentage: number;
  lastAccessedAt: number;
  totalTimeSpent: number; // seconds
}

export interface LessonNote {
  id: string;
  lessonId: string;
  content: string;
  timestamp: number; // video timestamp in seconds
  createdAt: number;
  updatedAt: number;
}

// ===== LEADERBOARD =====

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  points: number;
  completedCourses: number;
  rank: number;
}

// ===== API RESPONSE TYPES =====

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, never>;
}

// ===== DASHBOARD STATS =====

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  learningHours: number;
  certificates: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  completionRate: number;
  newUsersThisMonth: number;
  newCoursesThisMonth: number;
  revenueGrowth: number;
}
