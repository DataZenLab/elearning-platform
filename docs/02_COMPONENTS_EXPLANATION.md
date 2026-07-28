# Giải thích chi tiết các components (.tsx)

Tài liệu này giải thích chi tiết chức năng và mục đích sử dụng của từng file `.tsx` nằm trong thư mục `src/components/`, được phân nhóm theo các thư mục con tương ứng.

## 1. `auth` (Xác thực & Phân quyền)
Các component liên quan đến việc bảo vệ route và xử lý đăng nhập.
- **`admin-guard.tsx`**: Component bảo vệ (Guard/HOC) để bọc các trang dành riêng cho quản trị viên (Admin). Tự động chuyển hướng nếu người dùng không có quyền.
- **`dashboard-guard.tsx`**: Guard bảo vệ các trang dashboard chung, yêu cầu người dùng phải đăng nhập mới được truy cập.
- **`instructor-guard.tsx`**: Guard bảo vệ các trang dành cho giảng viên (Instructor).
- **`learn-guard.tsx`**: Guard bảo vệ trang học tập (của học viên), đảm bảo họ đã mua khóa học hoặc có quyền truy cập bài học đó.
- **`social-auth-buttons.tsx`**: Chứa các nút đăng nhập bằng mạng xã hội (Google, GitHub, Facebook, v.v.).

## 2. `course` (Khóa học)
Các component hiển thị thông tin và chi tiết về khóa học.
- **`add-review-form.tsx`**: Form cho phép học viên gửi đánh giá và nhận xét (review) sau khi học xong.
- **`course-card.tsx`**: Thẻ (Card) hiển thị tóm tắt một khóa học (hình ảnh, tên, giá, số sao đánh giá).
- **`course-detail-hero.tsx`**: Phần banner/hero to ở trên cùng của trang chi tiết khóa học.
- **`course-filters.tsx`**: Thanh bộ lọc (theo giá, đánh giá, danh mục...) dùng trong trang tìm kiếm khóa học.
- **`course-grid.tsx`**: Layout dạng lưới (Grid) để chứa và hiển thị danh sách nhiều `course-card`.
- **`curriculum.tsx`**: Hiển thị đề cương/nội dung giảng dạy (chương, bài học) của khóa học.
- **`instructor-card.tsx`**: Thẻ hiển thị thông tin tóm tắt về giảng viên (avatar, tên, tiểu sử).
- **`review-section.tsx`**: Khu vực hiển thị danh sách các đánh giá từ học viên khác (thường tích hợp luôn form review).
- **`sticky-sidebar.tsx`**: Sidebar cố định trên trang chi tiết khóa học, thường chứa giá tiền và nút "Đăng ký/Mua ngay" luôn đi theo khi người dùng cuộn trang.

## 3. `landing` (Trang chủ / Landing Page)
Các component tạo nên các phần (sections) của trang chủ nhằm thu hút người dùng.
- **`categories-section.tsx`**: Hiển thị danh sách các danh mục khóa học phổ biến.
- **`cta-section.tsx`**: Call-To-Action section - Phần kêu gọi hành động (VD: "Đăng ký giảng dạy ngay hôm nay!").
- **`faq-section.tsx`**: Khu vực hiển thị các câu hỏi thường gặp (Frequently Asked Questions).
- **`featured-courses-client.tsx`**: Component phía Client (có tương tác) hiển thị danh sách các khóa học nổi bật (có thể là dạng slide hoặc tab).
- **`featured-courses.tsx`**: Component Server-side để fetch dữ liệu khóa học nổi bật truyền xuống client.
- **`hero-section.tsx`**: Phần mở đầu (banner lớn nhất) của trang chủ.
- **`testimonials.tsx`**: Hiển thị các lời nhận xét, đánh giá từ những học viên đã trải nghiệm (Social proof).
- **`why-choose-us.tsx`**: Phần giải thích các lý do/ưu điểm nên chọn nền tảng học tập này.

## 4. `layout` (Bố cục giao diện)
Các component dùng làm khung sườn cho ứng dụng.
- **`admin-sidebar.tsx`**: Menu điều hướng bên trái (Sidebar) dành cho Admin Dashboard.
- **`dashboard-header.tsx`**: Thanh Header phía trên cùng cho các trang Dashboard sau khi đăng nhập.
- **`footer.tsx`**: Phần chân trang (Footer) chung cho toàn website.
- **`instructor-sidebar.tsx`**: Sidebar menu điều hướng dành cho Instructor Dashboard.
- **`navbar.tsx`**: Thanh menu điều hướng chính (Header/Navbar) dành cho trang chủ và người dùng chưa đăng nhập.
- **`sidebar.tsx`**: Sidebar menu điều hướng chung (thường dành cho học viên).

