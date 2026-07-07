'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { updateCourseAction } from '@/actions/course.actions';
import type { Course } from '@/types';

export function EditCourseClient({ course }: { course: Course }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: course.title,
    shortDescription: course.shortDescription || '',
    description: course.description || '',
    difficulty: course.difficulty,
    price: course.price,
    duration: course.duration,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const docId = (course as any).documentId || course.id;
      const result = await updateCourseAction(docId, formData);

      if (result.success) {
        router.push('/instructor/courses');
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
            <label className="text-sm font-medium mb-1.5 block">Tên khóa học *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Mô tả ngắn</label>
            <Input
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="h-10"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Nội dung chi tiết *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mức độ *</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:ring-3"
              >
                <option value="beginner">Người mới bắt đầu (Beginner)</option>
                <option value="intermediate">Trung bình (Intermediate)</option>
                <option value="advanced">Nâng cao (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Thời lượng (phút)</label>
              <Input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={0}
                className="h-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Giá bán (VNĐ) *</label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min={0}
              required
              className="h-10"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-10 px-6 rounded-xl">
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-xl gradient-primary text-white border-0">
            {isSubmitting ? 'Đang lưu...' : 'Cập nhật khóa học'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
