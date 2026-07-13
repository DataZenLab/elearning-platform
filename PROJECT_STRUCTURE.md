# Cấu trúc dự án E-Learning Platform

Dự án này sử dụng **Next.js App Router**. Dưới đây là cấu trúc dự án và hướng dẫn chi tiết về vị trí đặt code cho từng thành phần:

## 📂 Cấu trúc tổng quan

Mã nguồn chính của dự án được đặt trong thư mục `src/`, giúp tách biệt mã nguồn với các file cấu hình ở thư mục gốc.

```text
elearning-platform/
├── strapi/                 # Chứa code/cấu hình của backend Headless CMS (Strapi)
├── public/                 # Chứa các tài nguyên tĩnh như hình ảnh, biểu tượng (favicon)
├── src/                    # 🟢 NƠI CHỨA TOÀN BỘ MÃ NGUỒN FRONTEND
│   ├── actions/            # Các Server Actions (Next.js) để xử lý logic phía server
│   ├── app/                # Cấu trúc Routing (Định tuyến) của ứng dụng
│   ├── components/         # Các UI component tái sử dụng được
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Tiện ích, cấu hình, helper functions
│   ├── providers/          # React Context Providers (Ví dụ: Auth, Theme,...)
│   ├── services/           # Xử lý gọi API (tương tác với Firebase, Strapi,...)
│   ├── stores/             # Quản lý state toàn cục (Global state - Zustand, Redux)
│   └── types/              # Các định nghĩa kiểu dữ liệu TypeScript (Interfaces, Types)
├── firebase.json           # Cấu hình Firebase Hosting/Functions
├── firestore.rules         # Các quy tắc bảo mật của cơ sở dữ liệu Firestore
├── next.config.ts          # Cấu hình chính của Next.js
└── package.json            # Chứa thông tin thư viện dependencies
```

---

## 📝 Hướng dẫn: "Nên viết code ở đâu?"

Dưới đây là kim chỉ nam giúp xác định vị trí đặt code khi phát triển tính năng mới:

### 1. Tạo một trang web (Page) hoặc Route mới
👉 **Viết tại:** Thư mục `src/app/`
- Thư mục `app` sử dụng cơ chế định tuyến dựa trên thư mục. 
- Dự án đang dùng **Route Groups** (các thư mục có dấu ngoặc đơn, không ảnh hưởng đến URL):
  - `src/app/(public)/`: Chứa các trang công khai (Trang chủ, Đăng nhập, Đăng ký, Danh sách khóa học).
  - `src/app/(dashboard)/`: Dành cho học viên xem tiến trình học, hồ sơ cá nhân.
  - `src/app/(instructor)/`: Giao diện dành cho giảng viên tạo và quản lý khóa học.
  - `src/app/(admin)/`: Bảng điều khiển quản trị viên hệ thống.
  - `src/app/learn/`: Trang vào học thực tế của khóa học (video, bài giảng).
- *Quy tắc:* Mỗi thư mục đại diện cho 1 đường dẫn, và file giao diện bắt buộc phải có tên là `page.tsx`.

### 2. Viết các giao diện/thành phần tái sử dụng (UI Components)
👉 **Viết tại:** Thư mục `src/components/`
- Nếu tạo một nút (Button), hộp thoại (Modal), thẻ khóa học (CourseCard), hãy đặt ở đây.
- Hệ thống đã chia sẵn theo chức năng:
  - `components/ui/`: Các component cơ bản nhất (thường sinh ra từ thư viện UI như shadcn/ui).
  - `components/course/`: Các component liên quan đến hiển thị khóa học.
  - `components/auth/`: Các component form đăng nhập/đăng ký.
  - `components/quiz/`: Component dùng cho bài trắc nghiệm.
  - `components/shared/`: Component dùng chung trên toàn hệ thống (Navigation, Footer,...).

### 3. Xử lý gửi Form / Lưu dữ liệu an toàn (Server-side logic)
👉 **Viết tại:** Thư mục `src/actions/`
- Sử dụng Next.js Server Actions để viết các hàm chạy 100% trên server (ví dụ: Tạo khóa học mới, Cập nhật tiến độ học, Thay đổi mật khẩu).
- Các file trong này thường được khai báo dòng `"use server";` ở đầu file.

### 4. Gọi API bên thứ 3 hoặc giao tiếp với Database
👉 **Viết tại:** Thư mục `src/services/`
- Xử lý các nghiệp vụ gọi API lên Strapi hoặc tương tác với Firebase (đọc/ghi Firestore).
- Ví dụ: `services/course.service.ts` chứa các hàm như `getCourseById()`, `fetchCourses()`.

### 5. Khai báo kiểu dữ liệu (TypeScript Interfaces)
👉 **Viết tại:** Thư mục `src/types/`
- Định nghĩa các Model, Interface để đảm bảo an toàn kiểu dữ liệu (Type Safety).
- Ví dụ: `types/user.types.ts` để khai báo interface `User`, `Instructor`, v.v.

### 6. Xử lý các logic tái sử dụng phía Client (Custom Hooks)
👉 **Viết tại:** Thư mục `src/hooks/`
- Chứa các logic React cần dùng nhiều lần ở phía giao diện (Client Component).
- Ví dụ: `useAuth()` (kiểm tra trạng thái đăng nhập), `useCourseProgress()` (tính toán % hoàn thành khóa học).

### 7. Viết các hàm tiện ích nhỏ (Helpers/Utils)
👉 **Viết tại:** Thư mục `src/lib/`
- Các hàm format ngày tháng (`formatDate`), format tiền tệ (`formatCurrency`), cấu hình init Firebase (`firebase.ts`), các biến hằng số (`constants.ts`).

---
## 💡 Ví dụ thực tế: Thêm tính năng "Hiển thị danh sách khóa học"
1. Khai báo cấu trúc dữ liệu khóa học ở `src/types/course.types.ts`.
2. Viết hàm lấy dữ liệu từ database ở `src/services/course.service.ts`.
3. Tạo giao diện thẻ khóa học ở `src/components/course/CourseCard.tsx`.
4. Gọi dữ liệu và hiển thị danh sách tại trang `src/app/(public)/courses/page.tsx`.
