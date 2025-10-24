/**
 * Enhanced Action Attribution Service
 * 
 * ANALYTICS-002: Advanced action attribution and ROI measurement system
 * Builds on existing action-attribution.ts with enhanced features
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import prisma from "~/prisma.server";
import { logDecision } from "~/services/decisions.server";
import type { ActionAttributionResult, AttributionSummary } from './action-attribution';

// ============================================================================
// Enhanced Types
// ============================================================================

export interface EnhancedActionAttributionResult extends ActionAttributionResult {
  // Enhanced metrics
  costPerAcquisition: number;
  returnOnAdSpend: number;
  lifetimeValue: number;
  attributionEfficiency: number;
  performanceScore: number;
  
  // Time-based metrics
  peakPerformanceHour: number;
  peakPerformanceDay: string;
  seasonalTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Attribution insights
  attributionPath: string[];
  touchpointCount: number;
  attributionConfidence: number;
}

export interface AttributionInsights {
  topPerformingActions: EnhancedActionAttributionResult[];
  underperformingActions: EnhancedActionAttributionResult[];
  emergingTrends: string[];
  optimizationOpportunities: OptimizationOpportunity[];
  predictedROI: number;
  confidenceScore: number;
}

export interface OptimizationOpportunity {
  actionKey: string;
  currentROI: number;
  potentialROI: number;
  improvementPercentage: number;
  recommendedActions: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
}

export interface AttributionReport {
  period: {
    start: string;
    end: string;
    timeframe: '7d' | '14d' | '28d';
  };
  summary: {
    totalRevenue: number;
    totalSessions: number;
    totalConversions: number;
    averageConversionRate: number;
    averageOrderValue: number;
    totalROI: number;
  };
  insights: AttributionInsights;
  recommendations: string[];
  generatedAt: string;
}

// ============================================================================
// Enhanced Attribution Analysis
// ============================================================================

/**
 * Enhanced action attribution with advanced metrics
 */
