'use client';

import { AdminGuard } from '@/components/auth/admin-guard';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-muted/10 overflow-hidden">
        <aside className="w-64 hidden lg:block flex-shrink-0 z-20">
          <AdminSidebar />
        </aside>
        
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
          {/* We reuse the dashboard header but it will adapt to context */}
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
