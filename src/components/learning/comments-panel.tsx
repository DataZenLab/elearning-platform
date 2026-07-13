'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, MoreVertical, ThumbsUp, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface Comment {
  id: string;
  user: string;
  avatar?: string;
  content: string;
  likes: number;
  createdAt: string;
  isInstructor?: boolean;
}

interface CommentsPanelProps {
  lessonId: string;
}

/**
 * Khung thảo luận: Nơi học viên hỏi đáp và bình luận bên dưới mỗi bài học.
 */
export function CommentsPanel({ lessonId }: CommentsPanelProps) {
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState('');
  
  // Mock data for initial comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: 'Giảng viên EduFlow',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
      content: 'Chào các bạn, nếu có phần nào chưa hiểu rõ trong video này, các bạn cứ để lại bình luận tại đây nhé. Mình sẽ giải đáp!',
      likes: 12,
      createdAt: '2 ngày trước',
      isInstructor: true
    },
    {
      id: '2',
      user: 'Nguyễn Văn A',
      content: 'Bài giảng rất hay và chi tiết, cảm ơn giảng viên!',
      likes: 3,
      createdAt: '5 giờ trước'
    }
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !user) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: user.displayName || 'Học viên ẩn danh',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      content: commentContent,
      likes: 0,
      createdAt: 'Vừa xong'
    };

    setComments([newComment, ...comments]);
    setCommentContent('');
  };

  const handleLike = (id: string) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border bg-card rounded-t-xl shrink-0">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <MessageSquare className="w-5 h-5 text-primary" />
          Hỏi đáp & Bình luận
        </h3>
      </div>

      {/* Comments List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {comment.user.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-card p-3 rounded-xl rounded-tl-none border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{comment.user}</span>
                    {comment.isInstructor && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                        Giảng viên
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-1.5 ml-2">
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {comment.likes > 0 && comment.likes} Thích
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                    Phản hồi
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-border bg-card shrink-0">
        <form onSubmit={handleAddComment} className="flex flex-col gap-2">
          <textarea
            className="w-full min-h-[80px] rounded-lg border border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            placeholder="Viết bình luận hoặc câu hỏi..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="rounded-lg h-10 px-5 gap-2 font-medium" 
              disabled={!commentContent.trim() || !user}
            >
              <Send className="w-4 h-4" /> Gửi bình luận
            </Button>
          </div>
        </form>
        {!user && (
          <p className="text-xs text-warning mt-2 text-center">Vui lòng đăng nhập để gửi bình luận.</p>
        )}
      </div>
    </div>
  );
}
