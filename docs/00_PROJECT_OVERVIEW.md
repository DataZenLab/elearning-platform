# Tổng quan hệ thống (Project Overview)

## Ngữ cảnh
Đây là hệ thống E-Learning Platform được xây dựng dựa trên kiến trúc hiện đại (Modern Stack). Hệ thống bao gồm Frontend xử lý giao diện cho học viên, giảng viên và quản trị viên, kết hợp với các dịch vụ Backend để xử lý dữ liệu và xác thực.

## Công nghệ cốt lõi
- **Framework Frontend**: Next.js (App Router)
- **Styling**: TailwindCSS & shadcn/ui
- **Quản lý State**: Zustand, React Query
- **Authentication**: Firebase Authentication (Email, Google)
- **Database / Tiến trình học tập**: Firebase Firestore
- **Lưu trữ Tệp tin**: Firebase Storage
- **CMS / Dữ liệu khóa học**: Strapi Headless CMS (REST API)

## Kiến trúc chính
Hệ thống sử dụng mô hình BFF (Backend-for-Frontend) thông qua Next.js Server Actions. Client sẽ gọi Server Actions hoặc Custom Hooks, từ đó giao tiếp với các tầng Services (gọi lên Firebase hoặc Strapi).
