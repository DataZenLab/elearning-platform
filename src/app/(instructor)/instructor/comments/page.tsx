'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// Mock review/comment data — in production this would come from Strapi reviews collection
const MOCK_COMMENTS = [
  {
    id: 1,
    user: 'Nguyễn Văn An',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An',
    course: 'React & Next.js Masterclass',
    message: 'Bài giảng rất dễ hiểu! Giảng viên giải thích rất chi tiết. Cảm ơn thầy nhiều!',
    time: '2 giờ trước',
    replied: false,
  },
  {
    id: 2,
    user: 'Trần Thị Bình',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh',
    course: 'Node.js Backend',
    message: 'Ở bài số 5 có chỗ code mẫu bị lỗi, mình làm theo thì không chạy được. Thầy có thể xem lại không ạ?',
    time: '5 giờ trước',
    replied: false,
  },
  {
    id: 3,
    user: 'Lê Minh Cường',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong',
    course: 'React & Next.js Masterclass',
    message: 'Khóa học này thực sự rất hay. Mình đã apply được vào công ty sau khi học xong.',
    time: '1 ngày trước',
    replied: true,
  },
];

export default function InstructorCommentsPage() {
  const { user } = useAuthStore();
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleReply = (id: number) => {
    if (!replyTexts[id]?.trim()) return;
    setComments(prev => prev.map(c => c.id === id ? { ...c, replied: true } : c));
    setReplyingTo(null);
    setReplyTexts(prev => ({ ...prev, [id]: '' }));
    alert('Đã gửi phản hồi thành công! (Kết nối Strapi để lưu thật sự)');
  };

  const pending = comments.filter(c => !c.replied);
  const done = comments.filter(c => c.replied);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hỏi đáp & Bình luận</h1>
        <p className="text-muted-foreground">Trả lời thắc mắc của học viên trong các khóa học của bạn.</p>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-warning font-medium">
          <Clock className="w-4 h-4" /> {pending.length} chờ trả lời
        </span>
        <span className="flex items-center gap-1.5 text-success font-medium">
          <CheckCircle className="w-4 h-4" /> {done.length} đã trả lời
        </span>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Chờ trả lời</h2>
          {pending.map(comment => (
            <Card key={comment.id} className="p-4 border-border/50 shadow-sm border-l-4 border-l-warning">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground ml-2">• {comment.course}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.message}</p>
                  {replyingTo === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        className="w-full text-sm border border-input rounded-lg p-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                        placeholder="Nhập câu trả lời của bạn..."
                        value={replyTexts[comment.id] || ''}
                        onChange={e => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-lg gradient-primary text-white border-0" onClick={() => handleReply(comment.id)}>Gửi phản hồi</Button>
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setReplyingTo(null)}>Hủy</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs" onClick={() => setReplyingTo(comment.id)}>
                      <MessageSquare className="w-3 h-3 mr-1" /> Trả lời
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Đã trả lời</h2>
          {done.map(comment => (
            <Card key={comment.id} className="p-4 border-border/50 shadow-sm opacity-70">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground ml-2">• {comment.course}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-success"><CheckCircle className="w-3 h-3" /> Đã trả lời</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{comment.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
