import { HeroSection } from '@/components/landing/hero-section';
import { FeaturedCourses } from '@/components/landing/featured-courses';
import { CategoriesSection } from '@/components/landing/categories-section';
import { WhyChooseUs } from '@/components/landing/why-choose-us';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';

/**
 * Trang Chủ của nền tảng (Public Route - Không yêu cầu đăng nhập).
 * Ghép nối từ nhiều Component nhỏ như: Banner chính (Hero), 
 * Khóa học nổi bật, Danh mục, Đánh giá học viên và Câu hỏi thường gặp.
 */
/**
 * Trang Chủ (Public): Giới thiệu hệ thống, khóa học nổi bật và đánh giá từ học viên.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturedCourses />
      <CategoriesSection />
      <WhyChooseUs />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </div>
  );
}
