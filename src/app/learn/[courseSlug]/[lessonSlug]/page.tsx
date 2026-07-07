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
  
  // 3. Helpers
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYoutubeVideoId(currentLesson.videoUrl);

  // 4. Calculate Navigation (Prev/Next)
  const sortedLessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex(l => l.slug === currentLesson.slug);
  const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  return (
    <LessonViewClient 
      course={course as any}
      currentLesson={currentLesson as any}
      sortedLessons={sortedLessons as any}
      previousLesson={previousLesson as any}
      nextLesson={nextLesson as any}
      videoId={videoId}
    />
  );
}
