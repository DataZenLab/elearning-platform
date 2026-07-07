'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const revenueData = [
  { name: 'T2', value: 2000000 },
  { name: 'T3', value: 3500000 },
  { name: 'T4', value: 1500000 },
  { name: 'T5', value: 5000000 },
  { name: 'T6', value: 4200000 },
  { name: 'T7', value: 7000000 },
  { name: 'CN', value: 8500000 },
];

const studentsData = [
  { name: 'Khóa React', students: 120 },
  { name: 'Khóa Node.js', students: 85 },
  { name: 'Khóa UI/UX', students: 45 },
  { name: 'Khóa Python', students: 210 },
];

export default function InstructorDashboardOverview() {
  const { user } = useAuthStore();

  const stats = [
    { title: 'Tổng số học viên', value: '1,248', icon: Users, trend: '+12% so với tháng trước' },
    { title: 'Khóa học đang mở', value: '4', icon: BookOpen, trend: '+1 khóa mới' },
    { title: 'Doanh thu ước tính', value: '15,000,000đ', icon: DollarSign, trend: '+5% so với tháng trước' },
    { title: 'Đánh giá trung bình', value: '4.8', icon: Star, trend: 'Từ 150 lượt đánh giá' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chào mừng trở lại, {user?.displayName || 'Giảng viên'}!</h1>
        <p className="text-muted-foreground">Dưới đây là tổng quan về hoạt động giảng dạy của bạn.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border p-6">
          <h3 className="font-semibold mb-4">Biểu đồ doanh thu 7 ngày qua</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  formatter={(val) => [`${Number(val).toLocaleString()}đ`, 'Doanh thu']}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border p-6">
          <h3 className="font-semibold mb-4">Học viên theo khóa học</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  formatter={(val) => [`${val} học viên`, 'Số lượng']}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
