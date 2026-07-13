'use client';

import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";
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
  const { user, isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(course.slug || '');

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Check enrollment status when user changes
  useEffect(() => {
    async function checkStatus() {
      if (user?.uid && course.slug) {
        const enrolled = await enrollmentService.checkEnrollment(user.uid, course.slug);
        setIsEnrolled(enrolled);
      } else {
        setIsEnrolled(false);
      }
      setIsLoadingStatus(false);
    }
    checkStatus();
  }, [user, course.slug]);

  const handleEnrollOrStudy = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }
    
    if (isEnrolled) {
      // User already bought this course, go to learn directly
      const firstLessonSlug = course.lessons && course.lessons.length > 0 ? course.lessons[0].slug : 'intro';
      router.push(`/learn/${course.slug}/${firstLessonSlug}`);
    } else {
      // User needs to buy, go to fake checkout
      router.push(`/checkout/${course.slug}`);
    }
  };

  return (
    <div className="sticky top-24 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      {/* Video Preview Area */}
      <div className="aspect-video bg-slate-900 relative group cursor-pointer border-b border-border/50">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail.url} 
            alt={course.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity duration-300" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        
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
            disabled={isLoadingStatus}
            className="w-full h-11 font-semibold rounded-lg"
          >
            {isLoadingStatus ? 'Đang tải...' : isEnrolled ? 'Vào học ngay' : 'Đăng ký học ngay'}
          </Button>
          <Button
            variant={favorite ? 'secondary' : 'outline'}
            className="w-full h-11 font-medium rounded-lg"
            onClick={() => toggleFavorite(course.slug || '')}
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
