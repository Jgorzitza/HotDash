/**
 * Page Speed Analyzer
 * @module lib/seo/page-speed
 */

export interface PageSpeedMetrics {
  url: string;
  loadTime: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
  score: number;
}

export function calculateSpeedScore(metrics: PageSpeedMetrics): number {
  const weights = {
    fcp: 0.15,
    tti: 0.15,
    tbt: 0.30,
    speedIndex: 0.15,
    loadTime: 0.25,
  };
  
  const fcpScore = metrics.firstContentfulPaint < 1800 ? 100 : Math.max(0, 100 - (metrics.firstContentfulPaint - 1800) / 30);
  const ttiScore = metrics.timeToInteractive < 3800 ? 100 : Math.max(0, 100 - (metrics.timeToInteractive - 3800) / 50);
  const tbtScore = metrics.totalBlockingTime < 200 ? 100 : Math.max(0, 100 - (metrics.totalBlockingTime - 200) / 5);
  const siScore = metrics.speedIndex < 3400 ? 100 : Math.max(0, 100 - (metrics.speedIndex - 3400) / 40);
  const ltScore = metrics.loadTime < 3000 ? 100 : Math.max(0, 100 - (metrics.loadTime - 3000) / 50);
  
  return Math.round(
    fcpScore * weights.fcp +
    ttiScore * weights.tti +
    tbtScore * weights.tbt +
    siScore * weights.speedIndex +
    ltScore * weights.loadTime
  );
}
