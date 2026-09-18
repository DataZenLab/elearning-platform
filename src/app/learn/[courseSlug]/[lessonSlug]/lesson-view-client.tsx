'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, FileText, HelpCircle, ArrowLeft, ArrowRight, BookOpen, Trophy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { enrollmentService } from '@/services/firebase/enrollment.service';
import { firestoreService } from '@/services/firebase/firestore.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotesPanel } from '@/components/learning/notes-panel';
import { CommentsPanel } from '@/components/learning/comments-panel';
import { VideoPlayer } from '@/components/learning/video-player';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { cn } from '@/lib/utils';
import type { Course, Lesson } from '@/types';

interface LessonViewClientProps {
  course: Course;
  currentLesson: Lesson;
  sortedLessons: Lesson[];
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  videoUrl: string | null;
}

export function LessonViewClient({
  course,
  currentLesson,
  sortedLessons,
  previousLesson,
  nextLesson,
  videoUrl,
}: LessonViewClientProps) {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isMarking, setIsMarking] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  // Trạng thái thông báo khóa học bị xóa
  const [isCourseRemoved, setIsCourseRemoved] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lessonId = currentLesson.id.toString();
  const { getSavedTime, saveTime, clearSavedTime } = useVideoProgress(user?.uid, lessonId);

  // --- Polling kiểm tra khóa học còn tồn tại (30 giây / lần) ---
  useEffect(() => {
    // Chạy ngay sau 30s rồi lặp lại
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/course-exists?slug=${course.slug}`);
        const data = await res.json();
        if (!data.exists) {
          setIsCourseRemoved(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // Lỗi mạng: bỏ qua, thử lại lần sau
      }
    }, 30_000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [course.slug]);

  // --- Đếm ngược 5 giây rồi redirect khi khóa học bị xóa ---
  useEffect(() => {
    if (!isCourseRemoved) return;
    if (countdown <= 0) {
      router.push('/my-courses');
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isCourseRemoved, countdown, router]);

  // Check if current user is the instructor of this course
  const isAuthor = user?.role === 'instructor' && (course.instructor as any)?.name === user?.displayName;

  useEffect(() => {
    async function loadProgress() {
      if (user?.uid && course.slug) {
        const progress = await enrollmentService.getCourseProgress(user.uid, course.slug);
        if (progress?.completedLessons) setCompletedLessons(progress.completedLessons);
      }
      // Đọc vị trí xem dở từ localStorage sau khi user đã load
      setSavedTime(getSavedTime());
      setIsInitialLoaded(true);
    }
    loadProgress();
  }, [user, course.slug, getSavedTime]);

  const currentIndex = sortedLessons.findIndex(l => l.slug === currentLesson.slug);
  const isCurrentCompleted = completedLessons.includes(currentLesson.id.toString());
  
  // Set isVideoCompleted if already completed
  useEffect(() => {
    if (isCurrentCompleted) {
      setIsVideoCompleted(true);
    }
  }, [isCurrentCompleted]);

  const progressPercentage = sortedLessons.length > 0
    ? Math.round((completedLessons.length / sortedLessons.length) * 100)
    : 0;

  const handleMarkComplete = async () => {
    if (!user?.uid) return;
    setIsMarking(true);
    try {
      await enrollmentService.markLessonCompleted(user.uid, course.slug, lessonId);
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons(prev => [...prev, lessonId]);
        await firestoreService.addCredits(user.uid, 1);
        // Update local state so leaderboard reflects new count immediately
        setUser({ ...user, completedCourses: (user.completedCourses || 0) + 1 });
      }
      // Xóa checkpoint khi bài đã hoàn thành
      clearSavedTime();
    } catch (error) {
      console.error('Lỗi khi đánh dấu hoàn thành:', error);
    } finally {
      setIsMarking(false);
    }
  };

  /** Callback throttled từ VideoPlayer — lưu vị trí vào localStorage */
  const handleVideoTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      saveTime(currentTime, duration);
    },
    [saveTime]
  );

  const handleVideoComplete = () => {
    setIsVideoCompleted(true);
    // Xóa checkpoint khi xem xong video
    clearSavedTime();
    // Only mark as complete if not already completed and not an author
    if (!isCurrentCompleted && isInitialLoaded && !isAuthor) {
      handleMarkComplete();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">

      {/* ── Modal thông báo khóa học bị xóa ─────────────────── */}
      {isCourseRemoved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Icon cảnh báo */}
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              Khóa học không còn tồn tại
            </h2>
            <p className="text-muted-foreground text-sm mb-1">
              Khóa học <span className="font-semibold text-foreground">“{course.title}”</span> đã bị gỡ bỏ bởi quản trị viên.
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Bạn sẽ được chuyển đến trang khóa học của mình sau{' '}
              <span className="font-bold text-primary">{countdown}</span> giây.
            </p>

            {/* Progress bar đếm ngược */}
            <div className="w-full bg-muted rounded-full h-1.5 mb-6 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>

            <button
              onClick={() => router.push('/my-courses')}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-sm"
            >
              Đi đến Khóa học của tôi ngay
            </button>
          </div>
        </div>
      )}

      {/* ── Left: Video + Content ─────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">

        {/* Top bar */}
        <div className="h-14 border-b border-border bg-card flex items-center px-4 md:px-6 justify-between shrink-0">
          <Link
            href="/my-courses"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Khóa học của tôi</span>
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

        {/* Video player */}
        <div className="w-full bg-black aspect-video relative overflow-hidden">
          {videoUrl ? (
            <VideoPlayer
              videoUrl={videoUrl}
              savedTime={savedTime}
              onTimeUpdate={handleVideoTimeUpdate}
              onComplete={handleVideoComplete}
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
                    <Button variant="ghost" size="icon" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Download className="w-4 h-4" />
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
              {/* Only show Hoàn thành button if they want to manually mark it, but we auto-mark it now. We can keep it as a fallback, but disable it if video is not completed */}
              {!isCurrentCompleted && isInitialLoaded && !isAuthor && lessonId && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isMarking || (!isVideoCompleted && !!videoUrl)}
                  variant="outline"
                  className="flex-1 sm:flex-none gap-2 h-11 px-5 rounded-lg border-success/50 text-success hover:bg-success/10 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isMarking ? 'Đang lưu...' : (!isVideoCompleted && !!videoUrl) ? 'Đang xem...' : 'Hoàn thành'}
                </Button>
              )}

              {currentLesson.quiz ? (
                <Link
                  href={`/quiz/${(currentLesson.quiz as any).documentId || currentLesson.quiz.id}?courseSlug=${course.slug}`}
                  className={cn(
                    "flex-1 sm:flex-none",
                    (!isVideoCompleted && !!videoUrl && !isCurrentCompleted && !isAuthor) ? "pointer-events-none opacity-50" : ""
                  )}
                >
                  <Button className="w-full gap-2 h-11 px-5 rounded-lg bg-warning text-warning-foreground hover:bg-warning/90 font-semibold">
                    <HelpCircle className="w-4 h-4" />
                    Bài kiểm tra
                  </Button>
                </Link>
              ) : nextLesson ? (
                <Link 
                  href={`/learn/${course.slug}/${nextLesson.slug}`} 
                  className={cn(
                    "flex-1 sm:flex-none",
                    (!isVideoCompleted && !!videoUrl && !isCurrentCompleted && !isAuthor) ? "pointer-events-none opacity-50" : ""
                  )}
                >
                  <Button className="w-full gap-2 h-11 px-5 rounded-lg font-semibold">
                    Bài tiếp theo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link 
                  href={`/certificates/${course.slug}`} 
                  className={cn(
                    "flex-1 sm:flex-none",
                    (!isVideoCompleted && !!videoUrl && !isCurrentCompleted && !isAuthor) ? "pointer-events-none opacity-50" : ""
                  )}
                >
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
            <CommentsPanel 
              lessonId={currentLesson.id.toString()} 
              courseId={course.documentId || course.id.toString()}
              courseTitle={course.title}
              instructorName={(course.instructor as any)?.name}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
