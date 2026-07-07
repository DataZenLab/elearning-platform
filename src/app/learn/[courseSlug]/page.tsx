import { redirect } from 'next/navigation';
import { coursesApi } from '@/services/api/courses.api';

export default async function CourseLearnRedirectPage(props: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await props.params;
  
  const course = await coursesApi.getCourseBySlug(courseSlug);
  if (course && course.lessons && course.lessons.length > 0) {
    const firstLesson = [...course.lessons].sort((a, b) => a.order - b.order)[0];
    redirect(`/learn/${courseSlug}/${firstLesson.slug}`);
  }
  
  redirect('/my-courses');
}
