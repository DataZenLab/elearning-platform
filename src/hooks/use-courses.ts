import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/services/api/courses.api';
import type { CourseQueryParams } from '@/types';

export function useCourses(params: CourseQueryParams) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.getCourses(params),
    // Keep previous data while fetching new to prevent layout shift during pagination/filtering
    placeholderData: (previousData) => previousData,
  });
}
