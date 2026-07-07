# Báo cáo Tiến độ Dự án (Project Report)

File này lưu trữ lịch sử các công việc đã thực hiện để dễ dàng theo dõi tiến độ.

## [26/06/2026] Cập nhật API và Giao diện Danh sách Khóa học
- **Backend/API (`src/services/api/courses.api.ts`)**:
  - Gỡ bỏ mock data `MOCK_COURSES`.
  - Tích hợp logic xử lý phân trang, lọc (theo danh mục, độ khó), tìm kiếm text, sắp xếp và populate đầy đủ dữ liệu (giảng viên, ảnh thumbnail, danh mục).
  - Thêm mới hàm `getCourseBySlug` để lấy chi tiết một khóa học (kèm bài học, đánh giá).
- **Frontend/UI (`src/app/(public)/courses/page.tsx`)**:
  - Đã liên kết API mới với component hiển thị danh sách khóa học, cho phép học viên xem, tìm kiếm và lọc khóa học từ database thực (thông qua React Query hook `useCourses`).
  - Giao diện có sẵn URL truy cập là `/courses`.

## [26/06/2026] Hoàn thiện Trang Chi tiết Khóa học (`/courses/[slug]`)
- **Cập nhật UI (`src/app/(public)/courses/[slug]/page.tsx`)**:
  - Thay thế dữ liệu tĩnh thành dữ liệu động từ API `coursesApi.getCourseBySlug`.
  - Hiển thị nội dung thực của khóa học bao gồm Tổng quan (Overview), thông tin giảng viên (Instructor) thực lấy từ Strapi thay vì fix cứng.
  - Xử lý mượt mà trạng thái khóa học không tồn tại (redirect 404 - Not Found).

## [27/06/2026] Xây dựng Cổng Giảng viên (Instructor Portal) & Luồng Phê duyệt
- **Backend/API (`src/services/api/instructor.api.ts`)**:
  - Triển khai API service riêng biệt cho Giảng viên.
  - Xây dựng logic tạo khóa học (`createCourse`) tương tác với Strapi. Khóa học mới được gán mặc định `isPublished = false` (Lưu nháp).
- **Frontend/UI (`src/app/(instructor)`)**:
  - Tích hợp **Next.js Server Actions** (`src/actions/course.actions.ts`) để bảo mật API call từ phía server.
  - Xây dựng giao diện Form Tạo Khóa Học (`/instructor/courses/new`) cho phép giảng viên tự điền tiêu đề, mô tả chi tiết, giá bán, độ khó.
  - Hoàn thiện luồng bấm nút "Tạo khóa học mới" từ Dashboard Giảng viên chuyển sang Form tạo mới, và lưu về cơ sở dữ liệu.
- **Workflow hoàn chỉnh**: Giảng viên tạo khóa học -> Tự động vào trạng thái Draft -> Chờ Admin duyệt (Publish trên Strapi) -> Học viên nhìn thấy.

---
*Các bản cập nhật tiếp theo sẽ được ghi nối tiếp vào đây...*
