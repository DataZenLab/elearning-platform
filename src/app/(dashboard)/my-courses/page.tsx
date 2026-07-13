'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, PlayCircle, Clock, CheckCircle2, Award } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { useEnrollments } from '@/hooks/use-enrollments';
import { cn, formatDuration } from '@/lib/utils';
import type { EnrolledCourseWithProgress } from '@/hooks/use-enrollments';

function EnrolledCourseCard({ item }: { item: EnrolledCourseWithProgress }) {
  const { course, progress, progressPercent } = item;

  if (!course) {
    return (
      <Card className="p-4 border-border/50 text-muted-foreground text-sm">
        Không thể tải thông tin khóa học (ID: {item.enrollment.courseId})
      </Card>
    );
  }

  const firstLesson = course.lessons?.[0];
  const currentLessonId = progress?.currentLessonId;
  const matchedLesson = course.lessons?.find(l => l.id.toString() === currentLessonId);
  const currentLessonSlug = matchedLesson?.slug || firstLesson?.slug;
  
  const learnHref = currentLessonSlug
    ? `/learn/${course.slug}/${currentLessonSlug}`
    : `/courses/${course.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="w-full sm:w-52 h-36 sm:h-auto flex-shrink-0 relative bg-muted">
            {course.thumbnail ? (
              <img
                src={course.thumbnail.url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm"
                  style={{ backgroundColor: course.category?.color || 'var(--primary)' }}
                >
                  {(course.category?.name || 'C').charAt(0)}
                </div>
              </div>
            )}
            {/* Progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 gap-3">
            {/* Category badge */}
            {course.category && (
              <Badge
                variant="outline"
                className="w-fit text-xs rounded-full px-2 py-0.5"
                style={{ borderColor: course.category.color, color: course.category.color }}
              >
                {course.category.name}
              </Badge>
            )}

            <div>
              <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {course.instructor?.name || 'Giảng viên EduFlow'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  {progress?.completedLessons?.length ?? 0} / {course.lessons?.length ?? 0} bài học
                </span>
                <span className="font-semibold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(course.duration || 0)}</span>
              </div>

              <div className="flex gap-2">
                {progressPercent === 100 && (
                  <Link href={`/certificates/${course.slug}`}>
                    <Button size="sm" variant="outline" className="rounded-lg h-8 border-success/30 text-success hover:bg-success/10 gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Chứng chỉ
                    </Button>
                  </Link>
                )}
                <Link href={learnHref}>
                  <Button size="sm" className="rounded-lg h-8 gap-1.5 font-medium">
                    <PlayCircle className="w-3.5 h-3.5" />
                    {progressPercent === 0 ? 'Bắt đầu học' : progressPercent === 100 ? 'Xem lại' : 'Tiếp tục'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Trang Khóa Học Của Tôi: Danh sách các khóa học học viên đã mua và đang theo học.
 */
export default function MyCoursesPage() {
  const { data, isLoading, error } = useEnrollments();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');

  const filtered = data
    .filter(item => {
      if (!item.course) return true;
      return item.course.title.toLowerCase().includes(search.toLowerCase());
    })
    .filter(item => {
      if (tab === 'not-started') return item.progressPercent === 0;
      if (tab === 'in-progress') return item.progressPercent > 0 && item.progressPercent < 100;
      if (tab === 'completed') return item.progressPercent >= 100;
      return true;
    });

  const notStartedCount = data.filter(i => i.progressPercent === 0).length;
  const inProgressCount = data.filter(i => i.progressPercent > 0 && i.progressPercent < 100).length;
  const completedCount = data.filter(i => i.progressPercent >= 100).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Khóa học của tôi</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? 'Đang tải...' : `${data.length} khóa học đã đăng ký`}
          </p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm khóa học..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {([
          { key: 'all', label: `Tất cả (${data.length})` },
          { key: 'not-started', label: `Chưa học (${notStartedCount})` },
          { key: 'in-progress', label: `Đang học (${inProgressCount})` },
          { key: 'completed', label: `Hoàn thành (${completedCount})` },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && (
        <div className="text-destructive text-sm bg-destructive/10 rounded-xl p-4">{error}</div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-36 animate-pulse bg-muted/50 border-border/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={BookOpen}
            title={search ? 'Không tìm thấy khóa học' : 'Bạn chưa đăng ký khóa học nào'}
            description={
              search
                ? 'Thử tìm kiếm với từ khóa khác.'
                : 'Hãy khám phá danh mục khóa học của chúng tôi để bắt đầu hành trình học tập.'
            }
            actionLabel="Khám phá ngay"
            onAction={() => (window.location.href = '/courses')}
          />
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(item => (
            <EnrolledCourseCard key={item.enrollment.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
