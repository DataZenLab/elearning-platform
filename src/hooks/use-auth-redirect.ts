'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firestoreService } from '@/services/firebase/firestore.service';
import type { User as FirebaseUser } from 'firebase/auth';

export const useAuthRedirect = () => {
  const router = useRouter();

  const handleRedirect = async (firebaseUser: FirebaseUser, redirectUrl?: string | null) => {
    try {
      const { role, status } = await firestoreService.getOrCreateUserProfile(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || '',
        firebaseUser.photoURL || undefined
      );

      // Kiểm tra trạng thái tài khoản — nếu bị khóa thì đăng xuất và báo lỗi
      if (status === 'locked') {
        await signOut(auth);
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
      }

      // Nếu có redirectUrl hợp lệ, ưu tiên chuyển hướng đến đó
      if (redirectUrl && redirectUrl.startsWith('/')) {
        router.push(redirectUrl);
        return;
      }

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user để chuyển hướng:', error);
      // Nếu lỗi do tài khoản bị khóa, ném tiếp để UI hiển thị thông báo
      if (error instanceof Error && error.message.includes('bị khóa')) {
        throw error;
      }
      // Fallback to dashboard nếu lỗi khác
      if (redirectUrl && redirectUrl.startsWith('/')) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return { handleRedirect };
};
