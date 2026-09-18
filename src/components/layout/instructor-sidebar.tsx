'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { authService } from '@/services/firebase/auth.service';
import { Button } from '@/components/ui/button';

const SIDEBAR_LINKS = [
  { href: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/instructor/courses', label: 'Courses Studio', icon: BookOpen },
  { href: '/instructor/students', label: 'Students', icon: Users },
  { href: '/instructor/comments', label: 'Q&A & Discussion', icon: MessageSquare },
  { href: '/instructor/profile', label: 'Instructor Profile', icon: Settings },
];

/**
 * Thanh Menu điều hướng bên trái dành riêng cho khu vực Giảng viên.
 */
export function InstructorSidebar() {
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
    <div className="flex flex-col h-full bg-card border-r border-border/50 shadow-sm">
      <div className="p-6">
        <Link href="/instructor" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Instructor Panel</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Teaching Studio
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
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-sm">
          <p className="font-semibold text-primary mb-1">Instructor Hub</p>
          <p className="text-muted-foreground text-xs">Connect with fellow educators and share teaching insights.</p>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" /> Sign Out</Button>
      </div>
    </div>
  );
}
