'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { authService } from '@/services/firebase/auth.service';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.registerWithEmail({ displayName: fullName, email, password });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng ký</h1>
            <p className="text-muted-foreground text-sm">Bắt đầu hành trình học tập cùng hàng nghìn học viên.</p>
          </div>

          {isSuccess ? (
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">Kiểm tra email của bạn</h3>
              <p className="text-muted-foreground text-sm">
                Đăng ký thành công! Vui lòng kiểm tra hộp thư email (và mục Spam) để xác minh tài khoản của bạn trước khi đăng nhập.
              </p>
              <Button asChild className="w-full h-11 font-bold rounded-xl mt-6">
                <Link href="/login">Đi tới Đăng nhập</Link>
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-4 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Họ và tên
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      className="h-11"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
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
                    <label className="text-sm font-medium leading-none">
                      Mật khẩu
                    </label>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Xác nhận mật khẩu
                    </label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-11 font-semibold rounded-xl text-base transition-all">
                  {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-medium">Hoặc đăng ký bằng</span>
                  </div>
                </div>

                <SocialAuthButtons 
                  isLoading={isLoading} 
                  onLoadingChange={setIsLoading} 
                  onError={setError} 
                />
              </form>

              <p className="text-center text-sm text-muted-foreground pt-4">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Đăng nhập ngay
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-muted items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 max-w-lg p-12 text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center rotate-12">
            <GraduationCap className="w-12 h-12 text-primary -rotate-12" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Học hỏi, Trải nghiệm, <br/>Phát triển</h2>
          <p className="text-muted-foreground text-lg">Đăng ký ngay hôm nay để nhận các ưu đãi và bắt đầu lộ trình học tập được cá nhân hóa dành riêng cho bạn.</p>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
}
