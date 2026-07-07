import { Sidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardGuard } from '@/components/auth/dashboard-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="flex min-h-screen bg-muted/20">
        {/* Sidebar - Desktop */}
        <Sidebar className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50" />
        
        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          {/* Dashboard Header */}
          <DashboardHeader />
          
          {/* Main Dashboard Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