export async function getEnhancedActionAttribution(
  actionKey: string,
  periodDays: 7 | 14 | 28,
): Promise<EnhancedActionAttributionResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  try {
    // Get basic attribution data
    const basicAttribution = await getActionAttribution(actionKey, periodDays);
    
    // Get enhanced metrics from GA4
    const [response] = await analyticsDataClient.runReport({
      property: `properties/339826228`,
      dateRanges: [
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        },
      ],
      dimensions: [
        { name: "customEvent:hd_action_key" },
        { name: "hour" },
        { name: "dayOfWeek" },
        { name: "sessionSource" },
        { name: "sessionMedium" }
      ],
      metrics: [
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "addToCarts" },
        { name: "ecommercePurchases" },
        { name: "totalRevenue" },
        { name: "userEngagementDuration" },
        { name: "bounceRate" }
      ],
      dimensionFilter: {
        filter: {
          fieldName: "customEvent:hd_action_key",
          stringFilter: {
            value: actionKey,
            matchType: "EXACT",
          },
        },
      },
    });

    if (!response.rows || response.rows.length === 0) {
      return {
        ...basicAttribution,
        costPerAcquisition: 0,
        returnOnAdSpend: 0,
        lifetimeValue: 0,
        attributionEfficiency: 0,
        performanceScore: 0,
        peakPerformanceHour: 0,
        peakPerformanceDay: 'unknown',
        seasonalTrend: 'stable',
        attributionPath: [],
        touchpointCount: 0,
        attributionConfidence: 0
      };
    }

    // Calculate enhanced metrics
    const totalSessions = basicAttribution.sessions;
    const totalRevenue = basicAttribution.revenue;
    const totalConversions = basicAttribution.purchases;
    
    // Cost per acquisition (assuming $50 average cost per action)
    const costPerAcquisition = totalConversions > 0 ? 50 / totalConversions : 0;
    
    // Return on ad spend
    const returnOnAdSpend = totalRevenue > 0 ? totalRevenue / 50 : 0;
    
    // Lifetime value (estimated based on AOV and repeat rate)
    const lifetimeValue = basicAttribution.averageOrderValue * 1.3; // 30% repeat rate assumption
    
    // Attribution efficiency (revenue per session)
    const attributionEfficiency = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    
    // Performance score (0-100)
    const performanceScore = Math.min(100, (basicAttribution.conversionRate * 10) + (attributionEfficiency * 2));
    
    // Find peak performance hour and day
    const hourlyData = new Map<number, number>();
    const dailyData = new Map<string, number>();
    
    response.rows.forEach(row => {
      const hour = parseInt(row.dimensionValues?.[1]?.value || "0");
      const day = row.dimensionValues?.[2]?.value || "unknown";
      const revenue = parseFloat(row.metricValues?.[4]?.value || "0");
      
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + revenue);
      dailyData.set(day, (dailyData.get(day) || 0) + revenue);
    });
    
    const peakPerformanceHour = Array.from(hourlyData.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;
    
    const peakPerformanceDay = Array.from(dailyData.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
    
    // Determine seasonal trend
    const trendData = response.rows.slice(0, Math.min(7, response.rows.length));
    const recentRevenue = trendData.reduce((sum, row) => 
      sum + parseFloat(row.metricValues?.[4]?.value || "0"), 0);
    const olderRevenue = response.rows.slice(-7).reduce((sum, row) => 
      sum + parseFloat(row.metricValues?.[4]?.value || "0"), 0);
    
    const seasonalTrend = recentRevenue > olderRevenue * 1.1 ? 'increasing' :
                        recentRevenue < olderRevenue * 0.9 ? 'decreasing' : 'stable';
    
    // Attribution path and confidence
    const attributionPath = Array.from(new Set(
      response.rows.map(row => `${row.dimensionValues?.[3]?.value || 'unknown'}/${row.dimensionValues?.[4]?.value || 'unknown'}`)
    ));
    
    const touchpointCount = attributionPath.length;
    const attributionConfidence = Math.min(100, (touchpointCount * 20) + (basicAttribution.conversionRate * 10));

    return {
      ...basicAttribution,
      costPerAcquisition,
      returnOnAdSpend,
      lifetimeValue,
      attributionEfficiency,
      performanceScore,
      peakPerformanceHour,
      peakPerformanceDay,
      seasonalTrend,
      attributionPath,
      touchpointCount,
      attributionConfidence
    };
  } catch (error: any) {
    console.error(`[Enhanced Attribution] Error for ${actionKey}:`, error.message);
    throw new Error(`Failed to fetch enhanced attribution data: ${error.message}`);
  }
}

/**
 * Generate comprehensive attribution insights
 */
export async function generateAttributionInsights(
  attributionData: EnhancedActionAttributionResult[]
): Promise<AttributionInsights> {
  // Sort by performance score
  const sortedData = attributionData.sort((a, b) => b.performanceScore - a.performanceScore);
  
  // Top performing actions (top 20%)
  const topPerformingActions = sortedData.slice(0, Math.ceil(sortedData.length * 0.2));
  
  // Underperforming actions (bottom 20%)
  const underperformingActions = sortedData.slice(-Math.ceil(sortedData.length * 0.2));
  
  // Identify emerging trends
  const emergingTrends = identifyEmergingTrends(attributionData);
  
  // Generate optimization opportunities
  const optimizationOpportunities = generateOptimizationOpportunities(attributionData);
  
  // Calculate predicted ROI
  const predictedROI = calculatePredictedROI(attributionData);
  
  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(attributionData);

  return {
    topPerformingActions,
    underperformingActions,
    emergingTrends,
    optimizationOpportunities,
    predictedROI,
    confidenceScore
  };
}

/**
 * Generate comprehensive attribution report
 */
