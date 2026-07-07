'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
  BookOpen, Trophy, Clock, CheckCircle2, PlayCircle,
  TrendingUp, Flame, Star, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useEnrollments } from '@/hooks/use-enrollments';
import { formatDuration } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favorites-store';
import { coursesApi } from '@/services/api/courses.api';
import { CourseGrid } from '@/components/course/course-grid';
import { useState } from 'react';
import type { CourseCard } from '@/types';

// Build 7-day learning chart from progress timestamps
function buildWeeklyChart(allProgress: any[]) {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const today = new Date();
  return days.map((day, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    // Count lessons whose lastAccessedAt date matches this day
    const count = allProgress.filter(p => {
      if (!p.progress?.lastAccessedAt) return false;
      const accessed = p.progress.lastAccessedAt?.toDate?.()
        ?? new Date(p.progress.lastAccessedAt);
      return accessed.toDateString() === d.toDateString();
    }).length;
    return { day, baiHoc: count };
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: enrollments, isLoading } = useEnrollments();
  const { favoriteSlugs } = useFavoritesStore();
  const [favoriteCourses, setFavoriteCourses] = useState<CourseCard[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') router.replace('/admin');
    else if (user?.role === 'instructor') router.replace('/instructor');
  }, [user, router]);

  useEffect(() => {
    async function fetchFavorites() {
      if (favoriteSlugs.length === 0) {
        setFavoriteCourses([]);
        return;
      }
      setIsLoadingFavorites(true);
      try {
        const promises = favoriteSlugs.map(slug => coursesApi.getCourseBySlug(slug));
        const results = await Promise.all(promises);
        const validCourses = results.filter((c): c is NonNullable<typeof c> => c !== null);
        setFavoriteCourses(validCourses as unknown as CourseCard[]);
      } catch (error) {
        console.error('Failed to fetch favorite courses', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    }
    fetchFavorites();
  }, [favoriteSlugs]);

  // Derived stats
  const totalEnrolled = enrollments.length;
  const inProgress = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
  const completed = enrollments.filter(e => e.progressPercent === 100).length;
  const totalLessonsCompleted = enrollments.reduce(
    (acc, e) => acc + (e.progress?.completedLessons?.length ?? 0), 0
  );

  const weeklyData = buildWeeklyChart(enrollments);

  // Sort by last accessed for "recent activity"
  const recentActivity = [...enrollments]
    .filter(e => e.progress?.lastAccessedAt)
    .sort((a, b) => {
      const aDate = a.progress?.lastAccessedAt?.toDate?.() ?? new Date(a.progress?.lastAccessedAt ?? 0);
      const bDate = b.progress?.lastAccessedAt?.toDate?.() ?? new Date(b.progress?.lastAccessedAt ?? 0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 5);

  // Top courses by progress for bar chart
  const progressChartData = enrollments
    .filter(e => e.course)
    .slice(0, 5)
    .map(e => ({
      name: e.course!.title.length > 20
        ? e.course!.title.slice(0, 20) + '…'
        : e.course!.title,
      tienDo: e.progressPercent,
    }));

  const stats = [
    {
      title: 'Đang học',
      value: isLoading ? '…' : inProgress.toString(),
      description: 'Khóa học chưa hoàn thành',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Đã hoàn thành',
      value: isLoading ? '…' : completed.toString(),
      description: 'Khóa học hoàn chỉnh',
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Bài đã học',
      value: isLoading ? '…' : totalLessonsCompleted.toString(),
      description: 'Tổng số bài đã hoàn thành',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Điểm tích lũy',
      value: user?.points?.toString() ?? '0',
      description: 'EduFlow points',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Xin chào, {user?.displayName || 'bạn'}
        </h1>
        <p className="text-muted-foreground">
          {totalEnrolled > 0
            ? `Bạn đang theo học ${totalEnrolled} khóa học. Tiếp tục cố lên nhé!`
            : 'Hôm nay bạn muốn học gì nào? Hãy bắt đầu hành trình học tập của bạn.'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Area Chart: 7-day activity */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Hoạt động học tập 7 ngày qua
                </CardTitle>
                <Badge variant="outline" className="text-xs rounded-full">
                  {totalLessonsCompleted} bài đã học
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[260px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : weeklyData.every(d => d.baiHoc === 0) ? (
                <div className="h-[260px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <TrendingUp className="w-12 h-12 opacity-20" />
                  <p className="text-sm text-center">
                    Chưa có dữ liệu học tập tuần này.<br />
                    Hãy bắt đầu học để xem biểu đồ tiến độ!
                  </p>
                  <Link href="/courses">
                    <Button size="sm" className="rounded-lg">
                      Khám phá khóa học
                    </Button>
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBaiHoc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '13px',
                      }}
                      formatter={(val) => [`${val ?? 0} bài học`, 'Hoạt động']}
                    />
                    <Area
                      type="monotone"
                      dataKey="baiHoc"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#colorBaiHoc)"
                      dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div
          className="lg:col-span-3 flex flex-col gap-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Progress Bar Chart per course */}
          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Tiến độ theo khóa học
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-muted/60 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : progressChartData.length === 0 ? (
                <div className="h-[160px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <BookOpen className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Chưa có khóa học nào</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={progressChartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`${val ?? 0}%`, 'Tiến độ']}
                    />
                    <Bar dataKey="tienDo" radius={[0, 6, 6, 0]}>
                      {progressChartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Học gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-muted/60 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-6 flex flex-col items-center text-muted-foreground gap-2">
                  <BookOpen className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((item, i) => {
                    if (!item.course) return null;
                    const lastAccessed = item.progress?.lastAccessedAt?.toDate?.()
                      ?? new Date(item.progress?.lastAccessedAt ?? 0);
                    const timeAgo = formatTimeAgo(lastAccessed);
                    const currentLessonId = item.progress?.currentLessonId;
                    const matchedLesson = item.course.lessons?.find(l => l.id.toString() === currentLessonId);
                    const currentSlug = matchedLesson?.slug || item.course.lessons?.[0]?.slug;
                    const href = currentSlug
                      ? `/learn/${item.course.slug}/${currentSlug}`
                      : `/courses/${item.course.slug}`;

                    return (
                      <Link key={i} href={href} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group">
                        <div
                          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: item.course.category?.color || '#6366f1' }}
                        >
                          {item.course.title.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {item.course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-primary font-semibold">{item.progressPercent}%</span>
                          <PlayCircle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Course Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="pt-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <h3 className="text-xl font-bold tracking-tight">Đánh giá khóa học của bạn</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Mock reviews */}
          {[
            { course: "Web Development Masterclass - Cấp độ 1", rating: 5, comment: "Khóa học cực kỳ chi tiết, giảng viên hỗ trợ rất nhiệt tình. Rất đáng tiền!", time: "2 ngày trước" },
            { course: "Mobile App Masterclass - Cấp độ 2", rating: 4, comment: "Nội dung tốt nhưng bài tập hơi khó. Cần thêm ví dụ minh họa.", time: "1 tuần trước" }
          ].map((review, i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{review.time}</span>
                </div>
                <h4 className="text-sm font-semibold mb-2 line-clamp-1">{review.course}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">"{review.comment}"</p>
                <div className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-lg">Chỉnh sửa đánh giá</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Favorite Courses */}
      {favoriteCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold tracking-tight">Khóa học yêu thích của bạn</h3>
          </div>
          {isLoadingFavorites ? (
            <div className="flex h-[200px] items-center justify-center border rounded-xl bg-card">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CourseGrid courses={favoriteCourses} isLoading={false} skeletonCount={4} />
          )}
        </motion.div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
