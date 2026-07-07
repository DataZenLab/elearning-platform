'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseFilters } from '@/components/course/course-filters';
import { CourseGrid } from '@/components/course/course-grid';
import { Pagination } from '@/components/shared/pagination';
import { useCourseStore } from '@/stores/course-store';
import { useCourses } from '@/hooks/use-courses';
import { motion } from 'framer-motion';

function CoursesContent() {
  const searchParams = useSearchParams();
  const { filters, setCategory, setPage } = useCourseStore();
  
  // Set category from URL on initial load if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== filters.category) {
      setCategory(categoryParam);
    }
  }, [searchParams, setCategory, filters.category]);

  const { data, isLoading, isFetching } = useCourses({
    page: filters.page,
    pageSize: 8,
    search: filters.search,
    category: filters.category,
    difficulty: (filters.difficulty || undefined) as any,
    sort: filters.sort as any,
  });

  // Scroll to top when page changes
  useEffect(() => {
    if (!isLoading && !isFetching && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filters.page, isLoading, isFetching]);

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Khám phá khóa học
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Học kỹ năng mới từ các chuyên gia. Tương lai bắt đầu từ những gì bạn học hôm nay.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-8">
          {/* Filters */}
          <CourseFilters />

          {/* Results Summary */}
          {!isLoading && data && (
            <div className="text-sm text-muted-foreground flex items-center justify-between">
              <p>Hiển thị <span className="font-medium text-foreground">{data.data.length}</span> trong số <span className="font-medium text-foreground">{data.meta.pagination?.total || 0}</span> khóa học</p>
            </div>
          )}

          {/* Grid */}
          <div className="min-h-[400px]">
            <CourseGrid 
              courses={data?.data || []} 
              isLoading={isLoading} 
              skeletonCount={8} 
            />
          </div>

          {/* Pagination */}
          {data?.meta.pagination && data.meta.pagination.pageCount > 1 && (
            <Pagination 
              currentPage={data.meta.pagination.page}
              totalPages={data.meta.pagination.pageCount}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CoursesContent />
    </Suspense>
  );
}
