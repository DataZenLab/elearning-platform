// ===== APP CONSTANTS =====

export const APP_NAME = 'EduFlow';
export const APP_DESCRIPTION = 'Nền tảng học trực tuyến hiện đại với hàng nghìn khóa học chất lượng cao';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ===== NAVIGATION =====

export const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/courses', label: 'Khóa học' },
  { href: '/about', label: 'Giới thiệu' },
  { href: '/contact', label: 'Liên hệ' },
] as const;

export const DASHBOARD_NAV = [
  { href: '/dashboard', label: 'Tổng quan', icon: 'LayoutDashboard' },
  { href: '/my-courses', label: 'Khóa học của tôi', icon: 'BookOpen' },
  { href: '/certificates', label: 'Chứng chỉ', icon: 'Award' },
  { href: '/wishlist', label: 'Yêu thích', icon: 'Heart' },
  { href: '/leaderboard', label: 'Bảng xếp hạng', icon: 'Trophy' },
  { href: '/profile', label: 'Hồ sơ', icon: 'User' },
] as const;

export const ADMIN_NAV = [
  { href: '/admin', label: 'Analytics', icon: 'BarChart3' },
  { href: '/admin/courses', label: 'Khóa học', icon: 'BookOpen' },
  { href: '/admin/lessons', label: 'Bài học', icon: 'PlayCircle' },
  { href: '/admin/users', label: 'Người dùng', icon: 'Users' },
  { href: '/admin/quizzes', label: 'Quiz', icon: 'FileQuestion' },
  { href: '/admin/reviews', label: 'Đánh giá', icon: 'MessageSquare' },
] as const;

// ===== COURSE FILTERS =====

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Người mới', color: '#22C55E' },
  { value: 'intermediate', label: 'Trung cấp', color: '#F59E0B' },
  { value: 'advanced', label: 'Nâng cao', color: '#EF4444' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
] as const;

// ===== PAGINATION =====

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;

// ===== CATEGORIES (MOCK FOR LANDING) =====

export const LANDING_CATEGORIES = [
  { name: 'Lập trình Web', icon: 'Code2', color: '#2563EB', count: 156 },
  { name: 'Thiết kế UI/UX', icon: 'Palette', color: '#8B5CF6', count: 89 },
  { name: 'Marketing', icon: 'Megaphone', color: '#EC4899', count: 124 },
  { name: 'Data Science', icon: 'Database', color: '#06B6D4', count: 97 },
  { name: 'Mobile Dev', icon: 'Smartphone', color: '#22C55E', count: 73 },
  { name: 'DevOps', icon: 'Cloud', color: '#F59E0B', count: 45 },
  { name: 'AI & ML', icon: 'Brain', color: '#EF4444', count: 68 },
  { name: 'Business', icon: 'Briefcase', color: '#14B8A6', count: 112 },
] as const;

// ===== TESTIMONIALS (MOCK) =====

export const TESTIMONIALS = [
  {
    name: 'Nguyễn Văn An',
    role: 'Frontend Developer tại FPT Software',
    avatar: '/images/avatars/avatar-1.jpg',
    content: 'EduFlow giúp tôi nâng cao kỹ năng React và landing được công việc mơ ước. Các khóa học được thiết kế rất chuyên nghiệp và dễ hiểu.',
    rating: 5,
  },
  {
    name: 'Trần Thị Bình',
    role: 'UI/UX Designer tại Tiki',
    avatar: '/images/avatars/avatar-2.jpg',
    content: 'Tôi đã học thiết kế UI/UX từ con số 0 trên EduFlow. Giảng viên rất tận tâm và cộng đồng hỗ trợ lẫn nhau rất tốt.',
    rating: 5,
  },
  {
    name: 'Lê Minh Cường',
    role: 'Data Analyst tại VinGroup',
    avatar: '/images/avatars/avatar-3.jpg',
    content: 'Khóa học Data Science trên EduFlow rất thực tế. Tôi đã áp dụng ngay được kiến thức vào công việc hàng ngày.',
    rating: 5,
  },
  {
    name: 'Phạm Hương Giang',
    role: 'Full Stack Developer Freelancer',
    avatar: '/images/avatars/avatar-4.jpg',
    content: 'Chương trình học rất bài bản từ cơ bản đến nâng cao. EduFlow là nơi tốt nhất để bắt đầu hành trình lập trình.',
    rating: 4,
  },
] as const;

