import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  lessonId: string;
  courseId: string;
  courseTitle: string;
  instructorName?: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  isInstructor: boolean;
  content: string;
  likes: number;
  likedBy: string[]; // Mảng userIds đã like
  parentId: string | null; // null nếu là comment gốc, chứa ID của comment gốc nếu là reply
  replied?: boolean; // Đánh dấu đã được giảng viên trả lời hay chưa (chỉ dùng cho comment gốc)
  createdAt: Timestamp;
}

export interface CommentCreateInput {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  instructorName?: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  isInstructor: boolean;
  content: string;
  parentId: string | null;
}
