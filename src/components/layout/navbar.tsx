'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { NAV_LINKS, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — clean, no gradient, no pulse dot */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive 
                      ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-lg"
                aria-label="Chuyển chủ đề"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            )}

            {mounted && isAuthenticated && user ? (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/dashboard">
                  <Button size="sm" className="h-9 px-4 text-sm font-medium rounded-lg">
                    Bảng điều khiển
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Avatar className="w-8 h-8 border border-border cursor-pointer">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : mounted ? (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9 px-4 text-sm font-medium rounded-lg">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="h-9 px-5 text-sm font-medium rounded-lg">
                    Bắt đầu học
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-lg"
                aria-label="Chuyển chủ đề"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" />}
              >
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle className="sr-only">Điều hướng</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-5 border-b border-border">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-base">{APP_NAME}</span>
                  </div>

                  <nav className="flex-1 py-4 px-3">
                    <div className="space-y-0.5">
                      {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  <div className="p-4 border-t border-border space-y-2">
                    {isAuthenticated ? (
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full rounded-lg font-medium">
                          Bảng điều khiển
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full rounded-lg font-medium">
                            Đăng nhập
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full rounded-lg font-medium">
                            Bắt đầu học miễn phí
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
