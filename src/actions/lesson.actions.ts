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

/**
 * Nhận dữ liệu từ form để tạo một bài học (lesson/video) mới và liên kết nó vào khóa học.
 * Gọi API lên CMS Strapi và xóa cache của Next.js để UI cập nhật ngay.
 */
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

/**
 * Cập nhật thông tin bài học (đổi tên, thay link video, sửa nội dung bài giảng...).
 * Gọi API update của Strapi và xóa cache trang danh sách bài học.
 */
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

/**
 * Xóa một bài học khỏi hệ thống dựa vào documentId của bài học đó.
 */
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
