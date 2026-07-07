import { CourseDetailHero } from "@/components/course/course-detail-hero";
import { Curriculum } from "@/components/course/curriculum";
import { InstructorCard } from "@/components/course/instructor-card";
import { StickySidebar } from "@/components/course/sticky-sidebar";
import { ReviewSection } from "@/components/course/review-section";
import { AddReviewForm } from "@/components/course/add-review-form";
import { coursesApi } from "@/services/api/courses.api";
import { notFound } from "next/navigation";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  let course = null;
  try {
    course = await coursesApi.getCourseBySlug(slug);
  } catch {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-2xl font-bold">Không thể tải khóa học</h1>
        <p className="text-muted-foreground max-w-md">
          Máy chủ Strapi chưa được khởi động. Chạy lệnh sau trong thư mục
          <code className="mx-1 px-2 py-0.5 bg-muted rounded text-sm">strapi/</code>:
        </p>
        <pre className="bg-muted rounded-xl px-6 py-3 text-sm font-mono">npm run develop</pre>
      </div>
    );
  }
  if (!course) notFound();

  const instructorName = (course.instructor as any)?.name || "Giảng viên EduFlow";
  const instructorAvatar = (course.instructor as any)?.avatar || null;

  return (
    <div className="bg-background min-h-screen pb-20">
      <CourseDetailHero course={course} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 lg:max-w-[calc(100%-400px)] space-y-16">
            <section className="scroll-mt-24" id="overview">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Tong quan khoa hoc</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: course.description || course.shortDescription || "Chua co mo ta." }} />
              </div>
            </section>
            <section className="scroll-mt-24" id="curriculum">
              <Curriculum lessons={course.lessons || []} />
            </section>
            <section className="scroll-mt-24" id="instructor">
              <InstructorCard instructor={{
                id: course.instructor?.id || 1,
                name: instructorName,
                avatar: instructorAvatar,
                stats: { rating: course.averageRating || 5, reviews: course.totalReviews || 0, students: course.totalStudents || 0, courses: 1 }
              }} />
            </section>
            <section className="scroll-mt-24" id="reviews">
              <ReviewSection
                reviews={course.reviews || []}
                averageRating={course.averageRating || 0}
                totalReviews={course.totalReviews || 0}
              />
              <div className="mt-8">
                <AddReviewForm courseDocumentId={(course as any).documentId || String(course.id)} />
              </div>
            </section>
          </div>
          <div className="hidden lg:block w-[380px] flex-shrink-0">
            <StickySidebar course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}