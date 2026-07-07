import { notFound } from 'next/navigation';
import { strapi } from '@/lib/strapi';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonFormClient } from '../lesson-form-client';
import type { Lesson } from '@/types';

export default async function EditLessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  const lessonId = resolvedParams.lessonId;

  try {
    const res = await strapi.findOne<Lesson>('lessons', lessonId, {
      publicationState: 'preview',
    }, { cache: 'no-store' });
    
    const lesson = res.data;
    if (!lesson) return notFound();

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/instructor/courses/${courseId}/lessons`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa bài học</h1>
            <p className="text-muted-foreground">{lesson.title}</p>
          </div>
        </div>

        <LessonFormClient courseId={courseId} documentId={lessonId} initialData={lesson} />
      </div>
    );
  } catch (error) {
    console.error('Failed to load lesson for editing:', error);
    return notFound();
  }
}
