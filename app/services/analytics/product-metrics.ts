/**
 * Product Metrics Dashboard Service
 * 
 * Aggregates product metrics for high-level health monitoring.
 * Provides DAU/MAU, product health score, and key performance indicators.
 */

import { db } from "~/lib/db.server";
import { productAnalyticsService } from "./product-analytics";
import { userSegmentationService } from "./user-segmentation";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ProductMetrics {
  // User metrics
  dau: number;                 // Daily Active Users
  wau: number;                 // Weekly Active Users
  mau: number;                 // Monthly Active Users
  dauMauRatio: number;         // Stickiness (0-1, higher = better)
  
  // Engagement metrics
  avgSessionsPerUser: number;
  avgEngagementScore: number;
  
  // Feature metrics
  totalFeatures: number;
  activeFeatures: number;      // Features with >10% adoption
  featureAdoptionRate: number; // avgFeatures used / totalFeatures
  
  // Health score
  productHealthScore: number;  // 0-100
  healthFactors: HealthScoreFactors;
  
  // Timestamps
  calculatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
}

export interface HealthScoreFactors {
  userRetention: number;       // 0-30 points
  featureAdoption: number;     // 0-25 points
  userEngagement: number;      // 0-25 points
  approvalQuality: number;     // 0-20 points
}

export interface TrendData {
  date: string;                // YYYY-MM-DD
  value: number;
}

// ============================================================================
// Product Metrics Service Class
// ============================================================================

export class ProductMetricsService {
  /**
   * Calculate Daily Active Users (DAU)
   * 
   * Count of unique users who had any activity in the last 24 hours.
   * 
   * @param date - Date to calculate DAU for (default: today)
   * @returns DAU count
   */
  async calculateDAU(date: Date = new Date()): Promise<number> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const users = await db.dashboardFact.findMany({
      where: {
        timestamp: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      select: { shop: true },
      distinct: ["shop"]
    });

    return users.length;
  }

  /**
   * Calculate Weekly Active Users (WAU)
   * 
   * Count of unique users who had any activity in the last 7 days.
   * 
   * @param endDate - End date (default: today)
   * @returns WAU count
   */
  async calculateWAU(endDate: Date = new Date()): Promise<number> {
    const weekStart = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const users = await db.dashboardFact.findMany({
      where: {
        timestamp: {
          gte: weekStart,
          lte: endDate
        }
      },
      select: { shop: true },
      distinct: ["shop"]
    });

    return users.length;
  }

  /**
   * Calculate Monthly Active Users (MAU)
   * 
   * Count of unique users who had any activity in the last 30 days.
   * 
   * @param endDate - End date (default: today)
   * @returns MAU count
   */
  async calculateMAU(endDate: Date = new Date()): Promise<number> {
    const monthStart = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const users = await db.dashboardFact.findMany({
      where: {
        timestamp: {
          gte: monthStart,
          lte: endDate
        }
      },
      select: { shop: true },
      distinct: ["shop"]
    });

    return users.length;
  }

  /**
   * Calculate product health score (0-100)
   * 
   * Composite score based on:
   * - User Retention (30 points): DAU/MAU ratio
   * - Feature Adoption (25 points): % features with >10% adoption
   * - User Engagement (25 points): Avg engagement score
   * - Approval Quality (20 points): Approval rate
   * 
   * @returns Product health score and factors
   */
  async calculateProductHealthScore(): Promise<{
    score: number;
    factors: HealthScoreFactors;
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Factor 1: User Retention (DAU/MAU ratio)
    const dau = await this.calculateDAU();
    const mau = await this.calculateMAU();
    const dauMauRatio = mau > 0 ? dau / mau : 0;
    const userRetention = Math.round(dauMauRatio * 30); // 0-30 points

    // Factor 2: Feature Adoption
    const featureMetrics = await productAnalyticsService.getFeatureAdoptionMetrics(
      startDate,
      endDate
    );
    const activeFeatures = featureMetrics.filter(f => f.adoptionRate >= 0.10);
    const featureAdoptionRate = featureMetrics.length > 0
      ? activeFeatures.length / featureMetrics.length
      : 0;
    const featureAdoption = Math.round(featureAdoptionRate * 25); // 0-25 points

    // Factor 3: User Engagement (average engagement score)
    const segmentAnalytics = await userSegmentationService.getSegmentAnalytics();
    const totalEngagement = segmentAnalytics.reduce(
      (sum, s) => sum + s.avgEngagementScore * s.userCount,
      0
    );
    const totalUserCount = segmentAnalytics.reduce((sum, s) => sum + s.userCount, 0);
    const avgEngagementScore = totalUserCount > 0 ? totalEngagement / totalUserCount : 0;
    const userEngagement = Math.round((avgEngagementScore / 100) * 25); // 0-25 points

    // Factor 4: Approval Quality
    const modalMetrics = await productAnalyticsService.getModalActionMetrics(
      startDate,
      endDate
    );
    const avgApprovalRate = modalMetrics.length > 0
      ? modalMetrics.reduce((sum, m) => sum + m.approvalRate, 0) / modalMetrics.length
      : 0;
    const approvalQuality = Math.round(avgApprovalRate * 20); // 0-20 points

    const factors: HealthScoreFactors = {
      userRetention,
      featureAdoption,
      userEngagement,
      approvalQuality
    };

    const score = userRetention + featureAdoption + userEngagement + approvalQuality;

    return { score, factors };
  }