// ===== FAQ =====

export const FAQ_ITEMS = [
  {
    question: 'EduFlow là gì?',
    answer: 'EduFlow là nền tảng học trực tuyến hàng đầu Việt Nam, cung cấp hàng nghìn khóa học chất lượng cao từ các chuyên gia trong ngành. Chúng tôi tập trung vào công nghệ, thiết kế, marketing và kinh doanh.',
  },
  {
    question: 'Tôi có thể học miễn phí không?',
    answer: 'Có! Chúng tôi có nhiều khóa học miễn phí và các bài học preview để bạn trải nghiệm trước khi đăng ký. Ngoài ra, các khóa học trả phí đều có cam kết hoàn tiền trong 30 ngày.',
  },
  {
    question: 'Làm thế nào để nhận chứng chỉ?',
    answer: 'Sau khi hoàn thành 100% bài học và đạt điểm quiz tối thiểu, bạn sẽ tự động nhận được chứng chỉ hoàn thành có thể tải về dạng PDF và chia sẻ trên LinkedIn.',
  },
  {
    question: 'Tôi có thể học trên điện thoại không?',
    answer: 'Hoàn toàn được! EduFlow được thiết kế responsive, hoạt động mượt mà trên mọi thiết bị từ điện thoại, tablet đến máy tính.',
  },
  {
    question: 'Có hỗ trợ khi gặp khó khăn không?',
    answer: 'Chúng tôi có đội ngũ hỗ trợ 24/7 qua chat và email. Ngoài ra, mỗi khóa học đều có cộng đồng học viên để trao đổi và giúp đỡ lẫn nhau.',
  },
] as const;

// ===== FEATURES =====

export const FEATURES = [
  {
    title: 'Học mọi lúc mọi nơi',
    description: 'Truy cập khóa học trên mọi thiết bị, học theo tốc độ của riêng bạn với nội dung được cập nhật liên tục.',
    icon: 'Globe',
  },
  {
    title: 'Giảng viên hàng đầu',
    description: 'Học từ các chuyên gia có nhiều năm kinh nghiệm thực tế tại các công ty hàng đầu Việt Nam và thế giới.',
    icon: 'GraduationCap',
  },
  {
    title: 'Chứng chỉ giá trị',
    description: 'Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học, nâng cao hồ sơ chuyên nghiệp của bạn.',
    icon: 'Award',
  },
  {
    title: 'Cộng đồng hỗ trợ',
    description: 'Tham gia cộng đồng hàng nghìn học viên, trao đổi kiến thức và mở rộng mạng lưới chuyên nghiệp.',
    icon: 'Users',
  },
  {
    title: 'Học thực hành',
    description: 'Dự án thực tế, bài tập coding, quiz tương tác giúp bạn nắm vững kiến thức và áp dụng ngay.',
    icon: 'Code2',
  },
  {
    title: 'Theo dõi tiến độ',
    description: 'Dashboard cá nhân giúp bạn theo dõi tiến trình học, mục tiêu và thành tích một cách trực quan.',
    icon: 'TrendingUp',
  },
] as const;

// ===== STATS =====

export const LANDING_STATS = [
  { value: '50,000+', label: 'Học viên' },
  { value: '500+', label: 'Khóa học' },
  { value: '100+', label: 'Giảng viên' },
  { value: '98%', label: 'Hài lòng' },
] as const;
