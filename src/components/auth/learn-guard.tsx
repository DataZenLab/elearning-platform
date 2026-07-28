'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

/**
 * Guard cho trang học (Learn): Yêu cầu đăng nhập.
 * Cho phép cả student, instructor (xem trước) và admin truy cập.
 */
export function LearnGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, initialized, router, pathname]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  if (!user) return null;

  // Allow all authenticated roles (student, instructor, admin)
  return <>{children}</>;
}
