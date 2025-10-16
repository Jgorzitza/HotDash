/**
 * Observability: Logs with Trace IDs
 * 
 * Structured logging with trace IDs for debugging.
 * Backlog task #23: Observability: logs with trace ids
 */

import { randomUUID } from 'crypto';
import { scrubPII } from './pii-scrubbing';

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  traceId: string;
  agentId?: string;
  conversationId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logger class with trace ID support
 */
export class Logger {
  private traceId: string;
  private agentId?: string;

  constructor(agentId?: string) {
    this.traceId = randomUUID();
    this.agentId = agentId;
  }

  /**
   * Set trace ID (for continuing existing trace)
   */
  setTraceId(traceId: string): void {
    this.traceId = traceId;
  }

  /**
   * Get current trace ID
   */
  getTraceId(): string {
    return this.traceId;
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const errorMetadata = error
      ? {
          ...metadata,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : metadata;

    this.log(LogLevel.ERROR, message, errorMetadata);
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    // Scrub PII from message and metadata
    const scrubbedMessage = scrubPII(message);
    const scrubbedMetadata = metadata
      ? this.scrubMetadata(metadata)
      : undefined;

    const entry: LogEntry = {
      level,
      message: scrubbedMessage,
      traceId: this.traceId,
      agentId: this.agentId,
      timestamp: new Date().toISOString(),
      metadata: scrubbedMetadata,
    };

    // Output as JSON for structured logging
    console.log(JSON.stringify(entry));

    // TODO: Send to logging service (e.g., Datadog, CloudWatch)
  }

  /**
   * Scrub PII from metadata
   */
  private scrubMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const scrubbed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        scrubbed[key] = scrubPII(value);
      } else if (typeof value === 'object' && value !== null) {
        scrubbed[key] = this.scrubMetadata(value as Record<string, unknown>);
      } else {
        scrubbed[key] = value;
      }
    }

    return scrubbed;
  }
}

/**
 * Create logger for agent
 */
export function createLogger(agentId: string): Logger {
  return new Logger(agentId);
}

