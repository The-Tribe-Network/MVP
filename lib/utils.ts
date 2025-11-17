import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isProduction = process.env.NODE_ENV === "production";

export function getInitials(name: string): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  const initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase());
  return initials.join("");
}
