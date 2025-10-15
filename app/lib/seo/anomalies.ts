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

export type AnomalySeverity = 'critical' | 'warning' | 'info';

export interface SEOAnomaly {
  id: string;
  type: 'traffic' | 'ranking' | 'vitals' | 'crawl';
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
  metric: 'LCP' | 'FID' | 'CLS';
  value: number;
  threshold: number;
  device: 'mobile' | 'desktop';
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
export const ANOMALY_THRESHOLDS = {
  traffic: {
    critical: -0.40, // -40% or worse
    warning: -0.20,  // -20% to -40%
  },
  ranking: {
    critical: 10,    // Dropped 10+ positions
    warning: 5,      // Dropped 5-10 positions
  },
  vitals: {
    lcp: {
      good: 2500,      // milliseconds
      needsImprovement: 4000,
    },
    fid: {
      good: 100,       // milliseconds
      needsImprovement: 300,
    },
    cls: {
      good: 0.1,       // score
      needsImprovement: 0.25,
    },
  },
  crawl: {
    critical: 10,    // 10+ errors
    warning: 3,      // 3-10 errors
  },
} as const;

/**
 * Detect traffic anomalies from GA4 data
 */
export function detectTrafficAnomalies(
  inputs: TrafficAnomalyInput[]
): SEOAnomaly[] {
  return inputs
    .filter(input => input.wowDelta < ANOMALY_THRESHOLDS.traffic.warning)
    .map(input => {
      const severity: AnomalySeverity = 
        input.wowDelta <= ANOMALY_THRESHOLDS.traffic.critical 
          ? 'critical' 
          : 'warning';

      const changePercent = Math.round(input.wowDelta * 100);

      return {
        id: `traffic-${input.landingPage.replace(/[^a-z0-9]/gi, '-')}`,
        type: 'traffic',
        severity,
        title: `Traffic drop on ${input.landingPage}`,
        description: `Sessions dropped ${Math.abs(changePercent)}% week-over-week`,
        metric: {
          current: input.currentSessions,
          previous: input.previousSessions,
          change: input.currentSessions - input.previousSessions,
          changePercent: input.wowDelta,
        },
        affectedUrl: input.landingPage,
        detectedAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => a.metric.changePercent! - b.metric.changePercent!);
}

/**
 * Detect keyword ranking losses
 */
export function detectRankingAnomalies(
  inputs: RankingAnomalyInput[]
): SEOAnomaly[] {
  return inputs
    .filter(input => {
      const positionDrop = input.currentPosition - input.previousPosition;
      return positionDrop >= ANOMALY_THRESHOLDS.ranking.warning;
    })
    .map(input => {
      const positionDrop = input.currentPosition - input.previousPosition;
      const severity: AnomalySeverity = 
        positionDrop >= ANOMALY_THRESHOLDS.ranking.critical 
          ? 'critical' 
          : 'warning';

      return {
        id: `ranking-${input.keyword.replace(/\s+/g, '-')}`,
        type: 'ranking',
        severity,
        title: `Ranking drop for "${input.keyword}"`,
        description: `Dropped from position ${input.previousPosition} to ${input.currentPosition}`,
        metric: {
          current: input.currentPosition,
          previous: input.previousPosition,
          change: positionDrop,
        },
        affectedUrl: input.url,
        detectedAt: new Date().toISOString(),
        evidence: {
          query: input.keyword,
        },
      };
    })
    .sort((a, b) => b.metric.change! - a.metric.change!);
}

/**
 * Detect Core Web Vitals failures
 */
export function detectVitalsAnomalies(
  inputs: VitalsAnomalyInput[]
): SEOAnomaly[] {
  return inputs
    .filter(input => input.value > input.threshold)
    .map(input => {
      const thresholds = ANOMALY_THRESHOLDS.vitals[input.metric.toLowerCase() as 'lcp' | 'fid' | 'cls'];
      const severity: AnomalySeverity = 
        input.value > thresholds.needsImprovement 
          ? 'critical' 
          : 'warning';

      const metricNames = {
        LCP: 'Largest Contentful Paint',
        FID: 'First Input Delay',
        CLS: 'Cumulative Layout Shift',
      };

      return {
        id: `vitals-${input.metric}-${input.url.replace(/[^a-z0-9]/gi, '-')}`,
        type: 'vitals',
        severity,
        title: `${metricNames[input.metric]} failure`,
        description: `${input.metric} is ${input.value.toFixed(input.metric === 'CLS' ? 3 : 0)}${input.metric === 'CLS' ? '' : 'ms'} (threshold: ${input.threshold}${input.metric === 'CLS' ? '' : 'ms'})`,
        metric: {
          current: input.value,
          previous: input.threshold,
        },
        affectedUrl: input.url,
        detectedAt: new Date().toISOString(),
        evidence: {
          device: input.device,
        },
      };
    })
    .sort((a, b) => b.severity.localeCompare(a.severity));
}

/**
 * Detect Search Console crawl errors
 */
export function detectCrawlAnomalies(
  inputs: CrawlErrorInput[]
): SEOAnomaly[] {
  return inputs
    .filter(input => input.errorCount >= ANOMALY_THRESHOLDS.crawl.warning)
    .map(input => {
      const severity: AnomalySeverity = 
        input.errorCount >= ANOMALY_THRESHOLDS.crawl.critical 
          ? 'critical' 
          : 'warning';

      return {
        id: `crawl-${input.url.replace(/[^a-z0-9]/gi, '-')}`,
        type: 'crawl',
        severity,
        title: `Crawl errors on ${input.url}`,
        description: `${input.errorCount} ${input.errorType} errors detected`,
        metric: {
          current: input.errorCount,
        },
        affectedUrl: input.url,
        detectedAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => b.metric.current - a.metric.current);
}

/**
 * Aggregate all SEO anomalies with severity-based sorting
 */
export function aggregateSEOAnomalies(anomalies: SEOAnomaly[]): {
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
} {
  const critical = anomalies.filter(a => a.severity === 'critical');
  const warning = anomalies.filter(a => a.severity === 'warning');
  const info = anomalies.filter(a => a.severity === 'info');

  return {
    all: anomalies,
    critical,
    warning,
    info,
    summary: {
      total: anomalies.length,
      criticalCount: critical.length,
      warningCount: warning.length,
      infoCount: info.length,
    },
  };
}

