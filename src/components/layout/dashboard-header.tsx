'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Menu, Sun, Moon, LayoutDashboard, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { authService } from '@/services/firebase/auth.service';
import { cn } from '@/lib/utils';

/**
 * Thanh Header nằm ở phía trên cùng của khu vực Dashboard.
 */
export function DashboardHeader() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await authService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const getProfileLink = () => {
    if (user?.role === 'admin') return '/admin/profile';
    if (user?.role === 'instructor') return '/instructor/profile';
    return '/profile';
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'instructor') return '/instructor';
    return '/dashboard';
  };


  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            } />
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-xl font-bold tracking-tight hidden sm:block">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-lg hidden sm:flex"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
        </Button>

        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

        {/* User Profile with custom dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-muted/50 p-1.5 rounded-full transition-colors focus:outline-none"
          >
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-sm text-left">
              <p className="font-semibold leading-none mb-1">
                {user?.displayName || (user?.role === 'admin' ? 'Admin' : user?.role === 'instructor' ? 'Instructor' : 'Student')}
              </p>
              <p className="text-xs text-muted-foreground leading-none">
                {user?.role === 'admin' ? 'Admin' : user?.role === 'instructor' ? 'Instructor' : 'Student'}
              </p>
            </div>
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-[999] overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-sm font-semibold">{user?.displayName || 'Student'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { setOpen(false); router.push(getProfileLink()); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); router.push(getDashboardLink()); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  Dashboard
                </button>
              </div>

              <div className="border-t border-border/50 py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
