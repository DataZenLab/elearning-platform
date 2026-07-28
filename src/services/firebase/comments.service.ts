import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import type { Comment, CommentCreateInput } from '@/types';

export class CommentsService {
  private readonly collectionName = 'comments';

  /**
   * Subscribe to real-time comments for a specific lesson
   */
  subscribeToLessonComments(lessonId: string, callback: (comments: Comment[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      where('lessonId', '==', lessonId)
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      // Sort desc by createdAt on client side to avoid needing composite indexes
      comments.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      callback(comments);
    }, (error) => {
      console.error('Error fetching comments:', error);
      callback([]); // Return empty array on error (e.g. index missing initially)
    });
  }

  /**
   * Subscribe to all comments for the instructor dashboard
   * (No filter by instructorName to avoid mismatch issues)
   */
  subscribeToInstructorComments(_instructorName: string, callback: (comments: Comment[]) => void) {
    // Lấy tất cả comment gốc (parentId == null) để hiển thị trong dashboard giảng viên
    const q = query(
      collection(db, this.collectionName),
      where('parentId', '==', null)
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      // Sort desc by createdAt on client side
      comments.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      callback(comments);
    }, (error) => {
      console.error('Error fetching instructor comments:', error);
      callback([]); 
    });
  }

  /**
   * Add a new comment or reply
   */
  async addComment(input: CommentCreateInput): Promise<string> {
    try {
      // Remove undefined values to avoid Firestore crash
      const cleanedInput = Object.fromEntries(
        Object.entries(input).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...cleanedInput,
        likes: 0,
        likedBy: [],
        ...(cleanedInput.parentId ? {} : { replied: false }), // Set replied: false cho comment gốc
        createdAt: serverTimestamp()
      });

      // Nếu giảng viên trả lời một comment, update comment gốc thành đã trả lời
      if (input.isInstructor && input.parentId) {
        try {
          const parentRef = doc(db, this.collectionName, input.parentId);
          await updateDoc(parentRef, { replied: true });
        } catch (updateErr) {
          console.error('Error updating parent comment status:', updateErr);
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Toggle like for a comment
   */
  async toggleLikeComment(commentId: string, userId: string, isCurrentlyLiked: boolean): Promise<void> {
    try {
      const commentRef = doc(db, this.collectionName, commentId);
      
      if (isCurrentlyLiked) {
        // Unlike
        await updateDoc(commentRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        });
      } else {
        // Like
        await updateDoc(commentRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Delete a comment (and optionally its replies if we were to implement recursive deletion)
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const commentsService = new CommentsService();
