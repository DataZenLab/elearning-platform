/**
 * Script to attach images to 50 courses using real internet images
 */
const fs = require('fs');
const path = require('path');

// Read token
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

const categoryImages = [
  { slug: 'web-development', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200' },
  { slug: 'mobile-app', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200' },
  { slug: 'data-science-ai', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200' },
  { slug: 'ui-ux-design', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200' },
  { slug: 'digital-marketing-2', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200' }
];

async function main() {
  console.log('🚀 Bắt đầu quá trình tải ảnh và gán vào khóa học...\n');
  
  const uploadedImageMap = {}; // Maps category slug to Strapi Image ID

  // 1. Tải ảnh và Upload lên Strapi
  for (const cat of categoryImages) {
    console.log(`Đang xử lý ảnh cho danh mục: ${cat.slug}...`);
    try {
      // Tải ảnh từ Unsplash
      const imgRes = await fetch(cat.url);
      if (!imgRes.ok) throw new Error(`Lỗi tải ảnh: ${imgRes.statusText}`);
      const arrayBuffer = await imgRes.arrayBuffer();
      
      // Tạo Blob để nhúng vào FormData
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const formData = new FormData();
      // Chú ý: Strapi nhận field name là 'files'
      formData.append('files', blob, `${cat.slug}-cover.jpg`);

      // Upload lên Strapi
      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(`Lỗi upload: ${JSON.stringify(uploadJson)}`);
      
      const fileId = uploadJson[0].id;
      uploadedImageMap[cat.slug] = fileId;
      console.log(`  ✅ Đã upload thành công ảnh cho ${cat.slug} (ID: ${fileId})`);
    } catch (err) {
      console.error(`  ❌ Thất bại với danh mục ${cat.slug}:`, err.message);
    }
  }

  console.log('\n📌 Lấy danh sách khóa học...');
  // 2. Lấy danh sách 50 khóa học kèm thông tin category
  const coursesRes = await fetch(`${STRAPI_URL}/api/courses?pagination[limit]=100&populate=category`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const coursesJson = await coursesRes.json();
  const courses = coursesJson.data || [];
  console.log(`Đã tìm thấy ${courses.length} khóa học.`);

  // 3. Cập nhật ảnh cho từng khóa học
  let successCount = 0;
  for (const course of courses) {
    const catSlug = course.category?.slug;
    const fileId = uploadedImageMap[catSlug];
    
    if (fileId) {
      process.stdout.write(`Đang cập nhật khóa học "${course.title}"... `);
      const updateRes = await fetch(`${STRAPI_URL}/api/courses/${course.documentId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: { thumbnail: fileId } })
      });
      
      if (updateRes.ok) {
        // Cần publish lại nếu khóa học đang ở trạng thái published
        await fetch(`${STRAPI_URL}/api/courses/${course.documentId}/actions/publish`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        console.log('✅ Xong');
        successCount++;
      } else {
        console.log('❌ Lỗi cập nhật');
      }
    }
  }

  console.log(`\n🎉 Quá trình gán ảnh hoàn tất! Đã cập nhật thành công ${successCount} khóa học.`);
}

main().catch(console.error);
