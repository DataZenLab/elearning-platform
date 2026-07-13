'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Khu vực Call-to-action (Kêu gọi hành động) chốt sale trên trang chủ.
 */
export function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
        >
          {/* Left copy */}
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
              <span className="w-6 h-px bg-primary" />
              Bắt đầu ngay hôm nay
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Sẵn sàng để bước lên một tầm cao mới?
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Tham gia hơn 50,000 học viên đang xây dựng sự nghiệp với EduFlow. Không cần thẻ tín dụng — dùng thử miễn phí 7 ngày.
            </p>
          </div>

          {/* Right actions — stacked for emphasis */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end flex-shrink-0">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 font-semibold rounded-lg w-full sm:w-auto group">
                Đăng ký miễn phí
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 font-semibold rounded-lg border-border hover:bg-muted w-full sm:w-auto"
              >
                Xem khóa học
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
