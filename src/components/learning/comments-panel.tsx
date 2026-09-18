'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Send, CornerDownRight, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { commentsService } from '@/services/firebase/comments.service';
import type { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CommentsPanelProps {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  instructorName?: string;
}

export function CommentsPanel({ lessonId, courseId, courseTitle, instructorName }: CommentsPanelProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    const unsubscribe = commentsService.subscribeToLessonComments(lessonId, (fetchedComments) => {
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [lessonId]);

  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : commentContent;
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await commentsService.addComment({
        lessonId,
        courseId: courseId || '',
        courseTitle: courseTitle || '',
        instructorName: instructorName || undefined,
        userId: user.uid,
        userName: user.displayName || 'Học viên',
        userAvatar: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        isInstructor: user.role === 'instructor' || user.role === 'admin',
        content: content.trim(),
        parentId
      });

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setCommentContent('');
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi bình luận:', error);
      alert(`Có lỗi xảy ra khi gửi bình luận: ${error?.message || error}. Vui lòng thử lại hoặc báo với admin.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (comment: Comment) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thích bình luận.');
      return;
    }
    const isLiked = comment.likedBy?.includes(user.uid);
    try {
      await commentsService.toggleLikeComment(comment.id, user.uid, isLiked);
    } catch (error) {
      console.error('Lỗi khi like bình luận:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await commentsService.deleteComment(commentId);
      } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
      }
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

  // Organize comments into parent and replies
  const parentComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId).reverse(); // Oldest replies first

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border bg-card rounded-t-xl shrink-0">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <MessageSquare className="w-5 h-5 text-primary" />
          Hỏi đáp & Bình luận
        </h3>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {parentComments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!
          </div>
        ) : (
          parentComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {/* Parent Comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={comment.userAvatar || ''} alt={comment.userName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-card p-3 rounded-xl rounded-tl-none border border-border relative group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">{comment.userName}</span>
                      {comment.isInstructor && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                          Giảng viên
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    
                    {user?.uid === comment.userId && (
                      <button onClick={() => handleDelete(comment.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1.5 ml-2">
                    <button 
                      onClick={() => handleToggleLike(comment)}
                      className={`flex items-center gap-1 text-xs transition-colors font-medium ${comment.likedBy?.includes(user?.uid || '') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${comment.likedBy?.includes(user?.uid || '') ? 'fill-primary' : ''}`} />
                      {comment.likes > 0 && comment.likes} Thích
                    </button>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      Phản hồi
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleAddComment(e, comment.id)} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        placeholder="Viết câu trả lời..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        autoFocus
                      />
                      <Button type="submit" size="sm" disabled={!replyContent.trim() || isSubmitting} className="h-9">
                        Gửi
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="pl-11 space-y-4 relative">
                  <div className="absolute left-6 top-0 bottom-4 w-px bg-border"></div>
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="flex gap-3 relative">
                      <div className="absolute -left-5 top-4 w-4 h-px bg-border"></div>
                      <div className="w-6 h-6 rounded-md overflow-hidden bg-muted shrink-0 mt-1">
                        <img src={reply.userAvatar || ''} alt={reply.userName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-card p-2.5 rounded-lg rounded-tl-none border border-border group relative">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-foreground">{reply.userName}</span>
                            {reply.isInstructor && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary">
                                Giảng viên
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">{formatTime(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                          {user?.uid === reply.userId && (
                            <button onClick={() => handleDelete(reply.id)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 ml-1">
                          <button 
                            onClick={() => handleToggleLike(reply)}
                            className={`flex items-center gap-1 text-[11px] transition-colors font-medium ${reply.likedBy?.includes(user?.uid || '') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${reply.likedBy?.includes(user?.uid || '') ? 'fill-primary' : ''}`} />
                            {reply.likes > 0 && reply.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-border bg-card shrink-0">
        <form onSubmit={(e) => handleAddComment(e, null)} className="flex flex-col gap-2">
          <textarea
            className="w-full min-h-[80px] rounded-lg border border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            placeholder="Viết bình luận hoặc câu hỏi..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="rounded-lg h-10 px-5 gap-2 font-medium" 
              disabled={!commentContent.trim() || !user || isSubmitting}
            >
              <Send className="w-4 h-4" /> {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
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
