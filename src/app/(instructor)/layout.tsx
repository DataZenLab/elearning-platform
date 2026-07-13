'use client';

import { InstructorGuard } from '@/components/auth/instructor-guard';
import { InstructorSidebar } from '@/components/layout/instructor-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';

/**
 * Layout Giảng Viên: Bao bọc khu vực dành riêng cho giảng viên, chứa thanh điều hướng chuyên biệt.
 */
export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <InstructorGuard>
      <div className="flex h-screen bg-muted/10 overflow-hidden">
        <aside className="w-64 hidden lg:block flex-shrink-0 z-20">
          <InstructorSidebar />
        </aside>
        
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </InstructorGuard>
  );
}
