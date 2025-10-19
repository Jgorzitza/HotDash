/**
 * SEO Metrics Tracking - Supabase Integration
 * Store daily rankings, core vitals history, anomalies log
 */

import type { DetectedAnomaly } from "./anomalies-detector";
import type { VitalsAssessment } from "./vitals";

export interface SEORankingHistory {
  id?: string;
  shop_domain: string;
  url: string;
  keyword: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
  recorded_at: string;
}

export interface CoreVitalsHistory {
  id?: string;
  shop_domain: string;
  url: string;
  lcp: number;
  fid: number;
  cls: number;
  device: "mobile" | "desktop";
  recorded_at: string;
}

export interface AnomaliesLog {
  id?: string;
  shop_domain: string;
  anomaly_id: string;
  type: string;
  severity: string;
  affected_url: string;
  metric_current: number;
  metric_previous?: number;
  detected_at: string;
}

/**
 * Store daily rankings to Supabase
 *
 * In production: await supabase.from('seo_rankings').insert(ranking)
 */
export async function storeRanking(ranking: SEORankingHistory): Promise<void> {
  // Stub - requires Supabase client
  console.log("Store ranking:", ranking.keyword, "position", ranking.position);
}

/**
 * Store Core Web Vitals history to Supabase
 *
 * In production: await supabase.from('seo_vitals_history').insert(vitals)
 */
export async function storeVitalsHistory(
  shopDomain: string,
  url: string,
  vitals: VitalsAssessment[],
  device: "mobile" | "desktop",
): Promise<void> {
  const vitalsMap = Object.fromEntries(vitals.map((v) => [v.metric, v.value]));

  const record: CoreVitalsHistory = {
    shop_domain: shopDomain,
    url,
    lcp: vitalsMap.LCP || 0,
    fid: vitalsMap.FID || 0,
    cls: vitalsMap.CLS || 0,
    device,
    recorded_at: new Date().toISOString(),
  };

  // Stub - requires Supabase client
  console.log("Store vitals:", url, "LCP", record.lcp);
}

/**
 * Log anomaly to Supabase
 *
 * In production: await supabase.from('seo_anomalies_log').insert(log)
 */
export async function logAnomaly(
  shopDomain: string,
  anomaly: DetectedAnomaly,
): Promise<void> {
  const record: AnomaliesLog = {
    shop_domain: shopDomain,
    anomaly_id: anomaly.id,
    type: anomaly.type,
    severity: anomaly.severity,
    affected_url: anomaly.affectedUrl,
    metric_current: anomaly.metric.current,
    metric_previous: anomaly.metric.previous,
    detected_at: anomaly.detectedAt,
  };

  // Stub - requires Supabase client
  console.log("Log anomaly:", anomaly.id, anomaly.severity);
}

/**
 * SQL for Supabase migration (use with Supabase CLI)
 */
export const SUPABASE_MIGRATION_SQL = `
-- SEO Rankings Table
CREATE TABLE IF NOT EXISTS seo_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  url TEXT NOT NULL,
  keyword TEXT NOT NULL,
  position NUMERIC NOT NULL,
  clicks INTEGER NOT NULL,
  impressions INTEGER NOT NULL,
  ctr NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_rankings_shop ON seo_rankings(shop_domain);
CREATE INDEX idx_seo_rankings_url ON seo_rankings(url);
CREATE INDEX idx_seo_rankings_recorded_at ON seo_rankings(recorded_at DESC);

-- Core Web Vitals History Table
CREATE TABLE IF NOT EXISTS seo_vitals_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  url TEXT NOT NULL,
  lcp NUMERIC NOT NULL,
  fid NUMERIC NOT NULL,
  cls NUMERIC NOT NULL,
  device TEXT NOT NULL CHECK (device IN ('mobile', 'desktop')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_vitals_shop ON seo_vitals_history(shop_domain);
CREATE INDEX idx_seo_vitals_url ON seo_vitals_history(url);
CREATE INDEX idx_seo_vitals_recorded_at ON seo_vitals_history(recorded_at DESC);

-- Anomalies Log Table
CREATE TABLE IF NOT EXISTS seo_anomalies_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  anomaly_id TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  affected_url TEXT NOT NULL,
  metric_current NUMERIC NOT NULL,
  metric_previous NUMERIC,
  detected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_anomalies_shop ON seo_anomalies_log(shop_domain);
CREATE INDEX idx_seo_anomalies_severity ON seo_anomalies_log(severity);
CREATE INDEX idx_seo_anomalies_detected_at ON seo_anomalies_log(detected_at DESC);
`;
