'use server';

import { instructorApi, type CreateCourseData } from '@/services/api/instructor.api';
import { revalidatePath } from 'next/cache';

export async function createCourseAction(data: CreateCourseData) {
  try {
    const course = await instructorApi.createCourse(data);
    revalidatePath('/instructor/courses');
    return { success: true, course };
  } catch (error: any) {
    console.error('Failed to create course:', error);
    return { success: false, error: error.message || 'Tạo khóa học thất bại' };
  }
}

export async function updateCourseAction(documentId: string, data: Partial<CreateCourseData & { isPublished: boolean }>) {
  try {
    const course = await instructorApi.updateCourse(documentId, data);
    revalidatePath('/instructor/courses');
    revalidatePath(`/instructor/courses/${documentId}`);
    return { success: true, course };
  } catch (error: any) {
    console.error('Failed to update course:', error);
    return { success: false, error: error.message || 'Cập nhật khóa học thất bại' };
  }
}

export async function deleteCourseAction(documentId: string) {
  try {
    await instructorApi.deleteCourse(documentId);
    revalidatePath('/instructor/courses');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete course:', error);
    return { success: false, error: error.message || 'Xóa khóa học thất bại' };
  }
}
