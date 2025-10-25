/**
 * Product Analytics Service
 *
 * Tracks product feature usage and provides insights for product decisions.
 * Based on: docs/directions/product.md (PRODUCT-011)
 *
 * Features:
 * - Event tracking (feature usage, tile clicks, modal actions)
 * - Feature adoption metrics (% users using each feature)
 * - Top features identification
 * - Unused features detection
 * - Engagement analytics
 */

import { db } from "~/lib/prisma.server";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FeatureUsageEvent {
  userId: string; // Shop domain
  featureName: string; // "dark_mode", "tile_reorder", "approval_queue"
  action: string; // "enabled", "clicked", "viewed"
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FeatureAdoptionMetrics {
  featureName: string;
  totalUsers: number; // Total users in system
  activeUsers: number; // Users who used feature
  adoptionRate: number; // activeUsers / totalUsers (0-1)
  firstUsed: Date | null; // When first user used feature
  lastUsed: Date | null; // Most recent usage
  usageCount: number; // Total usage events
  avgUsagePerUser: number; // usageCount / activeUsers
}

export interface TileEngagementMetrics {
  tileName: string;
  clickCount: number;
  viewCount: number;
  clickRate: number; // clickCount / viewCount (0-1)
  avgTimeToClick: number; // Average seconds from view to click
  modalOpenRate: number; // % clicks that opened modal
}

export interface ModalActionMetrics {
  modalType: string; // "approval", "tile_details", "settings"
  approveCount: number;
  rejectCount: number;
  skipCount: number;
  approvalRate: number; // approveCount / (approveCount + rejectCount)
  avgDecisionTime: number; // Average seconds to approve/reject
}

export interface SettingsChangeMetrics {
  settingName: string; // "theme", "tile_visibility", "notifications"
  changeCount: number;
  uniqueUsers: number;
  popularValues: { value: string; count: number }[];
}

// ============================================================================
// Product Analytics Service Class
// ============================================================================

export class ProductAnalyticsService {
  /**
   * Track feature usage event
   *
   * Records when a user uses a feature.
   * Stored in DashboardFact with category "product_analytics".
   *
   * @param event - Feature usage event data
   */
  async trackFeatureUsage(event: FeatureUsageEvent): Promise<void> {
    await prisma.dashboardFact.create({
      data: {
        shop: event.userId,
        category: "product_analytics",
        metric: `feature_${event.featureName}_${event.action}`,
        value: 1,
        metadata: JSON.stringify({
          featureName: event.featureName,
          action: event.action,
          ...event.metadata,
        }),
        timestamp: event.timestamp,
      },
    });
  }

  /**
   * Get feature adoption metrics
   *
   * Calculates adoption rate for each feature:
   * - Total users in system
   * - Users who used feature at least once
   * - Adoption rate (% of users)
   *
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of feature adoption metrics
   */
  async getFeatureAdoptionMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<FeatureAdoptionMetrics[]> {
    // Get all unique users in period
    const totalUsersResult = await prisma.dashboardFact.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        shop: true,
      },
      distinct: ["shop"],
    });
    const totalUsers = totalUsersResult.length;

    // Get feature usage data
    const featureEvents = await prisma.dashboardFact.findMany({
      where: {
        category: "product_analytics",
        metric: {
          startsWith: "feature_",
        },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        shop: true,
        metric: true,
        timestamp: true,
      },
    });

    // Group by feature name
    const featureMap = new Map<
      string,
      {
        users: Set<string>;
        usageCount: number;
        firstUsed: Date | null;
        lastUsed: Date | null;
      }
    >();

    for (const event of featureEvents) {
      // Parse feature name from metric: "feature_{name}_{action}"
      const match = event.metric.match(/^feature_([^_]+)_/);
      if (!match) continue;
      const featureName = match[1];

      if (!featureMap.has(featureName)) {
        featureMap.set(featureName, {
          users: new Set(),
          usageCount: 0,
          firstUsed: null,
          lastUsed: null,
        });
      }

      const feature = featureMap.get(featureName)!;
      feature.users.add(event.shop);
      feature.usageCount++;

      if (!feature.firstUsed || event.timestamp < feature.firstUsed) {
        feature.firstUsed = event.timestamp;
      }
      if (!feature.lastUsed || event.timestamp > feature.lastUsed) {
        feature.lastUsed = event.timestamp;
      }
    }

    // Calculate metrics
    const metrics: FeatureAdoptionMetrics[] = [];
    for (const [featureName, data] of featureMap.entries()) {
      const activeUsers = data.users.size;
      const adoptionRate = totalUsers > 0 ? activeUsers / totalUsers : 0;
      const avgUsagePerUser =
        activeUsers > 0 ? data.usageCount / activeUsers : 0;

      metrics.push({
        featureName,
        totalUsers,
        activeUsers,
        adoptionRate,
        firstUsed: data.firstUsed,
        lastUsed: data.lastUsed,
        usageCount: data.usageCount,
        avgUsagePerUser,
      });
    }

    // Sort by adoption rate (descending)
    return metrics.sort((a, b) => b.adoptionRate - a.adoptionRate);
  }

  /**
   * Get tile engagement metrics
   *
   * Analyzes tile clicks and views to calculate engagement.
   *
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of tile engagement metrics
   */
  async getTileEngagementMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<TileEngagementMetrics[]> {
    // Get tile events
    const tileEvents = await prisma.dashboardFact.findMany({
      where: {
        category: "tile_analytics",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        metric: true,
        value: true,
        metadata: true,
      },
    });

    // Group by tile name
    const tileMap = new Map<
      string,
      {
        clicks: number;
        views: number;
        timesToClick: number[];
        modalOpens: number;
      }
    >();

    for (const event of tileEvents) {
      // Parse tile name from metric: "tile_{name}_{action}"
      const match = event.metric.match(/^tile_([^_]+)_/);
      if (!match) continue;
      const tileName = match[1];

      if (!tileMap.has(tileName)) {
        tileMap.set(tileName, {
          clicks: 0,
          views: 0,
          timesToClick: [],
          modalOpens: 0,
        });
      }

      const tile = tileMap.get(tileName)!;

      if (event.metric.endsWith("_clicked")) {
        tile.clicks++;

        // Extract time to click from metadata if available
        const metadata = event.metadata
          ? JSON.parse(event.metadata as string)
          : {};
        if (metadata.timeToClick) {
          tile.timesToClick.push(metadata.timeToClick);
        }
      } else if (event.metric.endsWith("_viewed")) {
        tile.views++;
      } else if (event.metric.endsWith("_modal_opened")) {
        tile.modalOpens++;
      }
    }

    // Calculate metrics
    const metrics: TileEngagementMetrics[] = [];
    for (const [tileName, data] of tileMap.entries()) {
      const clickRate = data.views > 0 ? data.clicks / data.views : 0;
      const avgTimeToClick =
        data.timesToClick.length > 0
          ? data.timesToClick.reduce((sum, t) => sum + t, 0) /
            data.timesToClick.length
          : 0;
      const modalOpenRate = data.clicks > 0 ? data.modalOpens / data.clicks : 0;

      metrics.push({
        tileName,
        clickCount: data.clicks,
        viewCount: data.views,
        clickRate,
        avgTimeToClick,
        modalOpenRate,
      });
    }

    // Sort by click count (descending)
    return metrics.sort((a, b) => b.clickCount - a.clickCount);
  }

  /**
   * Get modal action metrics
   *
   * Analyzes approve/reject rates for different modal types.
   *
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of modal action metrics
   */
  async getModalActionMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<ModalActionMetrics[]> {
    // Query decision_log for approval actions
    const decisions = await prisma.decisionLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        action: true,
        metadata: true,
        timestamp: true,
        createdAt: true,
      },
    });

    // Group by modal type
    const modalMap = new Map<
      string,
      {
        approves: number;
        rejects: number;
        skips: number;
        decisionTimes: number[];
      }
    >();

    for (const decision of decisions) {
      // Parse modal type from metadata
      const metadata = decision.metadata
        ? JSON.parse(decision.metadata as string)
        : {};
      const modalType = metadata.modalType || "approval";

      if (!modalMap.has(modalType)) {
        modalMap.set(modalType, {
          approves: 0,
          rejects: 0,
          skips: 0,
          decisionTimes: [],
        });
      }

      const modal = modalMap.get(modalType)!;

      // Count action type
      const action = decision.action.toLowerCase();
      if (action.includes("approve")) {
        modal.approves++;
      } else if (action.includes("reject")) {
        modal.rejects++;
      } else if (action.includes("skip")) {
        modal.skips++;
      }

      // Calculate decision time if available
      if (metadata.decisionTimeMs) {
        modal.decisionTimes.push(metadata.decisionTimeMs / 1000); // Convert to seconds
      }
    }

    // Calculate metrics
    const metrics: ModalActionMetrics[] = [];
    for (const [modalType, data] of modalMap.entries()) {
      const totalDecisions = data.approves + data.rejects;
      const approvalRate =
        totalDecisions > 0 ? data.approves / totalDecisions : 0;
      const avgDecisionTime =
        data.decisionTimes.length > 0
          ? data.decisionTimes.reduce((sum, t) => sum + t, 0) /
            data.decisionTimes.length
          : 0;

      metrics.push({
        modalType,
        approveCount: data.approves,
        rejectCount: data.rejects,
        skipCount: data.skips,
        approvalRate,
        avgDecisionTime,
      });
    }

    return metrics;
  }

  /**
   * Get settings change metrics
   *
   * Analyzes which settings users change most frequently.
   *
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of settings change metrics
   */
  async getSettingsChangeMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<SettingsChangeMetrics[]> {
    // Query user_preferences table for changes
    const settingsEvents = await prisma.dashboardFact.findMany({
      where: {
        category: "settings",
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        shop: true,
        metric: true,
        metadata: true,
      },
    });

    // Group by setting name
    const settingsMap = new Map<
      string,
      {
        changes: number;
        users: Set<string>;
        values: Map<string, number>;
      }
    >();

    for (const event of settingsEvents) {
      // Parse setting name from metric: "settings_{name}_changed"
      const match = event.metric.match(/^settings_([^_]+)_changed$/);
      if (!match) continue;
      const settingName = match[1];

      if (!settingsMap.has(settingName)) {
        settingsMap.set(settingName, {
          changes: 0,
          users: new Set(),
          values: new Map(),
        });
      }

      const setting = settingsMap.get(settingName)!;
      setting.changes++;
      setting.users.add(event.shop);

      // Track popular values
      const metadata = event.metadata
        ? JSON.parse(event.metadata as string)
        : {};
      if (metadata.value) {
        const currentCount = setting.values.get(metadata.value) || 0;
        setting.values.set(metadata.value, currentCount + 1);
      }
    }

    // Calculate metrics
    const metrics: SettingsChangeMetrics[] = [];
    for (const [settingName, data] of settingsMap.entries()) {
      const popularValues = Array.from(data.values.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 values

      metrics.push({
        settingName,
        changeCount: data.changes,
        uniqueUsers: data.users.size,
        popularValues,
      });
    }

    // Sort by change count (descending)
    return metrics.sort((a, b) => b.changeCount - a.changeCount);
  }

  /**
   * Identify top features by usage
   *
   * Returns most-used features ranked by adoption rate.
   *
   * @param limit - Number of top features to return (default: 10)
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of top features
   */
  async getTopFeatures(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FeatureAdoptionMetrics[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || new Date();

    const allMetrics = await this.getFeatureAdoptionMetrics(start, end);
    return allMetrics.slice(0, limit);
  }

  /**
   * Identify unused features
   *
   * Returns features with low adoption (<10%) or no recent usage.
   *
   * @param threshold - Adoption rate threshold (default: 0.10 = 10%)
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of unused features
   */
  async getUnusedFeatures(
    threshold: number = 0.1,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FeatureAdoptionMetrics[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || new Date();

    const allMetrics = await this.getFeatureAdoptionMetrics(start, end);

    // Filter for low adoption or no recent usage (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return allMetrics.filter(
      (m) =>
        m.adoptionRate < threshold || (m.lastUsed && m.lastUsed < sevenDaysAgo),
    );
  }

  /**
   * Generate product insights
   *
   * Provides actionable insights based on analytics data.
   *
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Array of insights with recommendations
   */
  async generateInsights(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ type: string; message: string; recommendation: string }>> {
    const insights: Array<{
      type: string;
      message: string;
      recommendation: string;
    }> = [];

    // Get metrics
    const featureMetrics = await this.getFeatureAdoptionMetrics(
      startDate,
      endDate,
    );
    const tileMetrics = await this.getTileEngagementMetrics(startDate, endDate);
    const unusedFeatures = await this.getUnusedFeatures(
      0.1,
      startDate,
      endDate,
    );

    // Insight 1: Low tile engagement
    const lowEngagementTiles = tileMetrics.filter((t) => t.clickRate < 0.2); // < 20% click rate
    if (lowEngagementTiles.length > 0) {
      insights.push({
        type: "low_engagement",
        message: `${lowEngagementTiles.length} tiles have low engagement (<20% click rate)`,
        recommendation: `Consider reordering tiles or improving tile content for: ${lowEngagementTiles.map((t) => t.tileName).join(", ")}`,
      });
    }

    // Insight 2: High modal rejection rate
    const modalMetrics = await this.getModalActionMetrics(startDate, endDate);
    const highRejectionModals = modalMetrics.filter(
      (m) => m.approvalRate < 0.5,
    ); // < 50% approval
    if (highRejectionModals.length > 0) {
      insights.push({
        type: "high_rejection",
        message: `${highRejectionModals.length} modal types have high rejection rates (<50% approval)`,
        recommendation: `Review recommendations quality for: ${highRejectionModals.map((m) => m.modalType).join(", ")}`,
      });
    }

    // Insight 3: Unused features
    if (unusedFeatures.length > 0) {
      insights.push({
        type: "unused_features",
        message: `${unusedFeatures.length} features have low adoption (<10%)`,
        recommendation: `Consider deprecating or improving: ${unusedFeatures.map((f) => f.featureName).join(", ")}`,
      });
    }

    // Insight 4: Popular features
    const topFeatures = featureMetrics.slice(0, 3);
    if (topFeatures.length > 0) {
      insights.push({
        type: "popular_features",
        message: `Top features: ${topFeatures.map((f) => `${f.featureName} (${(f.adoptionRate * 100).toFixed(0)}%)`).join(", ")}`,
        recommendation: "Continue investing in these high-value features",
      });
    }

    return insights;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const productAnalyticsService = new ProductAnalyticsService();
