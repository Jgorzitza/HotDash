/**
 * Core Web Vitals Monitoring Service
 *
 * Tracks Core Web Vitals using PageSpeed Insights API:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 *
 * Provides performance optimization recommendations and daily monitoring.
 *
 * @module services/seo/core-web-vitals
 */
export interface CoreWebVitalsMetrics {
    url: string;
    device: "mobile" | "desktop";
    lcp: VitalMetric;
    fid: VitalMetric;
    cls: VitalMetric;
    overallScore: number;
    recommendations: string[];
    measuredAt: string;
}
export interface VitalMetric {
    value: number;
    unit: string;
    rating: "good" | "needs-improvement" | "poor";
    percentile: number;
    threshold: {
        good: number;
        needsImprovement: number;
    };
}
export interface PageSpeedAnalysis {
    mobile: CoreWebVitalsMetrics;
    desktop: CoreWebVitalsMetrics;
    opportunities: PerformanceOpportunity[];
    diagnostics: PerformanceDiagnostic[];
    analyzedAt: string;
}
export interface PerformanceOpportunity {
    title: string;
    description: string;
    estimatedSavings: number;
    impact: "high" | "medium" | "low";
}
export interface PerformanceDiagnostic {
    title: string;
    description: string;
    severity: "critical" | "warning" | "info";
}
/**
 * Analyze Core Web Vitals for a URL (both mobile and desktop)
 */
export declare function analyzeWebVitals(url: string): Promise<PageSpeedAnalysis>;
/**
 * Daily monitoring function (to be called by cron job)
 */
export declare function runDailyWebVitalsMonitoring(urls: string[]): Promise<Map<string, PageSpeedAnalysis>>;
//# sourceMappingURL=core-web-vitals.d.ts.map