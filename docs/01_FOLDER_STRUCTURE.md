# Cấu trúc thư mục (Folder Structure)

```text
elearning-platform/
├── strapi/                 # Backend Headless CMS quản lý nội dung tĩnh (Video, Bài học)
├── public/                 # Tài nguyên hình ảnh tĩnh
├── src/
│   ├── actions/            # Server Actions (Logic chạy trên môi trường Node.js Server)
│   ├── app/                # Next.js App Router (Định tuyến và cấu hình Layout)
│   ├── components/         # Các khối UI (Giao diện) tái sử dụng
│   ├── hooks/              # Custom React Hooks (Client logic)
│   ├── lib/                # Cấu hình Firebase, Strapi client và Utils
│   ├── providers/          # React Context (Auth, Theme, Query)
│   ├── services/           # Xử lý gọi API tới Strapi và Firebase Firestore
│   ├── stores/             # Global State Management (Zustand)
│   └── types/              # Khai báo kiểu dữ liệu TypeScript
└── docs/                   # Tài liệu kiến trúc dự án
```
