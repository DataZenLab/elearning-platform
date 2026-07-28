import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  currentLessonId: string;
  lastAccessedAt: any;
  score?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: any;
  status: 'active' | 'completed';
}

class EnrollmentService {
  /**
   * Enroll a user in a course
   */
  async enrollUser(uid: string, courseId: string): Promise<void> {
    if (!uid) throw new Error("User ID is required");
    try {
      const enrollmentRef = doc(db, 'users', uid, 'enrollments', courseId);
      const snap = await getDoc(enrollmentRef);
      if (!snap.exists()) {
        await setDoc(enrollmentRef, {
          courseId,
          enrolledAt: serverTimestamp(),
          status: 'active'
        });
      }
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  }

  /**
   * Check if a user is enrolled
   */
  async checkEnrollment(uid: string, courseId: string): Promise<boolean> {
    if (!uid) return false;
    try {
      const enrollmentRef = doc(db, 'users', uid, 'enrollments', courseId);
      const snap = await getDoc(enrollmentRef);
      return snap.exists();
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  /**
   * Get user progress for a course
   */
  async getCourseProgress(uid: string, courseId: string): Promise<CourseProgress | null> {
    if (!uid) return null;
    try {
      const progressRef = doc(db, 'users', uid, 'progress', courseId);
      const snap = await getDoc(progressRef);
      if (snap.exists()) {
        return snap.data() as CourseProgress;
      }
      return {
        courseId,
        completedLessons: [],
        currentLessonId: '',
        lastAccessedAt: serverTimestamp()
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  /**
   * Mark a lesson as completed
   */
  async markLessonCompleted(uid: string, courseId: string, lessonId: string): Promise<void> {
    if (!uid) return;
    try {
      const progressRef = doc(db, 'users', uid, 'progress', courseId);
      await setDoc(progressRef, {
        courseId,
        completedLessons: arrayUnion(lessonId),
        currentLessonId: lessonId,
        lastAccessedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      throw error;
    }
  }

  /**
   * Update generic progress (e.g. quiz scores)
   */
  async updateProgress(uid: string, courseId: string, data: Partial<CourseProgress>): Promise<void> {
    if (!uid || !courseId) return;
    try {
      const progressRef = doc(db, 'users', uid, 'progress', courseId);
      await setDoc(progressRef, {
        ...data,
        courseId,
        lastAccessedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Get all enrollments for a user
   */
  async getEnrolledCourses(uid: string): Promise<Enrollment[]> {
    if (!uid) return [];
    try {
      const enrollmentsRef = collection(db, 'users', uid, 'enrollments');
      const snap = await getDocs(enrollmentsRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
    } catch (error) {
      console.error('Error getting enrollments:', error);
      return [];
    }
  }

  /**
   * Get progress for all enrolled courses for a user
   */
  async getAllProgress(uid: string): Promise<CourseProgress[]> {
    if (!uid) return [];
    try {
      const progressRef = collection(db, 'users', uid, 'progress');
      const snap = await getDocs(progressRef);
      return snap.docs.map(d => d.data() as CourseProgress);
    } catch (error) {
      console.error('Error getting all progress:', error);
      return [];
    }
  }

  /**
   * Reset all progress for a course (learn from scratch).
   * Deletes the progress document and resets enrollment status to 'active'.
   */
  async resetCourseProgress(uid: string, courseId: string): Promise<void> {
    if (!uid || !courseId) return;
    try {
      // Delete progress document entirely so completedLessons becomes []
      const progressRef = doc(db, 'users', uid, 'progress', courseId);
      await deleteDoc(progressRef);

      // Reset enrollment status back to active
      const enrollmentRef = doc(db, 'users', uid, 'enrollments', courseId);
      await setDoc(enrollmentRef, {
        status: 'active',
        resetAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error resetting course progress:', error);
      throw error;
    }
  }
}

export const enrollmentService = new EnrollmentService();
