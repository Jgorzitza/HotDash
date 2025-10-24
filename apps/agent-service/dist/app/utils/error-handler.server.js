/**
 * Server-side error handling utilities
 *
 * Provides consistent error transformation and response formatting
 */
import { ServiceError } from "../services/types";
/**
 * Transform error into user-friendly message
 */
export function getUserFriendlyMessage(error) {
    if (error instanceof ServiceError) {
        // Return sanitized message for ServiceErrors
        return error.message;
    }
    if (error instanceof Error) {
        // Generic error - return safe message
        if (error.message.includes("fetch")) {
            return "Unable to connect to external service. Please try again.";
        }
        if (error.message.includes("timeout")) {
            return "Request timed out. Please try again.";
        }
        if (error.message.includes("not found")) {
            return "The requested resource was not found.";
        }
        return "An unexpected error occurred. Please try again.";
    }
    return "An error occurred. Please try again.";
}
/**
 * Create error response object for loaders/actions
 */
export function errorResponse(error, status = 500) {
    const message = getUserFriendlyMessage(error);
    // Log the actual error for debugging
    console.error("[Error Handler]", error);
    return {
        error: message,
        timestamp: new Date().toISOString(),
        status,
    };
}
/**
 * Wrap loader function with error handling
 */
export function withErrorHandling(loaderFn, context) {
    return async () => {
        try {
            return await loaderFn();
        }
        catch (error) {
            console.error(`[Error Handler] ${context || "Loader"} error:`, error);
            throw errorResponse(error);
        }
    };
}
/**
 * Create standardized error for API failures
 */
export function createApiError(serviceName, operation, statusCode, details) {
    return new ServiceError(`${serviceName} ${operation} failed${details ? ": " + details : ""}`, {
        scope: `${serviceName}.${operation}`,
        code: `HTTP_${statusCode}`,
        retryable: statusCode >= 500,
    });
}
/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    if (error instanceof ServiceError) {
        return error.retryable || false;
    }
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (message.includes("timeout") ||
            message.includes("network") ||
            message.includes("econnrefused") ||
            message.includes("503") ||
            message.includes("504"));
    }
    return false;
}
//# sourceMappingURL=error-handler.server.js.map