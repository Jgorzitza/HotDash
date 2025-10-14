/**
 * Google Search Console Client Types
 * @module services/gsc/client
 */

export interface DateRange {
  start: string; // ISO date (YYYY-MM-DD)
  end: string; // ISO date (YYYY-MM-DD)
}

export interface GSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCPage {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  wowDelta: number; // Week-over-week delta (e.g., -0.24 = -24%)
  queries: GSCQuery[];
}

export interface GSCAnomalyDetection {
  page: string;
  currentClicks: number;
  previousClicks: number;
  delta: number;
  deltaPercentage: number;
  isAnomaly: boolean;
  anomalyType: 'spike' | 'drop' | 'none';
}

export interface GSCClient {
  /**
   * Fetch organic search data for pages
   * @param range - Date range for current period
   * @returns Promise of GSC page data with WoW metrics
   */
  fetchOrganicPages(range: DateRange): Promise<GSCPage[]>;

  /**
   * Detect traffic anomalies by comparing periods
   * @param currentRange - Current period date range
   * @param previousRange - Previous period date range (for comparison)
   * @returns Promise of anomaly detection results
   */
  detectAnomalies(
    currentRange: DateRange,
    previousRange: DateRange
  ): Promise<GSCAnomalyDetection[]>;
}

export interface GSCExportConfig {
  projectId: string;
  datasetId: string;
  tableId: string;
}

