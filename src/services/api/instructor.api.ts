import { strapi } from '@/lib/strapi';
import type { Course } from '@/types';

export interface CreateCourseData {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  price?: number;
  difficulty: string;
  duration?: number;
  categoryId?: number;
  instructorId?: number;
}

class InstructorApi {
  /**
   * Create a new course as draft (isPublished: false).
   */
  async createCourse(data: CreateCourseData): Promise<Course> {
    const payload = {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      price: data.price,
      difficulty: data.difficulty,
      duration: data.duration,
      category: data.categoryId,
      instructor: data.instructorId,
      isPublished: false,
    };
    
    // Strapi POST format: { data: { ...fields } }
    // Our StrapiClient handles wrapping it in `{ data }` in the `.post()` method
    const response = await strapi.post<{ data: Course }>('/courses', payload);
    return response.data;
  }

  /**
   * Fetch all courses for instructor (including drafts)
   */
  async getCourses(): Promise<Course[]> {
    const params = {
      populate: ['category', 'instructor'],
      sort: ['createdAt:desc'],
      publicationState: 'preview', // Fetch drafts and published
    };
    const response = await strapi.findMany<Course>('courses', params, { cache: 'no-store' });
    return response.data || [];
  }

  async getCourseById(documentId: string): Promise<Course> {
    const params = {
      populate: ['category', 'instructor', 'lessons', 'thumbnail'],
      publicationState: 'preview',
    };
    const response = await strapi.findOne<Course>('courses', documentId, params, { cache: 'no-store' });
    return response.data;
  }

  async updateCourse(documentId: string, data: Partial<CreateCourseData & { isPublished: boolean }>): Promise<Course> {
    const payload = {
      ...data,
      category: data.categoryId,
      instructor: data.instructorId,
    };
    // Remove undefined/mapped fields
    delete payload.categoryId;
    delete payload.instructorId;
    
    const response = await strapi.put<{ data: Course }>(`/courses/${documentId}`, payload);
    return response.data;
  }

  async deleteCourse(documentId: string): Promise<void> {
    await strapi.delete(`/courses/${documentId}`);
  }
}

export const instructorApi = new InstructorApi();
