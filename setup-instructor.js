const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// === Firebase config (từ .env.local của project) ===
const firebaseConfig = {
  apiKey: "AIzaSyCCa_TM-yQ-98iiqyMzMLgKNACimDdPg3A",
  authDomain: "e-learning-36dc5.firebaseapp.com",
  projectId: "e-learning-36dc5",
  storageBucket: "e-learning-36dc5.firebasestorage.app",
  messagingSenderId: "884384194053",
  appId: "1:884384194053:web:97054c6bd847d40839066c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === Đọc Strapi token từ .env.local ===
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

async function strapiFetch(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${endpoint} failed: ${JSON.stringify(json.error)}`);
  return json.data;
}

async function publishDoc(endpoint, documentId) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}/${documentId}/actions/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return res.ok;
}

async function main() {
  const EMAIL    = 'gvTest@elearning.com';
  const PASSWORD = '123456';
  const NAME     = 'Giảng viên Test';
  const SLUG     = 'giang-vien-test';

  // ────────────────────────────────────────────────────────
  // BƯỚC 1: Tạo tài khoản Firebase Auth + Firestore
  // ────────────────────────────────────────────────────────
  console.log('\n📌 BƯỚC 1: Tạo Firebase Auth & Firestore user...');
  let firebaseUid = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    const user = cred.user;
    firebaseUid = user.uid;
    await updateProfile(user, { displayName: NAME });
    await setDoc(doc(db, 'users', user.uid), {
      email: EMAIL,
      displayName: NAME,
      role: 'instructor',
      status: 'active',
      createdAt: serverTimestamp()
    });
    console.log(`✅ Đã tạo user Firebase: ${user.uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`⚠️  User ${EMAIL} đã tồn tại trong Firebase. Tiếp tục...`);
    } else {
      console.error('❌ Lỗi Firebase:', err.message);
      process.exit(1);
    }
  }

  // ────────────────────────────────────────────────────────
  // BƯỚC 2: Tìm hoặc tạo Strapi Instructor record
  // ────────────────────────────────────────────────────────
  console.log('\n📌 BƯỚC 2: Tìm hoặc tạo Instructor trong Strapi...');
  let instructorDocId = null;

  // Thử tìm instructor có slug này trước
  try {
    const existing = await strapiFetch(`instructors?filters[slug][$eq]=${SLUG}&status=published`);
    if (existing && existing.length > 0) {
      instructorDocId = existing[0].documentId;
      console.log(`⚠️  Instructor "${NAME}" đã tồn tại: ${instructorDocId}. Dùng lại.`);
    }
  } catch (e) {
    // Nếu lỗi thì cứ tiếp tục tạo mới
  }

  if (!instructorDocId) {
    const newIns = await strapiFetch('instructors', 'POST', {
      data: {
        name: NAME,
        slug: SLUG,
        title: 'Giảng viên Hỗ Trợ Toàn Nền Tảng',
        bio: '<p>Tài khoản dùng để hỗ trợ và trả lời mọi thắc mắc học viên trong toàn bộ hệ thống.</p>',
        expertise: ['Web', 'AI', 'Design', 'Mobile', 'Marketing'],
        totalCourses: 50,
        totalStudents: 50000,
        averageRating: 5.0
      }
    });
    await publishDoc('instructors', newIns.documentId);
    instructorDocId = newIns.documentId;
    console.log(`✅ Đã tạo Strapi Instructor: ${instructorDocId}`);
  }

  // ────────────────────────────────────────────────────────
  // BƯỚC 3: Lấy toàn bộ khóa học & cập nhật instructor
  // ────────────────────────────────────────────────────────
  console.log('\n📌 BƯỚC 3: Lấy danh sách khóa học và cập nhật instructor...');

  let allCourses = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${STRAPI_URL}/api/courses?pagination[page]=${page}&pagination[pageSize]=25&status=published`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    const batch = json.data || [];
    allCourses = allCourses.concat(batch);
    if (batch.length < 25) break;
    page++;
  }

  console.log(`Đã tìm thấy ${allCourses.length} khóa học.`);
  if (allCourses.length === 0) {
    console.warn('⚠️  Không tìm thấy khóa học nào. Kiểm tra Strapi có đang chạy không?');
    process.exit(0);
  }

  let ok = 0, fail = 0;
  for (let i = 0; i < allCourses.length; i++) {
    const course = allCourses[i];
    try {
      await strapiFetch(`courses/${course.documentId}`, 'PUT', {
        data: { instructor: instructorDocId }
      });
      await publishDoc('courses', course.documentId);
      ok++;
      console.log(`  ✅ (${i + 1}/${allCourses.length}) ${course.title}`);
    } catch (e) {
      fail++;
      console.error(`  ❌ (${i + 1}/${allCourses.length}) ${course.title}: ${e.message}`);
    }
  }

  console.log(`\n🎉 HOÀN TẤT! Thành công: ${ok} | Thất bại: ${fail}`);
  console.log(`\n👉 Bạn có thể đăng nhập bằng:`);
  console.log(`   Email   : ${EMAIL}`);
  console.log(`   Mật khẩu: ${PASSWORD}`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Lỗi không mong muốn:', err);
  process.exit(1);
});
