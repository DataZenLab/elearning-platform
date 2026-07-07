import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

// Content types to grant public read/write access (reviews can be posted without auth)
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

// These content types also get create permission for Public (needed for review posting & lesson creation by instructors via client)
const PUBLIC_WRITABLE_TYPES = [
  'api::review.review',
];

// Admin credentials (auto-created on fresh DB)
const ADMIN_EMAIL = 'admin@eduflow.com';
const ADMIN_PASSWORD = 'Admin@123456!';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ─────────────────────────────────────────────────────────────
    // A. Auto-create Super Admin (Removed because of missing password hash)
    // ─────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────
    // B. Auto-generate API Token for Next.js frontend
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
        
        // Write it to .env.local in the frontend
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
    // C. Auto-grant Public role: find + findOne for all content types
    // ─────────────────────────────────────────────────────────────
    console.log('🔓 Setting up Public role permissions...');
    try {
      // Find the Public role
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        for (const uid of PUBLIC_CONTENT_TYPES) {
          // For course and lesson, grant full CRUD for MVP. For others, just find/findOne.
          const isFullCRUD = ['api::course.course', 'api::lesson.lesson'].includes(uid);
          const isWritable = PUBLIC_WRITABLE_TYPES.includes(uid);
          const actions = isFullCRUD
            ? ['find', 'findOne', 'create', 'update', 'delete']
            : isWritable
            ? ['find', 'findOne', 'create']
            : ['find', 'findOne'];

          for (const action of actions) {
            const fullAction = `${uid}.${action}`;

            // Check if permission already exists
            const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: { action: fullAction, role: publicRole.id },
            });

            if (existing) {
              // Update to enabled
              await strapi.db.query('plugin::users-permissions.permission').update({
                where: { id: existing.id },
                data: { enabled: true },
              });
            } else {
              // Create new
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: { action: fullAction, role: publicRole.id, enabled: true },
              });
            }
          }
        }
        console.log('✅ Public permissions set for all content types!');
      }
    } catch (err) {
      console.error('⚠️  Could not set public permissions:', err);
    }

    // ─────────────────────────────────────────────────────────────
    // C. Seed initial content if empty
    // ─────────────────────────────────────────────────────────────
    const coursesCount = await strapi.db.query('api::course.course').count();

    if (coursesCount === 0) {
      console.log('🌱 Seeding initial data for E-learning platform (using Document API)...');

      try {
        // 1. Create Categories
        const category1 = await strapi.documents('api::category.category').create({
          data: {
            name: 'Lập trình Web',
            slug: 'lap-trinh-web',
            description: 'Các khóa học về lập trình Web Frontend & Backend',
            color: '#2563EB',
            icon: '💻',
            courseCount: 2,
          },
          status: 'published'
        });

        const category2 = await strapi.documents('api::category.category').create({
          data: {
            name: 'Thiết kế UI/UX',
            slug: 'thiet-ke-ui-ux',
            description: 'Thiết kế giao diện và trải nghiệm người dùng',
            color: '#7C3AED',
            icon: '🎨',
            courseCount: 1,
          },
          status: 'published'
        });

        const category3 = await strapi.documents('api::category.category').create({
          data: {
            name: 'DevOps & Cloud',
            slug: 'devops-cloud',
            description: 'CI/CD, Docker, Kubernetes và các nền tảng Cloud',
            color: '#059669',
            icon: '☁️',
            courseCount: 1,
          },
          status: 'published'
        });

        // 2. Create Instructors
        const instructor1 = await strapi.documents('api::instructor.instructor').create({
          data: {
            name: 'Nguyễn Văn An',
            slug: 'nguyen-van-an',
            title: 'Senior Full-Stack Developer',
            bio: '<p>Hơn 8 năm kinh nghiệm phát triển ứng dụng web với React, Node.js và cloud platforms. Đã đào tạo hơn 5000+ học viên.</p>',
            expertise: ['React', 'Next.js', 'Node.js', 'TypeScript', 'AWS'],
            socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
            totalCourses: 3,
            totalStudents: 5000,
            averageRating: 4.8,
          },
          status: 'published'
        });

        const instructor2 = await strapi.documents('api::instructor.instructor').create({
          data: {
            name: 'Phạm Thị Lan',
            slug: 'pham-thi-lan',
            title: 'Lead UI/UX Designer',
            bio: '<p>Hơn 6 năm kinh nghiệm thiết kế sản phẩm cho các startup và tập đoàn lớn. Chuyên gia về Design Systems.</p>',
            expertise: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
            socialLinks: { linkedin: 'https://linkedin.com' },
            totalCourses: 2,
            totalStudents: 3200,
            averageRating: 4.9,
          },
          status: 'published'
        });

        // 3. Create Courses
        const course1 = await strapi.documents('api::course.course').create({
          data: {
            title: 'React & Next.js Masterclass 2026',
            slug: 'react-nextjs-masterclass',
            shortDescription: 'Từ cơ bản đến nâng cao, xây dựng ứng dụng web hiện đại với React và Next.js.',
            description: '<h2>Bạn sẽ học được gì?</h2><p>Khóa học toàn diện giúp bạn làm chủ React và Next.js. Từ hooks cơ bản đến App Router, Server Components và deployment.</p><ul><li>React Hooks, Context API</li><li>Next.js 15 App Router</li><li>TypeScript với React</li><li>Firebase & Strapi CMS</li><li>Deploy lên Vercel</li></ul>',
            difficulty: 'intermediate',
            duration: 480,
            language: 'Tiếng Việt',
            isPublished: true,
            price: 1299000,
            originalPrice: 1999000,
            totalStudents: 1250,
            averageRating: 4.8,
            totalReviews: 312,
            category: category1.documentId,
            instructor: instructor1.documentId,
          },
          status: 'published'
        });

        const course2 = await strapi.documents('api::course.course').create({
          data: {
            title: 'UI/UX Design với Figma Pro',
            slug: 'uiux-design-figma',
            shortDescription: 'Thiết kế giao diện chuyên nghiệp từ wireframe đến prototype với Figma.',
            description: '<h2>Về khóa học này</h2><p>Trở thành master thiết kế UI/UX với Figma. Design system, auto layout và component library hoàn chỉnh.</p><ul><li>Figma từ cơ bản đến nâng cao</li><li>Xây dựng Design System</li><li>Auto Layout và Responsive Design</li><li>Handoff cho developers</li></ul>',
            difficulty: 'beginner',
            duration: 320,
            language: 'Tiếng Việt',
            isPublished: true,
            price: 999000,
            originalPrice: 1499000,
            totalStudents: 890,
            averageRating: 4.7,
            totalReviews: 198,
            category: category2.documentId,
            instructor: instructor2.documentId,
          },
          status: 'published'
        });

        const course3 = await strapi.documents('api::course.course').create({
          data: {
            title: 'Docker & Kubernetes cho Developer',
            slug: 'docker-kubernetes-developer',
            shortDescription: 'Containerize ứng dụng, quản lý với Kubernetes và CI/CD pipeline hoàn chỉnh.',
            description: '<h2>Nội dung khóa học</h2><p>Học cách đóng gói ứng dụng với Docker và điều phối với Kubernetes. CI/CD pipeline tự động từ A đến Z.</p><ul><li>Docker cơ bản và nâng cao</li><li>Docker Compose</li><li>Kubernetes fundamentals</li><li>GitHub Actions CI/CD</li><li>Deploy lên AWS EKS</li></ul>',
            difficulty: 'advanced',
            duration: 540,
            language: 'Tiếng Việt',
            isPublished: true,
            price: 1499000,
            originalPrice: 2499000,
            totalStudents: 645,
            averageRating: 4.9,
            totalReviews: 156,
            category: category3.documentId,
            instructor: instructor1.documentId,
          },
          status: 'published'
        });

        // 4. Lessons for Course 1 (React)
        const lesson1 = await strapi.documents('api::lesson.lesson').create({
          data: {
            title: 'Bài 1: Giới thiệu React & Cài đặt môi trường',
            slug: 'bai-1-gioi-thieu-react',
            content: '<p>Tìm hiểu React là gì và cách cài đặt NodeJS, VSCode để bắt đầu.</p><ul><li>React là gì và Virtual DOM</li><li>Cài đặt NodeJS và npm</li><li>Tạo project React đầu tiên</li></ul>',
            videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
            duration: 15, order: 1, isFree: true,
            chapter: 'Chương 1: Làm quen với React',
            course: course1.documentId,
          },
          status: 'published'
        });
        const lesson2 = await strapi.documents('api::lesson.lesson').create({
          data: {
            title: 'Bài 2: Component và JSX trong React',
            slug: 'bai-2-component-va-jsx',
            content: '<p>Tìm hiểu cách viết Component và cú pháp JSX trong React.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
            duration: 25, order: 2, isFree: true,
            chapter: 'Chương 1: Làm quen với React',
            course: course1.documentId,
          },
          status: 'published'
        });
        const lesson3 = await strapi.documents('api::lesson.lesson').create({
          data: {
            title: 'Bài 3: State và Props (kèm Quiz)',
            slug: 'bai-3-state-va-props',
            content: '<p>Sự khác nhau giữa State và Props — kiến thức cốt lõi nhất của React.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
            duration: 30, order: 3, isFree: false,
            chapter: 'Chương 2: Kiến thức cốt lõi',
            course: course1.documentId,
          },
          status: 'published'
        });
        const lesson4 = await strapi.documents('api::lesson.lesson').create({
          data: {
            title: 'Bài 4: useEffect và Side Effects',
            slug: 'bai-4-useeffect-side-effects',
            content: '<p>useEffect để xử lý side effects: gọi API, subscribe events, set timer.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
            duration: 35, order: 4, isFree: false,
            chapter: 'Chương 2: Kiến thức cốt lõi',
            course: course1.documentId,
          },
          status: 'published'
        });
        const lesson5 = await strapi.documents('api::lesson.lesson').create({
          data: {
            title: 'Bài 5: Next.js App Router & Server Components',
            slug: 'bai-5-nextjs-app-router',
            content: '<p>Next.js 15 App Router với Server Components giúp tăng hiệu năng và SEO.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
            duration: 45, order: 5, isFree: false,
            chapter: 'Chương 3: Next.js App Router',
            course: course1.documentId,
          },
          status: 'published'
        });
        void lesson1; void lesson2; void lesson4; void lesson5;

        // Lessons for Course 2 (UI/UX)
        await strapi.documents('api::lesson.lesson').create({
          data: { title: 'Bài 1: Làm quen với Figma', slug: 'figma-bai-1-lam-quen', content: '<p>Giao diện Figma và workflow thiết kế chuyên nghiệp.</p>', videoUrl: 'https://www.youtube.com/watch?v=dXQ7IHkTiMM', duration: 20, order: 1, isFree: true, chapter: 'Chương 1: Bắt đầu với Figma', course: course2.documentId },
          status: 'published'
        });
        await strapi.documents('api::lesson.lesson').create({
          data: { title: 'Bài 2: Frames, Layers và Auto Layout', slug: 'figma-bai-2-frames-auto-layout', content: '<p>Auto Layout — tính năng mạnh nhất của Figma để tạo responsive design.</p>', videoUrl: 'https://www.youtube.com/watch?v=dXQ7IHkTiMM', duration: 30, order: 2, isFree: true, chapter: 'Chương 1: Bắt đầu với Figma', course: course2.documentId },
          status: 'published'
        });
        await strapi.documents('api::lesson.lesson').create({
          data: { title: 'Bài 3: Xây dựng Design System', slug: 'figma-bai-3-design-system', content: '<p>Design System đảm bảo tính nhất quán trong toàn bộ sản phẩm.</p>', videoUrl: 'https://www.youtube.com/watch?v=dXQ7IHkTiMM', duration: 40, order: 3, isFree: false, chapter: 'Chương 2: Design System', course: course2.documentId },
          status: 'published'
        });

        // Lessons for Course 3 (Docker)
        await strapi.documents('api::lesson.lesson').create({
          data: { title: 'Bài 1: Docker là gì & Cài đặt', slug: 'docker-bai-1-gioi-thieu', content: '<p>Docker đóng gói ứng dụng vào container, chạy nhất quán trên mọi môi trường.</p>', videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: 20, order: 1, isFree: true, chapter: 'Chương 1: Docker Fundamentals', course: course3.documentId },
          status: 'published'
        });
        await strapi.documents('api::lesson.lesson').create({
          data: { title: 'Bài 2: Dockerfile và Image Building', slug: 'docker-bai-2-dockerfile', content: '<p>Dockerfile với multi-stage build để tạo image tối ưu.</p>', videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: 30, order: 2, isFree: false, chapter: 'Chương 1: Docker Fundamentals', course: course3.documentId },
          status: 'published'
        });
        await strapi.documents('api::lesson.lesson').create({
          data: { title: 'Bài 3: Docker Compose cho Development', slug: 'docker-bai-3-compose', content: '<p>Docker Compose chạy multi-container với database, cache, backend trong một lệnh.</p>', videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: 35, order: 3, isFree: false, chapter: 'Chương 2: Docker Compose', course: course3.documentId },
          status: 'published'
        });

        // 5. Quiz for Lesson 3
        const quiz1 = await strapi.documents('api::quiz.quiz').create({
          data: { title: 'Quiz: Kiểm tra State & Props', description: 'Kiểm tra kiến thức về State và Props trong React.', timeLimit: 15, passingScore: 80, lesson: lesson3.documentId },
          status: 'published'
        });

        // Questions
        const q1 = await strapi.documents('api::question.question').create({ data: { text: 'Đâu là điểm khác biệt chính giữa State và Props?', type: 'single_choice', points: 25, order: 1, quiz: quiz1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'Props có thể thay đổi bên trong component.', isCorrect: false, question: q1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'State là dữ liệu nội bộ, Props truyền từ ngoài vào.', isCorrect: true, question: q1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'State và Props hoàn toàn giống nhau.', isCorrect: false, question: q1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'Props có thể thay thế State mọi lúc.', isCorrect: false, question: q1.documentId }, status: 'published' });

        const q2 = await strapi.documents('api::question.question').create({ data: { text: 'Hook nào dùng để khai báo State trong functional component?', type: 'single_choice', points: 25, order: 2, quiz: quiz1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'this.setState()', isCorrect: false, question: q2.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'useState()', isCorrect: true, question: q2.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'useEffect()', isCorrect: false, question: q2.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'useContext()', isCorrect: false, question: q2.documentId }, status: 'published' });

        const q3 = await strapi.documents('api::question.question').create({ data: { text: 'Khi State thay đổi, điều gì xảy ra?', type: 'single_choice', points: 25, order: 3, quiz: quiz1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'Component bị xóa khỏi DOM.', isCorrect: false, question: q3.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'Toàn bộ trang web refresh.', isCorrect: false, question: q3.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'Component re-render với dữ liệu mới.', isCorrect: true, question: q3.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'Không có gì xảy ra.', isCorrect: false, question: q3.documentId }, status: 'published' });

        const q4 = await strapi.documents('api::question.question').create({ data: { text: 'Cách ĐÚNG để cập nhật State trong React?', type: 'single_choice', points: 25, order: 4, quiz: quiz1.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'state = newValue', isCorrect: false, question: q4.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'setState(newValue) hoặc setCount(newValue)', isCorrect: true, question: q4.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'this.state.value = newValue', isCorrect: false, question: q4.documentId }, status: 'published' });
        await strapi.documents('api::question-option.question-option').create({ data: { text: 'state.update(newValue)', isCorrect: false, question: q4.documentId }, status: 'published' });

        // 6. Reviews
        await strapi.documents('api::review.review').create({ data: { rating: 5, comment: 'Khóa học rất hay, giảng viên giải thích dễ hiểu! Tôi đã từ 0 lên tự làm project React.', userName: 'Trần Thị Bình', userEmail: 'binh@example.com', isApproved: true, course: course1.documentId }, status: 'published' });
        await strapi.documents('api::review.review').create({ data: { rating: 5, comment: 'Next.js 15 App Router được giải thích rõ ràng. Recommend!', userName: 'Lê Minh Tuấn', userEmail: 'tuan@example.com', isApproved: true, course: course1.documentId }, status: 'published' });
        await strapi.documents('api::review.review').create({ data: { rating: 4, comment: 'Figma Pro rất hữu ích, học được nhiều trick hay về Auto Layout.', userName: 'Nguyễn Hồng Nhung', userEmail: 'nhung@example.com', isApproved: true, course: course2.documentId }, status: 'published' });
        await strapi.documents('api::review.review').create({ data: { rating: 5, comment: 'Docker & K8s từ zero đến deploy production trong 1 khóa!', userName: 'Phạm Văn Khoa', userEmail: 'khoa@example.com', isApproved: true, course: course3.documentId }, status: 'published' });

        console.log('✅ Seed completed! 3 courses, 11 lessons, 4 quiz questions, 4 reviews created.');
      } catch (err) {
        console.error('❌ Error seeding data:', err);
        throw err;
      }
    } else {
      console.log(`ℹ️  Skipping seed: ${coursesCount} course(s) already exist.`);
    }
  },
};
