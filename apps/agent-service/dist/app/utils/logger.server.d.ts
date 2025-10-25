/**
 * Server-side logging utility that integrates with Supabase edge function
 * for centralized observability logging.
 *
 * This handles ServiceError logging and general application logging
 * with structured metadata for better observability.
 */
import { ServiceError } from "../services/types";
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
declare class Logger {
    private readonly supabaseUrl;
    private readonly serviceKey;
    private readonly edgeFunctionUrl;
    constructor();
    private sendToEdgeFunction;
    private createEntry;
    debug(message: string, metadata?: Record<string, any>, request?: Request): void;
    info(message: string, metadata?: Record<string, any>, request?: Request): void;
    warn(message: string, metadata?: Record<string, any>, request?: Request): void;
    error(message: string, metadata?: Record<string, any>, request?: Request): void;
    fatal(message: string, metadata?: Record<string, any>, request?: Request): void;
    /**
     * Logs ServiceError with structured metadata including scope, code, and cause
     */
    logServiceError(error: ServiceError, request?: Request, additionalMetadata?: Record<string, any>): void;
    /**
     * Logs general errors with structured metadata
     */
    logError(error: Error, context: string, request?: Request, additionalMetadata?: Record<string, any>): void;
}
export declare const logger: Logger;
/**
 * Middleware-style helper to add request context to logs
 */
export declare function withRequestLogger(request: Request): {
    debug: (message: string, metadata?: Record<string, any>) => void;
    info: (message: string, metadata?: Record<string, any>) => void;
    warn: (message: string, metadata?: Record<string, any>) => void;
    error: (message: string, metadata?: Record<string, any>) => void;
    fatal: (message: string, metadata?: Record<string, any>) => void;
    logServiceError: (error: ServiceError, additionalMetadata?: Record<string, any>) => void;
    logError: (error: Error, context: string, additionalMetadata?: Record<string, any>) => void;
};
export {};
//# sourceMappingURL=logger.server.d.ts.map