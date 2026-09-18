'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

const stats = [
  { value: '50K+', label: 'Active Learners' },
  { value: '500+', label: 'Courses' },
  { value: '4.8', label: 'Average Rating' },
  { value: '98%', label: 'Satisfaction' },
];

/**
 * Banner giới thiệu chính (Hero Banner) lớn nhất nằm ở đầu trang chủ.
 */
export function HeroSection() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-background">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Single, intentional accent — top-left */}
      <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-primary/[0.07] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/3 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase">
              <span className="w-6 h-px bg-primary" />
              Enterprise E-Learning Platform
            </span>
          </motion.div>

          {/* Heading — large, tight, editorial */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]"
          >
            Học đúng thứ.{' '}
            <span className="text-primary">Phát triển nhanh.</span>
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl"
          >
            From software architecture to UI/UX, cloud systems to AI engineering — master high-impact skills with industry leaders.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/courses">
              <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-lg group">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            {mounted && isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base font-semibold rounded-lg border-border hover:bg-muted"
                >
                  Vào bảng điều khiển
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base font-semibold rounded-lg border-border hover:bg-muted"
                >
                  Đăng ký miễn phí
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Social proof bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-10 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
