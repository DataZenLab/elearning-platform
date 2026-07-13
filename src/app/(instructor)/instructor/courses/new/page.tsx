'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { createCourseAction } from '@/actions/course.actions';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Trang Tạo Khóa Học Mới (Giảng viên): Form điền thông tin để xuất bản một khóa học mới.
 */
export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    difficulty: 'beginner',
    price: 0,
    duration: 0,
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
      // Auto-generate slug from title
      const slug = formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      
      const result = await createCourseAction({
        ...formData,
        slug,
        categoryId: 1, // Defaulting to 1 for MVP (Lập trình Web)
      });

      if (result.success) {
        // Redirect to course list
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tạo khóa học mới</h1>
          <p className="text-muted-foreground">Khóa học sau khi tạo sẽ được lưu ở dạng Nháp chờ Admin phê duyệt.</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tên khóa học *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: React & Next.js Masterclass"
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
                placeholder="Tóm tắt nội dung khóa học trong 1-2 câu"
                className="h-10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Nội dung chi tiết *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả đầy đủ chi tiết về khóa học (hỗ trợ HTML)"
                required
                rows={5}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mức độ *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              <p className="text-xs text-muted-foreground mt-1">Để 0 nếu là khóa học miễn phí.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-10 px-6 rounded-xl">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-xl gradient-primary text-white border-0">
              {isSubmitting ? 'Đang lưu...' : 'Lưu bản Nháp'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
