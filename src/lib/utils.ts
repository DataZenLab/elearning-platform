import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return `${hours}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ''}`;
}

const COURSE_IMAGES: Record<string, string> = {
  'react-nextjs-masterclass': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
  'uiux-design-figma': 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop',
  'docker-kubernetes-developer': 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop',
  'nodejs-express-backend': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
  'typescript-advanced-patterns': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
  'data-science-ai-masterclass-10': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
  'digital-marketing-az': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
  'digital-marketing-2-masterclass-6': 'https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?q=80&w=800&auto=format&fit=crop',
  'digital-marketing-2-masterclass-7': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
  'digital-marketing-2-masterclass-8': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=800&auto=format&fit=crop',
  'digital-marketing-2-masterclass-9': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
  'digital-marketing-2-masterclass-10': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop',
  'mobile-app-masterclass-1': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
  'ui-ux-design-masterclass-10': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
};

export function getCourseImage(course: any): string {
  if (course?.thumbnail?.url) return course.thumbnail.url;
  if (course?.imageUrl) return course.imageUrl;
  if (course?.slug && COURSE_IMAGES[course.slug]) return COURSE_IMAGES[course.slug];
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';
}

