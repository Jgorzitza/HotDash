/**
 * Crawl Budget Insights
 * @module lib/seo/crawl-budget
 */

export interface CrawlStats {
  totalPages: number;
  crawledPages: number;
  crawlRate: number;
  avgCrawlTime: number;
  crawlErrors: number;
}

export function analyzeCrawlBudget(stats: CrawlStats): {
  efficiency: number;
  recommendations: string[];
} {
  const efficiency = (stats.crawledPages / stats.totalPages) * 100;
  const recommendations: string[] = [];
  
  if (efficiency < 80) {
    recommendations.push('Improve site speed to increase crawl rate');
  }
  
  if (stats.crawlErrors > 100) {
    recommendations.push('Fix crawl errors to preserve crawl budget');
  }
  
  if (stats.avgCrawlTime > 2000) {
    recommendations.push('Optimize page load time (currently ' + stats.avgCrawlTime + 'ms)');
  }
  
  return { efficiency, recommendations };
}
