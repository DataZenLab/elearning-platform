'use client';

import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration, getCourseImage } from "@/lib/utils";
import { PlayCircle, Infinity, FileText, Smartphone, Trophy } from "lucide-react";
import type { Course } from "@/types";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { enrollmentService } from "@/services/firebase/enrollment.service";
import { useState, useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites-store";

interface StickySidebarProps {
  course: Course;
}

/**
 * Thanh Sidebar cố định bên phải (hiển thị giá, nút Đăng ký học) trượt theo khi cuộn trang.
 */
export function StickySidebar({ course }: StickySidebarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const currentUserId = user?.uid || 'guest';
  const favorite = isFavorite(course.slug || '', currentUserId);
  const imageUrl = getCourseImage(course);

  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Check if user is author or enrolled
  const isAuthor = !!(user && course.instructor && typeof course.instructor === 'object'
    && 'email' in course.instructor && (course.instructor as any).email === user.email);

  useEffect(() => {
    if (!user) {
      setIsLoadingStatus(false);
      setIsEnrolled(false);
      return;
    }
    setIsLoadingStatus(true);
    enrollmentService.checkEnrollment(user.uid, course.slug || '').then((enrolled) => {
      setIsEnrolled(enrolled);
      setIsLoadingStatus(false);
    }).catch(() => {
      setIsLoadingStatus(false);
    });
  }, [user, course.slug]);

  const handleEnrollOrStudy = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    if (isAuthor) {
      const firstLessonSlug = course.lessons?.[0]?.slug;
      router.push(firstLessonSlug ? `/learn/${course.slug}/${firstLessonSlug}` : `/learn/${course.slug}`);
      return;
    }

    if (isEnrolled) {
      const firstLessonSlug = course.lessons?.[0]?.slug;
      router.push(firstLessonSlug ? `/learn/${course.slug}/${firstLessonSlug}` : `/learn/${course.slug}`);
      return;
    }

    if (course.price === 0) {
      try {
        setEnrolling(true);
        await enrollmentService.enrollUser(user.uid, course.slug || '');
        const firstLessonSlug = course.lessons?.[0]?.slug;
        router.push(firstLessonSlug ? `/learn/${course.slug}/${firstLessonSlug}` : `/learn/${course.slug}`);
      } catch (err) {
        console.error('Enroll error:', err);
      } finally {
        setEnrolling(false);
      }
    } else {
      router.push(`/checkout/${course.slug}`);
    }
  };

  return (
    <div className="sticky top-24 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      {/* Video Preview Area */}
      <div className="aspect-video bg-slate-900 relative group cursor-pointer border-b border-border/50" onClick={handleEnrollOrStudy}>
        <img 
          src={imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity duration-300" 
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg border border-white/30">
            <PlayCircle className="w-8 h-8 text-white fill-white/20" />
          </div>
          <span className="text-white font-medium mt-3 drop-shadow-md">Xem trước khóa học</span>
        </div>
      </div>

      <div className="p-6">
        {/* Pricing */}
        <div className="flex items-end gap-3 mb-6">
          <span className="text-3xl font-bold text-foreground">
            {course.price === 0 ? 'Miễn phí' : formatPrice(course.price)}
          </span>
          {course.originalPrice && course.price > 0 && (
            <span className="text-lg text-muted-foreground line-through mb-1">
              {formatPrice(course.originalPrice)}
            </span>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            onClick={handleEnrollOrStudy}
            disabled={(isLoadingStatus || enrolling) && !isAuthor}
            className="w-full h-11 font-semibold rounded-lg"
          >
            {isAuthor
              ? 'Xem trước khóa học'
              : isLoadingStatus
              ? 'Đang tải...'
              : enrolling
              ? 'Đang đăng ký...'
              : isEnrolled
              ? 'Vào học ngay'
              : 'Đăng ký học ngay'}
          </Button>
          <Button
            variant={favorite ? 'secondary' : 'outline'}
            className="w-full h-11 font-medium rounded-lg"
            onClick={() => toggleFavorite(course.slug || '', currentUserId)}
          >
            {favorite ? 'Đã yêu thích ❤️' : 'Thêm vào yêu thích'}
          </Button>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Khóa học bao gồm:</h4>
          <ul className="space-y-3 text-sm text-foreground">
            <li className="flex items-center gap-3">
              <PlayCircle className="w-4 h-4 text-muted-foreground" />
              <span>{formatDuration(course.duration || 0)} video bài giảng</span>
            </li>
            <li className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>24 bài tập thực hành & Quiz</span>
            </li>
            <li className="flex items-center gap-3">
              <Infinity className="w-4 h-4 text-muted-foreground" />
              <span>Quyền truy cập trọn đời</span>
            </li>
            <li className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span>Học trên mọi thiết bị</span>
            </li>
            <li className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span>Chứng chỉ hoàn thành</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
