import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
  increment
} from 'firebase/firestore';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@elearning.com';

class FirestoreService {
  /**
   * Fetch a single document by ID
   */
  async getDocument<T = DocumentData>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch multiple documents from a collection with optional query constraints
   */
  async getDocuments<T = DocumentData>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error(`Error fetching documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch multiple documents from a collection group with optional query constraints
   */
  async getCollectionGroupDocuments<T = DocumentData>(collectionId: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      // Import here to avoid needing it in the top level if not used often, or use top level
      const { collectionGroup } = await import('firebase/firestore');
      const q = query(collectionGroup(db, collectionId), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error(`Error fetching documents from collection group ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Create or overwrite a document
   */
  async setDocument(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get or create a user profile in Firestore.
   * - If the user's email matches ADMIN_EMAIL, they always get role='admin'.
   * - Otherwise, if no profile exists yet, create one with role='student'.
   * - Returns the resolved role.
   */
  async getOrCreateUserProfile(uid: string, email: string, displayName: string, photoURL?: string): Promise<{
    role: 'admin' | 'instructor' | 'student';
    status: 'active' | 'locked';
  }> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      // ✅ Fixed admin: email match = always admin, regardless of Firestore write success
      if (email === ADMIN_EMAIL) {
        // Best-effort write — if it fails (e.g. no Firestore rules), we still return admin
        try {
          await setDoc(docRef, {
            uid,
            email,
            name: displayName || 'Admin',
            role: 'admin',
            status: 'active',
            photoURL: photoURL || null,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (writeErr) {
          console.warn('Could not write admin profile to Firestore (check rules), but admin role is still granted by email match:', writeErr);
        }
        return { role: 'admin', status: 'active' };
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Update photoURL if missing or changed
        if (photoURL && data.photoURL !== photoURL) {
          await updateDoc(docRef, { photoURL });
        }

        // If account is locked, we still return the profile so the guard can redirect
        return {
          role: (data.role as 'admin' | 'instructor' | 'student') || 'student',
          status: (data.status as 'active' | 'locked') || 'active',
        };
      }

      // New user — create default student profile
      await setDoc(docRef, {
        uid,
        email,
        name: displayName || 'Học viên',
        role: 'student',
        status: 'active',
        points: 0,
        photoURL: photoURL || null,
        completedCourses: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { role: 'student', status: 'active' };
    } catch (error) {
      console.error('Error in getOrCreateUserProfile:', error);
      // Fallback: treat as student to avoid breaking the app
      return { role: 'student', status: 'active' };
    }
  }

  /**
   * Add credits (tín chỉ) to a user's profile
   */
  async addCredits(uid: string, credits: number): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        completedCourses: increment(credits),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding credits to user:', error);
    }
  }

  /**
   * Get top users for leaderboard
   */
  async getLeaderboard(limitCount = 100): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('completedCourses', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return users.filter((u: any) => u.role !== 'admin' && u.role !== 'instructor');
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }
}

export const firestoreService = new FirestoreService();
