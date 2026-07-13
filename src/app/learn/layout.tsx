import { DashboardGuard } from '@/components/auth/dashboard-guard';

/**
 * Layout Học Tập (Learn): Giao diện phòng học, bọc Video player và danh sách bài giảng bên cạnh.
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No sidebar/header here — lesson pages are full-screen
  return <DashboardGuard>{children}</DashboardGuard>;
}
