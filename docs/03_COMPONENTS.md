# 🧩 03 — Danh Sách & Phân Tích Components

## Mục lục
- [Nhóm Auth](#-nhóm-auth--bảo-vệ-route)
- [Nhóm Course](#-nhóm-course--khóa-học)
- [Nhóm Landing](#-nhóm-landing--trang-chủ)
- [Nhóm Layout](#-nhóm-layout--bố-cục-trang)
- [Nhóm Learning](#-nhóm-learning--giao-diện-học-tập)
- [Nhóm Quiz](#-nhóm-quiz--trắc-nghiệm)
- [Nhóm Shared](#-nhóm-shared--dùng-chung)

---

## 🔒 Nhóm Auth — Bảo vệ Route

### `DashboardGuard` — [dashboard-guard.tsx](../src/components/auth/dashboard-guard.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Bảo vệ toàn bộ khu vực Dashboard của Học viên. Kiểm tra trạng thái đăng nhập từ `useAuthStore`. Nếu chưa đăng nhập → đẩy về `/login`. |
| **Input** | `children: React.ReactNode` |
| **Output** | Render `children` hoặc `null` (trong khi đang redirect) |
| **Được dùng bởi** | `src/app/(dashboard)/layout.tsx` |
| **Gọi tới** | `useAuthStore` |
| **Độ quan trọng** | 🔴 Critical |

### `AdminGuard` — [admin-guard.tsx](../src/components/auth/admin-guard.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Bảo vệ Route Admin. Kiểm tra xem user có `role === 'admin'` không. Nếu không đúng role → redirect. |
| **Input** | `children: React.ReactNode` |
| **Output** | Render `children` hoặc redirect |
| **Được dùng bởi** | `src/app/(admin)/layout.tsx` |
| **Gọi tới** | `useAuthStore` |
| **Độ quan trọng** | 🔴 Critical |

### `InstructorGuard` — [instructor-guard.tsx](../src/components/auth/instructor-guard.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Bảo vệ Route Giảng viên. Kiểm tra `role === 'instructor'`. |
| **Input** | `children: React.ReactNode` |
| **Output** | Render `children` hoặc redirect |
| **Được dùng bởi** | `src/app/(instructor)/layout.tsx` |
| **Gọi tới** | `useAuthStore` |
| **Độ quan trọng** | 🔴 Critical |

### `SocialAuthButtons` — [social-auth-buttons.tsx](../src/components/auth/social-auth-buttons.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Hiển thị nút đăng nhập bằng Google. Gọi `authService.loginWithGoogle()` và điều hướng dựa theo role. |
| **Input** | `isLoading`, `onLoadingChange`, `onError` |
| **Output** | JSX (Google button) |
| **Được dùng bởi** | `login/page.tsx`, `register/page.tsx` |
| **Gọi tới** | `authService`, `useAuthRedirect` |
| **Độ quan trọng** | 🟠 High |

---

## 📚 Nhóm Course — Khóa học

### `CourseCard` — [course-card.tsx](../src/components/course/course-card.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Thẻ hiển thị tóm tắt khóa học (thumbnail, tên, giá, giảng viên, rating). Dùng ở mọi nơi có danh sách khóa học. |
| **Input** | `course: CourseCard`, `className?: string` |
| **Output** | JSX Card |
| **Được dùng bởi** | `CourseGrid`, `FeaturedCoursesClient` |
| **Độ quan trọng** | 🟠 High |

### `CourseGrid` — [course-grid.tsx](../src/components/course/course-grid.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Khung lưới (CSS Grid) dàn trang nhiều `CourseCard`. Tích hợp hiệu ứng skeleton loading. |
| **Input** | `courses: CourseCard[]`, `isLoading: boolean`, `skeletonCount?: number` |
| **Output** | JSX Grid |
| **Được dùng bởi** | `courses/page.tsx` |
| **Gọi tới** | `CourseCard`, `LoadingSkeleton` |
| **Độ quan trọng** | 🟠 High |

### `CourseFilters` — [course-filters.tsx](../src/components/course/course-filters.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Bộ lọc bên cạnh danh sách khóa học (Danh mục, Độ khó, Giá). Ghi vào `useCourseStore`. |
| **Input** | Không có props (đọc state từ store) |
| **Gọi tới** | `useCourseStore`, `coursesApi.getCategories()` |
| **Độ quan trọng** | 🟡 Medium |

### `CourseDetailHero` — [course-detail-hero.tsx](../src/components/course/course-detail-hero.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Banner lớn đầu trang chi tiết khóa học: tên, mô tả, thông tin cơ bản (rating, học viên, giảng viên). |
| **Input** | `course: Course` |
| **Được dùng bởi** | `courses/[slug]/page.tsx` |
| **Độ quan trọng** | 🟡 Medium |

### `StickySidebar` — [sticky-sidebar.tsx](../src/components/course/sticky-sidebar.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Thanh bên phải cố định trên trang chi tiết khóa học. Hiển thị giá + nút "Đăng ký học" / "Vào học". |
| **Input** | `course: Course` |
| **Gọi tới** | `enrollmentService.checkEnrollment()`, `enrollmentService.enrollUser()` |
| **Độ quan trọng** | 🔴 Critical |

### `Curriculum` — [curriculum.tsx](../src/components/course/curriculum.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Accordion hiển thị danh sách chương và bài học trong khóa học (tên, thời lượng, free/lock). |
| **Input** | `lessons: Lesson[]` |
| **Độ quan trọng** | 🟡 Medium |

### `ReviewSection` — [review-section.tsx](../src/components/course/review-section.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Hiển thị đánh giá học viên: rating trung bình, phân phối sao, danh sách bình luận. |
| **Input** | `reviews: Review[]`, `averageRating: number`, `totalReviews: number` |
| **Độ quan trọng** | 🟡 Medium |

### `AddReviewForm` — [add-review-form.tsx](../src/components/course/add-review-form.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Form chọn sao + gõ nhận xét. Submit gửi review lên Strapi qua API. |
| **Input** | `courseDocumentId: string`, `onSuccess: () => void` |
| **Gọi tới** | `strapi.post('/reviews', ...)` |
| **Độ quan trọng** | 🟡 Medium |

### `InstructorCard` — [instructor-card.tsx](../src/components/course/instructor-card.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Thẻ thông tin Giảng viên: avatar, tên, bio, số khóa học, rating. |
| **Input** | `instructor: Instructor` |
| **Độ quan trọng** | 🟢 Low |

---

## 🏠 Nhóm Landing — Trang chủ

| Component | File | Chức năng |
|---|---|---|
| `HeroSection` | [hero-section.tsx](../src/components/landing/hero-section.tsx) | Banner chính (slogan, search bar, CTA buttons) |
| `FeaturedCoursesClient` | [featured-courses-client.tsx](../src/components/landing/featured-courses-client.tsx) | Carousel/Grid các khóa học nổi bật |
| `CategoriesSection` | [categories-section.tsx](../src/components/landing/categories-section.tsx) | Lưới các danh mục (icon + màu sắc) |
| `WhyChooseUs` | [why-choose-us.tsx](../src/components/landing/why-choose-us.tsx) | 4–6 thẻ lợi ích cạnh tranh |
| `Testimonials` | [testimonials.tsx](../src/components/landing/testimonials.tsx) | Carousel nhận xét của học viên |
| `FAQSection` | [faq-section.tsx](../src/components/landing/faq-section.tsx) | Accordion câu hỏi thường gặp |
| `CTASection` | [cta-section.tsx](../src/components/landing/cta-section.tsx) | Block kêu gọi đăng ký, nền gradient |

---

## 🖼 Nhóm Layout — Bố cục trang

| Component | File | Chức năng | Dùng trong |
|---|---|---|---|
| `Navbar` | [navbar.tsx](../src/components/layout/navbar.tsx) | Header chung: Logo, Menu, nút Auth | `(public)/layout.tsx` |
| `Footer` | [footer.tsx](../src/components/layout/footer.tsx) | Chân trang: Link, mạng xã hội | `(public)/layout.tsx` |
| `Sidebar` | [sidebar.tsx](../src/components/layout/sidebar.tsx) | Sidebar trái của Dashboard học viên | `(dashboard)/layout.tsx` |
| `DashboardHeader` | [dashboard-header.tsx](../src/components/layout/dashboard-header.tsx) | Header khu vực Dashboard: avatar, thông báo | `(dashboard)/layout.tsx` |
| `InstructorSidebar` | [instructor-sidebar.tsx](../src/components/layout/instructor-sidebar.tsx) | Sidebar menu Giảng viên | `(instructor)/layout.tsx` |
| `AdminSidebar` | [admin-sidebar.tsx](../src/components/layout/admin-sidebar.tsx) | Sidebar menu Admin | `(admin)/layout.tsx` |

---

## 🎓 Nhóm Learning — Giao diện học tập

### `VideoPlayer` — [video-player.tsx](../src/components/learning/video-player.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Nhúng YouTube iframe. Bắt sự kiện `onEnded` để trigger đánh dấu bài đã xem. |
| **Input** | `youtubeVideoId: string`, `onEnded: () => void` |
| **Được dùng bởi** | `learn/[courseSlug]/[lessonSlug]/page.tsx` |
| **Độ quan trọng** | 🔴 Critical |

### `LessonSidebar` — [lesson-sidebar.tsx](../src/components/learning/lesson-sidebar.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Danh sách bài giảng theo chương ở cột trái phòng học. Có tick ✅ nếu đã hoàn thành. |
| **Input** | `courseId`, `currentLessonId`, `chapters`, `className` |
| **Gọi tới** | `enrollmentService.getCourseProgress()` |
| **Độ quan trọng** | 🔴 Critical |

### `CommentsPanel` — [comments-panel.tsx](../src/components/learning/comments-panel.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Khu vực hỏi đáp, bình luận bên dưới bài giảng. |
| **Input** | `lessonId: string` |
| **Gọi tới** | Strapi `/comments` API |
| **Độ quan trọng** | 🟡 Medium |

### `NotesPanel` — [notes-panel.tsx](../src/components/learning/notes-panel.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Ghi chú cá nhân trong phòng học. Lưu vào Firestore `users/{uid}/notes/{lessonId}`. |
| **Input** | `lessonId: string` |
| **Gọi tới** | `firestoreService`, `useAuthStore` |
| **Độ quan trọng** | 🟡 Medium |

---

## 📝 Nhóm Quiz — Trắc nghiệm

### `QuestionCard` — [question-card.tsx](../src/components/quiz/question-card.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Hiển thị một câu hỏi: nội dung, 4 đáp án lựa chọn, trạng thái chọn/đúng/sai. |
| **Input** | `question: Question`, callback chọn đáp án |
| **Độ quan trọng** | 🟡 Medium |

### `QuizTimer` — [quiz-timer.tsx](../src/components/quiz/quiz-timer.tsx)
| Trường | Nội dung |
|---|---|
| **Chức năng** | Đồng hồ đếm ngược MM:SS. Khi hết giờ gọi `onTimeUp()`. |
| **Input** | `initialMinutes: number`, `onTimeUp: () => void` |
| **Độ quan trọng** | 🟡 Medium |

---

## 🔧 Nhóm Shared — Dùng chung

| Component | Chức năng | Input chính |
|---|---|---|
| `EmptyState` | Màn hình trống khi không có dữ liệu (icon + message + action) | `icon`, `title`, `description`, `onAction` |
| `LoadingSkeleton` | Skeleton loading placeholder thay thế nội dung đang tải | `type: 'card' \| ...` |
| `Pagination` | Thanh phân trang (Prev/Next/Page numbers) | `currentPage`, `totalPages`, `onPageChange` |
| `RatingStars` | Hiển thị sao đánh giá (có thể tương tác hoặc read-only) | `rating`, `maxRating`, `interactive` |
| `AvatarUpload` | Upload ảnh đại diện lên Firebase Storage, cập nhật Firestore | `currentUrl`, `userId`, `onUploadSuccess` |
