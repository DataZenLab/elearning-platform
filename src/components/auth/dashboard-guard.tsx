'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

/**
 * Component bảo vệ Route Dashboard (Yêu cầu đăng nhập, nếu chưa sẽ đẩy về trang login).
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check auth once Firebase has initialized
    if (initialized) {
      if (!user) {
        // Not logged in, redirect to login and save the attempted URL
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
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

  // If initialized but no user, the useEffect will redirect
  // We return null here to prevent flashing protected content
  if (!user) {
    return null;
  }

  // User is authenticated, render the dashboard
  return <>{children}</>;
}
