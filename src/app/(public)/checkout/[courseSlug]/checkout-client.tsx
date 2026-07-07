'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { enrollmentService } from '@/services/firebase/enrollment.service';
import type { Course } from '@/types';
import { Loader2, ShieldCheck, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CheckoutClientProps {
  course: Course;
}

export function CheckoutClient({ course }: CheckoutClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/checkout/' + course.slug);
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await enrollmentService.enrollUser(user.uid, course.slug);
      if (course.lessons && course.lessons.length > 0) {
        router.push(`/learn/${course.slug}/${course.lessons[0].slug}`);
      } else {
        router.push('/my-courses');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Hoàn tất đăng ký</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Kiểm tra lại thông tin và xác nhận để bắt đầu học ngay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Payment method */}
            <div className="border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Phương thức thanh toán
              </h2>
              <div className="flex items-start gap-3 p-4 border-2 border-primary/50 bg-primary/[0.03] rounded-lg">
                <div className="w-4 h-4 rounded-full border-[3px] border-primary bg-background mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Thanh toán giả lập (Demo)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Không trừ tiền thật. Đăng ký thành công ngay lập tức.
                  </p>
                </div>
              </div>
            </div>

            {/* User info */}
            <div className="border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Thông tin học viên
              </h2>
              {user ? (
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-warning bg-warning/10 p-4 rounded-lg border border-warning/20">
                  Vui lòng{' '}
                  <Link href="/login" className="font-semibold underline underline-offset-2 hover:text-warning/80">
                    đăng nhập
                  </Link>{' '}
                  để tiến hành thanh toán.
                </div>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-xl p-5 sticky top-24">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Tóm tắt đơn hàng
              </h2>

              {/* Course preview */}
              <div className="flex gap-3 mb-5 pb-5 border-b border-border">
                <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail.url} alt={course.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{course.instructor?.name || 'Giảng viên'}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Giá gốc</span>
                  <span className="line-through">{formatPrice(course.originalPrice || course.price)}</span>
                </div>
                <div className="flex justify-between font-medium text-foreground">
                  <span>Giá bán</span>
                  <span>{formatPrice(course.price)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-border mb-5">
                <span className="text-sm font-semibold text-foreground">Tổng cộng</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(course.price)}</span>
              </div>

              <Button
                className="w-full h-11 font-semibold rounded-lg"
                onClick={handleCheckout}
                disabled={isProcessing || !user}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : !user ? (
                  'Đăng nhập để thanh toán'
                ) : (
                  'Xác nhận & Vào học'
                )}
              </Button>

              {error && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Thanh toán an toàn với mã hóa SSL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
