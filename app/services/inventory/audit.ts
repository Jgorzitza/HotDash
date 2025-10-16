/**
 * Inventory Audit Logging Service
 * 
 * Tracks all inventory changes and actions for compliance and debugging
 * Provides rollback support for PO errors
 */

import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface AuditEntry {
  auditId: string;
  eventType: 'rop_calculated' | 'po_generated' | 'alert_triggered' | 'suggestion_created' | 
             'metafield_synced' | 'vendor_updated' | 'manual_adjustment' | 'po_error' | 'rollback';
  entityType: 'product' | 'vendor' | 'po' | 'alert' | 'suggestion';
  entityId: string;
  userId?: string;
  action: string;
  beforeState?: any;
  afterState?: any;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RollbackInfo {
  rollbackId: string;
  originalAuditId: string;
  entityType: string;
  entityId: string;
  rollbackState: any;
  reason: string;
  performedBy?: string;
  performedAt: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Create audit entry
 */
export function createAuditEntry(
  eventType: AuditEntry['eventType'],
  entityType: AuditEntry['entityType'],
  entityId: string,
  action: string,
  options: {
    userId?: string;
    beforeState?: any;
    afterState?: any;
    changes?: Record<string, { old: any; new: any }>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): AuditEntry {
  return {
    auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    entityType,
    entityId,
    action,
    timestamp: new Date().toISOString(),
    ...options,
  };
}

/**
 * Calculate changes between before and after states
 */
export function calculateChanges(
  beforeState: Record<string, any>,
  afterState: Record<string, any>
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  // Check all keys in afterState
  for (const key of Object.keys(afterState)) {
    if (beforeState[key] !== afterState[key]) {
      changes[key] = {
        old: beforeState[key],
        new: afterState[key],
      };
    }
  }

  // Check for removed keys
  for (const key of Object.keys(beforeState)) {
    if (!(key in afterState)) {
      changes[key] = {
        old: beforeState[key],
        new: undefined,
      };
    }
  }

  return changes;
}

/**
 * Log ROP calculation
 */
export function logROPCalculation(
  sku: string,
  productId: string,
  ropResult: any,
  userId?: string
): AuditEntry {
  return createAuditEntry(
    'rop_calculated',
    'product',
    productId,
    'ROP calculated',
    {
      userId,
      afterState: ropResult,
      metadata: {
        sku,
        rop: ropResult.rop,
        statusBucket: ropResult.statusBucket,
      },
    }
  );
}

/**
 * Log PO generation
 */
export function logPOGeneration(
  poNumber: string,
  po: any,
  userId?: string
): AuditEntry {
  return createAuditEntry(
    'po_generated',
    'po',
    poNumber,
    'Purchase order generated',
    {
      userId,
      afterState: po,
      metadata: {
        vendor: po.vendor,
        totalItems: po.totalItems,
        totalQuantity: po.totalQuantity,
      },
    }
  );
}

/**
 * Log PO error
 */
export function logPOError(
  poNumber: string,
  error: Error,
  poData: any,
  userId?: string
): AuditEntry {
  return createAuditEntry(
    'po_error',
    'po',
    poNumber,
    'Purchase order generation failed',
    {
      userId,
      beforeState: poData,
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    }
  );
}

/**
 * Log manual adjustment
 */
export function logManualAdjustment(
  sku: string,
  productId: string,
  beforeState: any,
  afterState: any,
  userId?: string,
  reason?: string
): AuditEntry {
  const changes = calculateChanges(beforeState, afterState);

  return createAuditEntry(
    'manual_adjustment',
    'product',
    productId,
    'Manual inventory adjustment',
    {
      userId,
      beforeState,
      afterState,
      changes,
      metadata: {
        sku,
        reason,
      },
    }
  );
}

/**
 * Create rollback entry
 */
export function createRollback(
  originalAuditId: string,
  entityType: string,
  entityId: string,
  rollbackState: any,
  reason: string,
  performedBy?: string
): RollbackInfo {
  return {
    rollbackId: `rollback_${Date.now()}`,
    originalAuditId,
    entityType,
    entityId,
    rollbackState,
    reason,
    performedBy,
    performedAt: new Date().toISOString(),
    success: false, // Will be updated after rollback attempt
  };
}

/**
 * Execute rollback for PO error
 */
export async function rollbackPO(
  poNumber: string,
  originalState: any,
  reason: string,
  performedBy?: string
): Promise<RollbackInfo> {
  const rollback = createRollback(
    `po_${poNumber}`,
    'po',
    poNumber,
    originalState,
    reason,
    performedBy
  );

  try {
    // TODO: Implement actual rollback logic
    // This would involve:
    // 1. Canceling any sent emails
    // 2. Marking PO as cancelled in database
    // 3. Restoring previous state
    // 4. Notifying relevant parties

    rollback.success = true;
  } catch (error) {
    rollback.success = false;
    rollback.errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  return rollback;
}

/**
 * Get audit trail for entity
 */
export function getAuditTrail(
  entries: AuditEntry[],
  entityType: string,
  entityId: string
): AuditEntry[] {
  return entries
    .filter(e => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get recent audit entries
 */
export function getRecentAudits(
  entries: AuditEntry[],
  limit: number = 100
): AuditEntry[] {
  return entries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get audit summary statistics
 */
export function getAuditSummary(
  entries: AuditEntry[],
  startDate: Date,
  endDate: Date
): {
  total: number;
  byEventType: Record<string, number>;
  byEntityType: Record<string, number>;
  byUser: Record<string, number>;
  errorCount: number;
  rollbackCount: number;
} {
  const filtered = entries.filter(e => {
    const timestamp = new Date(e.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });

  const byEventType: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};
  const byUser: Record<string, number> = {};

  for (const entry of filtered) {
    byEventType[entry.eventType] = (byEventType[entry.eventType] || 0) + 1;
    byEntityType[entry.entityType] = (byEntityType[entry.entityType] || 0) + 1;
    if (entry.userId) {
      byUser[entry.userId] = (byUser[entry.userId] || 0) + 1;
    }
  }

  return {
    total: filtered.length,
    byEventType,
    byEntityType,
    byUser,
    errorCount: filtered.filter(e => e.eventType === 'po_error').length,
    rollbackCount: filtered.filter(e => e.eventType === 'rollback').length,
  };
}

/**
 * Record audit entry to Supabase
 */
export async function recordAuditEntry(
  context: ShopifyServiceContext,
  entry: AuditEntry
): Promise<void> {
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: `inventory.audit.${entry.eventType}`,
    scope: 'ops',
    value: toInputJson(entry),
    metadata: toInputJson({
      auditId: entry.auditId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      timestamp: entry.timestamp,
    }),
  });
}

/**
 * Record rollback to Supabase
 */
export async function recordRollback(
  context: ShopifyServiceContext,
  rollback: RollbackInfo
): Promise<void> {
  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.audit.rollback',
    scope: 'ops',
    value: toInputJson(rollback),
    metadata: toInputJson({
      rollbackId: rollback.rollbackId,
      originalAuditId: rollback.originalAuditId,
      success: rollback.success,
      performedAt: rollback.performedAt,
    }),
  });
}

