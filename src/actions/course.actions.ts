'use server';

import { instructorApi, type CreateCourseData } from '@/services/api/instructor.api';
import { revalidatePath } from 'next/cache';

/**
 * Nhận dữ liệu từ form và tạo mới một khóa học.
 * Chạy trên Server (Server Action). Sau khi tạo xong sẽ yêu cầu Next.js làm mới lại cache danh sách khóa học.
 */
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

/**
 * Chỉnh sửa thông tin của một khóa học đã có (cập nhật tên, giá, trạng thái xuất bản...).
 * Chạy trên Server (Server Action). Sau khi cập nhật, làm mới lại cache.
 */
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

/**
 * Xóa vĩnh viễn một khóa học khỏi hệ thống dựa trên ID (documentId).
 * Chạy trên Server (Server Action).
 */
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
