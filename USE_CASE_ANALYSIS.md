# Phân Tích Kiến Trúc Use Case - E-Learning Platform

Tài liệu này tổng hợp phân tích về các Use Case, xác định Use Case nào cần vẽ Sequence Diagram, Controller tương ứng và luồng xử lý chi tiết.

## 1. Danh Sách Controller Toàn Hệ Thống

Hệ thống được thiết kế với 10 Controller chính để tránh dư thừa và gom nhóm các Use Case cùng Domain:

1. **`AuthController`**: Quản lý Xác thực (Đăng nhập, Đăng ký, Đổi mật khẩu, Xác thực Email, Khôi phục mật khẩu).
2. **`UserController`**: Quản lý User Profile (Xem hồ sơ, Sửa tên, Cài đặt/Tắt thông báo).
3. **`CourseController`**: Quản lý Khóa học (Tìm kiếm, Lọc, Xem thông tin khóa, CRUD khóa học của Giảng viên).
4. **`LessonController`**: Quản lý Bài học (Xem video chi tiết, Tải file, Đăng bài giảng).
5. **`EnrollmentController`**: Quản lý Đăng ký/Giao dịch (Mua khóa học, Thử học miễn phí, Lịch sử giao dịch).
6. **`ProgressController`**: Quản lý Quá trình học (Theo dõi tiến độ, Lưu xem dở, Nhận chứng chỉ, Leaderboard).
7. **`InteractionController`**: Quản lý Tương tác (Gửi bình luận, Đánh giá/Rating, Lưu yêu thích, Ghi chú cá nhân).
8. **`QuizController`**: Quản lý Kiểm tra (Làm trắc nghiệm).
9. **`AdminController`**: Quản lý hệ thống cho Quản trị viên (Phê duyệt khóa học, Quản lý người dùng).
10. **`SystemController`**: Các tính năng hệ thống phụ trợ (Báo lỗi hệ thống).

---

## 2. Bảng Phân Tích Use Case

