// ===== COURSE TYPES =====
import type { Category, Instructor, Lesson } from './lesson.types';
import type { Review } from './api.types';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export type { Category, Instructor, Lesson, Review };

export interface Course {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: StrapiMedia | null;
  price: number;
  originalPrice?: number;
  difficulty: CourseDifficulty;
  duration: number; // total minutes
  language: string;
  isPublished: boolean;
  publishedAt: string | null;
  totalStudents: number;
  averageRating: number;
  totalReviews: number;
  category: Category | null;
  instructor: Instructor | null;
  lessons: Lesson[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseCard {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: StrapiMedia | null;
  price: number;
  originalPrice?: number;
  difficulty: CourseDifficulty;
  duration: number;
  totalStudents: number;
  averageRating: number;
  totalReviews: number;
  category: Pick<Category, 'id' | 'name' | 'slug' | 'color'> | null;
  instructor: { id: number; username?: string; name?: string; avatar?: StrapiMedia | null } | null;
}

export interface CourseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  difficulty?: CourseDifficulty;
  sort?: 'newest' | 'popular' | 'rating' | 'price-asc' | 'price-desc';
  priceMin?: number;
  priceMax?: number;
}

// ===== STRAPI MEDIA =====
export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText: string | null;
  ext: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}
