/**
 * SEO Anomaly Detection
 *
 * Comprehensive SEO monitoring that detects:
 * - Traffic drops > 20% week-over-week
 * - Keyword ranking losses (top 10 → below 20)
 * - Core Web Vitals failures
 * - Search Console crawl errors
 *
 * Severity levels: critical, warning, info
 *
 * @module lib/seo/anomalies
 */
export type AnomalySeverity = "critical" | "warning" | "info";
export interface SEOAnomaly {
    id: string;
    type: "traffic" | "ranking" | "vitals" | "crawl";
    severity: AnomalySeverity;
    title: string;
    description: string;
    metric: {
        current: number;
        previous?: number;
        change?: number;
        changePercent?: number;
    };
    affectedUrl?: string;
    detectedAt: string;
    evidence?: {
        query?: string;
        device?: string;
        country?: string;
    };
}
export interface TrafficAnomalyInput {
    landingPage: string;
    currentSessions: number;
    previousSessions: number;
    wowDelta: number;
}
export interface RankingAnomalyInput {
    keyword: string;
    currentPosition: number;
    previousPosition: number;
    url: string;
    searchVolume?: number;
}
export interface VitalsAnomalyInput {
    url: string;
    metric: "LCP" | "FID" | "CLS";
    value: number;
    threshold: number;
    device: "mobile" | "desktop";
}
export interface CrawlErrorInput {
    url: string;
    errorType: string;
    errorCount: number;
    lastDetected: string;
}
/**
 * Thresholds for anomaly detection
 */
export declare const ANOMALY_THRESHOLDS: {
    readonly traffic: {
        readonly critical: -0.4;
        readonly warning: -0.2;
    };
    readonly ranking: {
        readonly critical: 10;
        readonly warning: 5;
    };
    readonly vitals: {
        readonly lcp: {
            readonly good: 2500;
            readonly needsImprovement: 4000;
        };
        readonly fid: {
            readonly good: 100;
            readonly needsImprovement: 300;
        };
        readonly cls: {
            readonly good: 0.1;
            readonly needsImprovement: 0.25;
        };
    };
    readonly crawl: {
        readonly critical: 10;
        readonly warning: 3;
    };
};
/**
 * Detect traffic anomalies from GA4 data
 */
export declare function detectTrafficAnomalies(inputs: TrafficAnomalyInput[]): SEOAnomaly[];
/**
 * Detect keyword ranking losses
 */
export declare function detectRankingAnomalies(inputs: RankingAnomalyInput[]): SEOAnomaly[];
/**
 * Detect Core Web Vitals failures
 */
export declare function detectVitalsAnomalies(inputs: VitalsAnomalyInput[]): SEOAnomaly[];
/**
 * Detect Search Console crawl errors
 */
export declare function detectCrawlAnomalies(inputs: CrawlErrorInput[]): SEOAnomaly[];
/**
 * Aggregate all SEO anomalies with severity-based sorting
 */
export declare function aggregateSEOAnomalies(anomalies: SEOAnomaly[]): {
    all: SEOAnomaly[];
    critical: SEOAnomaly[];
    warning: SEOAnomaly[];
    info: SEOAnomaly[];
    summary: {
        total: number;
        criticalCount: number;
        warningCount: number;
        infoCount: number;
    };
};
//# sourceMappingURL=anomalies.d.ts.map