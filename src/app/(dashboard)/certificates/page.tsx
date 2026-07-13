'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Download, ExternalLink, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useEnrollments } from '@/hooks/use-enrollments';
import { cn } from '@/lib/utils';

/**
 * Trang Danh Sách Chứng Chỉ: Nơi học viên xem lại toàn bộ chứng chỉ đã đạt được.
 */
export default function CertificatesPage() {
  const { data, isLoading } = useEnrollments();

  const completedCourses = data.filter(item => item.progressPercent === 100 && item.course);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary" />
            Chứng chỉ của tôi
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? 'Đang tải...' : `${completedCourses.length} chứng chỉ đã đạt được`}
          </p>
        </div>
      </div>

      {/* Stats Banner */}
      {!isLoading && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Khóa đã đăng ký', value: data.length, color: 'text-blue-500' },
            { label: 'Đang học', value: data.filter(i => i.progressPercent < 100 && i.progressPercent > 0).length, color: 'text-amber-500' },
            { label: 'Chứng chỉ đạt được', value: completedCourses.length, color: 'text-green-500' },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 border-border text-center">
              <div className={cn('text-3xl font-black', stat.color)}>{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-muted/50 border-border" />
          ))}
        </div>
      ) : completedCourses.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Chưa có chứng chỉ nào"
          description="Hoàn thành 100% các bài học trong một khóa học để nhận chứng chỉ."
          actionLabel="Xem khóa học của tôi"
          onAction={() => (window.location.href = '/my-courses')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {completedCourses.map(({ course, enrollment }, idx) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              {/* Certificate Card */}
              <Card className="overflow-hidden border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                {/* Decorative top gradient */}
                <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
                
                <div className="p-6 space-y-4">
                  {/* Category + date */}
                  <div className="flex items-center justify-between">
                    {course!.category && (
                      <Badge
                        variant="outline"
                        className="rounded-full text-xs"
                        style={{ borderColor: course!.category.color, color: course!.category.color }}
                      >
                        {course!.category.name}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {enrollment.enrolledAt?.toDate
                        ? enrollment.enrolledAt.toDate().toLocaleDateString('vi-VN')
                        : 'Đã hoàn thành'}
                    </span>
                  </div>

                  {/* Certificate icon + title */}
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-snug line-clamp-2">{course!.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course!.instructor?.name || 'Giảng viên EduFlow'}
                      </p>
                    </div>
                  </div>

                  {/* Lessons count */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Đã hoàn thành {course!.lessons?.length ?? 0} bài học</span>
                    <Badge className="ml-auto bg-success/10 text-success border-0 text-xs">✓ 100%</Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link href={`/certificates/${course!.slug}`} className="flex-1">
                      <Button className="w-full rounded-lg font-semibold gap-2">
                        <Award className="w-4 h-4" />
                        Xem chứng chỉ
                      </Button>
                    </Link>
                    <Link href={`/certificates/${course!.slug}`} target="_blank">
                      <Button variant="outline" size="icon" className="rounded-lg border-border flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* In-progress courses hint */}
      {!isLoading && data.filter(i => i.progressPercent < 100).length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Bạn còn <span className="font-semibold text-foreground">{data.filter(i => i.progressPercent < 100).length}</span> khóa học chưa hoàn thành.{' '}
            <Link href="/my-courses" className="text-primary hover:underline font-medium">Tiếp tục học →</Link>
          </p>
        </div>
      )}
    </div>
  );
}
