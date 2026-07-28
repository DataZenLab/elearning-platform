import { notFound } from 'next/navigation';
import { coursesApi } from '@/services/api/courses.api';
import { lessonApi } from '@/services/api/lesson.api';
import { LessonViewClient } from './lesson-view-client';

export default async function LessonPage(props: { params: Promise<{ courseSlug: string, lessonSlug: string }> }) {
  const params = await props.params;
  
  // 1. Fetch course details & all lessons
  const course = await coursesApi.getCourseBySlug(params.courseSlug);
  if (!course) {
    notFound();
  }

  // 2. Fetch specific lesson details
  const currentLesson = await lessonApi.getLessonBySlug(params.lessonSlug);
  if (!currentLesson) {
    if (course.lessons && course.lessons.length > 0) {
      const firstLesson = [...course.lessons].sort((a, b) => a.order - b.order)[0];
      if (firstLesson.slug !== params.lessonSlug) {
        // Import redirect from 'next/navigation' at the top, which is already available
        const { redirect } = await import('next/navigation');
        redirect(`/learn/${params.courseSlug}/${firstLesson.slug}`);
      }
    }
    notFound();
  }
  
  // 4. Calculate Navigation (Prev/Next)
  const sortedLessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex(l => l.slug === currentLesson.slug);
  const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  // HACK: Tạm thời ghi đè videoUrl bằng link Cloudinary của user gửi 
  // để có thể test tính năng ngay lập tức mà chưa cần vào Admin sửa.
  let finalVideoUrl = currentLesson.videoUrl;
  if (!finalVideoUrl || finalVideoUrl.includes('youtube.com') || finalVideoUrl.includes('youtu.be')) {
    finalVideoUrl = "https://res.cloudinary.com/dsy7a3ezv/video/upload/v1784376670/basketball_yj9ors.mp4";
  }

  return (
    <LessonViewClient 
      course={course as any}
      currentLesson={currentLesson as any}
      sortedLessons={sortedLessons as any}
      previousLesson={previousLesson as any}
      nextLesson={nextLesson as any}
      videoUrl={finalVideoUrl}
    />
  );
}
