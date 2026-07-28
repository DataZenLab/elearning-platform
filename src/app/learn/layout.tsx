import { LearnGuard } from '@/components/auth/learn-guard';

/**
 * Layout Học Tập (Learn): Giao diện phòng học, bọc Video player và danh sách bài giảng bên cạnh.
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No sidebar/header here — lesson pages are full-screen
  // LearnGuard allows student, instructor (preview) and admin
  return <LearnGuard>{children}</LearnGuard>;
}