| Use Case | Cần vẽ Sequence? | Controller | Thành phần tham gia (Actor -> Boundary -> Controller ...) |
| --- | --- | --- | --- |
| 1. User Đăng ký thành viên | **Có** | `AuthController` | Actor -> UI -> AuthController -> Firebase Auth -> Strapi API -> Response -> UI -> Actor |
| 2. Học viên Đăng nhập hệ thống | **Có** | `AuthController` | Actor -> UI -> AuthController -> Firebase Auth -> Strapi API -> Response -> UI -> Actor |
| 3. Học viên Đăng xuất tài khoản | Không | `AuthController` | - |
| 4. Học viên Xem hồ sơ cá nhân | Không | `UserController` | - |
| 5. Học viên Xem danh mục học | Không | `CourseController` | - |
| 6. Học viên Xem chi tiết bài học | **Có** | `LessonController` | Học viên -> UI -> LessonController -> Firestore -> Strapi API -> Response -> UI -> Học viên |
| 7. Học viên Xem danh sách bài | Không | `CourseController` | *(Thuộc Use Case 8)* |
| 8. Học viên Xem thông tin khóa học | **Có** | `CourseController` | Học viên -> UI -> CourseController -> Firestore -> Strapi API -> Response -> UI -> Học viên |
| 9. Học viên Xem tổng số bài | Không | `CourseController` | *(Thuộc Use Case 8)* |
| 10. Học viên Xem gợi ý học | Không | `CourseController` | - |
| 11. Học viên Tìm kiếm khóa học | **Có** | `CourseController` | Học viên -> UI -> CourseController -> Strapi API -> Response -> UI -> Học viên |
| 12. Học viên Lọc theo trình độ | Không | `CourseController` | *(Thuộc Use Case 11)* |
| 13. Học viên Lọc theo chủ đề | Không | `CourseController` | *(Thuộc Use Case 11)* |
| 14. Học viên Phát video bài giảng | Không | `LessonController` | - |
| 15. Học viên Chuyển bài học | Không | `LessonController` | *(Thuộc Use Case 6)* |
| 16. Học viên Thấy bài đã học | Không | `ProgressController` | *(Thuộc Use Case 43)* |
| 17. Học viên Xác thực Email | **Có** | `AuthController` | Học viên -> UI -> AuthController -> Firebase Auth -> Strapi API -> Response -> UI -> Học viên |
| 18. Học viên Thấy huy hiệu | Không | `UserController` | *(Thuộc Use Case 4)* |
| 19. Học viên Sửa tên hiển thị | **Có** | `UserController` | Học viên -> UI -> UserController -> Firebase Auth -> Strapi API -> Response -> UI -> Học viên |
| 20. Học viên Thống kê số khóa | Không | `UserController` | *(Thuộc Use Case 4)* |
| 21. Học viên Gửi bình luận | **Có** | `InteractionController`| Học viên -> UI -> InteractionController -> Strapi API / Firestore -> Response -> UI -> Học viên |
| 22. Học viên Theo dõi lộ trình | Không | `ProgressController` | *(Trùng với Use Case 43)* |
| 23. Học viên Lưu xem dở | **Có** | `ProgressController` | Học viên -> UI -> ProgressController -> Firestore -> Response -> UI -> Học viên |
| 24. Học viên Xác nhận thoát | Không | - | - |
| 25. Học viên Thử học miễn phí | **Có** | `EnrollmentController`| Học viên -> UI -> EnrollmentController -> Firestore -> Strapi API -> Response -> UI -> Học viên |
| 26. Giảng viên Đăng bài giảng | **Có** | `LessonController` | Giảng viên -> UI -> LessonController -> Firebase Storage -> Strapi API -> Response -> UI -> Giảng viên |
| 27. Học viên Tải file đính kèm | **Có** | `LessonController` | Học viên -> UI -> LessonController -> Firebase Storage -> Response -> UI -> Học viên |
| 28. Học viên Đổi mật khẩu mới | **Có** | `AuthController` | Học viên -> UI -> AuthController -> Firebase Auth -> Response -> UI -> Học viên |
| 29. Học viên Báo lỗi hệ thống | **Có** | `SystemController` | Học viên -> UI -> SystemController -> Strapi API -> Response -> UI -> Học viên |
| 30. Học viên Nhận chứng chỉ | **Có** | `ProgressController` | Học viên -> UI -> ProgressController -> Firebase Storage -> Strapi API -> Response -> UI -> Học viên |
| 31. Học viên Lưu yêu thích | **Có** | `InteractionController`| Học viên -> UI -> InteractionController -> Firestore -> Response -> UI -> Học viên |
| 32. Học viên Ghi chú cá nhân | **Có** | `InteractionController`| Học viên -> UI -> InteractionController -> Firestore -> Response -> UI -> Học viên |
| 33. Học viên Làm trắc nghiệm | **Có** | `QuizController` | Học viên -> UI -> QuizController -> Strapi API -> Firestore -> Response -> UI -> Học viên |
| 34. Học viên Thấy Leaderboard | Không | `ProgressController` | - |
| 35. Học viên Biết lý lịch GV | Không | `CourseController` | *(Thuộc Use Case 8)* |
| 36. Học viên Tắt thông báo | Không | `UserController` | *(Thuộc Use Case 19)* |
| 37. Học viên Xem tổng giờ học | Không | `ProgressController` | *(Thuộc Use Case 4)* |
| 38. Học viên Đánh giá khóa học | **Có** | `InteractionController`| Học viên -> UI -> InteractionController -> Strapi API -> Response -> UI -> Học viên |
| 39. Học viên Thấy bài phù hợp | Không | `CourseController` | *(Thuộc Use Case 10)* |
| 40. Học viên Làm mới học tập | Không | `ProgressController` | - |
| 41. Học viên Khôi phục mật khẩu | **Có** | `AuthController` | Học viên -> UI -> AuthController -> Firebase Auth -> Response -> UI -> Học viên |
| 42. Học viên đăng ký khóa học | **Có** | `EnrollmentController`| Học viên -> UI -> EnrollmentController -> Firestore -> Strapi API -> Response -> UI -> Học viên |
| 43. Học viên theo dõi tiến độ | **Có** | `ProgressController` | Học viên -> UI -> ProgressController -> Firestore -> Response -> UI -> Học viên |
| 44. Học viên xem lịch sử GD | Không | `EnrollmentController`| - |
| 45. Giảng viên tạo khóa học | **Có** | `CourseController` | Giảng viên -> UI -> CourseController -> Firebase Storage -> Strapi API -> Response -> UI -> Giảng viên |
| 46. Giảng viên cập nhật khóa học| **Có** | `CourseController` | Giảng viên -> UI -> CourseController -> Firebase Storage -> Strapi API -> Response -> UI -> Giảng viên |
| 47. Giảng viên xóa khóa học | **Có** | `CourseController` | Giảng viên -> UI -> CourseController -> Strapi API -> Response -> UI -> Giảng viên |
| 48. QTV quản lý người dùng | **Có** | `AdminController` | QTV -> UI -> AdminController -> Firebase Auth -> Strapi API -> Response -> UI -> QTV |
| 49. QTV phê duyệt khóa học | **Có** | `AdminController` | QTV -> UI -> AdminController -> Strapi API -> Response -> UI -> QTV |
| 50. QTV xem báo cáo tổng quan | Không | `AdminController` | - |
