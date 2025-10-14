import { Request, Response, NextFunction } from 'express';
interface IdempotencyOptions {
    headerName?: string;
    ttlSeconds?: number;
    hashBody?: boolean;
}
export declare function initializeIdempotencyStore(pgUrl?: string): void;
/**
 * Create idempotency middleware
 */
export declare function idempotencyMiddleware(options?: IdempotencyOptions): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Cleanup expired idempotency records (cron job)
 */
export declare function cleanupIdempotencyRecords(): Promise<void>;
/**
 * Migration SQL for idempotency table
 */
export declare const IDEMPOTENCY_MIGRATION = "\n-- Create idempotency_records table\nCREATE TABLE IF NOT EXISTS idempotency_records (\n  key VARCHAR(255) PRIMARY KEY,\n  request_hash VARCHAR(64),\n  response_status INTEGER NOT NULL,\n  response_body JSONB NOT NULL,\n  created_at TIMESTAMP NOT NULL DEFAULT NOW()\n);\n\n-- Index for cleanup\nCREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_records(created_at);\n\n-- Auto-cleanup trigger (optional)\nCREATE OR REPLACE FUNCTION cleanup_old_idempotency_records()\nRETURNS TRIGGER AS $$\nBEGIN\n  DELETE FROM idempotency_records WHERE created_at < NOW() - INTERVAL '24 hours';\n  RETURN NULL;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trigger_cleanup_idempotency\n  AFTER INSERT ON idempotency_records\n  EXECUTE FUNCTION cleanup_old_idempotency_records();\n";
export {};
//# sourceMappingURL=idempotency.d.ts.map