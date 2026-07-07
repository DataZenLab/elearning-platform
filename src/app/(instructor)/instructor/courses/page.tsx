import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Eye, ListVideo } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';
import { instructorApi } from '@/services/api/instructor.api';
import { DeleteCourseButton } from './delete-course-button';

export default async function InstructorCoursesPage() {
  const courses = await instructorApi.getCourses();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý khóa học</h1>
          <p className="text-muted-foreground">Tạo và chỉnh sửa nội dung các khóa học của bạn.</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button className="rounded-xl gradient-primary text-white border-0 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Tạo khóa học mới
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Chưa có khóa học nào"
          description="Bắt đầu chia sẻ kiến thức của bạn bằng cách tạo khóa học đầu tiên."
        />
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => {
            const isPublished = course.publishedAt !== null && course.isPublished !== false;
            return (
              <Card key={course.id} className="p-4 flex items-center justify-between border-border/50 shadow-sm">
                <div>
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className={isPublished ? 'text-success' : 'text-warning'}>
                      {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                    <span>• {course.totalStudents || 0} học viên</span>
                    <span>• {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString() || 0}đ`}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/instructor/courses/${(course as any).documentId || course.id}/lessons`}>
                    <Button variant="outline" size="icon" className="rounded-xl" title="Quản lý bài học"><ListVideo className="w-4 h-4" /></Button>
                  </Link>
                  <Link href={`/courses/${course.slug}`}>
                    <Button variant="outline" size="icon" className="rounded-xl" title="Xem trên web"><Eye className="w-4 h-4" /></Button>
                  </Link>
                  <Link href={`/instructor/courses/${(course as any).documentId || course.id}`}>
                    <Button variant="outline" size="icon" className="rounded-xl" title="Chỉnh sửa"><Edit className="w-4 h-4" /></Button>
                  </Link>
                  <DeleteCourseButton documentId={(course as any).documentId || course.id} title={course.title} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
