import { Pool } from 'pg';
import crypto from 'crypto';

/**
 * Audit Trail Service
 * 
 * Immutable audit logging for all critical operations:
 * - Action approvals/executions
 * - Data access
 * - Configuration changes
 * 
 * Features:
 * - Append-only storage (tamper-proof)
 * - Hash chaining for integrity verification
 * - Compliance reporting
 */

export enum AuditEventType {
  ACTION_APPROVED = 'action:approved',
  ACTION_REJECTED = 'action:rejected',
  ACTION_EXECUTED = 'action:executed',
  DATA_ACCESSED = 'data:accessed',
  DATA_EXPORTED = 'data:exported',
  CONFIG_CHANGED = 'config:changed',
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
  PERMISSION_CHANGED = 'permission:changed',
}

export interface AuditEvent {
  id?: string;
  eventType: AuditEventType;
  userId: string;
  userEmail: string;
  userRole: string;
  resource?: string;
  resourceId?: string;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  previousHash?: string;
  eventHash?: string;
  timestamp: Date;
}

let pool: Pool | null = null;

export function initializeAuditTrail(pgUrl?: string) {
  if (pgUrl) {
    pool = new Pool({ connectionString: pgUrl });
  }
}

if (process.env.PG_URL) {
  initializeAuditTrail(process.env.PG_URL);
}

/**
 * Compute hash of audit event (for integrity verification)
 */
