'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, PlayCircle, HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  type: 'video' | 'quiz';
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonSidebarProps {
  courseId: string;
  currentLessonId: string;
  chapters: Chapter[];
  className?: string;
}

/**
 * Danh sách phát bài giảng: Hiển thị các bài học khác để học viên click chuyển bài nhanh.
 */
export function LessonSidebar({ courseId, currentLessonId, chapters, className }: LessonSidebarProps) {
  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border", className)}>
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-lg">Nội dung khóa học</h3>
        <p className="text-sm text-muted-foreground mt-1">2/15 bài học hoàn thành</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                {chapter.title}
              </h4>
              <div className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const Icon = lesson.type === 'quiz' ? HelpCircle : PlayCircle;
                  
                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${courseId}/${lesson.id}`}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-lg transition-colors group",
                        isActive ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      {lesson.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Circle className={cn(
                          "w-5 h-5 shrink-0 mt-0.5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                      )}
                      
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium line-clamp-2",
                          isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                        )}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Icon className="w-3.5 h-3.5" />
                          {lesson.duration}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
