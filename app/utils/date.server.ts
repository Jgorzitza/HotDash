/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Get date N days ago
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

/**
 * Get date range for the last N days
 */
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = daysAgo(days);
  return {
    start: toISODate(start),
    end: toISODate(end),
  };
}

/**
 * Parse ISO date string to Date
 */
export function parseISODate(dateString: string): Date {
  // Treat bare YYYY-MM-DD as UTC midnight to avoid local timezone shifts
  const isYMD = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  if (!isYMD) {
    return new Date(dateString);
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date();
  localDate.setFullYear(year, month - 1, day);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format date for display (e.g., "Oct 11, 2025")
 */
export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}
