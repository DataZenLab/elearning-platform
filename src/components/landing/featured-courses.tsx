import { coursesApi } from "@/services/api/courses.api";
import { FeaturedCoursesClient } from "./featured-courses-client";

const FALLBACK_COURSES = [
  {
    id: "c1",
    title: "Full-Stack Next.js 16 & React 19 Masterclass",
    slug: "react-nextjs-masterclass",
    shortDescription: "Build high-performance web applications with App Router, Server Actions, and Tailwind CSS.",
    price: 499000,
    originalPrice: 899000,
    averageRating: 4.9,
    totalRatings: 340,
    totalStudents: 1420,
    difficulty: "intermediate" as const,
    duration: 1800,
    category: { id: 1, name: "Web Development", slug: "web-development", color: "#2563EB" },
    instructor: { id: 1, name: "Alex Harrison" }
  },
  {
    id: "c2",
    title: "System Design & Cloud Architecture on AWS",
    slug: "docker-kubernetes-developer",
    shortDescription: "Architect scalable, resilient microservices with Docker, Kubernetes, and AWS cloud services.",
    price: 599000,
    originalPrice: 999000,
    averageRating: 4.85,
    totalRatings: 215,
    totalStudents: 980,
    difficulty: "advanced" as const,
    duration: 2400,
    category: { id: 2, name: "DevOps & Cloud", slug: "devops-cloud", color: "#F59E0B" },
    instructor: { id: 2, name: "David Miller" }
  },
  {
    id: "c3",
    title: "UI/UX Design Systems with Figma & Prototyping",
    slug: "uiux-design-figma",
    shortDescription: "Master modern design systems, auto-layout, design tokens, and interactive micro-animations.",
    price: 399000,
    originalPrice: 699000,
    averageRating: 4.92,
    totalRatings: 180,
    totalStudents: 850,
    difficulty: "beginner" as const,
    duration: 1200,
    category: { id: 3, name: "UI/UX Design", slug: "ui-ux-design", color: "#8B5CF6" },
    instructor: { id: 3, name: "Sarah Lin" }
  },
  {
    id: "c4",
    title: "Applied AI & Data Science with Python",
    slug: "data-science-ai-masterclass-10",
    shortDescription: "Train deep neural networks, build ML pipelines, and deploy LLM applications with LangChain.",
    price: 649000,
    originalPrice: 1099000,
    averageRating: 4.88,
    totalRatings: 310,
    totalStudents: 1150,
    difficulty: "intermediate" as const,
    duration: 2100,
    category: { id: 4, name: "Data Science & AI", slug: "data-science-ai", color: "#06B6D4" },
    instructor: { id: 4, name: "Dr. Ethan Wright" }
  }
];

export async function FeaturedCourses() {
  let courses: any[] = [];
  try {
    const res = await coursesApi.getFeaturedCourses();
    if (res && res.length > 0) {
      courses = res;
    } else {
      courses = FALLBACK_COURSES;
    }
  } catch {
    // Strapi offline fallback
    courses = FALLBACK_COURSES;
  }
  return <FeaturedCoursesClient courses={courses} />;
}
