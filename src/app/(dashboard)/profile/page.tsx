'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUpload } from '@/components/shared/avatar-upload';
import { firestoreService } from '@/services/firebase/firestore.service';
import { auth } from '@/lib/firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useEnrollments } from '@/hooks/use-enrollments';
import { formatPrice } from '@/lib/utils';
import { History, User as UserIcon, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Trang Hồ Sơ Cá Nhân: Nơi người dùng chỉnh sửa thông tin (Tên, Ảnh đại diện, Mật khẩu).
 */
export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    bio: '',
  });
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [activeTab, setActiveTab] = useState<'profile' | 'transactions'>('profile');
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useEnrollments();

  // Load phone/bio from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    firestoreService.getDocument('users', user.uid).then((data: any) => {
      if (data) {
        setFormData(prev => ({
          ...prev,
          phone: data.phone || '',
          bio: data.bio || '',
          name: data.name || prev.name,
        }));
      }
    });
  }, [user?.uid]);

  const handleUpdateAvatar = (url: string) => {
    if (user) setUser({ ...user, avatarUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(auth.currentUser, { displayName: formData.name });
      await firestoreService.updateDocument('users', user.uid, {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      });
      setUser({ ...user, displayName: formData.name });
      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user?.email) return;
    setPwdError('');
    setPwdSuccess('');

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('Mật khẩu mới không khớp.');
      return;
    }
    if (pwdData.newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsPwdLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwdData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, pwdData.newPassword);
      setPwdSuccess('Đổi mật khẩu thành công!');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPwdError('Mật khẩu hiện tại không đúng.');
      } else {
        setPwdError(err.message || 'Đổi mật khẩu thất bại. Hãy thử lại.');
      }
    } finally {
      setIsPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Quản lý thông tin tài khoản và lịch sử giao dịch.
        </p>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <UserIcon className="w-4 h-4" />
          Hồ sơ cá nhân
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
            activeTab === 'transactions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <History className="w-4 h-4" />
          Lịch sử giao dịch
        </button>
      </div>

      {error && <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20">{error}</div>}
      {success && <div className="text-sm text-success bg-success/10 px-4 py-3 rounded-xl border border-success/20">{success}</div>}

      {activeTab === 'profile' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
            <CardDescription>
              Ảnh đại diện sẽ được hiển thị công khai trên hồ sơ và các bình luận của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <AvatarUpload
                userId={user.uid}
                userName={user.displayName}
                currentUrl={user.avatarUrl}
                onUploadSuccess={handleUpdateAvatar}
              />
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Họ và tên</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                  <p className="text-[10px] text-muted-foreground">Email không thể thay đổi.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="09xx xxx xxx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Giới thiệu ngắn (Bio)</label>
                <textarea
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Giới thiệu một chút về bản thân bạn..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setFormData({ name: user?.displayName || '', phone: '', bio: '' })}>Hủy thay đổi</Button>
            <Button type="submit" disabled={isLoading} className="gradient-primary text-white border-0 shadow-md">
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>

        {/* Password Change Section */}
        <form onSubmit={handleChangePassword}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Để bảo mật, hãy sử dụng mật khẩu mạnh có ít nhất 6 ký tự.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pwdError && <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20">{pwdError}</div>}
              {pwdSuccess && <div className="text-sm text-success bg-success/10 px-4 py-2 rounded-lg border border-success/20">{pwdSuccess}</div>}

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                <Input
                  type="password"
                  value={pwdData.currentPassword}
                  onChange={(e) => setPwdData({...pwdData, currentPassword: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu mới</label>
                  <Input
                    type="password"
                    value={pwdData.newPassword}
                    onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                  <Input
                    type="password"
                    value={pwdData.confirmPassword}
                    onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPwdLoading} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  {isPwdLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-primary" />
                Lịch sử đăng ký khóa học
              </CardTitle>
              <CardDescription>Danh sách các khóa học bạn đã thanh toán và tham gia.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isEnrollmentsLoading ? (
                <div className="p-8 flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className="p-12 flex flex-col items-center text-center text-muted-foreground gap-3">
                  <ReceiptText className="w-12 h-12 opacity-20" />
                  <p>Bạn chưa có giao dịch nào.</p>
                  <Link href="/courses">
                    <Button variant="outline" size="sm" className="mt-2 rounded-xl">Khám phá khóa học</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/20 uppercase border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Khóa học</th>
                        <th className="px-6 py-4 font-medium">Ngày đăng ký</th>
                        <th className="px-6 py-4 font-medium">Trạng thái</th>
                        <th className="px-6 py-4 font-medium text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {enrollments.sort((a, b) => {
                        const dateA = a.enrollment.enrolledAt?.toDate?.() || new Date(a.enrollment.enrolledAt || 0);
                        const dateB = b.enrollment.enrolledAt?.toDate?.() || new Date(b.enrollment.enrolledAt || 0);
                        return dateB.getTime() - dateA.getTime();
                      }).map((item, index) => {
                        const date = item.enrollment.enrolledAt?.toDate?.() || new Date(item.enrollment.enrolledAt || 0);
                        return (
                          <tr key={index} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">
                              {item.course?.title || `Khóa học chưa xác định (${item.enrollment.courseId})`}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                                Thành công
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-foreground">
                              {item.course ? formatPrice(item.course.price) : '---'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
