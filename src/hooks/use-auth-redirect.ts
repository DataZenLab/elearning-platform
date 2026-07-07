'use client';

import { useRouter } from 'next/navigation';
import { firestoreService } from '@/services/firebase/firestore.service';
import type { User as FirebaseUser } from 'firebase/auth';

export const useAuthRedirect = () => {
  const router = useRouter();

  const handleRedirect = async (firebaseUser: FirebaseUser) => {
    try {
      const { role } = await firestoreService.getOrCreateUserProfile(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || '',
        firebaseUser.photoURL || undefined
      );

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user để chuyển hướng:', error);
      // Fallback to dashboard if role fetch fails
      router.push('/dashboard');
    }
  };

  return { handleRedirect };
};
