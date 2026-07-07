import { notFound } from 'next/navigation';
import { coursesApi } from '@/services/api/courses.api';
import { CheckoutClient } from './checkout-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thanh toán khóa học | EduFlow',
  description: 'Thanh toán khóa học trên EduFlow',
};

export default async function CheckoutPage(props: { params: Promise<{ courseSlug: string }> }) {
  const params = await props.params;
  
  const course = await coursesApi.getCourseBySlug(params.courseSlug);
  
  if (!course) {
    notFound();
  }

  return <CheckoutClient course={course} />;
}