## 5. `learning` (Khu vực học tập)
Các component dành riêng cho giao diện bên trong một lớp học.
- **`comments-panel.tsx`**: Khung thảo luận, Hỏi đáp (Q&A) bên dưới bài học.
- **`lesson-sidebar.tsx`**: Sidebar bên cạnh hiển thị danh sách các bài học để người dùng có thể chuyển đổi dễ dàng.
- **`notes-panel.tsx`**: Khung để học viên ghi chú cá nhân (Notes) trong quá trình học.
- **`video-player.tsx`**: Trình phát video (Video Player) để xem nội dung bài giảng.

## 6. `profile` (Hồ sơ người dùng)
- **`profile-client.tsx`**: Component phía Client để người dùng xem và chỉnh sửa thông tin cá nhân (tên, avatar, tiểu sử).

## 7. `quiz` (Bài trắc nghiệm)
Các component dùng cho bài tập trắc nghiệm.
- **`question-card.tsx`**: Thẻ hiển thị một câu hỏi trắc nghiệm cùng với các đáp án (options) để chọn.
- **`quiz-timer.tsx`**: Đồng hồ đếm ngược thời gian làm bài trắc nghiệm.

## 8. `shared` (Component dùng chung)
Các component tiện ích, có thể dùng ở nhiều nơi trong dự án.
- **`avatar-upload.tsx`**: Component hỗ trợ tính năng chọn và tải lên hình đại diện.
- **`empty-state.tsx`**: Giao diện hiển thị khi không có dữ liệu (VD: "Chưa có khóa học nào", "Không tìm thấy kết quả").
- **`error-boundary.tsx`**: Component bắt lỗi (Error Boundary) của React, hiển thị giao diện báo lỗi thân thiện thay vì làm sập cả trang web.
- **`loading-skeleton.tsx`**: Hiển thị các khối mờ (Skeleton) nhấp nháy khi dữ liệu đang được tải về.
- **`pagination.tsx`**: Component phân trang (Next, Prev, các số trang).
- **`rating-stars.tsx`**: Hiển thị số sao đánh giá (Ví dụ: 4.5/5 sao).

## 9. `ui` (Giao diện nền tảng)
Thư mục này thường chứa các UI component cơ bản, nguyên thủy nhất. Phần lớn được tạo ra thông qua các thư viện như `shadcn/ui` (dựa trên Radix UI) hoặc tương tự.
- **`accordion.tsx`**: Giao diện thu gọn / mở rộng nội dung.
- **`avatar.tsx`**: Component hiển thị hình ảnh đại diện dạng tròn.
- **`badge.tsx`**: Nhãn (Tag) nhỏ để đánh dấu trạng thái (VD: "Mới", "Giảm giá").
- **`button.tsx`**: Nút bấm với nhiều biến thể (biến thể primary, outline, ghost).
- **`card.tsx`**: Khung bao bọc nội dung (Card).
- **`dialog.tsx`**: Cửa sổ pop-up hiển thị chồng lên trên nội dung (Modal/Dialog).
- **`dropdown-menu.tsx`**: Menu đổ xuống khi click.
- **`input.tsx`**: Ô nhập liệu (Text input).
- **`label.tsx`**: Nhãn (Label) cho các ô nhập liệu.
- **`progress.tsx`**: Thanh tiến trình (Ví dụ: Tiến độ hoàn thành khóa học).
- **`radio-group.tsx`**: Nhóm các nút chọn (Radio buttons).
- **`scroll-area.tsx`**: Khu vực có thể cuộn với thanh cuộn tùy chỉnh.
- **`select.tsx`**: Ô chọn một giá trị từ một danh sách (Dropdown Select).
- **`separator.tsx`**: Đường gạch ngang/dọc chia cắt nội dung.
- **`sheet.tsx`**: Bảng trượt (Sidebar/Drawer) trượt từ mép màn hình vào.
- **`skeleton.tsx`**: Hiển thị khung tải nội dung cơ bản.
- **`tabs.tsx`**: Chia nội dung thành các tab (Tab điều hướng ngang).
