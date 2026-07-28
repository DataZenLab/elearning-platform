'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { commentsService } from '@/services/firebase/comments.service';
import type { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Trang Quản Lý Bình Luận (Giảng viên): Xem và trả lời thắc mắc của học viên trong các khóa học.
 */
export default function InstructorCommentsPage() {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.displayName) return;
    const unsubscribe = commentsService.subscribeToInstructorComments(user.displayName, (fetchedComments) => {
      // Chỉ lấy các comment gốc (không lấy reply) để hiển thị trong danh sách chờ trả lời
      const parentComments = fetchedComments.filter(c => !c.parentId);
      setComments(parentComments);
    });
    return () => unsubscribe();
  }, [user?.displayName]);

  const handleReply = async (comment: Comment) => {
    if (!replyTexts[comment.id]?.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await commentsService.addComment({
        lessonId: comment.lessonId,
        courseId: comment.courseId,
        courseTitle: comment.courseTitle,
        instructorName: comment.instructorName || null,
        userId: user.uid,
        userName: user.displayName || 'Giảng viên',
        userAvatar: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        isInstructor: true,
        content: replyTexts[comment.id].trim(),
        parentId: comment.id
      });
      setReplyingTo(null);
      setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      alert('Có lỗi xảy ra khi gửi phản hồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Vừa xong';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return 'Vừa xong';
    }
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
                  <AvatarImage src={comment.userAvatar || undefined} />
                  <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground ml-2">• {comment.courseTitle}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  {replyingTo === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        className="w-full text-sm border border-input rounded-lg p-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        rows={3}
                        placeholder="Nhập câu trả lời của bạn..."
                        value={replyTexts[comment.id] || ''}
                        onChange={e => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        disabled={isSubmitting}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="rounded-lg gradient-primary text-white border-0" 
                          onClick={() => handleReply(comment)}
                          disabled={isSubmitting}
                        >
                          Gửi phản hồi
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="rounded-lg" 
                          onClick={() => setReplyingTo(null)}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </Button>
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
                  <AvatarImage src={comment.userAvatar || undefined} />
                  <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground ml-2">• {comment.courseTitle}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-success"><CheckCircle className="w-3 h-3" /> Đã trả lời</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

