import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

// Content types to grant public read/write access
const PUBLIC_CONTENT_TYPES = [
  'api::course.course',
  'api::category.category',
  'api::lesson.lesson',
  'api::quiz.quiz',
  'api::question.question',
  'api::question-option.question-option',
  'api::instructor.instructor',
  'api::review.review',
];

const PUBLIC_WRITABLE_TYPES = [
  'api::review.review',
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ─────────────────────────────────────────────────────────────
    // A. Auto-generate API Token for Next.js frontend
    // ─────────────────────────────────────────────────────────────
    try {
      const tokenService = strapi.service('admin::api-token');
      const existingToken = await strapi.db.query('admin::api-token').findOne({
        where: { name: 'nextjs-frontend-token' }
      });
      
      let tokenValue = '';
      if (!existingToken) {
        console.log('🔑 Generating new API Token for Next.js...');
        const token = await tokenService.create({
          name: 'nextjs-frontend-token',
          description: 'Auto-generated token for Next.js frontend',
          type: 'full-access',
          lifespan: null
        });
        tokenValue = token.accessKey;
        
        const envLocalPath = path.resolve(__dirname, '../../../.env.local');
        if (fs.existsSync(envLocalPath)) {
          let envContent = fs.readFileSync(envLocalPath, 'utf8');
          envContent = envContent.replace(/NEXT_PUBLIC_STRAPI_TOKEN=.*(\r\n|\n|$)/g, '');
          envContent = envContent.replace(/STRAPI_API_TOKEN=.*(\r\n|\n|$)/g, '');
          envContent += `\nSTRAPI_API_TOKEN="${tokenValue}"\nNEXT_PUBLIC_STRAPI_TOKEN="${tokenValue}"\n`;
          fs.writeFileSync(envLocalPath, envContent);
          console.log('✅ Updated .env.local with new STRAPI_API_TOKEN');
        }
      }
    } catch (err) {
      console.error('⚠️ Could not generate API Token:', err);
    }

    // ─────────────────────────────────────────────────────────────
    // B. Auto-grant Public role permissions
    // ─────────────────────────────────────────────────────────────
    console.log('🔓 Setting up Public role permissions...');
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        for (const uid of PUBLIC_CONTENT_TYPES) {
          const isFullCRUD = ['api::course.course', 'api::lesson.lesson'].includes(uid);
          const isWritable = PUBLIC_WRITABLE_TYPES.includes(uid);
          const actions = isFullCRUD
            ? ['find', 'findOne', 'create', 'update', 'delete']
            : isWritable
            ? ['find', 'findOne', 'create']
            : ['find', 'findOne'];

          for (const action of actions) {
            const fullAction = `${uid}.${action}`;
            const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: { action: fullAction, role: publicRole.id },
            });

            if (existing) {
              await strapi.db.query('plugin::users-permissions.permission').update({
                where: { id: existing.id },
                data: { enabled: true },
              });
            } else {
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: { action: fullAction, role: publicRole.id, enabled: true },
              });
            }
          }
        }
        console.log('✅ Public permissions set for all content types!');
      }
    } catch (err) {
      console.error('⚠️ Could not set public permissions:', err);
    }

    // ─────────────────────────────────────────────────────────────
    // C. Seed / Sync Content if count < 10
    // ─────────────────────────────────────────────────────────────
    const coursesCount = await strapi.db.query('api::course.course').count();

    if (coursesCount < 10) {
      console.log('🌱 Seeding full dataset for E-learning platform...');

      try {
        // Clear existing data to avoid duplicates if re-seeding
        if (coursesCount > 0) {
          console.log('🧹 Clearing existing partial course data for clean re-seed...');
          const existingCourses = await strapi.documents('api::course.course').findMany({});
          for (const c of existingCourses) {
            await strapi.documents('api::course.course').delete({ documentId: c.documentId });
          }
        }

        // 1. Categories
        const catMap: Record<string, any> = {};
        const categoriesData = [
          { name: 'Lập trình Web', slug: 'web-development', color: '#2563EB', icon: '💻' },
          { name: 'Lập trình Web', slug: 'lap-trinh-web', color: '#2563EB', icon: '💻' },
          { name: 'Thiết kế UI/UX', slug: 'ui-ux-design', color: '#7C3AED', icon: '🎨' },
          { name: 'Thiết kế UI/UX', slug: 'thiet-ke-ui-ux', color: '#7C3AED', icon: '🎨' },
          { name: 'Data Science & AI', slug: 'data-science-ai', color: '#059669', icon: '📊' },
          { name: 'Digital Marketing', slug: 'digital-marketing-2', color: '#EA580C', icon: '📈' },
          { name: 'Lập trình Mobile', slug: 'mobile-app', color: '#DB2777', icon: '📱' },
          { name: 'DevOps & Cloud', slug: 'devops-cloud', color: '#0284C7', icon: '☁️' },
        ];

        for (const cat of categoriesData) {
          const existing = await strapi.documents('api::category.category').findMany({
            filters: { slug: { $eq: cat.slug } }
          });
          if (existing && existing.length > 0) {
            catMap[cat.slug] = existing[0];
          } else {
            const created = await strapi.documents('api::category.category').create({
              data: { ...cat, description: `Các khóa học về ${cat.name}`, courseCount: 5 },
              status: 'published'
            });
            catMap[cat.slug] = created;
          }
        }

        // 2. Instructors
        const inst1 = await strapi.documents('api::instructor.instructor').create({
          data: {
            name: 'Nguyễn Văn An',
            slug: 'nguyen-van-an',
            title: 'Senior Full-Stack & AI Engineer',
            bio: '<p>Hơn 8 năm kinh nghiệm phát triển hệ thống lớn với React, Node.js, Python và AI. Đã đào tạo 5000+ học viên.</p>',
            expertise: ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript'],
            totalCourses: 6,
            totalStudents: 8500,
            averageRating: 4.9,
          },
          status: 'published'
        });

        const inst2 = await strapi.documents('api::instructor.instructor').create({
          data: {
            name: 'Phạm Thị Lan',
            slug: 'pham-thi-lan',
            title: 'Lead UI/UX Designer',
            bio: '<p>Hơn 6 năm kinh nghiệm thiết kế sản phẩm cho các tập đoàn công nghệ. Chuyên gia về Design Systems & Figma.</p>',
            expertise: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
            totalCourses: 4,
            totalStudents: 4200,
            averageRating: 4.8,
          },
          status: 'published'
        });

        const inst3 = await strapi.documents('api::instructor.instructor').create({
          data: {
            name: 'Trần Đức Nam',
            slug: 'tran-duc-nam',
            title: 'Data Science & Machine Learning Specialist',
            bio: '<p>Chuyên gia phân tích dữ liệu và học máy. Hơn 7 năm tư vấn và triển khai giải pháp AI cho doanh nghiệp.</p>',
            expertise: ['Python', 'Pandas', 'Machine Learning', 'Deep Learning', 'SQL'],
            totalCourses: 3,
            totalStudents: 3100,
            averageRating: 4.85,
          },
          status: 'published'
        });

        const inst4 = await strapi.documents('api::instructor.instructor').create({
          data: {
            name: 'Lê Hoàng Mai',
            slug: 'le-hoang-mai',
            title: 'Head of Growth & Digital Marketing',
            bio: '<p>Chuyên gia tư vấn chiến lược tăng trưởng, Performance Marketing và Content Strategy với 10 năm kinh nghiệm.</p>',
            expertise: ['SEO', 'Google Ads', 'Facebook Ads', 'Growth Hacking', 'Analytics'],
            totalCourses: 5,
            totalStudents: 6300,
            averageRating: 4.75,
          },
          status: 'published'
        });

        // 3. Courses Definition List
        const coursesToCreate = [
          {
            title: 'React & Next.js Masterclass 2026',
            slug: 'react-nextjs-masterclass',
            shortDescription: 'Từ cơ bản đến nâng cao, xây dựng ứng dụng web hiện đại với React và Next.js 15.',
            description: '<h2>Học làm chủ React 19 và Next.js 15</h2><p>Khóa học toàn diện giúp bạn làm chủ React Hooks, App Router, Server Components và deployment chuyên nghiệp.</p>',
            difficulty: 'intermediate', duration: 480, price: 1299000, originalPrice: 1999000, totalStudents: 1250, averageRating: 4.8, totalReviews: 312,
            catSlug: 'web-development', instId: inst1.documentId
          },
          {
            title: 'UI/UX Design với Figma Pro',
            slug: 'uiux-design-figma',
            shortDescription: 'Thiết kế giao diện chuyên nghiệp từ wireframe đến prototype tương tác với Figma.',
            description: '<h2>Trở thành Master Figma</h2><p>Học Auto Layout 5.0, Component Variants, Design Systems và Handoff cho Developer.</p>',
            difficulty: 'beginner', duration: 320, price: 999000, originalPrice: 1499000, totalStudents: 890, averageRating: 4.7, totalReviews: 198,
            catSlug: 'ui-ux-design', instId: inst2.documentId
          },
          {
            title: 'Docker & Kubernetes cho Developer',
            slug: 'docker-kubernetes-developer',
            shortDescription: 'Containerize ứng dụng, quản lý với Kubernetes và triển khai CI/CD pipeline tự động.',
            description: '<h2>Làm chủ Container & Cloud Native</h2><p>Đóng gói ứng dụng Docker, điều phối Kubernetes cluster và dựng CI/CD với GitHub Actions.</p>',
            difficulty: 'advanced', duration: 540, price: 1499000, originalPrice: 2499000, totalStudents: 645, averageRating: 4.9, totalReviews: 156,
            catSlug: 'devops-cloud', instId: inst1.documentId
          },
          {
            title: 'Lập trình Backend với Node.js & Express',
            slug: 'nodejs-express-backend',
            shortDescription: 'Xây dựng RESTful API chuẩn production, xác thực JWT, kết nối MongoDB & PostgreSQL.',
            description: '<h2>Làm chủ Node.js & Express Backend</h2><p>Thiết kế kiến trúc Clean Architecture, tối ưu hiệu năng API, tích hợp Payment Gateway và WebSocket.</p>',
            difficulty: 'intermediate', duration: 450, price: 1199000, originalPrice: 1799000, totalStudents: 1100, averageRating: 4.85, totalReviews: 240,
            catSlug: 'web-development', instId: inst1.documentId
          },
          {
            title: 'TypeScript Advanced Patterns & Architecture',
            slug: 'typescript-advanced-patterns',
            shortDescription: 'Nâng cao tư duy lập trình với Generics, Utility Types, Decorators và Design Patterns.',
            description: '<h2>Viết Code TypeScript Chuẩn Doanh Nghiệp</h2><p>Làm chủ Generics phức tạp, Type Narrowing, AST, và xây dựng thư viện Type-safe.</p>',
            difficulty: 'advanced', duration: 380, price: 1099000, originalPrice: 1699000, totalStudents: 780, averageRating: 4.9, totalReviews: 142,
            catSlug: 'web-development', instId: inst1.documentId
          },
          {
            title: 'Data Science & AI Masterclass 2026',
            slug: 'data-science-ai-masterclass-10',
            shortDescription: 'Phân tích dữ liệu lớn, xây dựng mô hình Machine Learning và ứng dụng AI với Python.',
            description: '<h2>Từ Zero đến Data Scientist & AI Engineer</h2><p>Học Pandas, NumPy, Scikit-Learn, TensorFlow, LLM Prompt Engineering và RAG Architecture.</p>',
            difficulty: 'intermediate', duration: 600, price: 1699000, originalPrice: 2699000, totalStudents: 1420, averageRating: 4.88, totalReviews: 380,
            catSlug: 'data-science-ai', instId: inst3.documentId
          },
          {
            title: 'Digital Marketing từ A đến Z',
            slug: 'digital-marketing-az',
            shortDescription: 'Tổng quan chiến lược Marketing online: SEO, Content, Facebook Ads, TikTok Ads & Email.',
            description: '<h2>Chiến lược Digital Marketing Thực Chiến</h2><p>Xây dựng kế hoạch Marketing đa kênh, định vị thương hiệu và tối ưu tỷ lệ chuyển đổi ROI.</p>',
            difficulty: 'beginner', duration: 400, price: 899000, originalPrice: 1399000, totalStudents: 2100, averageRating: 4.75, totalReviews: 450,
            catSlug: 'digital-marketing-2', instId: inst4.documentId
          },
          {
            title: 'SEO & Search Engine Optimization Masterclass',
            slug: 'digital-marketing-2-masterclass-6',
            shortDescription: 'Đưa website lên Top 1 Google bền vững với On-page, Off-page và Technical SEO.',
            description: '<h2>Bí quyết Thống trị Google Search</h2><p>Nghiên cứu từ khóa, tối ưu trải nghiệm người dùng, Audit Technical SEO và Xây dựng Backlink chất lượng.</p>',
            difficulty: 'intermediate', duration: 350, price: 999000, originalPrice: 1499000, totalStudents: 950, averageRating: 4.8, totalReviews: 210,
            catSlug: 'digital-marketing-2', instId: inst4.documentId
          },
          {
            title: 'Social Media & Content Marketing Strategy',
            slug: 'digital-marketing-2-masterclass-7',
            shortDescription: 'Sáng tạo nội dung thu hút triệu view trên Facebook, TikTok, YouTube và Instagram.',
            description: '<h2>Xây dựng Kênh Truyền thông Triệu Follower</h2><p>Kỹ năng viết Content Storytelling, kịch bản Video ngắn viral và quản trị cộng đồng người hâm mộ.</p>',
            difficulty: 'beginner', duration: 320, price: 799000, originalPrice: 1199000, totalStudents: 1300, averageRating: 4.7, totalReviews: 260,
            catSlug: 'digital-marketing-2', instId: inst4.documentId
          },
          {
            title: 'Google Ads & Performance Marketing',
            slug: 'digital-marketing-2-masterclass-8',
            shortDescription: 'Tối ưu ngân sách quảng cáo Google Search, Display, Shopping & Performance Max.',
            description: '<h2>Chạy Quảng Cáo Ra Đơn Thực Chiến</h2><p>Thiết lập chiến dịch chuẩn xác, đọc chỉ số CTR, CPC, CPA và vít camp bùng nổ doanh số.</p>',
            difficulty: 'intermediate', duration: 360, price: 1199000, originalPrice: 1799000, totalStudents: 1050, averageRating: 4.82, totalReviews: 230,
            catSlug: 'digital-marketing-2', instId: inst4.documentId
          },
          {
            title: 'Email Marketing & Customer Automation',
            slug: 'digital-marketing-2-masterclass-9',
            shortDescription: 'Tự động hóa chăm sóc khách hàng và gia tăng doanh số lặp lại với Email Automation.',
            description: '<h2>Hệ thống Bán hàng Tự động 24/7</h2><p>Xây dựng kịch bản Email Nurturing, phân loại tệp khách hàng và tối ưu tỷ lệ mở mail > 40%.</p>',
            difficulty: 'intermediate', duration: 300, price: 899000, originalPrice: 1299000, totalStudents: 720, averageRating: 4.78, totalReviews: 145,
            catSlug: 'digital-marketing-2', instId: inst4.documentId
          },
          {
            title: 'Growth Hacking & Marketing Analytics',
            slug: 'digital-marketing-2-masterclass-10',
            shortDescription: 'Đo lường dữ liệu GA4, Looker Studio và phương pháp tăng trưởng bứt phá cho Startup.',
            description: '<h2>Tối ưu Tăng trưởng Dựa trên Dữ liệu</h2><p>Làm chủ Google Analytics 4, A/B Testing, Funnel Conversion Rate Optimization (CRO).</p>',
            difficulty: 'advanced', duration: 420, price: 1399000, originalPrice: 2099000, totalStudents: 680, averageRating: 4.87, totalReviews: 160,
            catSlug: 'digital-marketing-2', instId: inst4.documentId
          },
          {
            title: 'Lập trình Mobile với Flutter & React Native',
            slug: 'mobile-app-masterclass-1',
            shortDescription: 'Phát triển ứng dụng di động đa nền tảng iOS & Android từ một codebase duy nhất.',
            description: '<h2>Tạo App iOS & Android Chuyên Nghiệp</h2><p>Học Dart/Flutter và React Native, State Management (Bloc, Redux), REST API và publish lên App Store / Google Play.</p>',
            difficulty: 'intermediate', duration: 520, price: 1399000, originalPrice: 2199000, totalStudents: 1150, averageRating: 4.85, totalReviews: 290,
            catSlug: 'mobile-app', instId: inst1.documentId
          },
          {
            title: 'Mastering UI/UX Systems & Micro-Interactions',
            slug: 'ui-ux-design-masterclass-10',
            shortDescription: 'Thiết kế hiệu ứng chuyển động, micro-interaction và quy chuẩn UI Kit cao cấp.',
            description: '<h2>Nâng tầm Thiết kế Trải nghiệm Người dùng</h2><p>Tạo mẫu Prototyping nâng cao với Principle, Lottie Animation và chuẩn bị Handoff Spec chi tiết.</p>',
            difficulty: 'advanced', duration: 360, price: 1199000, originalPrice: 1799000, totalStudents: 810, averageRating: 4.9, totalReviews: 175,
            catSlug: 'ui-ux-design', instId: inst2.documentId
          },
        ];

        // 4. Create All Courses & Lessons & Quizzes
        let createdCoursesCount = 0;
        for (const cData of coursesToCreate) {
          const categoryObj = catMap[cData.catSlug] || catMap['web-development'];
          const course = await strapi.documents('api::course.course').create({
            data: {
              title: cData.title,
              slug: cData.slug,
              shortDescription: cData.shortDescription,
              description: cData.description,
              difficulty: cData.difficulty as 'beginner' | 'intermediate' | 'advanced',
              duration: cData.duration,
              language: 'Tiếng Việt',
              isPublished: true,
              price: cData.price,
              originalPrice: cData.originalPrice,
              totalStudents: cData.totalStudents,
              averageRating: cData.averageRating,
              totalReviews: cData.totalReviews,
              category: categoryObj.documentId,
              instructor: cData.instId,
            },
            status: 'published'
          });
          createdCoursesCount++;

          // Create 3 Lessons per Course
          const l1 = await strapi.documents('api::lesson.lesson').create({
            data: {
              title: `Bài 1: Giới thiệu & Tổng quan khóa học ${cData.title}`,
              slug: `${cData.slug}-bai-1`,
              content: `<p>Chào mừng bạn đến với khóa học <strong>${cData.title}</strong>. Trong bài này chúng ta sẽ tìm hiểu lộ trình học tập và cài đặt công cụ.</p>`,
              videoUrl: 'https://res.cloudinary.com/dsy7a3ezv/video/upload/v1784376670/basketball_yj9ors.mp4',
              duration: 15, order: 1, isFree: true,
              chapter: 'Chương 1: Khởi đầu & Tổng quan',
              course: course.documentId,
            },
            status: 'published'
          });

          const l2 = await strapi.documents('api::lesson.lesson').create({
            data: {
              title: `Bài 2: Kiến thức nền tảng & Thực hành cơ bản`,
              slug: `${cData.slug}-bai-2`,
              content: `<p>Thực hành các khái niệm cốt lõi của <strong>${cData.title}</strong> qua ví dụ thực tế.</p>`,
              videoUrl: 'https://res.cloudinary.com/dsy7a3ezv/video/upload/v1784376670/basketball_yj9ors.mp4',
              duration: 25, order: 2, isFree: true,
              chapter: 'Chương 1: Khởi đầu & Tổng quan',
              course: course.documentId,
            },
            status: 'published'
          });

          const l3 = await strapi.documents('api::lesson.lesson').create({
            data: {
              title: `Bài 3: Kỹ thuật nâng cao & Bài tập kiểm tra`,
              slug: `${cData.slug}-bai-3`,
              content: `<p>Áp dụng các kỹ thuật chuyên sâu để giải quyết bài toán thực tế.</p>`,
              videoUrl: 'https://res.cloudinary.com/dsy7a3ezv/video/upload/v1784376670/basketball_yj9ors.mp4',
              duration: 35, order: 3, isFree: false,
              chapter: 'Chương 2: Kiến thức chuyên sâu',
              course: course.documentId,
            },
            status: 'published'
          });
          void l1; void l2;

          // Add Quiz to Lesson 3
          const quiz = await strapi.documents('api::quiz.quiz').create({
            data: {
              title: `Quiz đánh giá: ${cData.title}`,
              description: `Bài kiểm tra trắc nghiệm đánh giá mức độ hiểu bài của bạn.`,
              timeLimit: 15,
              passingScore: 80,
              lesson: l3.documentId
            },
            status: 'published'
          });

          const q1 = await strapi.documents('api::question.question').create({
            data: { text: `Mục tiêu chính của ${cData.title} là gì?`, type: 'single_choice', points: 50, order: 1, quiz: quiz.documentId },
            status: 'published'
          });
          await strapi.documents('api::question-option.question-option').create({ data: { text: 'Cung cấp giải pháp tối ưu và thực chiến', isCorrect: true, question: q1.documentId }, status: 'published' });
          await strapi.documents('api::question-option.question-option').create({ data: { text: 'Chỉ lý thuyết suông không áp dụng được', isCorrect: false, question: q1.documentId }, status: 'published' });

          const q2 = await strapi.documents('api::question.question').create({
            data: { text: 'Yếu tố quan trọng nhất khi làm chủ kỹ năng này?', type: 'single_choice', points: 50, order: 2, quiz: quiz.documentId },
            status: 'published'
          });
          await strapi.documents('api::question-option.question-option').create({ data: { text: 'Thực hành liên tục và làm project', isCorrect: true, question: q2.documentId }, status: 'published' });
          await strapi.documents('api::question-option.question-option').create({ data: { text: 'Chỉ xem video mà không gõ code', isCorrect: false, question: q2.documentId }, status: 'published' });

          // Add Reviews
          await strapi.documents('api::review.review').create({
            data: { rating: 5, comment: `Khóa học ${cData.title} rất tuyệt vời, nội dung cô đọng dễ áp dụng!`, userName: 'Học viên K26', userEmail: 'student@example.com', isApproved: true, course: course.documentId },
            status: 'published'
          });
        }

        console.log(`✅ SEED COMPLETED SUCCESSFULLY! Created ${createdCoursesCount} courses with full categories, lessons, quizzes & reviews.`);
      } catch (err) {
        console.error('❌ Error seeding data:', err);
        throw err;
      }
    } else {
      console.log(`ℹ️  Skipping seed: ${coursesCount} course(s) already exist.`);
    }

    // ─────────────────────────────────────────────────────────────
    // D. Patch all lessons: set videoUrl to Cloudinary demo
    // ─────────────────────────────────────────────────────────────
    try {
      const DEMO_VIDEO = 'https://res.cloudinary.com/dsy7a3ezv/video/upload/v1784376670/basketball_yj9ors.mp4';
      const lessons = await strapi.db.query('api::lesson.lesson').findMany({
        where: {
          $or: [
            { videoUrl: null },
            { videoUrl: '' },
            { videoUrl: { $contains: 'youtube' } },
            { videoUrl: { $contains: 'youtu.be' } },
          ]
        },
        limit: 500,
      });

      if (lessons.length > 0) {
        console.log(`🎬 Patching ${lessons.length} lessons with Cloudinary demo video...`);
        for (const lesson of lessons) {
          await strapi.db.query('api::lesson.lesson').update({
            where: { id: lesson.id },
            data: { videoUrl: DEMO_VIDEO }
          });
        }
        console.log(`✅ All ${lessons.length} lessons updated with Cloudinary demo video.`);
      } else {
        console.log('✅ All lessons already have Cloudinary video URLs.');
      }
    } catch (err) {
      console.error('⚠️ Could not patch lesson videos:', err);
    }
  },
};

