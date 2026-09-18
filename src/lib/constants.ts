// ===== APP CONSTANTS =====

export const APP_NAME = 'EduFlow';
export const APP_DESCRIPTION = 'Modern online learning platform featuring industry-leading courses and expert instructors';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ===== NAVIGATION =====

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
] as const;

export const DASHBOARD_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/my-courses', label: 'My Courses', icon: 'BookOpen' },
  { href: '/certificates', label: 'Certificates', icon: 'Award' },
  { href: '/wishlist', label: 'Wishlist', icon: 'Heart' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { href: '/profile', label: 'Profile Settings', icon: 'User' },
] as const;

export const ADMIN_NAV = [
  { href: '/admin', label: 'Analytics', icon: 'BarChart3' },
  { href: '/admin/courses', label: 'Courses', icon: 'BookOpen' },
  { href: '/admin/lessons', label: 'Lessons', icon: 'PlayCircle' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/quizzes', label: 'Quizzes', icon: 'FileQuestion' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'MessageSquare' },
] as const;

// ===== COURSE FILTERS =====

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', color: '#22C55E' },
  { value: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
  { value: 'advanced', label: 'Advanced', color: '#EF4444' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const;

// ===== PAGINATION =====

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;

// ===== CATEGORIES (MOCK FOR LANDING) =====

export const LANDING_CATEGORIES = [
  { name: 'Web Development', icon: 'Code2', color: '#2563EB', count: 156 },
  { name: 'UI/UX Design', icon: 'Palette', color: '#8B5CF6', count: 89 },
  { name: 'Digital Marketing', icon: 'Megaphone', color: '#EC4899', count: 124 },
  { name: 'Data Science & AI', icon: 'Database', color: '#06B6D4', count: 97 },
  { name: 'Mobile Development', icon: 'Smartphone', color: '#22C55E', count: 73 },
  { name: 'DevOps & Cloud', icon: 'Cloud', color: '#F59E0B', count: 45 },
  { name: 'Machine Learning', icon: 'Brain', color: '#EF4444', count: 68 },
  { name: 'Business & Management', icon: 'Briefcase', color: '#14B8A6', count: 112 },
] as const;

// ===== TESTIMONIALS (MOCK) =====

export const TESTIMONIALS = [
  {
    name: 'Alexander Reed',
    role: 'Frontend Engineer at Stripe',
    avatar: '/images/avatars/avatar-1.jpg',
    content: 'EduFlow helped me master modern React and Next.js architecture. The project-driven courses provided immediate value to my engineering workflow.',
    rating: 5,
  },
  {
    name: 'Sophia Martinez',
    role: 'Senior Product Designer at Airbnb',
    avatar: '/images/avatars/avatar-2.jpg',
    content: 'I transitioned from graphic design into UI/UX entirely through EduFlow. The depth of design systems and interactive prototyping is unmatched.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Lead Data Analyst at Spotify',
    avatar: '/images/avatars/avatar-3.jpg',
    content: 'The Python for Machine Learning course is practical, comprehensive, and up-to-date with modern toolchains. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'Full Stack Cloud Architect',
    avatar: '/images/avatars/avatar-4.jpg',
    content: 'Well-structured curriculum from fundamentals to distributed systems. EduFlow is the best platform to level up technical expertise.',
    rating: 5,
  },
] as const;

// ===== FAQ =====

export const FAQ_ITEMS = [
  {
    question: 'What is EduFlow?',
    answer: 'EduFlow is an enterprise e-learning platform delivering top-tier technical courses taught by industry veterans in software engineering, system design, data science, and modern technology stacks.',
  },
  {
    question: 'Can I preview courses before enrolling?',
    answer: 'Yes! We offer free preview lessons for every course so you can evaluate the teaching style and curriculum depth before making a commitment. All paid courses include a 30-day money-back guarantee.',
  },
  {
    question: 'How do I earn verified certificates?',
    answer: 'Upon completing 100% of the lessons and successfully passing the end-of-module assessment quizzes, you will receive a verifiable digital certificate shareable directly on LinkedIn.',
  },
  {
    question: 'Is EduFlow accessible on mobile devices?',
    answer: 'Absolutely. EduFlow is fully responsive and optimized for seamless learning across desktops, tablets, and mobile devices.',
  },
  {
    question: 'How do I get instructor support if I get stuck?',
    answer: 'Each course features an integrated community discussion room and Q&A section where instructors and peers provide timely support.',
  },
] as const;

// ===== FEATURES =====

export const FEATURES = [
  {
    title: 'Learn Anywhere, Anytime',
    description: 'Access video lessons, transcripts, and source code from any device with high-definition streaming.',
    icon: 'Globe',
  },
  {
    title: 'World-Class Instructors',
    description: 'Learn directly from senior software engineers, tech leads, and industry practitioners.',
    icon: 'GraduationCap',
  },
  {
    title: 'Verified Certificates',
    description: 'Earn industry-recognized digital credentials to showcase your expertise to hiring managers.',
    icon: 'Award',
  },
  {
    title: 'Active Tech Community',
    description: 'Engage with fellow developers, participate in code reviews, and expand your professional network.',
    icon: 'Users',
  },
  {
    title: 'Hands-on Projects',
    description: 'Build real-world production applications and portfolio-worthy projects throughout your coursework.',
    icon: 'Code2',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor learning streaks, quiz scores, and course completion milestones through visual dashboards.',
    icon: 'TrendingUp',
  },
] as const;

// ===== STATS =====

export const LANDING_STATS = [
  { value: '50,000+', label: 'Active Students' },
  { value: '500+', label: 'Expert Courses' },
  { value: '100+', label: 'Verified Instructors' },
  { value: '98%', label: 'Satisfaction Rate' },
] as const;
