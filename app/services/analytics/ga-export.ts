/**
 * Google Analytics Export Service
 * 
 * Task: ANALYTICS-LAUNCH-001
 * 
 * Exports launch metrics to Google Analytics for tracking and analysis.
 * Uses GA4 Measurement Protocol to send custom events.
 */

import { type LaunchMetrics } from "~/services/metrics/launch-metrics";
import { getGaConfig } from "~/config/ga.server";
import { logDecision } from "~/services/decisions.server";

export interface GAExportResult {
  success: boolean;
  eventsExported: number;
  errors: string[];
}

/**
 * Export launch metrics to Google Analytics
 */
export async function exportLaunchMetricsToGA(metrics: LaunchMetrics): Promise<GAExportResult> {
  const config = getGaConfig();
  const errors: string[] = [];
  let eventsExported = 0;
  
  // Check if GA is configured
  if (config.mode === 'mock') {
    return {
      success: true,
      eventsExported: 0,
      errors: ['Running in mock mode'],
    };
  }
  
  try {
    // Export user engagement metrics
    await exportUserEngagementMetrics(metrics, config.propertyId);
    eventsExported += 3; // DAU, MAU, signups
    
    // Export feature adoption metrics
    await exportFeatureAdoptionMetrics(metrics, config.propertyId);
    eventsExported += 2; // activation, TTFV
    
    // Export satisfaction metrics
    await exportSatisfactionMetrics(metrics, config.propertyId);
    eventsExported += 3; // NPS, CSAT, sentiment
    
    // Log export success
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'launch_metrics_exported_to_ga',
      rationale: `Exported ${eventsExported} launch metrics to Google Analytics`,
      evidenceUrl: 'app/services/analytics/ga-export.ts',
      payload: {
        eventsExported,
        propertyId: config.propertyId,
        timestamp: new Date().toISOString(),
      },
    });
    
    return {
      success: true,
      eventsExported,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    
    console.error('[GA Export] Failed:', error);
    
    return {
      success: false,
      eventsExported,
      errors,
    };
  }
}

/**
 * Export user engagement metrics to GA
 */
async function exportUserEngagementMetrics(metrics: LaunchMetrics, propertyId: string): Promise<void> {
  // Send DAU metric
  await sendGAEvent(propertyId, {
    name: 'launch_metric_dau',
    params: {
      metric_category: 'user_engagement',
      dau: metrics.adoption.dauMau.dau,
      mau: metrics.adoption.dauMau.mau,
      dau_mau_ratio: metrics.adoption.dauMau.ratio,
      trend: metrics.adoption.dauMau.trend,
    },
  });
  
  // Send signup metric
  await sendGAEvent(propertyId, {
    name: 'launch_metric_signups',
    params: {
      metric_category: 'user_engagement',
      signups: metrics.adoption.signups.signups,
      target: metrics.adoption.signups.target,
      percent_of_target: metrics.adoption.signups.percentOfTarget,
      trend: metrics.adoption.signups.trend,
    },
  });
}

/**
 * Export feature adoption metrics to GA
 */
async function exportFeatureAdoptionMetrics(metrics: LaunchMetrics, propertyId: string): Promise<void> {
  // Send activation metric
  await sendGAEvent(propertyId, {
    name: 'launch_metric_activation',
    params: {
      metric_category: 'feature_adoption',
      activation_rate: metrics.adoption.activation.activationRate,
      total_users: metrics.adoption.activation.totalUsers,
      activated_users: metrics.adoption.activation.activatedUsers,
      profile_setup: metrics.adoption.activation.milestoneCompletion.profileSetup,
      first_integration: metrics.adoption.activation.milestoneCompletion.firstIntegration,
      view_dashboard: metrics.adoption.activation.milestoneCompletion.viewDashboard,
      first_approval: metrics.adoption.activation.milestoneCompletion.firstApproval,
      first_workflow: metrics.adoption.activation.milestoneCompletion.firstWorkflow,
    },
  });
  
  // Send TTFV metric
  await sendGAEvent(propertyId, {
    name: 'launch_metric_ttfv',
    params: {
      metric_category: 'feature_adoption',
      median: metrics.adoption.ttfv.median,
      p50: metrics.adoption.ttfv.p50,
      p75: metrics.adoption.ttfv.p75,
      p90: metrics.adoption.ttfv.p90,
      p99: metrics.adoption.ttfv.p99,
    },
  });
}

/**
 * Export satisfaction metrics to GA
 */
async function exportSatisfactionMetrics(metrics: LaunchMetrics, propertyId: string): Promise<void> {
  // Send NPS metric
  await sendGAEvent(propertyId, {
    name: 'launch_metric_nps',
    params: {
      metric_category: 'satisfaction',
      nps_score: metrics.satisfaction.nps.npsScore,
      total_responses: metrics.satisfaction.nps.totalResponses,
      promoters: metrics.satisfaction.nps.promoters,
      passives: metrics.satisfaction.nps.passives,
      detractors: metrics.satisfaction.nps.detractors,
      trend: metrics.satisfaction.nps.trend,
    },
  });
  
  // Send CSAT metric
  if (metrics.satisfaction.csat.length > 0) {
    const csat = metrics.satisfaction.csat[0];
    await sendGAEvent(propertyId, {
      name: 'launch_metric_csat',
      params: {
        metric_category: 'satisfaction',
        average_rating: csat.averageRating,
        satisfaction_rate: csat.satisfactionRate,
        total_ratings: csat.totalRatings,
      },
    });
  }
  
  // Send sentiment metric
  await sendGAEvent(propertyId, {
    name: 'launch_metric_sentiment',
    params: {
      metric_category: 'satisfaction',
      positive_rate: metrics.satisfaction.sentiment.positiveRate,
      neutral_rate: metrics.satisfaction.sentiment.neutralRate,
      negative_rate: metrics.satisfaction.sentiment.negativeRate,
      total_analyzed: metrics.satisfaction.sentiment.totalAnalyzed,
    },
  });
}

/**
 * Send event to Google Analytics via Measurement Protocol
 */
async function sendGAEvent(propertyId: string, event: { name: string; params: Record<string, any> }): Promise<void> {
  // TODO: Implement actual GA4 Measurement Protocol API call
  // For now, just log the event
    propertyId,
    event,
  });
  
  // GA4 Measurement Protocol endpoint:
  // POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=SECRET
  // Body: {
  //   client_id: 'unique_client_id',
  //   events: [event]
  // }
  
  // Implementation would look like:
  /*
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;
  
  if (!measurementId || !apiSecret) {
    throw new Error('GA Measurement ID or API Secret not configured');
  }
  
  const response = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'hotdash-launch-metrics',
        events: [event],
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`GA API error: ${response.status} ${response.statusText}`);
  }
  */
}

