'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayCircle, CheckCircle, FileText, HelpCircle, ArrowLeft, ArrowRight, BookOpen, Trophy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { enrollmentService } from '@/services/firebase/enrollment.service';
import { firestoreService } from '@/services/firebase/firestore.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotesPanel } from '@/components/learning/notes-panel';
import { CommentsPanel } from '@/components/learning/comments-panel';
import { cn } from '@/lib/utils';
import type { Course, Lesson } from '@/types';

interface LessonViewClientProps {
  course: Course;
  currentLesson: Lesson;
  sortedLessons: Lesson[];
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  videoId: string | null;
}

export function LessonViewClient({
  course,
  currentLesson,
  sortedLessons,
  previousLesson,
  nextLesson,
  videoId,
}: LessonViewClientProps) {
  const { user } = useAuthStore();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isMarking, setIsMarking] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      if (user?.uid && course.slug) {
        const progress = await enrollmentService.getCourseProgress(user.uid, course.slug);
        if (progress?.completedLessons) setCompletedLessons(progress.completedLessons);
      }
      setIsInitialLoaded(true);
    }
    loadProgress();
  }, [user, course.slug]);

  const currentIndex = sortedLessons.findIndex(l => l.slug === currentLesson.slug);
  const isCurrentCompleted = completedLessons.includes(currentLesson.id.toString());
  const progressPercentage = sortedLessons.length > 0
    ? Math.round((completedLessons.length / sortedLessons.length) * 100)
    : 0;

  const handleMarkComplete = async () => {
    if (!user?.uid) return;
    setIsMarking(true);
    try {
      await enrollmentService.markLessonCompleted(user.uid, course.slug, currentLesson.id.toString());
      if (!completedLessons.includes(currentLesson.id.toString())) {
        setCompletedLessons(prev => [...prev, currentLesson.id.toString()]);
        await firestoreService.addCredits(user.uid, 1);
      }
    } catch (error) {
      console.error('Lỗi khi đánh dấu hoàn thành:', error);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">

      {/* ── Left: Video + Content ─────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">

        {/* Top bar */}
        <div className="h-14 border-b border-border bg-card flex items-center px-4 md:px-6 justify-between shrink-0">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Trở lại khóa học</span>
          </Link>

          <h1 className="font-semibold text-foreground line-clamp-1 max-w-[50%] text-sm md:text-base">
            {course.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Tiến độ</span>
              <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Video player — dark background is correct for video context */}
        <div className="w-full bg-black aspect-video relative overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1`}
              title={currentLesson.title}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <BookOpen className="w-14 h-14 opacity-20" />
              <p className="text-sm">Bài học này không có video</p>
            </div>
          )}
        </div>

        {/* Lesson content */}
        <div className="p-6 md:p-10 max-w-4xl w-full flex-1">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold tracking-wide">
              Bài {currentLesson.order}
            </span>
            {currentLesson.chapter && (
              <span className="text-xs text-muted-foreground">{currentLesson.chapter}</span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5 tracking-tight leading-snug">
            {currentLesson.title}
          </h2>

          <div className="flex items-center gap-5 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
            <div className="flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4" />
              <span>{currentLesson.duration} phút</span>
            </div>
            {currentLesson.quiz && (
              <div className="flex items-center gap-1.5 text-warning font-medium">
                <HelpCircle className="w-4 h-4" />
                <span>Có bài kiểm tra</span>
              </div>
            )}
          </div>

          <div
            className="prose prose-neutral dark:prose-invert max-w-none mb-10 prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{
              __html: currentLesson.content || '<p class="text-muted-foreground italic">Chưa có mô tả cho bài học này.</p>',
            }}
          />

          {/* Attachments Section */}
          {currentLesson.attachments && currentLesson.attachments.length > 0 && (
            <div className="mb-16">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                Tài liệu đính kèm
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLesson.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 mr-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {file.name || 'Tài liệu'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {file.ext?.replace('.', '').toUpperCase()} • {(file.size || 0).toFixed(2)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                      <span>
                        <Download className="w-4 h-4" />
                      </span>
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Bottom navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border gap-4">
            {previousLesson ? (
              <Link href={`/learn/${course.slug}/${previousLesson.slug}`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto gap-2 h-11 px-5 rounded-lg">
                  <ArrowLeft className="w-4 h-4" />
                  Bài trước
                </Button>
              </Link>
            ) : (
              <div />
            )}

            <div className="flex gap-3 w-full sm:w-auto">
              {!isCurrentCompleted && isInitialLoaded && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isMarking}
                  variant="outline"
                  className="flex-1 sm:flex-none gap-2 h-11 px-5 rounded-lg border-success/50 text-success hover:bg-success/10 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isMarking ? 'Đang lưu...' : 'Hoàn thành'}
                </Button>
              )}

              {currentLesson.quiz ? (
                <Link
                  href={`/quiz/${(currentLesson.quiz as any).documentId || currentLesson.quiz.id}?courseSlug=${course.slug}`}
                  className="flex-1 sm:flex-none"
                >
                  <Button className="w-full gap-2 h-11 px-5 rounded-lg bg-warning text-warning-foreground hover:bg-warning/90 font-semibold">
                    <HelpCircle className="w-4 h-4" />
                    Bài kiểm tra
                  </Button>
                </Link>
              ) : nextLesson ? (
                <Link href={`/learn/${course.slug}/${nextLesson.slug}`} className="flex-1 sm:flex-none">
                  <Button className="w-full gap-2 h-11 px-5 rounded-lg font-semibold">
                    Bài tiếp theo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/certificates/${course.slug}`} className="flex-1 sm:flex-none">
                  <Button className="w-full gap-2 h-11 px-5 rounded-lg bg-success text-success-foreground hover:bg-success/90 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Hoàn thành khóa học
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Sidebar ────────────────────────────── */}
      <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 bg-card border-l border-border flex flex-col h-[50vh] lg:h-screen lg:sticky lg:top-0 order-first lg:order-last">
        <Tabs defaultValue="playlist" className="flex flex-col h-full">

          {/* Tab header */}
          <div className="p-3 border-b border-border shrink-0">
            <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/50 rounded-lg p-0.5">
              <TabsTrigger value="playlist" className="rounded-md text-xs font-medium">Nội dung</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-md text-xs font-medium">Ghi chú</TabsTrigger>
              <TabsTrigger value="comments" className="rounded-md text-xs font-medium">Hỏi đáp</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="playlist" className="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
            {/* Progress bar */}
            <div className="px-4 py-3 border-b border-border shrink-0">
              <div className="w-full bg-muted rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completedLessons.length}/{sortedLessons.length} bài đã hoàn thành</span>
                <span className="text-primary font-medium">{progressPercentage}%</span>
              </div>
            </div>

            {/* Lesson list */}
            <div className="flex-1 overflow-y-auto">
              {sortedLessons.map((lesson, index) => {
                const isActive = lesson.slug === currentLesson.slug;
                const isCompleted = completedLessons.includes(lesson.id.toString());
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${course.slug}/${lesson.slug}`}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3.5 border-b border-border/60 transition-colors duration-150 border-l-2',
                      isActive
                        ? 'bg-primary/[0.06] border-l-primary'
                        : 'hover:bg-muted/40 border-l-transparent'
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border/80 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-muted-foreground">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-xs font-medium line-clamp-2 leading-snug',
                        isActive ? 'text-primary' : isCompleted ? 'text-muted-foreground' : 'text-foreground'
                      )}>
                        {lesson.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">{lesson.duration}m</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 m-0 overflow-hidden data-[state=inactive]:hidden">
            <NotesPanel lessonId={currentLesson.id.toString()} />
          </TabsContent>
          <TabsContent value="comments" className="flex-1 m-0 overflow-hidden data-[state=inactive]:hidden">
            <CommentsPanel lessonId={currentLesson.id.toString()} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