export async function generateAttributionReport(
  timeframe: '7d' | '14d' | '28d'
): Promise<AttributionReport> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 28));
  
  // Get all action attribution data
  const actions = await prisma.actionQueue.findMany({
    where: {
      status: 'approved',
      approvedAt: {
        gte: startDate,
        lte: endDate
      },
      actionKey: { not: null }
    }
  });

  const attributionData: EnhancedActionAttributionResult[] = [];
  
  for (const action of actions) {
    if (action.actionKey) {
      try {
        const enhancedData = await getEnhancedActionAttribution(action.actionKey, timeframe);
        attributionData.push(enhancedData);
      } catch (error) {
        console.error(`Failed to get attribution for ${action.actionKey}:`, error);
      }
    }
  }

  // Calculate summary metrics
  const summary = {
    totalRevenue: attributionData.reduce((sum, data) => sum + data.revenue, 0),
    totalSessions: attributionData.reduce((sum, data) => sum + data.sessions, 0),
    totalConversions: attributionData.reduce((sum, data) => sum + data.purchases, 0),
    averageConversionRate: attributionData.length > 0 ? 
      attributionData.reduce((sum, data) => sum + data.conversionRate, 0) / attributionData.length : 0,
    averageOrderValue: attributionData.length > 0 ? 
      attributionData.reduce((sum, data) => sum + data.averageOrderValue, 0) / attributionData.length : 0,
    totalROI: attributionData.reduce((sum, data) => sum + data.returnOnAdSpend, 0)
  };

  // Generate insights
  const insights = await generateAttributionInsights(attributionData);

  // Generate recommendations
  const recommendations = generateRecommendations(insights);

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      timeframe
    },
    summary,
    insights,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function identifyEmergingTrends(data: EnhancedActionAttributionResult[]): string[] {
  const trends: string[] = [];
  
  // Check for increasing trends
  const increasingActions = data.filter(d => d.seasonalTrend === 'increasing');
  if (increasingActions.length > 0) {
    trends.push(`${increasingActions.length} actions showing increasing performance trends`);
  }
  
  // Check for high attribution efficiency
  const efficientActions = data.filter(d => d.attributionEfficiency > 10);
  if (efficientActions.length > 0) {
    trends.push(`${efficientActions.length} actions with high attribution efficiency (>$10/session)`);
  }
  
  // Check for peak performance patterns
  const peakHourActions = data.filter(d => d.peakPerformanceHour >= 9 && d.peakPerformanceHour <= 17);
  if (peakHourActions.length > data.length * 0.7) {
    trends.push('Most actions perform best during business hours (9 AM - 5 PM)');
  }
  
  return trends;
}

function generateOptimizationOpportunities(data: EnhancedActionAttributionResult[]): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  
  data.forEach(action => {
    if (action.performanceScore < 50) {
      const potentialROI = action.returnOnAdSpend * 1.5; // 50% improvement potential
      const improvementPercentage = ((potentialROI - action.returnOnAdSpend) / action.returnOnAdSpend) * 100;
      
      opportunities.push({
        actionKey: action.actionKey,
        currentROI: action.returnOnAdSpend,
        potentialROI,
        improvementPercentage,
        recommendedActions: [
          'Optimize targeting parameters',
          'Improve ad creative and messaging',
          'Test different attribution windows',
          'Consider audience expansion'
        ],
        priority: improvementPercentage > 100 ? 'high' : improvementPercentage > 50 ? 'medium' : 'low',
        estimatedImpact: potentialROI - action.returnOnAdSpend
      });
    }
  });
  
  return opportunities.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}

function calculatePredictedROI(data: EnhancedActionAttributionResult[]): number {
  if (data.length === 0) return 0;
  
  const averageROI = data.reduce((sum, action) => sum + action.returnOnAdSpend, 0) / data.length;
  const trendMultiplier = data.filter(d => d.seasonalTrend === 'increasing').length / data.length;
  
  return averageROI * (1 + trendMultiplier * 0.2); // 20% boost for positive trends
}

