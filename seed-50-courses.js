/**
 * Script to seed 50 full courses into Strapi
 */
const fs = require('fs');
const path = require('path');

// Đọc token từ .env.local
const envLocal = path.resolve(__dirname, '.env.local');
let token = '';
if (fs.existsSync(envLocal)) {
  const content = fs.readFileSync(envLocal, 'utf8');
  const match = content.match(/STRAPI_API_TOKEN=([^\n\r]+)/);
  if (match) token = match[1].trim().replace(/^["']|["']$/g, '');
}

if (!token) {
  console.error('❌ Không tìm thấy STRAPI_API_TOKEN trong .env.local');
  process.exit(1);
}

const STRAPI_URL = 'http://localhost:1337';

async function strapiPost(endpoint, data) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${endpoint} failed: ${JSON.stringify(json.error)}`);
  return json.data;
}

async function publishDoc(endpoint, documentId) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}/${documentId}/actions/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return res.ok;
}

const categoriesData = [
  { name: 'Web Development', slug: 'web-development', description: 'Học lập trình Web Front-end và Back-end', color: '#2563EB', icon: '💻' },
  { name: 'Mobile App', slug: 'mobile-app', description: 'Phát triển ứng dụng di động iOS và Android', color: '#059669', icon: '📱' },
  { name: 'Data Science & AI', slug: 'data-science-ai', description: 'Khoa học dữ liệu, Machine Learning và Trí tuệ nhân tạo', color: '#DC2626', icon: '🤖' },
  { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Thiết kế giao diện và trải nghiệm người dùng', color: '#7C3AED', icon: '🎨' },
  { name: 'Digital Marketing', slug: 'digital-marketing-2', description: 'Marketing kỹ thuật số, SEO, Ads', color: '#EA580C', icon: '📈' }
];

const instructorData = [
  { name: 'Nguyễn Văn A', slug: 'nguyen-van-a-seed', title: 'Senior Developer', bio: '<p>10 năm kinh nghiệm</p>', expertise: ['Web'], totalCourses: 10, totalStudents: 1000, averageRating: 4.8 },
  { name: 'Trần Thị B', slug: 'tran-thi-b-seed', title: 'AI Expert', bio: '<p>Chuyên gia AI từ Google</p>', expertise: ['AI'], totalCourses: 10, totalStudents: 1500, averageRating: 4.9 },
  { name: 'Lê Hoàng C', slug: 'le-hoang-c-seed', title: 'UX/UI Designer', bio: '<p>Từng làm việc tại Figma</p>', expertise: ['Design'], totalCourses: 10, totalStudents: 2000, averageRating: 4.7 }
];

async function main() {
  console.log('🌱 Bắt đầu tạo 50 khóa học mẫu...\n');

  // 1. Tạo Instructors
  const instructors = [];
  for (const ins of instructorData) {
    console.log(`Tạo giảng viên: ${ins.name}`);
    const doc = await strapiPost('instructors', ins);
    await publishDoc('instructors', doc.documentId);
    instructors.push(doc);
  }

  // 2. Tạo Categories và Khóa học trong Category đó
  let courseCount = 1;
  for (const cat of categoriesData) {
    console.log(`\n📌 Tạo danh mục: ${cat.name}`);
    const catDoc = await strapiPost('categories', cat);
    await publishDoc('categories', catDoc.documentId);

    // Tạo 10 khóa học cho mỗi category
    for (let i = 1; i <= 10; i++) {
      const ins = instructors[i % instructors.length];
      const title = `${cat.name} Masterclass - Cấp độ ${i}`;
      const slug = `${cat.slug}-masterclass-${i}`;
      
      console.log(`  🚀 Tạo khóa học ${courseCount}/50: ${title}...`);
      
      const course = await strapiPost('courses', {
        title,
        slug,
        shortDescription: `Khóa học toàn diện về ${cat.name}, phù hợp cho mọi trình độ từ cơ bản đến nâng cao.`,
        description: `<h2>Nội dung khóa học</h2><p>Được thiết kế chuẩn quốc tế, giúp bạn làm chủ <strong>${cat.name}</strong>.</p><ul><li>Kiến thức nền tảng</li><li>Thực hành dự án thực tế</li><li>Hỗ trợ 1-1</li></ul>`,
        difficulty: i <= 3 ? 'beginner' : (i <= 7 ? 'intermediate' : 'advanced'),
        duration: 300 + (i * 20),
        language: 'Tiếng Việt',
        isPublished: true,
        price: 500000 + (i * 100000),
        originalPrice: 1000000 + (i * 100000),
        totalStudents: Math.floor(Math.random() * 5000),
        averageRating: 4.5 + Math.random() * 0.5,
        totalReviews: Math.floor(Math.random() * 500),
        category: catDoc.documentId,
        instructor: ins.documentId
      });
      await publishDoc('courses', course.documentId);

      // Tạo 3 bài học cho mỗi khóa
      for (let j = 1; j <= 3; j++) {
        const lesson = await strapiPost('lessons', {
          title: `Bài ${j}: ${j === 1 ? 'Tổng quan' : (j === 2 ? 'Kiến thức cốt lõi' : 'Thực hành chuyên sâu')} về ${cat.name}`,
          slug: `${slug}-bai-${j}`,
          content: `<p>Nội dung chi tiết của bài học số ${j} trong khóa ${title}.</p>`,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 30 + j * 5,
          order: j,
          isFree: j === 1,
          chapter: `Chương 1: Mở đầu`,
          course: course.documentId
        });
        await publishDoc('lessons', lesson.documentId);
      }

      // Tạo 1 Quiz cho mỗi khóa học
      const quiz = await strapiPost('quizzes', {
        title: `Bài kiểm tra: ${title}`,
        description: `Kiểm tra kiến thức bạn đã học trong khóa ${title}.`,
        timeLimit: 15,
        passingScore: 80,
        lesson: null // Quiz cuối khóa (hoặc có thể gắn vào 1 bài học)
      });
      await publishDoc('quizzes', quiz.documentId);

      // Tạo 2 câu hỏi cho Quiz
      for (let k = 1; k <= 2; k++) {
        const q = await strapiPost('questions', {
          text: `Câu hỏi số ${k} về ${cat.name} là gì?`,
          type: 'single_choice',
          points: 50,
          order: k,
          quiz: quiz.documentId
        });
        await publishDoc('questions', q.documentId);

        // Tạo 3 option cho câu hỏi
        for (let o = 1; o <= 3; o++) {
          const opt = await strapiPost('question-options', {
            text: `Đây là đáp án ${o}`,
            isCorrect: o === 1, // Option 1 luôn đúng
            question: q.documentId
          });
          await publishDoc('question-options', opt.documentId);
        }
      }

      courseCount++;
    }
  }

  console.log('\n🎉 Hoàn thành! Đã tạo thành công 50 khóa học với đầy đủ bài học, bài kiểm tra.');
}

main().catch(err => {
  console.error('❌ Lỗi:', err.message || err);
  process.exit(1);
});
