/**
 * Google Analytics Export Service
 *
 * Task: ANALYTICS-LAUNCH-001
 *
 * Exports launch metrics to Google Analytics for tracking and analysis.
 * Uses GA4 Measurement Protocol to send custom events.
 */
import { type LaunchMetrics } from "~/services/metrics/launch-metrics";
export interface GAExportResult {
    success: boolean;
    eventsExported: number;
    errors: string[];
}
/**
 * Export launch metrics to Google Analytics
 */
export declare function exportLaunchMetricsToGA(metrics: LaunchMetrics): Promise<GAExportResult>;
//# sourceMappingURL=ga-export.d.ts.map