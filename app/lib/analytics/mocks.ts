/**
 * Analytics Mock Data
 * 
 * Fallback mock data when GA4 is not configured or unavailable.
 */

import type { RevenueMetrics, TrafficMetrics, ConversionMetrics } from './ga4.ts';
import type { FunnelData } from './funnels.ts';
import type { SEOMetrics } from './seo.ts';

export const MOCK_REVENUE: RevenueMetrics = {
  totalRevenue: 12500.00,
  averageOrderValue: 185.50,
  transactions: 67,
  trend: {
    revenueChange: 15.3,
    aovChange: -2.1,
    transactionsChange: 18.2,
  },
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
};

export const MOCK_TRAFFIC: TrafficMetrics = {
  totalSessions: 5200,
  organicSessions: 3640,
  organicPercentage: 70.0,
  trend: {
    sessionsChange: 12.5,
    organicChange: 15.8,
  },
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
};

export const MOCK_CONVERSION: ConversionMetrics = {
  conversionRate: 1.29,
  transactions: 67,
  revenue: 12500.00,
  trend: {
    conversionRateChange: 8.4,
  },
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
};

export const MOCK_SEO: SEOMetrics = {
  organicSessions: 3640,
  organicUsers: 2890,
  organicRevenue: 8750.00,
  organicConversions: 47,
  organicConversionRate: 1.29,
  topKeywords: [],
  topLandingPages: [
    { page: '/', sessions: 1200, bounceRate: 45.2, avgDuration: 180 },
    { page: '/products', sessions: 890, bounceRate: 38.5, avgDuration: 240 },
    { page: '/about', sessions: 450, bounceRate: 52.1, avgDuration: 120 },
  ],
  trend: {
    sessionsChange: 15.8,
    revenueChange: 18.3,
  },
};

export const MOCK_FUNNEL: FunnelData = {
  name: 'E-commerce Purchase Funnel',
  steps: [
    { name: 'Landing', eventName: 'session_start', users: 5200, dropOffRate: 0, conversionRate: 100, avgTimeToNext: 0 },
    { name: 'Product View', eventName: 'view_item', users: 3120, dropOffRate: 40, conversionRate: 60, avgTimeToNext: 0 },
    { name: 'Add to Cart', eventName: 'add_to_cart', users: 1248, dropOffRate: 60, conversionRate: 24, avgTimeToNext: 0 },
    { name: 'Begin Checkout', eventName: 'begin_checkout', users: 374, dropOffRate: 70, conversionRate: 7.2, avgTimeToNext: 0 },
    { name: 'Purchase', eventName: 'purchase', users: 67, dropOffRate: 82, conversionRate: 1.29, avgTimeToNext: 0 },
  ],
  totalUsers: 5200,
  completionRate: 1.29,
  avgCompletionTime: 0,
  period: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
};

/**
 * Check if GA4 is configured
 */
export function isGAConfigured(): boolean {
  const propertyId = process.env.GA_PROPERTY_ID;
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  return !!(propertyId && credentials);
}

/**
 * Get revenue metrics with fallback to mock
 */
export async function getRevenueWithFallback(
  fetchFn: () => Promise<RevenueMetrics>
): Promise<RevenueMetrics> {
  if (!isGAConfigured()) {
    console.warn('[Analytics] GA not configured, using mock data');
    return MOCK_REVENUE;
  }
  
  try {
    return await fetchFn();
  } catch (error) {
    console.error('[Analytics] GA fetch failed, using mock data:', error);
    return MOCK_REVENUE;
  }
}

/**
 * Get traffic metrics with fallback to mock
 */
export async function getTrafficWithFallback(
  fetchFn: () => Promise<TrafficMetrics>
): Promise<TrafficMetrics> {
  if (!isGAConfigured()) {
    console.warn('[Analytics] GA not configured, using mock data');
    return MOCK_TRAFFIC;
  }
  
  try {
    return await fetchFn();
  } catch (error) {
    console.error('[Analytics] GA fetch failed, using mock data:', error);
    return MOCK_TRAFFIC;
  }
}

/**
 * Get conversion metrics with fallback to mock
 */
export async function getConversionWithFallback(
  fetchFn: () => Promise<ConversionMetrics>
): Promise<ConversionMetrics> {
  if (!isGAConfigured()) {
    console.warn('[Analytics] GA not configured, using mock data');
    return MOCK_CONVERSION;
  }
  
  try {
    return await fetchFn();
  } catch (error) {
    console.error('[Analytics] GA fetch failed, using mock data:', error);
    return MOCK_CONVERSION;
  }
}

/**
 * Get SEO metrics with fallback to mock
 */
export async function getSEOWithFallback(
  fetchFn: () => Promise<SEOMetrics>
): Promise<SEOMetrics> {
  if (!isGAConfigured()) {
    console.warn('[Analytics] GA not configured, using mock data');
    return MOCK_SEO;
  }
  
  try {
    return await fetchFn();
  } catch (error) {
    console.error('[Analytics] GA fetch failed, using mock data:', error);
    return MOCK_SEO;
  }
}

/**
 * Get funnel data with fallback to mock
 */
export async function getFunnelWithFallback(
  fetchFn: () => Promise<FunnelData>
): Promise<FunnelData> {
  if (!isGAConfigured()) {
    console.warn('[Analytics] GA not configured, using mock data');
    return MOCK_FUNNEL;
  }
  
  try {
    return await fetchFn();
  } catch (error) {
    console.error('[Analytics] GA fetch failed, using mock data:', error);
    return MOCK_FUNNEL;
  }
}

