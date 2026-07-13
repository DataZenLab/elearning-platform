'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Lock, Unlock, UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { firestoreService } from '@/services/firebase/firestore.service';
import { authService } from '@/services/firebase/auth.service';
import { useAuthStore } from '@/stores/auth-store';

interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'active' | 'locked';
}

/**
 * Trang Quản Lý Người Dùng (Admin): Xem, phân quyền hoặc khóa tài khoản user/giảng viên.
 */
export default function AdminUsersPage() {
  const { user: adminUser } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Create instructor form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getDocuments<UserProfile>('users');
      // Don't show admin account in the list
      setUsers(data.filter(u => u.role !== 'admin'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleLock = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    await firestoreService.updateDocument('users', userId, { status: newStatus });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!formData.name || !formData.email || !formData.password || !adminPassword) {
      setFormError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setFormLoading(true);
    try {
      await authService.createInstructorAccount(
        formData.email,
        formData.password,
        formData.name,
        adminUser!.email,
        adminPassword
      );
      setFormSuccess(`Đã tạo tài khoản giảng viên cho ${formData.name} thành công!`);
      setFormData({ name: '', email: '', password: '' });
      setAdminPassword('');
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setFormError(err.message || 'Tạo tài khoản thất bại.');
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h1>
          <p className="text-muted-foreground">Xem, phân quyền và khóa tài khoản người dùng trên hệ thống.</p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setFormError(''); setFormSuccess(''); }}
          className="rounded-xl gradient-primary border-0 text-white shadow-md font-semibold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tạo tài khoản Giảng viên
        </Button>
      </div>

      {/* Create Instructor Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 shadow-2xl border border-border/50 rounded-3xl space-y-5 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">Tạo tài khoản Giảng viên</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Chỉ Admin mới có quyền thực hiện thao tác này.
              </p>
            </div>

            {formError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl p-3">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-success/10 border border-success/30 text-success text-sm rounded-xl p-3">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateInstructor} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Họ và tên Giảng viên</label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email Giảng viên</label>
                <Input
                  type="email"
                  placeholder="instructor@elearning.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mật khẩu khởi tạo</label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    disabled={formLoading}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-2.5 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <label className="text-sm font-medium mb-1 block text-muted-foreground">
                  Xác nhận bằng mật khẩu Admin của bạn
                </label>
                <Input
                  type="password"
                  placeholder="Mật khẩu của Admin"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-xl gradient-primary border-0 text-white font-bold"
                >
                  {formLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          className="pl-9 h-10 bg-background"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Người dùng</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="bg-card hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{u.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'instructor'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {u.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleToggleLock(u.id, u.status)}
                          >
                            <Lock className="w-4 h-4 mr-1" /> Khóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-success hover:bg-success/10 border-success/20"
                            onClick={() => handleToggleLock(u.id, u.status)}
                          >
                            <Unlock className="w-4 h-4 mr-1" /> Mở khóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
