import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const isProduction = process.env.NODE_ENV === "production";

export function getInitials(name: string): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  const initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase());
  return initials.join("");
}

export function getFirstName(fullName: string | undefined | null): string {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
}

/**
 * Format a date as relative time (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

export function parsePaginationParams(limitParam: string | string[] | undefined, offsetParam: string | string[] | undefined) {
  let limit = limitParam && typeof limitParam === 'string' ? parseInt(limitParam) : undefined;
  let offset = offsetParam && typeof offsetParam === 'string' ? parseInt(offsetParam) : undefined;

  if (limit && isNaN(limit)) {
    limit = undefined;
  }
  if (offset && isNaN(offset)) {
    offset = undefined;
  }

  return { limit, offset };
}