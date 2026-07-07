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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

          // Fetch points from Firestore
          let points = 0;
          try {
            const userDoc = await firestoreService.getDocument<{ points?: number }>('users', firebaseUser.uid);
            points = userDoc?.points || 0;
          } catch {}

          // If account is locked, sign out and set user null
          if (status === 'locked') {
            await auth.signOut();
            setUser(null);
            alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.');
            router.push('/login?error=locked');
            return;
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Học viên',
            avatarUrl: firebaseUser.photoURL || null,
            role,
            points,
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
