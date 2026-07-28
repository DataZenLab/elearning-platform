import { NextRequest, NextResponse } from 'next/server';
import { coursesApi } from '@/services/api/courses.api';

/**
 * GET /api/course-exists?slug=<courseSlug>
 *
 * Endpoint nhẹ dùng cho polling ở client — kiểm tra xem khóa học còn tồn tại không.
 * Trả về { exists: boolean } thay vì toàn bộ dữ liệu để giảm băng thông.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  try {
    const course = await coursesApi.getCourseBySlug(slug);
    // Nếu khóa học không tồn tại hoặc đã bị thu hồi (isPublished = false)
    const exists = course !== null && course.isPublished !== false;
    return NextResponse.json({ exists });
  } catch {
    // Nếu lỗi mạng / Strapi down → coi như vẫn còn (tránh false positive)
    return NextResponse.json({ exists: true });
  }
}
