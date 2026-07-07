import { coursesApi } from "@/services/api/courses.api";
import { FeaturedCoursesClient } from "./featured-courses-client";

export async function FeaturedCourses() {
  let courses: any[] = [];
  try {
    courses = await coursesApi.getFeaturedCourses();
  } catch {
    // Strapi not running — render with empty courses (no crash)
  }
  return <FeaturedCoursesClient courses={courses} />;
}