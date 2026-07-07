'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createLessonAction, updateLessonAction } from '@/actions/lesson.actions';

export function LessonFormClient({ courseId, initialData, documentId }: { courseId: string; initialData?: any; documentId?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    videoUrl: initialData?.videoUrl || '',
    duration: initialData?.duration || 0,
    order: initialData?.order || 1,
    chapter: initialData?.chapter || '',
    isFree: initialData?.isFree || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'duration' || name === 'order') {
      finalValue = Number(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let result;
      if (documentId) {
        result = await updateLessonAction(documentId, formData, courseId);
      } else {
        const slug = formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        result = await createLessonAction({ ...formData, slug, courseId });
      }

      if (result.success) {
        router.push(`/instructor/courses/${courseId}/lessons`);
      } else {
        setError(result.error || 'Đã có lỗi xảy ra');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 mt-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tên bài học *</label>
            <Input name="title" value={formData.title} onChange={handleChange} required className="h-10" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Chương (Chapter)</label>
            <Input name="chapter" value={formData.chapter} onChange={handleChange} placeholder="Ví dụ: Chương 1: Giới thiệu" className="h-10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Thứ tự bài học *</label>
              <Input type="number" name="order" value={formData.order} onChange={handleChange} required min={1} className="h-10" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Thời lượng (phút)</label>
              <Input type="number" name="duration" value={formData.duration} onChange={handleChange} min={0} className="h-10" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Video URL (Youtube)</label>
            <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." className="h-10" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Nội dung chi tiết (Mô tả) *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={5}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFree"
              name="isFree"
              checked={formData.isFree}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isFree" className="text-sm font-medium cursor-pointer">
              Cho phép học thử miễn phí (Không cần đăng ký/mua khóa học)
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-10 px-6 rounded-xl">
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-xl gradient-primary text-white border-0">
            {isSubmitting ? 'Đang lưu...' : (documentId ? 'Cập nhật bài học' : 'Tạo bài học')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
