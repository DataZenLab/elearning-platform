'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, ArrowLeft, MailCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { authService } from '@/services/firebase/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess('Liên kết khôi phục mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (và mục Spam).');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-card p-8 sm:p-10 rounded-3xl shadow-xl border border-border/50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-tr-full blur-2xl" />

        <div className="text-center relative z-10">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Quên mật khẩu?</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để khôi phục mật khẩu.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg p-3 relative z-10 text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <MailCheck className="w-8 h-8 text-success" />
            </div>
            <p className="text-sm font-medium text-success">{success}</p>
            <Link href="/login" className="w-full mt-4">
              <Button className="w-full h-11 font-bold rounded-xl gradient-primary border-0 text-white shadow-md hover:shadow-lg transition-all">
                Trở lại đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="mt-1.5 bg-background h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 font-bold rounded-xl gradient-primary border-0 text-white shadow-md hover:shadow-lg transition-all">
              {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
            </Button>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
