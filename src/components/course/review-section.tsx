import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewItem {
  id: number;
  rating: number;
  comment?: string;
  userName?: string;
  userAvatar?: string;
  createdAt: string;
}

interface ReviewSectionProps {
  reviews?: ReviewItem[];
  averageRating?: number;
  totalReviews?: number;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(dateString));
}

function calcDistribution(reviews: ReviewItem[]) {
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
  const total = reviews.length || 1;
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percentage: Math.round((dist[stars] / total) * 100),
  }));
}

export function ReviewSection({ reviews = [], averageRating = 0, totalReviews = 0 }: ReviewSectionProps) {
  const displayReviews = reviews.slice(0, 5);
  const avg = averageRating || (reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
  const total = totalReviews || reviews.length;
  const distribution = calcDistribution(reviews);

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Đánh giá từ học viên</h2>
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted" />
          <p className="text-lg font-medium">Chưa có đánh giá nào</p>
          <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá khóa học này!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Đánh giá từ học viên</h2>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-card p-6 rounded-xl border border-border">
        <div className="flex flex-col items-center justify-center min-w-[150px]">
          <span className="text-5xl font-extrabold text-foreground">{avg.toFixed(1)}</span>
          <div className="flex gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">({total} đánh giá)</span>
        </div>

        <div className="flex-1 w-full space-y-3">
          {distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 shrink-0">
                <span className="text-sm font-medium">{item.stars}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {displayReviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12">
                {review.userAvatar ? (
                  <AvatarImage src={review.userAvatar} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(review.userName || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-semibold text-foreground">{review.userName || 'Học viên ẩn danh'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-foreground leading-relaxed text-sm sm:text-base">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
