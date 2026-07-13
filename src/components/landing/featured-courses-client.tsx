"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CourseCard } from "@/types";

const difficultyConfig: Record<string, { label: string; className: string }> = {
  beginner: { label: 'Người mới', className: 'bg-success/10 text-success border-success/20' },
  intermediate: { label: 'Trung cấp', className: 'bg-warning/10 text-warning border-warning/20' },
  advanced: { label: 'Nâng cao', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

/**
 * Thành phần Client render danh sách các khóa học nổi bật trên trang chủ.
 */
export function FeaturedCoursesClient({ courses }: { courses: CourseCard[] }) {
  return (
    <section className="py-24 lg:py-32 bg-muted/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — left-aligned, editorial */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
              <span className="w-6 h-px bg-primary" />
              Khóa học nổi bật
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Được yêu thích nhất
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Link href="/courses" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
              Xem tất cả &rarr;
            </Link>
          </motion.div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((course, index) => {
            const difficulty = difficultyConfig[course.difficulty] ?? difficultyConfig.beginner;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link href={`/courses/${course.slug}`} className="block group h-full">
                  <Card className="overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors duration-200 h-full flex flex-col">

                    {/* Thumbnail */}
                    <div className="aspect-video relative overflow-hidden bg-muted flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail.url}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base"
                            style={{ backgroundColor: course.category?.color || 'var(--primary)' }}
                          >
                            {(course.category?.name || 'C').charAt(0)}
                          </div>
                        </div>
                      )}
                      {course.originalPrice && (
                        <div className="absolute top-2.5 right-2.5">
                          <Badge className="bg-destructive text-destructive-foreground border-0 text-xs font-semibold px-2">
                            -{Math.round((1 - course.price / course.originalPrice) * 100)}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 flex flex-col flex-1 gap-3">
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {course.category && (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded border"
                            style={{ borderColor: `${course.category.color}40`, color: course.category.color }}
                          >
                            {course.category.name}
                          </span>
                        )}
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded border', difficulty.className)}>
                          {difficulty.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {course.title}
                      </h3>

                      {/* Instructor */}
                      <p className="text-xs text-muted-foreground">
                        {(course.instructor as any)?.username || 'Giảng viên EduFlow'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-foreground">{(course.averageRating || 0).toFixed(1)}</span>
                          <span>({course.totalReviews || 0})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(course.duration || 0)}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-border mt-auto">
                        <span className="text-base font-bold text-foreground">
                          {course.price === 0 ? 'Miễn phí' : formatPrice(course.price)}
                        </span>
                        {course.originalPrice && course.price > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}