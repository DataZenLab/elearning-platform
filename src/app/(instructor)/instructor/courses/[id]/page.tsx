import { notFound } from 'next/navigation';
import { instructorApi } from '@/services/api/instructor.api';
import { EditCourseClient } from './edit-course-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  try {
    const course = await instructorApi.getCourseById(resolvedParams.id);
    
    if (!course) {
      return notFound();
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/instructor/courses">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa khóa học</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>

        <EditCourseClient course={course} />
      </div>
    );
  } catch (error) {
    console.error('Failed to load course for editing:', error);
    return notFound();
  }
}