function computeEventHash(event: AuditEvent): string {
  const data = JSON.stringify({
    eventType: event.eventType,
    userId: event.userId,
    resource: event.resource,
    resourceId: event.resourceId,
    action: event.action,
    timestamp: event.timestamp.toISOString(),
    previousHash: event.previousHash || 'GENESIS',
  });
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get the last audit event hash (for chain continuity)
 */
async function getLastEventHash(): Promise<string | null> {
  if (!pool) return null;
  
  try {
    const { rows } = await pool.query(
      `SELECT event_hash FROM audit_trail ORDER BY id DESC LIMIT 1`
    );
    
    return rows[0]?.event_hash || null;
  } catch (err) {
    console.error('[Audit] Failed to get last hash:', err);
    return null;
  }
}

/**
 * Log an audit event (append-only)
 */
export async function logAuditEvent(event: Omit<AuditEvent, 'id' | 'previousHash' | 'eventHash' | 'timestamp'>): Promise<void> {
  if (!pool) {
    console.warn('[Audit] No database configured - audit logging skipped');
    return;
  }
  
  try {
    // Get previous hash for chain continuity
    const previousHash = await getLastEventHash();
    
    // Create full event
    const fullEvent: AuditEvent = {
      ...event,
      previousHash: previousHash || undefined,
      timestamp: new Date(),
    };
    
    // Compute hash
    fullEvent.eventHash = computeEventHash(fullEvent);
    
    // Insert (append-only)
    await pool.query(
      `INSERT INTO audit_trail (
        event_type, user_id, user_email, user_role,
        resource, resource_id, action, metadata,
        ip_address, user_agent, previous_hash, event_hash, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        fullEvent.eventType,
        fullEvent.userId,
        fullEvent.userEmail,
        fullEvent.userRole,
        fullEvent.resource,
        fullEvent.resourceId,
        fullEvent.action,
        JSON.stringify(fullEvent.metadata || {}),
        fullEvent.ipAddress,
        fullEvent.userAgent,
        fullEvent.previousHash,
        fullEvent.eventHash,
        fullEvent.timestamp,
      ]
    );
    
    console.log(`[Audit] Logged ${fullEvent.eventType} by ${fullEvent.userEmail} (hash: ${fullEvent.eventHash?.substring(0, 8)}...)`);
  } catch (err) {
    console.error('[Audit] Failed to log event:', err);
    // Don't throw - audit logging failure shouldn't break operations
  }
}

/**
 * Query audit trail
 */
export interface AuditQuery {
  userId?: string;
  eventType?: AuditEventType;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export async function queryAuditTrail(query: AuditQuery = {}): Promise<AuditEvent[]> {
  if (!pool) return [];
  
  let sql = `SELECT * FROM audit_trail WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;
  
  if (query.userId) {
    sql += ` AND user_id = $${paramIndex++}`;
    params.push(query.userId);
  }
  
  if (query.eventType) {
    sql += ` AND event_type = $${paramIndex++}`;
    params.push(query.eventType);
  }
  
  if (query.resource) {
    sql += ` AND resource = $${paramIndex++}`;
    params.push(query.resource);
  }
  
  if (query.startDate) {
    sql += ` AND created_at >= $${paramIndex++}`;
    params.push(query.startDate);
  }
  
  if (query.endDate) {
    sql += ` AND created_at <= $${paramIndex++}`;
    params.push(query.endDate);
  }
  
  sql += ` ORDER BY id DESC LIMIT $${paramIndex}`;
  params.push(query.limit || 100);
  
  try {
    const { rows } = await pool.query(sql, params);
    
    return rows.map(r => ({
      id: r.id.toString(),
      eventType: r.event_type,
      userId: r.user_id,
      userEmail: r.user_email,
      userRole: r.user_role,
      resource: r.resource,
      resourceId: r.resource_id,
      action: r.action,
      metadata: r.metadata,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      previousHash: r.previous_hash,
      eventHash: r.event_hash,
      timestamp: r.created_at,
    }));
  } catch (err) {
    console.error('[Audit] Query error:', err);
    return [];
  }
}

/**
 * Verify audit trail integrity (check hash chain)
 */
export async function verifyAuditIntegrity(): Promise<{ valid: boolean; errors: string[] }> {
  if (!pool) {
    return { valid: false, errors: ['No database configured'] };
  }
  
  try {
    const { rows } = await pool.query(
      `SELECT id, event_type, user_id, resource, resource_id, action, 
       previous_hash, event_hash, created_at 
       FROM audit_trail ORDER BY id ASC`
    );
    
    const errors: string[] = [];
    let previousHash: string | null = null;
    
    for (const row of rows) {
      // Verify hash chain
      if (previousHash !== null && row.previous_hash !== previousHash) {
        errors.push(`Event ${row.id}: Previous hash mismatch (expected ${previousHash}, got ${row.previous_hash})`);
      }
      
      // Verify event hash
      const event: AuditEvent = {
        eventType: row.event_type,
        userId: row.user_id,
        userEmail: '',
        userRole: '',
        resource: row.resource,
        resourceId: row.resource_id,
        action: row.action,
        previousHash: row.previous_hash,
        timestamp: row.created_at,
      };
      
      const computedHash = computeEventHash(event);
      if (computedHash !== row.event_hash) {
        errors.push(`Event ${row.id}: Hash mismatch (computed ${computedHash}, stored ${row.event_hash})`);
      }
      
      previousHash = row.event_hash;
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (err) {
    return {
      valid: false,
      errors: [`Verification failed: ${err}`],
    };
  }
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
  if (!pool) return null;
  
  try {
    const { rows: summary } = await pool.query(
      `SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
       FROM audit_trail
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY event_type
       ORDER BY count DESC`,
      [startDate, endDate]
    );
    
    const { rows: userActivity } = await pool.query(
      `SELECT 
        user_email,
        user_role,
        COUNT(*) as event_count,
        MIN(created_at) as first_event,
        MAX(created_at) as last_event
       FROM audit_trail
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY user_email, user_role
       ORDER BY event_count DESC
       LIMIT 20`,
      [startDate, endDate]
    );
    
    const integrity = await verifyAuditIntegrity();
    
    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary,
      topUsers: userActivity,
      integrity: {
        valid: integrity.valid,
        errorCount: integrity.errors.length,
        errors: integrity.errors.slice(0, 10), // First 10 errors
      },
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[Audit] Report generation error:', err);
    return null;
  }
}

/**
 * Migration SQL for audit trail
 */
export const AUDIT_TRAIL_MIGRATION = `
-- Create audit_trail table (append-only, immutable)
CREATE TABLE IF NOT EXISTS audit_trail (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  previous_hash VARCHAR(64),
  event_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_type ON audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON audit_trail(resource);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_hash ON audit_trail(event_hash);

-- Prevent UPDATE and DELETE (append-only enforcement)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit trail is immutable - modifications not allowed';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_update ON audit_trail;
CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE ON audit_trail
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS prevent_audit_delete ON audit_trail;
CREATE TRIGGER prevent_audit_delete
  BEFORE DELETE ON audit_trail
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- Comments
COMMENT ON TABLE audit_trail IS 'Immutable audit log with hash chaining for integrity verification';
COMMENT ON COLUMN audit_trail.previous_hash IS 'Hash of previous event for chain integrity';
COMMENT ON COLUMN audit_trail.event_hash IS 'SHA256 hash of this event for tamper detection';
`;

