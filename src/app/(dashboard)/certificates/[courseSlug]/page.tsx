'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, Download, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { enrollmentService } from '@/services/firebase/enrollment.service';
import { coursesApi } from '@/services/api/courses.api';
import type { Course } from '@/types';
import Link from 'next/link';

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const courseSlug = (params.courseSlug || params.courseId) as string;

  useEffect(() => {
    if (!courseSlug || !user?.uid) return;

    async function load() {
      setIsLoading(true);
      try {
        const [courseData, prog] = await Promise.all([
          coursesApi.getCourseBySlug(courseSlug),
          enrollmentService.getCourseProgress(user!.uid, courseSlug),
        ]);

        if (!courseData) { router.push('/certificates'); return; }
        setCourse(courseData);
        setProgress(prog);

        const totalLessons = courseData.lessons?.length ?? 0;
        const completed = prog?.completedLessons?.length ?? 0;
        setIsEligible(totalLessons > 0 && completed >= totalLessons);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseSlug, user?.uid, router]);

  const handlePrint = () => window.print();

  const completionDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-4">
        <div className="w-16 h-16 rounded-lg bg-warning/10 flex items-center justify-center">
          <Award className="w-8 h-8 text-warning" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chưa đủ điều kiện</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Bạn cần hoàn thành 100% bài học trong khóa học <strong>{course?.title}</strong> để nhận chứng chỉ.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tiến độ: {progress?.completedLessons?.length ?? 0} / {course?.lessons?.length ?? 0} bài học
          </p>
        </div>
        <Link href={`/learn/${courseSlug}`}>
          <Button className="rounded-lg h-11 font-semibold px-6">
            Tiếp tục học
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/certificates">
          <Button variant="ghost" className="gap-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
        </Link>
        <Button
          onClick={handlePrint}
          className="rounded-lg gap-2 font-semibold"
        >
          <Download className="w-4 h-4" /> In / Tải PDF
        </Button>
      </div>

      {/* Certificate */}
      <motion.div
        ref={certRef}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-3xl mx-auto"
      >
        <div
          className="relative bg-card border-[4px] border-border rounded-2xl overflow-hidden shadow-lg"
          id="certificate-print"
        >
          <div className="px-10 py-12 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-semibold">
                EduFlow — Nền tảng học trực tuyến
              </p>
              <h1 className="text-4xl font-bold mt-3 text-foreground">
                CHỨNG CHỈ HOÀN THÀNH
              </h1>
            </div>

            {/* Stars divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Chứng nhận học viên</p>
              <p className="text-4xl font-bold text-foreground tracking-tight">
                {user?.displayName || user?.email?.split('@')[0] || 'Học viên'}
              </p>
            </div>

            <p className="text-muted-foreground text-sm">đã hoàn thành xuất sắc khóa học</p>

            {/* Course name */}
            <div className="bg-primary/5 rounded-xl px-6 py-4 border border-primary/20 max-w-lg mx-auto">
              <p className="text-xl font-bold text-primary leading-snug">{course?.title}</p>
              {course?.instructor?.name && (
                <p className="text-sm text-muted-foreground mt-2">
                  Giảng viên: <span className="font-medium text-foreground">{course.instructor.name}</span>
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-10">
              {[
                { label: 'Bài học', value: `${course?.lessons?.length ?? 0}` },
                { label: 'Thời lượng', value: `${Math.round((course?.duration ?? 0) / 60)}h` },
                { label: 'Trình độ', value: course?.difficulty === 'beginner' ? 'Cơ bản' : course?.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="h-px bg-border max-w-md mx-auto" />

            {/* Date + ID */}
            <div className="flex items-center justify-between text-sm text-muted-foreground max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Hoàn thành ngày {completionDate}</span>
              </div>
              <div className="text-xs">
                ID: {user?.uid?.slice(0, 8).toUpperCase() ?? 'XXXXXXXX'}-{courseSlug?.slice(0, 5).toUpperCase()}
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-center gap-16 pt-6">
              <div className="text-center">
                <div className="h-px w-32 bg-border mb-2" />
                <p className="text-xs text-muted-foreground">Giám đốc học thuật</p>
                <p className="text-sm font-semibold text-foreground mt-1">EduFlow</p>
              </div>
              <div className="text-center">
                <div className="h-px w-32 bg-border mb-2" />
                <p className="text-xs text-muted-foreground">Giảng viên</p>
                <p className="text-sm font-semibold text-foreground mt-1">{course?.instructor?.name || 'EduFlow'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}
