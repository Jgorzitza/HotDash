/**
 * Structured Logging Utility
 *
 * Provides structured logging with consistent format, levels, and metadata.
 * Logs are output as JSON in production for easier parsing by log aggregators.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    service?: string;
    module?: string;
    metadata?: Record<string, any>;
    error?: {
        message: string;
        stack?: string;
        code?: string;
    };
}
export interface LoggerOptions {
    service: string;
    module?: string;
    minLevel?: LogLevel;
    pretty?: boolean;
}
/**
 * Structured Logger class
 */
export declare class StructuredLogger {
    private service;
    private module?;
    private minLevel;
    private pretty;
    constructor(options: LoggerOptions);
    /**
     * Log debug message
     */
    debug(message: string, metadata?: Record<string, any>): void;
    /**
     * Log info message
     */
    info(message: string, metadata?: Record<string, any>): void;
    /**
     * Log warning message
     */
    warn(message: string, metadata?: Record<string, any>): void;
    /**
     * Log error message
     */
    error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void;
    /**
     * Generic log method
     */
    private log;
    /**
     * Write log entry to console
     */
    private write;
    /**
     * Get ANSI color code for log level
     */
    private getColor;
    /**
     * Create child logger with additional context
     */
    child(module: string): StructuredLogger;
    /**
     * Time an operation
     */
    time<T>(operationName: string, fn: () => Promise<T>): Promise<T>;
}
/**
 * Create logger instance for a service
 */
export declare function createLogger(service: string, options?: Partial<LoggerOptions>): StructuredLogger;
/**
 * Default application logger
 */
export declare const appLogger: StructuredLogger;
/**
 * Service-specific loggers
 */
export declare const shopifyLogger: StructuredLogger;
export declare const gaLogger: StructuredLogger;
export declare const chatwootLogger: StructuredLogger;
export declare const agentLogger: StructuredLogger;
//# sourceMappingURL=structured-logger.server.d.ts.map