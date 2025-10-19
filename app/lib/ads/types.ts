export type AdsPacingStatus = "ahead" | "behind" | "on_track";

export interface AdsPacingRow {
  metricDate: string;
  platform: string;
  campaign?: string | null;
  spend: number;
  budget: number | null;
  pacingPercentage: number | null;
  status: AdsPacingStatus;
  clicks: number | null;
  conversions: number | null;
  revenue: number | null;
}

export interface AdsPacingSummary {
  rows: AdsPacingRow[];
  generatedAt: string;
  fallbackReason?: string;
}

export interface AdsAttributionRow {
  platform: string;
  campaign?: string | null;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number | null;
  cpa: number | null;
  conversionRatePct: number | null;
}

export interface AdsAttributionSummary {
  rows: AdsAttributionRow[];
  generatedAt: string;
  fallbackReason?: string;
}
