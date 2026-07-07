// ===== USER TYPES =====

export type UserRole = 'student' | 'admin' | 'instructor';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  points: number;
  createdAt: string;
  emailVerified: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string;
  phone: string;
  role: UserRole;
  points: number;
  totalCourses: number;
  completedCourses: number;
  totalLearningHours: number;
  certificates: number;
  joinedAt: string;
}

export interface UpdateProfileDTO {
  displayName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string; // Optional for Google login
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  displayName: string;
}
