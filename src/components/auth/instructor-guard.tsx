'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export function InstructorGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'instructor' && user.role !== 'admin') {
        // Only instructors and admins can access this area
        // Students are redirected to their dashboard
        router.push('/dashboard');
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

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}
