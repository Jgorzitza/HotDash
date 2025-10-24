/**
 * Date utility functions for consistent date handling across the application
 */
/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export declare function toISODate(date: Date): string;
/**
 * Get date N days ago
 */
export declare function daysAgo(days: number): Date;
/**
 * Get date range for the last N days
 */
export declare function getDateRange(days: number): {
    start: string;
    end: string;
};
/**
 * Parse ISO date string to Date
 */
export declare function parseISODate(dateString: string): Date;
/**
 * Check if date is valid
 */
export declare function isValidDate(date: any): date is Date;
/**
 * Format date for display (e.g., "Oct 11, 2025")
 */
export declare function formatDisplayDate(date: Date): string;
/**
 * Get relative time string (e.g., "2 hours ago")
 */
export declare function getRelativeTime(date: Date): string;
//# sourceMappingURL=date.server.d.ts.map