/**
 * Server-side error handling utilities
 *
 * Provides consistent error transformation and response formatting
 */
import { ServiceError } from "../services/types";
/**
 * Transform error into user-friendly message
 */
export declare function getUserFriendlyMessage(error: unknown): string;
/**
 * Create error response object for loaders/actions
 */
export declare function errorResponse(error: unknown, status?: number): {
    error: string;
    timestamp: string;
    status: number;
};
/**
 * Wrap loader function with error handling
 */
export declare function withErrorHandling<T>(loaderFn: () => Promise<T>, context?: string): () => Promise<T>;
/**
 * Create standardized error for API failures
 */
export declare function createApiError(serviceName: string, operation: string, statusCode: number, details?: string): ServiceError;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: unknown): boolean;
//# sourceMappingURL=error-handler.server.d.ts.map