function calculateConfidenceScore(data: EnhancedActionAttributionResult[]): number {
  if (data.length === 0) return 0;
  
  const averageConfidence = data.reduce((sum, action) => sum + action.attributionConfidence, 0) / data.length;
  const dataQualityScore = Math.min(100, data.length * 10); // More data = higher confidence
  
  return (averageConfidence + dataQualityScore) / 2;
}

function generateRecommendations(insights: AttributionInsights): string[] {
  const recommendations: string[] = [];
  
  if (insights.topPerformingActions.length > 0) {
    recommendations.push(`Scale up top performing actions: ${insights.topPerformingActions.map(a => a.actionKey).join(', ')}`);
  }
  
  if (insights.underperformingActions.length > 0) {
    recommendations.push(`Review and optimize underperforming actions: ${insights.underperformingActions.map(a => a.actionKey).join(', ')}`);
  }
  
  if (insights.optimizationOpportunities.length > 0) {
    const highPriority = insights.optimizationOpportunities.filter(o => o.priority === 'high');
    if (highPriority.length > 0) {
      recommendations.push(`High priority optimization opportunities: ${highPriority.length} actions with significant improvement potential`);
    }
  }
  
  if (insights.emergingTrends.length > 0) {
    recommendations.push(`Monitor emerging trends: ${insights.emergingTrends.join(', ')}`);
  }
  
  return recommendations;
}

// ============================================================================
// Nightly Job Enhancement
// ============================================================================

/**
 * Enhanced nightly attribution update with insights
 */
export async function runEnhancedNightlyAttributionUpdate() {
  const startTime = Date.now();
  console.log("[Enhanced Attribution] ========================================");
  console.log("[Enhanced Attribution] Starting enhanced nightly ROI update");
  console.log("[Enhanced Attribution] ========================================");

  try {
    // Generate reports for all timeframes
    const [report7d, report14d, report28d] = await Promise.all([
      generateAttributionReport('7d'),
      generateAttributionReport('14d'),
      generateAttributionReport('28d')
    ]);

    const duration = Date.now() - startTime;
    const durationMinutes = (duration / 60000).toFixed(2);

    console.log(`[Enhanced Attribution] ✅ Complete in ${durationMinutes} minutes`);
    console.log(`[Enhanced Attribution] Reports generated for all timeframes`);
    console.log(`[Enhanced Attribution] 28d Summary: $${report28d.summary.totalRevenue.toLocaleString()} revenue, ${report28d.summary.totalConversions} conversions`);

    // Log comprehensive decision
    await logDecision({
      scope: "ops",
      actor: "analytics",
      action: "enhanced_attribution_update",
      rationale: `Enhanced nightly ROI sync: Generated comprehensive attribution reports for all timeframes`,
      evidenceUrl: "/api/action-attribution",
      payload: {
        durationMs: duration,
        reportsGenerated: 3,
        totalRevenue: report28d.summary.totalRevenue,
        totalConversions: report28d.summary.totalConversions,
        confidenceScore: report28d.insights.confidenceScore,
        recommendations: report28d.recommendations.length
      }
    });

    return {
      success: true,
      reports: { report7d, report14d, report28d },
      durationMs: duration
    };
  } catch (error: any) {
    console.error("[Enhanced Attribution] ❌ Enhanced nightly update failed:", error.message);

    await logDecision({
      scope: "ops",
      actor: "analytics",
      action: "enhanced_attribution_update_failed",
      rationale: `Enhanced nightly ROI sync failed: ${error.message}`,
      evidenceUrl: "/api/action-attribution",
      payload: {
        error: error.message,
        stack: error.stack
      }
    });

    throw error;
  }
}

// Re-export existing functions for compatibility
export { getActionAttribution, updateActionROI, rerankActionQueue, runNightlyAttributionUpdate } from './action-attribution';
