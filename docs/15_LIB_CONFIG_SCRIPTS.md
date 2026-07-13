# 🛠️ Tài liệu bổ sung — Lib, Config, Scripts

---

## 📦 Thư viện & Tiện ích (`src/lib/`)

### `firebase.ts` — Khởi tạo Firebase SDK
**File:** [firebase.ts](../src/lib/firebase.ts)  
**Loại:** Configuration  
**Độ quan trọng:** 🔴 Critical

| Export | Kiểu | Mô tả |
|---|---|---|
| `auth` | `Auth` | Instance Firebase Authentication (đăng nhập) |
| `db` | `Firestore` | Instance Firestore Database (lưu tiến độ, hồ sơ) |
| `storage` | `Storage` | Instance Firebase Storage (upload file) |
| `default` (app) | `FirebaseApp` | Instance app gốc |

**Cơ chế:** Kiểm tra `getApps().length` để tránh khởi tạo lại khi Next.js Hot Module Replacement (HMR) trong dev mode.

---

### `strapi.ts` — Strapi API Client
**File:** [strapi.ts](../src/lib/strapi.ts)  
**Loại:** Utility — HTTP Client  
**Độ quan trọng:** 🔴 Critical

Lớp `StrapiClient` bọc `fetch()` với các tính năng:
- Tự động thêm Bearer Token vào header
- Serialize query params bằng `qs` (hỗ trợ nested object)
- Throw Error có message rõ ràng nếu request thất bại

| Hàm | Mô tả |
|---|---|
| `get<T>(endpoint, params, options)` | HTTP GET với cache control |
| `post<T>(endpoint, data)` | HTTP POST, tự wrap data trong `{ data: ... }` theo chuẩn Strapi |
| `put<T>(endpoint, data)` | HTTP PUT |
| `delete(endpoint)` | HTTP DELETE |
| `findMany<T>(contentType, params)` | Shorthand GET nhiều document |
| `findOne<T>(contentType, documentId)` | Shorthand GET 1 document |

---

### `utils.ts` — Helper functions
**File:** [utils.ts](../src/lib/utils.ts)  
**Loại:** Utility  
**Độ quan trọng:** 🟡 Medium

| Hàm | Input | Output | Mô tả |
|---|---|---|---|
| `cn(...inputs)` | `ClassValue[]` | `string` | Merge Tailwind classes, xử lý conflict |
| `formatPrice(price)` | `number` | `string` | Format số tiền VND (`₫1.200.000`) |
| `formatDuration(minutes)` | `number` | `string` | Format thời lượng (`2h 30m`) |

---

### `constants.ts` — Hằng số toàn cục
**File:** [constants.ts](../src/lib/constants.ts)  
**Loại:** Configuration  
**Độ quan trọng:** 🟡 Medium

Chứa các hằng số dùng chung: danh sách menu điều hướng, danh mục mẫu, màu sắc, đường dẫn route, các nhãn text UI...

---

## ⚙️ Cấu hình gốc dự án

| File | Mô tả |
|---|---|
| `next.config.ts` | Cấu hình Next.js: domain ảnh cho `next/image`, biến môi trường |
| `tsconfig.json` | TypeScript config: path aliases (`@/` → `./src/`) |
| `eslint.config.mjs` | Quy tắc ESLint |
| `firestore.rules` | Quy tắc bảo mật Firestore |
| `firebase.json` | Cấu hình Firebase CLI (hosting) |
| `.env.local` | Biến môi trường: Firebase keys, Strapi URL, API token |
| `package.json` | Danh sách dependencies và scripts |

---

## 📜 Scripts phụ trợ

| File | Chức năng |
|---|---|
| `seed-50-courses.js` | Tạo seed 50 khóa học mẫu vào Strapi CMS (dùng khi setup môi trường mới) |
| `attach-course-images.js` | Gán ảnh bìa (thumbnail) vào các khóa học trong Strapi |
| `debug-course.js` | Script debug: in ra chi tiết một khóa học từ Strapi để kiểm tra cấu trúc dữ liệu |
