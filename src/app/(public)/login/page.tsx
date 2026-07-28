'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { authService } from '@/services/firebase/auth.service';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const errorParam = searchParams.get('error');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    errorParam === 'locked' ? 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const { handleRedirect } = useAuthRedirect();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const firebaseUser = await authService.loginWithEmail({ email, password });
      await handleRedirect(firebaseUser, redirectUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerLink = `/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h1>
        <p className="text-muted-foreground text-sm">Chào mừng bạn quay lại! Vui lòng điền thông tin để tiếp tục.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-4 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Email
            </label>
            <Input 
              type="email" 
              placeholder="name@example.com" 
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none">
                Mật khẩu
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-11 font-semibold rounded-xl text-base transition-all">
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-medium">Hoặc tiếp tục với</span>
          </div>
        </div>

        <SocialAuthButtons 
          isLoading={isLoading} 
          onLoadingChange={setIsLoading} 
          onError={setError}
          redirectUrl={redirectUrl}
        />
      </form>

      <p className="text-center text-sm text-muted-foreground pt-4">
        Chưa có tài khoản?{' '}
        <Link href={registerLink} className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

/**
 * Trang Đăng Nhập: Form đăng nhập vào hệ thống bằng Email hoặc Google.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background">
        <Suspense fallback={<div className="w-full flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-muted items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 max-w-lg p-12 text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center rotate-12">
            <GraduationCap className="w-12 h-12 text-primary -rotate-12" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Mở rộng kiến thức, <br/>Nâng tầm bản thân</h2>
          <p className="text-muted-foreground text-lg">Tham gia cộng đồng học tập trực tuyến với hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu.</p>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
}
