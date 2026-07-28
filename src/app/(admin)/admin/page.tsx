'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, DollarSign, Activity, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { firestoreService } from '@/services/firebase/firestore.service';
import { strapi } from '@/lib/strapi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip } from 'recharts';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

/**
 * Trang Tổng Quan (Admin): Thống kê toàn hệ thống (tổng user, tổng doanh thu, khóa học mới).
 */
export default function AdminDashboardOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    revenue: 0,
    drafts: 0
  });
  
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Users from Firebase
        const users = await firestoreService.getDocuments('users');
        
        // 2. Fetch Enrollments for Revenue
        const enrollments = await firestoreService.getCollectionGroupDocuments<any>('enrollments');

        
        // 3. Fetch Courses & Categories from Strapi (with preview to include drafts)
        const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
        const [coursesRes, categoriesRes, pendingRes] = await Promise.all([
          strapi.findMany<any>('courses', { 
            pagination: { pageSize: 1000 }, 
            fields: ['slug', 'documentId', 'price'],
            publicationState: 'preview' 
          }, { token }),
          strapi.findMany<any>('categories', { populate: ['courses'] }),
          strapi.findMany<any>('courses', {
            pagination: { pageSize: 5 },
            populate: { instructor: { fields: ['name'] } },
            publicationState: 'preview',
          }, { token })
        ]);
        
        const coursesCount = coursesRes.meta?.pagination?.total || 0;
        const drafts = (pendingRes.data || []).filter((c: any) => !c.publishedAt);
        
        setPendingCourses(drafts.slice(0, 5));
        setRecentUsers(users.filter(u => (u as any).role !== 'admin').slice(0, 5));
        
        // Map courses to get prices
        const coursePriceMap = new Map();
        if (coursesRes.data) {
          coursesRes.data.forEach((c: any) => {
            coursePriceMap.set(c.slug, c.price || 0);
            coursePriceMap.set(c.documentId, c.price || 0);
          });
        }
        
        const totalRevenue = enrollments.reduce((acc, curr) => acc + (coursePriceMap.get(curr.courseId) || 0), 0);
        
        setStats({
          users: users.filter(u => (u as any).role !== 'admin').length,
          courses: coursesCount,
          revenue: totalRevenue,
          drafts: drafts.length
        });

        // 4. Process Category Data for Pie Chart
        if (categoriesRes.data) {
          const pieData = categoriesRes.data.map((cat: any) => ({
            name: cat.name,
            value: cat.courses?.length || 0
          })).filter((d: any) => d.value > 0);
          setCategoryData(pieData);
        }

        // 5. Build Revenue/Growth Chart data from enrollments grouped by month
        const now = new Date();
        const monthlyData: Record<string, { users: number; revenue: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
          monthlyData[key] = { users: 0, revenue: 0 };
        }
        enrollments.forEach((e: any) => {
          // Fallback to createdAt if enrolledAt is missing, but typically it is enrolledAt
          const timeVal = e.enrolledAt || e.createdAt;
          const ts = timeVal?.toDate?.() || (timeVal ? new Date(timeVal) : null);
          if (ts) {
            const key = `T${ts.getMonth() + 1}/${ts.getFullYear().toString().slice(2)}`;
            if (monthlyData[key]) {
              monthlyData[key].revenue += (coursePriceMap.get(e.courseId) || 0);
              monthlyData[key].users += 1;
            }
          }
        });
        setRevenueData(Object.entries(monthlyData).map(([name, val]) => ({ name, ...val })));

      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const statCards = [
    { title: 'Tổng Người dùng', value: stats.users.toLocaleString(), icon: Users, trend: 'Thành viên đăng ký', color: 'bg-blue-100 text-blue-600' },
    { title: 'Tổng Khóa học', value: stats.courses.toLocaleString(), icon: BookOpen, trend: 'Hệ thống Strapi', color: 'bg-purple-100 text-purple-600' },
    { title: 'Tổng Doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue), icon: DollarSign, trend: 'Firebase Enrollments', color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Chờ duyệt', value: stats.drafts.toLocaleString(), icon: Clock, trend: 'Khóa học nháp', color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thống kê toàn hệ thống</h1>
        <p className="text-muted-foreground">Theo dõi các chỉ số quan trọng của nền tảng.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icon className="w-16 h-16" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-border/50 shadow-sm p-4 h-[400px]">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Biểu đồ tăng trưởng doanh thu & người dùng</h3>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <LineTooltip wrapperClassName="rounded-xl shadow-lg border-0" />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (VNĐ)" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="users" name="Người dùng" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="col-span-1 border-border/50 shadow-sm p-4 h-[400px]">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Phân bổ khóa học theo danh mục</h3>
          <div className="w-full h-[320px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip wrapperClassName="rounded-xl shadow-lg border-0" />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Chưa có dữ liệu danh mục
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pending Courses + Recent Users */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Courses */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Khóa học chờ duyệt
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push('/admin/courses?filter=draft')}>
              Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingCourses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                Không có khóa học nào chờ duyệt!
              </div>
            ) : (
              pendingCourses.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.instructor?.name || 'Không rõ GV'}</div>
                  </div>
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Chờ duyệt
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Thành viên gần đây
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push('/admin/users')}>
              Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">Chưa có thành viên nào.</div>
            ) : (
              recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(u.name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.name || u.displayName || 'Không rõ tên'}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role === 'instructor' ? 'GV' : 'HV'}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
