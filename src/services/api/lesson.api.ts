import type { Lesson, Quiz } from '@/types';
import { strapi } from '@/lib/strapi';
import { getMockLessonBySlug, getMockQuizById } from '@/data/mock-courses';

class LessonApi {
  /**
   * Fetch a specific lesson by slug
   */
  async getLessonBySlug(slug: string): Promise<Lesson | null> {
    try {
      const params = {
        filters: { slug: { $eq: slug } },
        publicationState: 'preview',
        populate: {
          course: {
            fields: ['id', 'title', 'slug']
          },
          quiz: {
            fields: ['id', 'documentId', 'title']
          },
          attachments: {
            fields: ['id', 'url', 'name', 'ext', 'mime', 'size']
          }
        }
      };
      
      const res = await strapi.findMany<Lesson>('lessons', params, { cache: 'no-store' });
      if (res && res.data && res.data.length > 0) return res.data[0];
      return getMockLessonBySlug(slug);
    } catch {
      return getMockLessonBySlug(slug);
    }
  }

  /**
   * Fetch a quiz with full questions & options by documentId
   */
  async getQuizByDocumentId(documentId: string): Promise<Quiz | null> {
    try {
      const params = {
        populate: {
          questions: {
            populate: {
              options: {
                fields: ['id', 'text', 'isCorrect']
              }
            },
            sort: ['order:asc']
          }
        }
      };
      const res = await strapi.findOne<Quiz>('quizzes', documentId, params, { cache: 'no-store' });
      if (res && res.data) return res.data;
      return getMockQuizById(documentId);
    } catch {
      return getMockQuizById(documentId);
    }
  }

  /**
   * Fetch a quiz by numeric id (filter)
   */
  async getQuizById(quizId: string): Promise<Quiz | null> {
    try {
      const params = {
        filters: { id: { $eq: quizId } },
        populate: {
          questions: {
            populate: {
              options: {
                fields: ['id', 'text', 'isCorrect']
              }
            },
            sort: ['order:asc']
          }
        }
      };
      const res = await strapi.findMany<Quiz>('quizzes', params, { cache: 'no-store' });
      if (res && res.data && res.data.length > 0) return res.data[0];
      return getMockQuizById(quizId);
    } catch {
      return getMockQuizById(quizId);
    }
  }
}

export const lessonApi = new LessonApi();
