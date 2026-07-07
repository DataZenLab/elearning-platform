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
}

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
            const completed = progress?.completedLessons?.length ?? 0;
            const progressPercentRaw = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
            const progressPercent = Math.min(progressPercentRaw, 100);

            return { enrollment, course, progress, progressPercent };
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
