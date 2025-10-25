/**
 * Server-side logging utility that integrates with Supabase edge function
 * for centralized observability logging.
 *
 * This handles ServiceError logging and general application logging
 * with structured metadata for better observability.
 */
class Logger {
    supabaseUrl;
    serviceKey;
    edgeFunctionUrl;
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.serviceKey = process.env.SUPABASE_SERVICE_KEY;
        this.edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/occ-log`;
        if (!this.supabaseUrl || !this.serviceKey) {
            console.warn("Logger: SUPABASE_URL or SUPABASE_SERVICE_KEY not configured. " +
                "Falling back to console logging only.");
        }
    }
    async sendToEdgeFunction(entry) {
        if (!this.supabaseUrl || !this.serviceKey) {
            // Fallback to console logging if Supabase not configured
            console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
            return;
        }
        try {
            const response = await fetch(this.edgeFunctionUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.serviceKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(entry),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Logger edge function error: ${response.status} ${errorText}`);
                // Fallback to console
                console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
            }
        }
        catch (error) {
            console.error("Failed to send log to edge function:", error);
            // Fallback to console
            console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
        }
    }
    createEntry(level, message, metadata, request) {
        return {
            level,
            message,
            metadata: {
                timestamp: new Date().toISOString(),
                ...metadata,
            },
            requestId: request?.headers.get("x-request-id") || undefined,
            userAgent: request?.headers.get("user-agent") || undefined,
        };
    }
    debug(message, metadata, request) {
        const entry = this.createEntry("DEBUG", message, metadata, request);
        this.sendToEdgeFunction(entry).catch(() => { }); // Fire and forget
    }
    info(message, metadata, request) {
        const entry = this.createEntry("INFO", message, metadata, request);
        this.sendToEdgeFunction(entry).catch(() => { }); // Fire and forget
    }
    warn(message, metadata, request) {
        const entry = this.createEntry("WARN", message, metadata, request);
        this.sendToEdgeFunction(entry).catch(() => { }); // Fire and forget
    }
    error(message, metadata, request) {
        const entry = this.createEntry("ERROR", message, metadata, request);
        this.sendToEdgeFunction(entry).catch(() => { }); // Fire and forget
    }
    fatal(message, metadata, request) {
        const entry = this.createEntry("FATAL", message, metadata, request);
        this.sendToEdgeFunction(entry).catch(() => { }); // Fire and forget
    }
    /**
     * Logs ServiceError with structured metadata including scope, code, and cause
     */
    logServiceError(error, request, additionalMetadata) {
        const metadata = {
            scope: error.scope,
            code: error.code,
            retryable: error.retryable,
            cause: error.cause,
            stack: error.stack,
            ...additionalMetadata,
        };
        this.error(`ServiceError in ${error.scope}: ${error.message}`, metadata, request);
    }
    /**
     * Logs general errors with structured metadata
     */
    logError(error, context, request, additionalMetadata) {
        const metadata = {
            context,
            errorName: error.name,
            stack: error.stack,
            ...additionalMetadata,
        };
        this.error(`Error in ${context}: ${error.message}`, metadata, request);
    }
}
// Singleton instance
export const logger = new Logger();
/**
 * Middleware-style helper to add request context to logs
 */
export function withRequestLogger(request) {
    return {
        debug: (message, metadata) => logger.debug(message, metadata, request),
        info: (message, metadata) => logger.info(message, metadata, request),
        warn: (message, metadata) => logger.warn(message, metadata, request),
        error: (message, metadata) => logger.error(message, metadata, request),
        fatal: (message, metadata) => logger.fatal(message, metadata, request),
        logServiceError: (error, additionalMetadata) => logger.logServiceError(error, request, additionalMetadata),
        logError: (error, context, additionalMetadata) => logger.logError(error, context, request, additionalMetadata),
    };
}
//# sourceMappingURL=logger.server.js.map