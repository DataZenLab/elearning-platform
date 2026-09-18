import { useState, useEffect } from 'react';
import { enrollmentService, type Enrollment, type CourseProgress } from '@/services/firebase/enrollment.service';
import { coursesApi } from '@/services/api/courses.api';
import type { Course } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

export interface EnrolledCourseWithProgress {
  enrollment: Enrollment;
  course: Course | null;
  progress: CourseProgress | null;
  progressPercent: number;
  completedLessonCount: number;
}

/**
 * Hook (Frontend): Lấy danh sách các khóa học mà người dùng hiện tại đã đăng ký.
 * Đồng thời tự động tính toán tiến độ phần trăm (%) hoàn thành của từng khóa học
 * để có thể dễ dàng hiển thị lên giao diện (ví dụ: thanh Progress Bar).
 */
export function useEnrollments() {
  const { user } = useAuthStore();
  const [data, setData] = useState<EnrolledCourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [enrollments, allProgress] = await Promise.all([
          enrollmentService.getEnrolledCourses(user!.uid),
          enrollmentService.getAllProgress(user!.uid),
        ]);

        const progressMap = new Map<string, CourseProgress>(
          allProgress.map(p => [p.courseId, p])
        );

        const withCourses = await Promise.all(
          enrollments.map(async (enrollment) => {
            let course: Course | null = null;
            try {
              // Try to fetch the course. courseId may be the slug or strapi id.
              // We'll search by slug first.
              course = await coursesApi.getCourseBySlug(enrollment.courseId);
            } catch {
              course = null;
            }

            const progress = progressMap.get(enrollment.courseId) ?? null;
            const totalLessons = course?.lessons?.length ?? 0;
            
            // Filter completed lessons so only valid unique lessons for this course are counted
            const validCompletedCount = course?.lessons && course.lessons.length > 0
              ? new Set(
                  (progress?.completedLessons || []).filter(lId =>
                    course.lessons.some(l => String(l.id) === String(lId) || l.slug === String(lId))
                  )
                ).size
              : new Set(progress?.completedLessons || []).size;

            const progressPercentRaw = totalLessons > 0 ? Math.round((validCompletedCount / totalLessons) * 100) : 0;
            const progressPercent = Math.min(progressPercentRaw, 100);

            return { enrollment, course, progress, progressPercent, completedLessonCount: validCompletedCount };
          })
        );

        setData(withCourses);
      } catch (err: any) {
        setError(err.message ?? 'Không thể tải danh sách khóa học');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.uid]);

  return { data, isLoading, error };
}
