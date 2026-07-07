import { DashboardGuard } from '@/components/auth/dashboard-guard';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No sidebar/header here — lesson pages are full-screen
  return <DashboardGuard>{children}</DashboardGuard>;
}
