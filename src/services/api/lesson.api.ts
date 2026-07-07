import type { Lesson, Quiz } from '@/types';
import { strapi } from '@/lib/strapi';

class LessonApi {
  /**
   * Fetch a specific lesson by slug
   */
  async getLessonBySlug(slug: string): Promise<Lesson | null> {
    const params = {
      filters: { slug: { $eq: slug } },
      publicationState: 'preview',
      populate: {
        course: {
          fields: ['id', 'title', 'slug']
        },
        quiz: {
          fields: ['id', 'documentId', 'title']
        }
      }
    };
    
    const res = await strapi.findMany<Lesson>('lessons', params, { cache: 'no-store' });
    if (res.data && res.data.length > 0) return res.data[0];
    return null;
  }

  /**
   * Fetch a quiz with full questions & options by documentId
   */
  async getQuizByDocumentId(documentId: string): Promise<Quiz | null> {
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
    return res.data || null;
  }

  /**
   * Fetch a quiz by numeric id (filter)
   */
  async getQuizById(quizId: string): Promise<Quiz | null> {
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
    if (res.data && res.data.length > 0) return res.data[0];
    return null;
  }
}

export const lessonApi = new LessonApi();
