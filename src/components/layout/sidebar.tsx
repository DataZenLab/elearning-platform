'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut,
  Trophy,
  Award
} from 'lucide-react';
import { authService } from '@/services/firebase/auth.service';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Khóa học của tôi', href: '/my-courses', icon: BookOpen },
    { name: 'Chứng chỉ', href: '/certificates', icon: Award },
    { name: 'Bảng xếp hạng', href: '/leaderboard', icon: Trophy },
    { name: 'Cài đặt tài khoản', href: '/profile', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Auth provider state change will automatically redirect via guard if needed,
      // but let's force a reload/redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className={cn("bg-card border-r border-border flex flex-col h-full", className)} {...props}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            {APP_NAME}
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button at bottom */}
      <div className="p-3 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
