import { notFound } from 'next/navigation';
import { strapi } from '@/lib/strapi';
import { instructorApi } from '@/services/api/instructor.api';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Lesson } from '@/types';
import { DeleteLessonButton } from './delete-lesson-button';

export default async function ManageLessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  
  try {
    const course = await instructorApi.getCourseById(courseId);
    if (!course) return notFound();

    const res = await strapi.findMany<Lesson>('lessons', {
      filters: { course: { documentId: { $eq: courseId } } },
      sort: ['order:asc'],
      publicationState: 'preview',
    }, { cache: 'no-store' });
    
    const lessons = res.data || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/instructor/courses">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Quản lý bài học</h1>
            <p className="text-muted-foreground">Khóa học: {course.title}</p>
          </div>
          <Link href={`/instructor/courses/${courseId}/lessons/new`}>
            <Button className="rounded-xl gradient-primary text-white border-0 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bài học
            </Button>
          </Link>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card border-dashed">
            <p className="text-muted-foreground mb-4">Chưa có bài học nào trong khóa này.</p>
            <Link href={`/instructor/courses/${courseId}/lessons/new`}>
              <Button variant="outline">Tạo bài học đầu tiên</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {lessons.map((lesson) => {
              const docId = (lesson as any).documentId || lesson.id;
              return (
                <Card key={lesson.id} className="p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-semibold text-primary mb-1">
                      {lesson.chapter || 'Chưa phân chương'} • Thứ tự: {lesson.order}
                    </div>
                    <h3 className="font-medium text-lg">{lesson.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>{lesson.duration ? `${lesson.duration} phút` : 'Chưa có thời lượng'}</span>
                      <span className={lesson.isFree ? 'text-success' : ''}>{lesson.isFree ? 'Học thử miễn phí' : 'Cần đăng ký'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${courseId}/lessons/${docId}`}>
                      <Button variant="outline" size="sm" className="rounded-lg">Sửa</Button>
                    </Link>
                    <DeleteLessonButton documentId={docId} courseId={courseId} title={lesson.title} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to load course lessons:', error);
    return notFound();
  }
}
