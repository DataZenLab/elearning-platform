'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

/**
 * Component bảo vệ Route Admin (Chỉ cho phép tài khoản có role='admin' truy cập).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'admin') {
        // Only admins can access this area
        // Instructors and students are redirected to their respective dashboards
        router.push(user.role === 'instructor' ? '/instructor' : '/dashboard');
      }
    }
  }, [user, initialized, router, pathname]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
