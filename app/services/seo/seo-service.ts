/**
 * SEO Service
 * 
 * Comprehensive SEO monitoring and analysis service
 * Integrates all SEO modules and external APIs
 * 
 * @module services/seo/seo-service
 */

import { createSearchConsoleClient } from './search-console-client';
import { createPageSpeedClient } from './pagespeed-client';
import { seoCache } from './cache';
import { detectTrafficAnomalies, aggregateSEOAnomalies } from '../../lib/seo/anomalies';
import { detectRankingAnomalies } from '../../lib/seo/rankings';
import { detectVitalsAlerts } from '../../lib/seo/web-vitals';
import { detectCrawlErrors } from '../../lib/seo/crawl-errors';
import type { SEOAnomaly } from '../../lib/seo/anomalies';

export interface SEOServiceConfig {
  shopDomain: string;
  siteUrl: string;
  searchConsoleApiKey?: string;
  pageSpeedApiKey?: string;
  enableCaching?: boolean;
  cacheTTL?: number;
}

export interface SEOAnalysisResult {
  anomalies: {
    all: SEOAnomaly[];
    critical: SEOAnomaly[];
    warning: SEOAnomaly[];
    info: SEOAnomaly[];
  };
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
  sources: {
    traffic: 'fresh' | 'cache' | 'mock';
    rankings: 'fresh' | 'cache' | 'mock';
    vitals: 'fresh' | 'cache' | 'mock';
    crawl: 'fresh' | 'cache' | 'mock';
  };
  timestamp: string;
}

/**
 * SEO Service Class
 */
export class SEOService {
  private config: SEOServiceConfig;
  private searchConsoleClient;
  private pageSpeedClient;

  constructor(config: SEOServiceConfig) {
    this.config = config;
    this.searchConsoleClient = createSearchConsoleClient(
      config.siteUrl,
      config.searchConsoleApiKey
    );
    this.pageSpeedClient = createPageSpeedClient(config.pageSpeedApiKey);
  }

  /**
   * Run comprehensive SEO analysis
   */
  async analyze(): Promise<SEOAnalysisResult> {
    const cacheKey = `seo-analysis:${this.config.shopDomain}`;
    
    // Check cache if enabled
    if (this.config.enableCaching !== false) {
      const cached = seoCache.get<SEOAnalysisResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Fetch data from all sources
    const [trafficAnomalies, rankingAnomalies, vitalsAlerts, crawlErrors] = await Promise.all([
      this.getTrafficAnomalies(),
      this.getRankingAnomalies(),
      this.getVitalsAlerts(),
      this.getCrawlErrors(),
    ]);
    
    // Combine all anomalies
    const allAnomalies = [
      ...trafficAnomalies,
      ...rankingAnomalies,
      ...vitalsAlerts,
      ...crawlErrors,
    ];
    
    // Aggregate by severity
    const aggregated = aggregateSEOAnomalies(allAnomalies);
    
    const result: SEOAnalysisResult = {
      anomalies: {
        all: aggregated.all,
        critical: aggregated.critical,
        warning: aggregated.warning,
        info: aggregated.info,
      },
      summary: aggregated.summary,
      sources: {
        traffic: 'mock', // TODO: Update when GA4 integration is live
        rankings: 'mock',
        vitals: 'mock',
        crawl: 'mock',
      },
      timestamp: new Date().toISOString(),
    };
    
    // Cache result
    if (this.config.enableCaching !== false) {
      seoCache.set(cacheKey, result, this.config.cacheTTL);
    }
    
    return result;
  }

  /**
   * Get traffic anomalies
   */
  private async getTrafficAnomalies(): Promise<SEOAnomaly[]> {
    // TODO: Integrate with GA4
    return [];
  }

  /**
   * Get ranking anomalies from Search Console
   */
  private async getRankingAnomalies(): Promise<SEOAnomaly[]> {
    try {
      const response = await this.searchConsoleClient.querySearchAnalytics({
        startDate: this.getDateDaysAgo(7),
        endDate: this.getDateDaysAgo(0),
        dimensions: ['query', 'page'],
        rowLimit: 100,
      });
      
      // TODO: Compare with previous period and detect anomalies
      // For now, return empty since API is mocked
      return [];
    } catch (error) {
      console.error('[SEO Service] Error fetching rankings:', error);
      return [];
    }
  }

  /**
   * Get Core Web Vitals alerts
   */
  private async getVitalsAlerts(): Promise<SEOAnomaly[]> {
    try {
      const response = await this.pageSpeedClient.runPageSpeed({
        url: this.config.siteUrl,
        strategy: 'mobile',
      });
      
      const pageVitals = this.pageSpeedClient.convertToPageVitals(response, this.config.siteUrl);
      
      // TODO: Convert vitals to anomalies if thresholds exceeded
      // For now, return empty since we're using mock data
      return [];
    } catch (error) {
      console.error('[SEO Service] Error fetching vitals:', error);
      return [];
    }
  }

  /**
   * Get crawl errors from Search Console
   */
  private async getCrawlErrors(): Promise<SEOAnomaly[]> {
    try {
      const response = await this.searchConsoleClient.getCrawlErrors();
      
      // TODO: Convert crawl errors to anomalies
      // For now, return empty since API is mocked
      return [];
    } catch (error) {
      console.error('[SEO Service] Error fetching crawl errors:', error);
      return [];
    }
  }

  /**
   * Helper: Get date N days ago in YYYY-MM-DD format
   */
  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Clear cache for this shop
   */
  clearCache(): void {
    const cacheKey = `seo-analysis:${this.config.shopDomain}`;
    seoCache.delete(cacheKey);
  }
}

/**
 * Create SEO service instance
 */
export function createSEOService(config: SEOServiceConfig): SEOService {
  return new SEOService(config);
}

