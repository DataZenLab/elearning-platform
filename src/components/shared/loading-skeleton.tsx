import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'dashboard' | 'video';
}

/**
 * Khung xương tải trang (Skeleton Layout): Hiển thị hiệu ứng chớp nháy trước khi dữ liệu thật tải xong.
 */
export function LoadingSkeleton({ type = 'card' }: LoadingSkeletonProps) {
  if (type === 'dashboard') {
    return (
      <div className="flex w-full h-full gap-6 p-6">
        <Skeleton className="w-64 h-[calc(100vh-3rem)] rounded-xl hidden lg:block" />
        <div className="flex-1 space-y-6">
          <Skeleton className="w-full h-20 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl" />
          </div>
          <Skeleton className="w-full h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="flex flex-col space-y-3 w-full">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
