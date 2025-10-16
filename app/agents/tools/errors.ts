/**
 * Error Taxonomy and UX Messages
 * 
 * Standardized error types and user-friendly messages.
 * Backlog task #21: Error taxonomy + UX messages
 */

import { z } from 'zod';

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  POLICY_VIOLATION = 'policy_violation',
  HITL_REQUIRED = 'hitl_required',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Structured error schema
 */
export const StructuredErrorSchema = z.object({
  code: z.string(),
  category: z.nativeEnum(ErrorCategory),
  severity: z.nativeEnum(ErrorSeverity),
  message: z.string(),
  userMessage: z.string(),
  details: z.record(z.unknown()).optional(),
  retryable: z.boolean(),
  timestamp: z.string(),
});

export type StructuredError = z.infer<typeof StructuredErrorSchema>;

/**
 * Error definitions with user-friendly messages
 */
export const ERROR_DEFINITIONS: Record<string, Omit<StructuredError, 'timestamp' | 'details'>> = {
  // Validation errors
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    message: 'Invalid input provided',
    userMessage: 'Please check your input and try again.',
    retryable: false,
  },
  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    message: 'Required field is missing',
    userMessage: 'Please fill in all required fields.',
    retryable: false,
  },

  // Authentication errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Authentication required',
    userMessage: 'Please log in to continue.',
    retryable: false,
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid or expired token',
    userMessage: 'Your session has expired. Please log in again.',
    retryable: false,
  },

  // Authorization errors
  FORBIDDEN: {
    code: 'FORBIDDEN',
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Access denied',
    userMessage: 'You don\'t have permission to perform this action.',
    retryable: false,
  },

  // Not found errors
  CONVERSATION_NOT_FOUND: {
    code: 'CONVERSATION_NOT_FOUND',
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    message: 'Conversation not found',
    userMessage: 'The conversation you\'re looking for doesn\'t exist.',
    retryable: false,
  },
  AGENT_NOT_FOUND: {
    code: 'AGENT_NOT_FOUND',
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    message: 'Agent configuration not found',
    userMessage: 'The AI agent is not properly configured. Please contact support.',
    retryable: false,
  },

  // Rate limit errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please wait a moment and try again.',
    retryable: true,
  },

  // Server errors
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    category: ErrorCategory.SERVER_ERROR,
    severity: ErrorSeverity.HIGH,
    message: 'Internal server error',
    userMessage: 'Something went wrong on our end. Please try again later.',
    retryable: true,
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    category: ErrorCategory.SERVER_ERROR,
    severity: ErrorSeverity.HIGH,
    message: 'Database operation failed',
    userMessage: 'We\'re experiencing technical difficulties. Please try again later.',
    retryable: true,
  },

  // Network errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    category: ErrorCategory.NETWORK_ERROR,
    severity: ErrorSeverity.MEDIUM,
    message: 'Network request failed',
    userMessage: 'Network error. Please check your connection and try again.',
    retryable: true,
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    category: ErrorCategory.TIMEOUT,
    severity: ErrorSeverity.MEDIUM,
    message: 'Request timeout',
    userMessage: 'The request took too long. Please try again.',
    retryable: true,
  },

  // Policy violations
  POLICY_VIOLATION: {
    code: 'POLICY_VIOLATION',
    category: ErrorCategory.POLICY_VIOLATION,
    severity: ErrorSeverity.HIGH,
    message: 'Policy violation detected',
    userMessage: 'This action violates our policies and cannot be completed.',
    retryable: false,
  },
  DISCOUNT_LIMIT_EXCEEDED: {
    code: 'DISCOUNT_LIMIT_EXCEEDED',
    category: ErrorCategory.POLICY_VIOLATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Discount exceeds policy limit',
    userMessage: 'The requested discount exceeds our policy limits. Please contact a manager.',
    retryable: false,
  },
  REFUND_LIMIT_EXCEEDED: {
    code: 'REFUND_LIMIT_EXCEEDED',
    category: ErrorCategory.POLICY_VIOLATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Refund amount exceeds policy limit',
    userMessage: 'This refund requires manager approval.',
    retryable: false,
  },

  // HITL errors
  HITL_APPROVAL_REQUIRED: {
    code: 'HITL_APPROVAL_REQUIRED',
    category: ErrorCategory.HITL_REQUIRED,
    severity: ErrorSeverity.LOW,
    message: 'Human approval required',
    userMessage: 'This action requires human review before proceeding.',
    retryable: false,
  },
  HITL_APPROVAL_REJECTED: {
    code: 'HITL_APPROVAL_REJECTED',
    category: ErrorCategory.HITL_REQUIRED,
    severity: ErrorSeverity.LOW,
    message: 'Approval rejected',
    userMessage: 'The requested action was not approved.',
    retryable: false,
  },
};

/**
 * Create structured error
 */
export function createError(
  code: string,
  details?: Record<string, unknown>
): StructuredError {
  const definition = ERROR_DEFINITIONS[code];
  
  if (!definition) {
    return {
      code: 'UNKNOWN_ERROR',
      category: ErrorCategory.SERVER_ERROR,
      severity: ErrorSeverity.HIGH,
      message: 'Unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    ...definition,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: StructuredError): string {
  return JSON.stringify({
    code: error.code,
    category: error.category,
    severity: error.severity,
    message: error.message,
    timestamp: error.timestamp,
    details: error.details,
  });
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: StructuredError | Error): string {
  if ('userMessage' in error) {
    return error.userMessage;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: StructuredError | Error): boolean {
  if ('retryable' in error) {
    return error.retryable;
  }
  
  return false;
}

