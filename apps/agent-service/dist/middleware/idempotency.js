import { Pool } from 'pg';
const defaultOptions = {
    headerName: 'idempotency-key',
    ttlSeconds: 86400, // 24 hours
    hashBody: true,
};
// In-memory store (fallback if no PG)
const memoryStore = new Map();
// Database pool (shared with feedback store)
let pool = null;
export function initializeIdempotencyStore(pgUrl) {
    if (pgUrl) {
        pool = new Pool({ connectionString: pgUrl });
    }
}
// Initialize with env var
if (process.env.PG_URL) {
    initializeIdempotencyStore(process.env.PG_URL);
}
/**
 * Create idempotency middleware
 */
export function idempotencyMiddleware(options = {}) {
    const opts = { ...defaultOptions, ...options };
    return async (req, res, next) => {
        try {
            // Get idempotency key from header
            const idempotencyKey = req.headers[opts.headerName];
            if (!idempotencyKey) {
                // No idempotency key - process normally
                return next();
            }
            // Generate request hash (for duplicate detection)
            const requestHash = opts.hashBody
                ? require('crypto').createHash('sha256').update(JSON.stringify(req.body)).digest('hex')
                : '';
            // Check for existing record
            const existing = await getIdempotencyRecord(idempotencyKey);
            if (existing) {
                // Verify request is identical (prevent key reuse with different data)
                if (opts.hashBody && existing.requestHash !== requestHash) {
                    console.warn(`[Idempotency] Key reused with different request: ${idempotencyKey}`);
                    return res.status(422).json({
                        error: 'Idempotency key conflict',
                        message: 'This key was used for a different request'
                    });
                }
                // Return cached response
                console.log(`[Idempotency] Replaying cached response for key: ${idempotencyKey}`);
                return res
                    .status(existing.responseStatus)
                    .set('x-idempotent-replayed', 'true')
                    .json(existing.responseBody);
            }
            // Capture response
            const originalJson = res.json.bind(res);
            const originalStatus = res.status.bind(res);
            let capturedStatus = 200;
            let capturedBody = null;
            res.status = function (code) {
                capturedStatus = code;
                return originalStatus(code);
            };
            res.json = function (body) {
                capturedBody = body;
                // Store idempotency record
                saveIdempotencyRecord({
                    key: idempotencyKey,
                    requestHash,
                    responseStatus: capturedStatus,
                    responseBody: body,
                    createdAt: new Date(),
                }).catch(err => {
                    console.error('[Idempotency] Failed to save record:', err);
                });
                return originalJson(body);
            };
            next();
        }
        catch (err) {
            console.error('[Idempotency] Middleware error:', err);
            next(); // Continue processing on error
        }
    };
}
/**
 * Get idempotency record from store
 */
async function getIdempotencyRecord(key) {
    if (pool) {
        try {
            const { rows } = await pool.query(`SELECT key, request_hash, response_status, response_body, created_at
         FROM idempotency_records
         WHERE key = $1 AND created_at > NOW() - INTERVAL '24 hours'`, [key]);
            if (rows[0]) {
                return {
                    key: rows[0].key,
                    requestHash: rows[0].request_hash,
                    responseStatus: rows[0].response_status,
                    responseBody: rows[0].response_body,
                    createdAt: rows[0].created_at,
                };
            }
        }
        catch (err) {
            console.error('[Idempotency] DB read error:', err);
        }
    }
    // Fallback to memory store
    const record = memoryStore.get(key);
    if (record) {
        const age = Date.now() - record.createdAt.getTime();
        if (age < defaultOptions.ttlSeconds * 1000) {
            return record;
        }
        else {
            memoryStore.delete(key);
        }
    }
    return null;
}
/**
 * Save idempotency record to store
 */
async function saveIdempotencyRecord(record) {
    if (pool) {
        try {
            await pool.query(`INSERT INTO idempotency_records (key, request_hash, response_status, response_body, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (key) DO NOTHING`, [record.key, record.requestHash, record.responseStatus, JSON.stringify(record.responseBody), record.createdAt]);
            return;
        }
        catch (err) {
            console.error('[Idempotency] DB write error:', err);
        }
    }
    // Fallback to memory store
    memoryStore.set(record.key, record);
    // Cleanup old records (memory only)
    if (memoryStore.size > 1000) {
        const now = Date.now();
        const ttl = defaultOptions.ttlSeconds * 1000;
        for (const [key, rec] of memoryStore.entries()) {
            if (now - rec.createdAt.getTime() > ttl) {
                memoryStore.delete(key);
            }
        }
    }
}
/**
 * Cleanup expired idempotency records (cron job)
 */
export async function cleanupIdempotencyRecords() {
    if (pool) {
        try {
            const { rowCount } = await pool.query(`DELETE FROM idempotency_records WHERE created_at < NOW() - INTERVAL '24 hours'`);
            console.log(`[Idempotency] Cleaned up ${rowCount} expired records`);
        }
        catch (err) {
            console.error('[Idempotency] Cleanup error:', err);
        }
    }
}
/**
 * Migration SQL for idempotency table
 */
export const IDEMPOTENCY_MIGRATION = `
-- Create idempotency_records table
CREATE TABLE IF NOT EXISTS idempotency_records (
  key VARCHAR(255) PRIMARY KEY,
  request_hash VARCHAR(64),
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_records(created_at);

-- Auto-cleanup trigger (optional)
CREATE OR REPLACE FUNCTION cleanup_old_idempotency_records()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM idempotency_records WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_idempotency
  AFTER INSERT ON idempotency_records
  EXECUTE FUNCTION cleanup_old_idempotency_records();
`;
//# sourceMappingURL=idempotency.js.map