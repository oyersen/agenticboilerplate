import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper precedence handling.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-teal-600', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
