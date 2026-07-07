import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LessonFormClient } from '../lesson-form-client';

export default async function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/instructor/courses/${courseId}/lessons`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thêm bài học mới</h1>
          <p className="text-muted-foreground">Tạo bài học mới cho khóa học này</p>
        </div>
      </div>

      <LessonFormClient courseId={courseId} />
    </div>
  );
}
