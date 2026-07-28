'use client';

import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { firestoreService } from '@/services/firebase/firestore.service';
import { useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    let currentAuthUid: string | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      currentAuthUid = firebaseUser?.uid || null;
      try {
        setLoading(true);
        if (firebaseUser) {
          // Fetch role from Firestore (or create profile if new user)
          const { role, status } = await firestoreService.getOrCreateUserProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || 'Học viên',
            firebaseUser.photoURL || undefined
          );

          // Fix race condition: If auth state changed (e.g. user was signed out due to unverified email) 
          // while we were fetching the profile, do not set the user state.
          if (currentAuthUid !== firebaseUser.uid) {
             return;
          }

          // Fetch points and completedCourses from Firestore
          let points = 0;
          let completedCourses = 0;
          try {
            const userDoc = await firestoreService.getDocument<{ points?: number; completedCourses?: number }>('users', firebaseUser.uid);
            points = userDoc?.points || 0;
            completedCourses = userDoc?.completedCourses || 0;
          } catch {}
          
          if (currentAuthUid !== firebaseUser.uid) return;

          // If account is locked, sign out and set user null
          if (status === 'locked') {
            await auth.signOut();
            if (currentAuthUid === firebaseUser.uid) {
               setUser(null);
               alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.');
               router.push('/login?error=locked');
            }
            return;
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Học viên',
            avatarUrl: firebaseUser.photoURL || null,
            role,
            points,
            completedCourses,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error synchronizing auth state:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setInitialized]);

  return <>{children}</>;
}
