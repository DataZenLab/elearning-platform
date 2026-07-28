'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users, BookOpen, TrendingUp } from 'lucide-react';
import { strapi } from '@/lib/strapi';
import type { Course } from '@/types';
import { useAuthStore } from '@/stores/auth-store';
import { enrollmentService } from '@/services/firebase/enrollment.service';
import { firestoreService } from '@/services/firebase/firestore.service';

interface CourseStats {
  id: string;
  documentId: string;
  title: string;
  slug: string;
  totalStudents: number;
  totalLessons: number;
}

interface StudentRow {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  courseTitle: string;
  courseSlug: string;
  completedLessons: number;
  totalLessons: number;
}

/**
 * Trang Quản Lý Học Viên (Giảng viên): Hiển thị thống kê học viên từ Strapi.
 * Do giới hạn Firestore rules, danh sách học viên chi tiết cần backend riêng.
 * Hiện tại hiển thị tổng số học viên theo từng khóa học từ Strapi.
 */
export default function InstructorStudentsPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [myStudents, setMyStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch all courses (including drafts) for this instructor from Strapi
        const res = await strapi.findMany<Course>('courses', {
          populate: ['lessons'],
          publicationState: 'preview',
          pagination: { pageSize: 100 },
        }, { cache: 'no-store' });

        const data: CourseStats[] = (res.data || []).map((c: any) => ({
          id: String(c.id),
          documentId: c.documentId || String(c.id),
          title: c.title,
          slug: c.slug,
          totalStudents: c.totalStudents || 0,
          totalLessons: Array.isArray(c.lessons) ? c.lessons.length : 0,
        }));

        setCourses(data);

        // Only admins can read other users' enrollments from Firestore.
        // Instructors rely on Strapi's totalStudents field instead.
        if (user?.role === 'admin') {
          try {
            const users = await firestoreService.getDocuments<any>('users');
            const rows: StudentRow[] = [];

            await Promise.all(
              users
                .filter((u: any) => u.role === 'student')
                .map(async (u: any) => {
                  try {
                    const enrollments = await firestoreService.getDocuments<any>(`users/${u.uid || u.id}/enrollments`);
                    for (const enroll of enrollments) {
                      const courseInfo = data.find(c => c.slug === enroll.courseId || c.documentId === enroll.courseId);
                      if (!courseInfo) continue;
                      const progress = await enrollmentService.getCourseProgress(u.uid || u.id, enroll.courseId);
                      rows.push({
                        uid: u.uid || u.id,
                        name: u.name || u.displayName || u.email,
                        email: u.email,
                        photoURL: u.photoURL,
                        courseTitle: courseInfo.title,
                        courseSlug: courseInfo.slug,
                        completedLessons: progress?.completedLessons?.length || 0,
                        totalLessons: courseInfo.totalLessons,
                      });
                    }
                  } catch {
                    // skip user
                  }
                })
            );

            setMyStudents(rows);
          } catch (err) {
            console.error('Admin Firebase read failed:', err);
          }
        }
        // Non-admin instructors: no Firebase reads — rely on Strapi totalStudents only
      } catch (err) {
        console.error('Error loading students data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  const totalStudents = courses.reduce((sum, c) => sum + c.totalStudents, 0);

  // If we have real Firebase rows, show them; otherwise show course-level stats
  const hasDetailedData = myStudents.length > 0;

  const filteredStudents = myStudents.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = myStudents.filter(
    s => s.totalLessons > 0 && s.completedLessons >= s.totalLessons
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Danh sách học viên</h1>
        <p className="text-muted-foreground">Quản lý và theo dõi tiến độ của học viên tham gia khóa học của bạn.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-4 border-border/50">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="text-xs text-muted-foreground">Tổng lượt đăng ký</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-border/50">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <span className="text-success text-xl">🎓</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">
              {hasDetailedData ? completedCount : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Học viên hoàn thành</div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm tên học viên hoặc khóa học..."
            className="pl-9 h-10 bg-background"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Detailed student rows (only visible when Firebase data is accessible) */}
      {hasDetailedData ? (
        <Card className="border-border/50 shadow-sm">
          <div className="p-4 border-b border-border/50 font-medium grid grid-cols-4 bg-muted/20 text-sm">
            <div className="col-span-2">Học viên</div>
            <div>Khóa học đăng ký</div>
            <div>Tiến độ</div>
          </div>
          <div className="divide-y divide-border/50">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {search ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có học viên đăng ký khóa học nào của bạn.'}
              </div>
            ) : (
              filteredStudents.map((student, idx) => {
                const progress = student.totalLessons > 0
                  ? Math.round((student.completedLessons / student.totalLessons) * 100)
                  : 0;
                return (
                  <div key={`${student.uid}-${student.courseSlug}-${idx}`} className="p-4 grid grid-cols-4 items-center gap-4 hover:bg-muted/10 transition-colors">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {student.photoURL ? (
                          <img src={student.photoURL} alt={student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          student.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{student.courseTitle}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
                        <div
                          className={`h-full rounded-full ${progress >= 100 ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${progress >= 100 ? 'text-success' : ''}`}>{progress}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      ) : (
        /* Fallback: Show per-course stats from Strapi when Firebase data isn't accessible */
        <Card className="border-border/50 shadow-sm">
          <div className="p-4 border-b border-border/50 bg-muted/20">
            <p className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Thống kê theo khóa học
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dữ liệu học viên chi tiết cần quyền Admin. Hiển thị tổng hợp từ hệ thống.
            </p>
          </div>
          <div className="divide-y divide-border/50">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {search ? 'Không tìm thấy khóa học phù hợp.' : 'Chưa có khóa học nào.'}
              </div>
            ) : (
              filteredCourses.map(course => (
                <div key={course.documentId} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{course.title}</div>
                      <div className="text-xs text-muted-foreground">{course.totalLessons} bài học</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-bold text-sm">{course.totalStudents.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">học viên</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
