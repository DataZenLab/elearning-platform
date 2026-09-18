import type { Lesson, Quiz } from '@/types';
import { strapi } from '@/lib/strapi';
import { getMockLessonBySlug, getMockQuizById } from '@/data/mock-courses';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const isLocalhostStrapi = STRAPI_URL.includes('localhost') || STRAPI_URL.includes('127.0.0.1');

function shouldBypassStrapi(): boolean {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' && isLocalhostStrapi) {
      return true;
    }
  }
  return false;
}

class LessonApi {
  async getLessonBySlug(slug: string): Promise<Lesson | null> {
    if (shouldBypassStrapi()) {
      return getMockLessonBySlug(slug);
    }

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

  async getQuizByDocumentId(documentId: string): Promise<Quiz | null> {
    if (shouldBypassStrapi()) {
      return getMockQuizById(documentId);
    }

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

  async getQuizById(quizId: string): Promise<Quiz | null> {
    if (shouldBypassStrapi()) {
      return getMockQuizById(quizId);
    }

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
