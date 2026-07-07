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
