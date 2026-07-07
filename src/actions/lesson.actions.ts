'use server';

import { strapi } from '@/lib/strapi';
import { revalidatePath } from 'next/cache';

export interface CreateLessonData {
  title: string;
  slug: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  chapter?: string;
  isFree?: boolean;
  courseId: string;
}

export async function createLessonAction(data: CreateLessonData) {
  try {
    const payload = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      videoUrl: data.videoUrl,
      duration: data.duration,
      order: data.order,
      chapter: data.chapter,
      isFree: data.isFree,
      course: data.courseId,
    };
    await strapi.post('/lessons', payload);
    revalidatePath(`/instructor/courses/${data.courseId}/lessons`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create lesson:', error);
    return { success: false, error: error.message || 'Tạo bài học thất bại' };
  }
}

export async function updateLessonAction(documentId: string, data: Partial<CreateLessonData>, courseId: string) {
  try {
    const payload = { ...data };
    delete payload.courseId;
    await strapi.put(`/lessons/${documentId}`, payload);
    revalidatePath(`/instructor/courses/${courseId}/lessons`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update lesson:', error);
    return { success: false, error: error.message || 'Cập nhật bài học thất bại' };
  }
}

export async function deleteLessonAction(documentId: string, courseId: string) {
  try {
    await strapi.delete(`/lessons/${documentId}`);
    revalidatePath(`/instructor/courses/${courseId}/lessons`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete lesson:', error);
    return { success: false, error: error.message || 'Xóa bài học thất bại' };
  }
}
