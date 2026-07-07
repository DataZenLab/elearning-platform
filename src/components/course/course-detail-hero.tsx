'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, Globe, PlayCircle, Award } from 'lucide-react';
import type { CourseCard } from '@/types';
import { formatDuration } from '@/lib/utils';

interface CourseDetailHeroProps {
  course: CourseCard;
}

export function CourseDetailHero({ course }: CourseDetailHeroProps) {
  return (
    <div className="bg-muted/30 text-foreground py-12 lg:py-16 relative overflow-hidden border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {course.category?.name}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
                {course.title}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {course.shortDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  <span className="font-bold text-lg mr-1">{(course.averageRating || 0).toFixed(1)}</span>
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-muted-foreground underline decoration-muted-foreground/50 underline-offset-4">
                  ({course.totalReviews || 0} đánh giá)
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{(course.totalStudents || 0).toLocaleString()} học viên</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Chứng chỉ hoàn thành</span>
              </div>
              <span className="text-muted-foreground/50">|</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Tiếng Việt</span>
              </div>
            </motion.div>
          </div>

          {/* Right Video Preview (Visible only on mobile/tablet here, Desktop shows in Sticky Sidebar) */}
          <div className="lg:hidden block">
            <div className="aspect-video bg-muted rounded-xl border border-border relative overflow-hidden group cursor-pointer">
              {course.thumbnail ? (
                <img src={course.thumbnail.url} alt="Course Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <div className="w-16 h-16 rounded-lg bg-background/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
