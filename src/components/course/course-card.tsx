'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users } from 'lucide-react';
import type { CourseCard as CourseCardType } from '@/types';
import { cn, formatPrice, formatDuration } from '@/lib/utils';

interface CourseCardProps {
  course: CourseCardType;
  className?: string;
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  beginner: { label: 'Người mới', className: 'bg-success/10 text-success border-success/20' },
  intermediate: { label: 'Trung cấp', className: 'bg-warning/10 text-warning border-warning/20' },
  advanced: { label: 'Nâng cao', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className={cn("block group h-full", className)}>
      <Card className="overflow-hidden border border-border/50 bg-card hover:border-primary/30 card-hover h-full flex flex-col">
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
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: course.category?.color || 'var(--primary)' }}
              >
                {(course.category?.name || 'C').charAt(0)}
              </div>
            </div>
          )}
          
          {/* Discount Badge */}
          {course.originalPrice && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-destructive text-destructive-foreground border-0 text-xs font-semibold rounded-full px-2.5">
                -{Math.round((1 - course.price / course.originalPrice) * 100)}%
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex flex-col flex-1 gap-4">
          {/* Category & Difficulty */}
          <div className="flex items-center gap-2">
            {course.category && (
              <Badge variant="outline" className="text-[10px] sm:text-xs rounded-full px-2 py-0.5" style={{ borderColor: course.category.color, color: course.category.color }}>
                {course.category.name}
              </Badge>
            )}
            <Badge className={cn("text-[10px] sm:text-xs rounded-full px-2 py-0.5 border border-border", difficultyConfig[course.difficulty]?.className || difficultyConfig.beginner.className)}>
              {difficultyConfig[course.difficulty]?.label || difficultyConfig.beginner.label}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-muted-foreground mt-auto">
            {course.instructor?.username || course.instructor?.name || 'Giảng viên EduFlow'}
          </p>

          {/* Rating & Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{(course.averageRating || 0).toFixed(1)}</span>
              <span>({course.totalReviews || 0})</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(course.duration || 0)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{(course.totalStudents || 0).toLocaleString('vi-VN')} học viên</span>
          </div>

          {/* Price */}
          <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-border/50">
            <span className="text-lg font-bold text-primary">
              {course.price === 0 ? 'Miễn phí' : formatPrice(course.price)}
            </span>
            {course.originalPrice && course.price > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
