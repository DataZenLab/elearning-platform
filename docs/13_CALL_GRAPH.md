# 📞 13 — Call Graph (Sơ đồ gọi hàm)

Tài liệu này mô tả hàm nào gọi hàm nào theo từng tình huống nghiệp vụ thực tế.

---

## 1. Luồng Đăng Nhập (Login)

```mermaid
sequenceDiagram
    participant U as User
    participant LP as LoginPage
    participant SAB as SocialAuthButtons
    participant AS as AuthService
    participant FB as Firebase Auth
    participant AP as AuthProvider
    participant FS as FirestoreService
    participant STORE as useAuthStore

    U->>LP: Điền Email/Password
    LP->>AS: loginWithEmail(credentials)
    AS->>FB: signInWithEmailAndPassword()
    FB-->>AS: userCredential
    AS->>FS: getOrCreateUserProfile(uid)
    FS-->>AS: { role, status }
    AS-->>LP: FirebaseUser
    LP-->>U: Redirect theo role

    Note over FB,AP: onAuthStateChanged tự kích hoạt
    FB->>AP: firebaseUser object
    AP->>FS: getOrCreateUserProfile(uid)
    FS-->>AP: { role, status }
    AP->>STORE: setUser(fullUserObject)
```

---

## 2. Luồng Xem Trang Khóa Học (Course Detail)

```mermaid
flowchart TD
    A([User vào /courses/slug]) --> B[courses/slug/page.tsx]
    B --> C[coursesApi.getCourseBySlug]
    C --> D[lib/strapi.ts - GET /courses?slug=...]
    D --> E[(Strapi CMS)]
    E -->> D
    D -->> C
    C -->> B
    B --> F[CourseDetailHero course]
    B --> G[Curriculum lessons]
    B --> H[StickySidebar course]
    H --> I[enrollmentService.checkEnrollment]
    I --> J[(Firestore)]
```

---

## 3. Luồng Học Bài Giảng (Watch Lesson)

```mermaid
sequenceDiagram
    participant U as User
    participant LP as LearnPage
    participant LA as LessonApi
    participant VP as VideoPlayer
    participant ES as EnrollmentService
    participant FS as Firestore

    U->>LP: Vào /learn/course-slug/lesson-slug
    LP->>LA: getLessonBySlug(lessonSlug)
    LA-->>LP: Lesson (videoId, content, quiz)
    LP->>VP: Render VideoPlayer(youtubeVideoId)
    U->>VP: Xem xong video (onEnded)
    VP->>LP: onEnded callback
    LP->>ES: markLessonCompleted(uid, courseId, lessonId)
    ES->>FS: setDoc (users/{uid}/progress/{courseId})
    FS-->>ES: OK
    LP->>LP: Cập nhật UI (tick xanh)
```

---

## 4. Luồng Tạo Khóa Học (Instructor)

```mermaid
flowchart TD
    A([Giảng viên bấm Tạo khóa học]) --> B[NewCoursePage Form]
    B --> C[createCourseAction data]
    C --> D[instructorApi.createCourse data]
    D --> E[lib/strapi.ts - POST /courses]
    E --> F[(Strapi CMS)]
    F -->> E
    E -->> D
    D -->> C
    C --> G[revalidatePath /instructor/courses]
    G --> H[Next.js xóa cache, re-render danh sách]
    C -->> B
    B -->> A
```

---

## 5. Luồng Ghi Danh Khóa Học (Enroll)

```mermaid
sequenceDiagram
    participant U as User
    participant SS as StickySidebar
    participant ES as EnrollmentService
    participant FS as Firestore
    participant Router as Next Router

    U->>SS: Bấm "Đăng ký học"
    SS->>ES: enrollUser(uid, courseId)
    ES->>FS: setDoc (users/{uid}/enrollments/{courseId})
    FS-->>ES: OK
    ES-->>SS: Done
    SS->>Router: push(/learn/courseSlug)
```

---

## 6. Luồng Làm Bài Trắc Nghiệm (Quiz)

```mermaid
flowchart TD
    A([User bấm Làm bài]) --> B[Quiz Component]
    B --> C[lessonApi.getQuizByDocumentId]
    C --> D[Strapi CMS]
    D -->> C
    C -->> B
    B --> E[QuizTimer - đếm ngược]
    B --> F[QuestionCard - hiển thị câu hỏi]
    F --> G[User chọn đáp án]
    G --> B
    B --> H{Hết giờ hoặc Submit?}
    H --> I[Tính điểm]
    I --> J[enrollmentService.updateProgress - lưu điểm]
    J --> K[(Firestore)]
```

---

## 7. Luồng Upload Avatar

```mermaid
sequenceDiagram
    participant U as User
    participant AV as AvatarUpload
    participant SS as StorageService
    participant FB as Firebase Storage
    participant FSvc as FirestoreService
    participant FS as Firestore

    U->>AV: Chọn file ảnh
    AV->>SS: uploadFile(file, path)
    SS->>FB: uploadBytes()
    FB-->>SS: UploadTask
    SS->>FB: getDownloadURL()
    FB-->>SS: downloadUrl
    SS-->>AV: downloadUrl
    AV->>FSvc: updateDocument('users', uid, {photoURL})
    FSvc->>FS: updateDoc()
    FS-->>FSvc: OK
    AV-->>U: Hiển thị avatar mới
```
