'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

/**
 * Component bảo vệ Route Dashboard (Yêu cầu đăng nhập, chỉ dành cho role='student').
 * - Chưa đăng nhập → redirect /login
 * - Là instructor    → redirect /instructor
 * - Là admin         → redirect /admin
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      // Not logged in, redirect to login and save the attempted URL
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role === 'admin') {
      router.replace('/admin');
    } else if (user.role === 'instructor') {
      router.replace('/instructor');
    }
  }, [user, initialized, router, pathname]);

  // Show a full-page loading skeleton while Firebase is initializing
  if (!initialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  // Block access for non-students
  if (!user || user.role === 'admin' || user.role === 'instructor') {
    return null;
  }

  // User is an authenticated student, render the dashboard
  return <>{children}</>;
}

