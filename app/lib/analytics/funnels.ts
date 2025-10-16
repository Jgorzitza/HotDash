/**
 * Conversion Funnel Tracking
 * 
 * Track user journey through conversion funnel and identify drop-off points.
 * Supports custom funnels with multiple steps.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

// ============================================================================
// Types
// ============================================================================

export interface FunnelStep {
  name: string;
  eventName: string;
  users: number;
  dropOffRate: number;
  conversionRate: number;
  avgTimeToNext: number; // seconds
}

export interface FunnelData {
  name: string;
  steps: FunnelStep[];
  totalUsers: number;
  completionRate: number;
  avgCompletionTime: number;
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Predefined Funnels
// ============================================================================

export const ECOMMERCE_FUNNEL = {
  name: 'E-commerce Purchase Funnel',
  steps: [
    { name: 'Landing', eventName: 'session_start' },
    { name: 'Product View', eventName: 'view_item' },
    { name: 'Add to Cart', eventName: 'add_to_cart' },
    { name: 'Begin Checkout', eventName: 'begin_checkout' },
    { name: 'Purchase', eventName: 'purchase' },
  ],
};

export const SIGNUP_FUNNEL = {
  name: 'User Signup Funnel',
  steps: [
    { name: 'Landing', eventName: 'session_start' },
    { name: 'Signup Page', eventName: 'view_signup' },
    { name: 'Form Started', eventName: 'signup_start' },
    { name: 'Form Submitted', eventName: 'signup_submit' },
    { name: 'Account Created', eventName: 'sign_up' },
  ],
};

// ============================================================================
// Funnel Analysis
// ============================================================================

/**
 * Analyze conversion funnel for a given set of steps
 */
export async function analyzeFunnel(
  funnelConfig: { name: string; steps: Array<{ name: string; eventName: string }> },
  dateRange?: { start: string; end: string }
): Promise<FunnelData> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    // Calculate date range (default: last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = dateRange?.start || thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = dateRange?.end || today.toISOString().split('T')[0];

    // Fetch event counts for each step
    const stepPromises = funnelConfig.steps.map(async (step) => {
      const [response] = await client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: step.eventName,
            },
          },
        },
      });

      const users = parseInt(response.rows?.[0]?.metricValues?.[1]?.value || '0', 10);
      return { ...step, users };
    });

    const stepsWithUsers = await Promise.all(stepPromises);

    // Calculate drop-off rates and conversion rates
    const totalUsers = stepsWithUsers[0]?.users || 0;
    const steps: FunnelStep[] = stepsWithUsers.map((step, index) => {
      const previousUsers = index > 0 ? stepsWithUsers[index - 1].users : totalUsers;
      const dropOffRate = previousUsers > 0 
        ? ((previousUsers - step.users) / previousUsers) * 100 
        : 0;
      const conversionRate = totalUsers > 0 
        ? (step.users / totalUsers) * 100 
        : 0;

      return {
        name: step.name,
        eventName: step.eventName,
        users: step.users,
        dropOffRate,
        conversionRate,
        avgTimeToNext: 0, // TODO: Calculate from event timestamps
      };
    });

    const completedUsers = steps[steps.length - 1]?.users || 0;
    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('analyzeFunnel', true, duration);

    return {
      name: funnelConfig.name,
      steps,
      totalUsers,
      completionRate,
      avgCompletionTime: 0, // TODO: Calculate from event timestamps
      period: { start: startDate, end: endDate },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('analyzeFunnel', false, duration);
    throw error;
  }
}

/**
 * Get e-commerce funnel analysis
 */
export async function getEcommerceFunnel(
  dateRange?: { start: string; end: string }
): Promise<FunnelData> {
  return analyzeFunnel(ECOMMERCE_FUNNEL, dateRange);
}

/**
 * Get signup funnel analysis
 */
export async function getSignupFunnel(
  dateRange?: { start: string; end: string }
): Promise<FunnelData> {
  return analyzeFunnel(SIGNUP_FUNNEL, dateRange);
}

/**
 * Identify biggest drop-off points in funnel
 */
export function identifyDropOffPoints(funnelData: FunnelData): Array<{
  step: string;
  dropOffRate: number;
  usersLost: number;
}> {
  const dropOffs = funnelData.steps
    .map((step, index) => {
      if (index === 0) return null; // First step has no drop-off
      
      const previousStep = funnelData.steps[index - 1];
      const usersLost = previousStep.users - step.users;
      
      return {
        step: `${previousStep.name} → ${step.name}`,
        dropOffRate: step.dropOffRate,
        usersLost,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.dropOffRate - a.dropOffRate);

  return dropOffs;
}

/**
 * Calculate funnel optimization opportunities
 */
export function calculateOptimizationOpportunities(funnelData: FunnelData): Array<{
  step: string;
  potentialGain: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}> {
  const dropOffs = identifyDropOffPoints(funnelData);
  
  return dropOffs.map((dropOff) => {
    const potentialGain = dropOff.usersLost;
    const priority = dropOff.dropOffRate > 50 ? 'high' 
      : dropOff.dropOffRate > 25 ? 'medium' 
      : 'low';
    
    let recommendation = '';
    if (dropOff.step.includes('Product View')) {
      recommendation = 'Improve product page design, add better images, clearer CTAs';
    } else if (dropOff.step.includes('Add to Cart')) {
      recommendation = 'Simplify add-to-cart process, add trust signals, show shipping info';
    } else if (dropOff.step.includes('Checkout')) {
      recommendation = 'Reduce checkout steps, offer guest checkout, add payment options';
    } else {
      recommendation = 'Analyze user behavior, A/B test improvements, reduce friction';
    }

    return {
      step: dropOff.step,
      potentialGain,
      priority,
      recommendation,
    };
  });
}

