import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  reviewCount?: number;
}

export function RatingStars({ 
  rating, 
  maxStars = 5, 
  size = 'sm', 
  className,
  showText = false,
  reviewCount
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconClass = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex text-yellow-500">
        {[...Array(maxStars)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className={cn(iconClass, "fill-current")} />;
          }
          if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className={cn(iconClass, "fill-current")} />;
          }
          return <Star key={i} className={cn(iconClass, "text-muted-foreground/30")} />;
        })}
      </div>
      
      {showText && (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="text-muted-foreground">({reviewCount.toLocaleString()})</span>
          )}
        </div>
      )}
    </div>
  );
}
