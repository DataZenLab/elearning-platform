'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileBarChart,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { authService } from '@/services/firebase/auth.service';
import { Button } from '@/components/ui/button';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
  { href: '/admin/courses', label: 'Quản lý Khóa học', icon: BookOpen },
  { href: '/admin/reports', label: 'Báo cáo & Thống kê', icon: FileBarChart },
  { href: '/admin/profile', label: 'Cài đặt cá nhân', icon: Settings },
];

/**
 * Thanh Menu điều hướng bên trái dành riêng cho trang quản trị (Admin).
 */
export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-50 border-r border-slate-800 shadow-xl">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Admin Portal</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Super Admin
        </div>
        {SIDEBAR_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-400")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-sm">
          <p className="font-semibold text-indigo-400 mb-1">{APP_NAME} Admin</p>
          <p className="text-slate-500 text-xs">Hệ thống quản trị cấp cao nhất.</p>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
