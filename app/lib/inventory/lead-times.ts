/**
 * Supplier Lead Time Tracking
 * 
 * Tracks historical lead times per supplier for ROP calculations
 * Manager-specified path: app/lib/inventory/lead-times.ts
 */

export interface LeadTimeRecord {
  supplier: string;
  orderDate: string;
  receiveDate: string;
  leadTimeDays: number;
}

export interface SupplierLeadTime {
  supplier: string;
  avgLeadTime: number;
  minLeadTime: number;
  maxLeadTime: number;
  recordCount: number;
}

/**
 * Calculate average lead time for a supplier
 */
export function calculateAvgLeadTime(records: LeadTimeRecord[]): number {
  if (records.length === 0) return 0;
  
  const total = records.reduce((sum, r) => sum + r.leadTimeDays, 0);
  return Math.round(total / records.length);
}

/**
 * Track lead times by supplier
 */
export function trackLeadTimes(records: LeadTimeRecord[]): Map<string, SupplierLeadTime> {
  const bySupplier = new Map<string, LeadTimeRecord[]>();
  
  for (const record of records) {
    const existing = bySupplier.get(record.supplier) || [];
    existing.push(record);
    bySupplier.set(record.supplier, existing);
  }
  
  const result = new Map<string, SupplierLeadTime>();
  
  for (const [supplier, supplierRecords] of bySupplier.entries()) {
    const leadTimes = supplierRecords.map(r => r.leadTimeDays);
    result.set(supplier, {
      supplier,
      avgLeadTime: calculateAvgLeadTime(supplierRecords),
      minLeadTime: Math.min(...leadTimes),
      maxLeadTime: Math.max(...leadTimes),
      recordCount: supplierRecords.length,
    });
  }
  
  return result;
}

/**
 * Get recommended lead time for ROP calculation (use max for safety)
 */
export function getRecommendedLeadTime(supplierStats: SupplierLeadTime): number {
  return supplierStats.maxLeadTime; // Use max for conservative ROP
}
