import type { Course, CourseCard, CourseQueryParams, StrapiResponse } from '@/types';
import type { Category } from '@/types';
import { strapi } from '@/lib/strapi';
import {
  getMockCourses,
  getMockFeaturedCourses,
  getMockCourseBySlug,
  MOCK_CATEGORIES,
} from '@/data/mock-courses';

class CoursesApi {
  async getCourses(params: CourseQueryParams): Promise<StrapiResponse<CourseCard[]>> {
    try {
      const filters: Record<string, any> = {};
      if (params.search) {
        filters['$or'] = [
          { title: { $containsi: params.search } },
          { shortDescription: { $containsi: params.search } },
        ];
      }
      if (params.category && params.category !== 'all') {
        filters.category = { slug: { $eq: params.category } };
      }
      if (params.difficulty && (params.difficulty as string) !== 'all') {
        filters.difficulty = { $eq: params.difficulty };
      }
      const sort: string[] = [];
      switch (params.sort) {
        case 'newest': sort.push('createdAt:desc'); break;
        case 'popular': sort.push('totalStudents:desc'); break;
        case 'rating': sort.push('averageRating:desc'); break;
        case 'price-asc': sort.push('price:asc'); break;
        case 'price-desc': sort.push('price:desc'); break;
        default: sort.push('createdAt:desc'); break;
      }
      const strapiParams = {
        filters,
        sort,
        pagination: { page: params.page || 1, pageSize: params.pageSize || 12 },
        populate: {
          category: { fields: ['id', 'name', 'slug', 'color'] },
          instructor: true,
          thumbnail: true,
        },
      };
      const res = await strapi.findMany<CourseCard>('courses', strapiParams, { cache: 'no-store' });
      if (res && res.data && res.data.length > 0) {
        return res;
      }
      return getMockCourses(params);
    } catch {
      return getMockCourses(params);
    }
  }

  async getFeaturedCourses(): Promise<CourseCard[]> {
    try {
      const params = {
        sort: ['averageRating:desc', 'totalStudents:desc'],
        pagination: { page: 1, pageSize: 4 },
        populate: {
          category: { fields: ['id', 'name', 'slug', 'color'] },
          instructor: { fields: ['id', 'name'] },
          thumbnail: true,
        },
      };
      const res = await strapi.findMany<CourseCard>('courses', params, { cache: 'no-store' });
      if (res && res.data && res.data.length > 0) return res.data;
      return getMockFeaturedCourses();
    } catch {
      return getMockFeaturedCourses();
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const res = await strapi.findMany<Category>('categories', { sort: ['name:asc'] }, { cache: 'no-store' });
      if (res && res.data && res.data.length > 0) return res.data;
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    try {
      const params = {
        filters: { slug: { $eq: slug } },
        publicationState: 'preview',
        populate: {
          category: true,
          instructor: true,
          thumbnail: true,
          lessons: {
            fields: ['id', 'title', 'slug', 'duration', 'order', 'isFree', 'chapter'],
            sort: ['order:asc'],
          },
          reviews: {
            fields: ['id', 'rating', 'comment', 'userName', 'userAvatar', 'createdAt'],
            sort: ['createdAt:desc'],
          },
        },
      };
      const res = await strapi.findMany<Course>('courses', params, { cache: 'no-store' });
      if (res && res.data && res.data.length > 0) return res.data[0];
      return getMockCourseBySlug(slug);
    } catch {
      return getMockCourseBySlug(slug);
    }
  }
}

export const coursesApi = new CoursesApi();