  /**
   * Get complete product metrics
   * 
   * Returns all key product metrics for dashboard display.
   * 
   * @returns Complete product metrics
   */
  async getProductMetrics(): Promise<ProductMetrics> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate user metrics
    const dau = await this.calculateDAU();
    const wau = await this.calculateWAU();
    const mau = await this.calculateMAU();
    const dauMauRatio = mau > 0 ? dau / mau : 0;

    // Get engagement metrics
    const segmentAnalytics = await userSegmentationService.getSegmentAnalytics();
    const totalSessions = segmentAnalytics.reduce(
      (sum, s) => sum + s.avgSessionsPerUser * s.userCount,
      0
    );
    const totalUsers = segmentAnalytics.reduce((sum, s) => sum + s.userCount, 0);
    const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0;

    const totalEngagement = segmentAnalytics.reduce(
      (sum, s) => sum + s.avgEngagementScore * s.userCount,
      0
    );
    const avgEngagementScore = totalUsers > 0 ? totalEngagement / totalUsers : 0;

    // Get feature metrics
    const featureMetrics = await productAnalyticsService.getFeatureAdoptionMetrics(
      startDate,
      endDate
    );
    const totalFeatures = featureMetrics.length;
    const activeFeatures = featureMetrics.filter(f => f.adoptionRate >= 0.10).length;
    const avgFeaturesPerUser = featureMetrics.length > 0
      ? featureMetrics.reduce((sum, f) => sum + f.activeUsers, 0) / totalUsers
      : 0;
    const featureAdoptionRate = totalFeatures > 0 ? avgFeaturesPerUser / totalFeatures : 0;

    // Calculate health score
    const healthData = await this.calculateProductHealthScore();

    return {
      dau,
      wau,
      mau,
      dauMauRatio,
      avgSessionsPerUser,
      avgEngagementScore,
      totalFeatures,
      activeFeatures,
      featureAdoptionRate,
      productHealthScore: healthData.score,
      healthFactors: healthData.factors,
      calculatedAt: new Date(),
      periodStart: startDate,
      periodEnd: endDate
    };
  }

  /**
   * Get DAU trend (last 30 days)
   * 
   * @returns Array of DAU values by date
   */
  async getDAUTrend(days: number = 30): Promise<TrendData[]> {
    const trend: TrendData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dau = await this.calculateDAU(date);
      trend.push({
        date: date.toISOString().split('T')[0],
        value: dau
      });
    }

    return trend;
  }

  /**
   * Get health score interpretation
   * 
   * @param score - Health score (0-100)
   * @returns Interpretation and status
   */
  getHealthInterpretation(score: number): {
    status: "excellent" | "good" | "fair" | "poor";
    message: string;
    color: string;
  } {
    if (score >= 80) {
      return {
        status: "excellent",
        message: "Product is healthy and thriving",
        color: "green"
      };
    } else if (score >= 60) {
      return {
        status: "good",
        message: "Product is performing well",
        color: "blue"
      };
    } else if (score >= 40) {
      return {
        status: "fair",
        message: "Product needs attention",
        color: "yellow"
      };
    } else {
      return {
        status: "poor",
        message: "Product requires immediate action",
        color: "red"
      };
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const productMetricsService = new ProductMetricsService();

