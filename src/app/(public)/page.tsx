import { HeroSection } from '@/components/landing/hero-section';
import { FeaturedCourses } from '@/components/landing/featured-courses';
import { CategoriesSection } from '@/components/landing/categories-section';
import { WhyChooseUs } from '@/components/landing/why-choose-us';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';

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
