'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { strapi } from '@/lib/strapi';

interface AddReviewFormProps {
  courseDocumentId: string;
  onSuccess?: () => void;
}

/**
 * Form nhập nội dung đánh giá và chấm điểm sao cho khóa học.
 */
export function AddReviewForm({ courseDocumentId, onSuccess }: AddReviewFormProps) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
        <p className="text-sm">Đăng nhập để gửi đánh giá của bạn</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await strapi.post('/reviews', {
        rating,
        comment,
        userName: user.displayName || user.email,
        userAvatar: user.avatarUrl || null,
        firebaseUid: user.uid,
        course: courseDocumentId,
      });
      setSuccess('Cảm ơn đánh giá của bạn! 🎉');
      setComment('');
      setRating(5);
      onSuccess?.();
    } catch (err: any) {
      setError('Gửi đánh giá thất bại. Bạn đã có thể đã đánh giá khóa học này rồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-4">Viết đánh giá của bạn</h3>

      {success && (
        <div className="text-sm text-success bg-success/10 px-4 py-3 rounded-xl border border-success/20 mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Chọn điểm đánh giá</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-125"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground self-center">
              {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất tệ'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium mb-2 block">Nhận xét</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground resize-none transition-colors"
            placeholder="Chia sẻ trải nghiệm học tập của bạn với khóa học này..."
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-8 rounded-lg font-semibold"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </div>
  );
}
