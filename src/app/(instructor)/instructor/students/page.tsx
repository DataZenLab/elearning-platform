'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { firestoreService } from '@/services/firebase/firestore.service';
import { strapi } from '@/lib/strapi';
import type { Course } from '@/types';

interface StudentEnrollment {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  courseTitle: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        
        // Get all courses from Strapi
        const coursesRes = await strapi.findMany<Course>('courses', {
          populate: ['lessons'],
          publicationState: 'preview',
          pagination: { pageSize: 100 },
        }, { cache: 'no-store' });
        const courses = coursesRes.data || [];

        // Build a map: courseId -> { title, lessonCount }
        const courseMap: Record<string, { title: string; lessonCount: number }> = {};
        courses.forEach(c => {
          const docId = (c as any).documentId || String(c.id);
          courseMap[docId] = {
            title: c.title,
            lessonCount: Array.isArray((c as any).lessons) ? (c as any).lessons.length : 0,
          };
        });

        // Get all user docs from Firestore
        const users = await firestoreService.getDocuments<any>('users');
        const enrolledList: StudentEnrollment[] = [];

        // For each user, get their enrollments
        await Promise.all(users.filter(u => u.role === 'student').map(async (u) => {
          try {
            const enrollments = await firestoreService.getDocuments<any>(`users/${u.uid}/enrollments`);
            for (const enroll of enrollments) {
              const progress = await firestoreService.getDocument<any>('users', `${u.uid}/progress/${enroll.courseId}`).catch(() => null);
              const courseInfo = courseMap[enroll.courseId];
              if (courseInfo) {
                enrolledList.push({
                  uid: u.uid,
                  name: u.name || u.email,
                  email: u.email,
                  photoURL: u.photoURL,
                  courseTitle: courseInfo.title,
                  courseId: enroll.courseId,
                  completedLessons: progress?.completedLessons?.length || 0,
                  totalLessons: courseInfo.lessonCount,
                });
              }
            }
          } catch {
            // Skip user if error fetching enrollments
          }
        }));

        setStudents(enrolledList);
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="text-2xl font-bold">{students.length}</div>
            <div className="text-xs text-muted-foreground">Tổng lượt đăng ký</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-border/50">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <span className="text-success text-xl">🎓</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">
              {students.filter(s => s.totalLessons > 0 && s.completedLessons >= s.totalLessons).length}
            </div>
            <div className="text-xs text-muted-foreground">Học viên hoàn thành</div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Tìm tên học viên hoặc khóa học..." className="pl-9 h-10 bg-background"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 font-medium grid grid-cols-4 bg-muted/20 text-sm">
          <div className="col-span-2">Học viên</div>
          <div>Khóa học đăng ký</div>
          <div>Tiến độ</div>
        </div>
        <div className="divide-y divide-border/50">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có học viên đăng ký khóa học nào của bạn.'}
            </div>
          ) : (
            filtered.map((student, idx) => {
              const progress = student.totalLessons > 0
                ? Math.round((student.completedLessons / student.totalLessons) * 100)
                : 0;
              return (
                <div key={`${student.uid}-${student.courseId}-${idx}`} className="p-4 grid grid-cols-4 items-center gap-4 hover:bg-muted/10 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.uid}`} alt={student.name} />
                      <AvatarFallback>{student.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
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
    </div>
  );
}
