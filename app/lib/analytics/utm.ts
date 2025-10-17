export interface UTMBreakdownRow {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  users: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

// Placeholder implementation; replace with GA4 query when ready
export async function getUTMBreakdown(): Promise<UTMBreakdownRow[]> {
  return [];
}
