/**
 * Sample Data Fixtures
 * 
 * Test fixtures for analytics data.
 */

import type { RevenueMetrics, TrafficMetrics } from './ga4.ts';
import type { FunnelData } from './funnels.ts';
import type { ProductMetrics } from './products.ts';

export const FIXTURE_REVENUE: RevenueMetrics = {
  totalRevenue: 15000.00,
  averageOrderValue: 200.00,
  transactions: 75,
  trend: {
    revenueChange: 20.0,
    aovChange: 5.0,
    transactionsChange: 15.0,
  },
  period: {
    start: '2025-01-01',
    end: '2025-01-31',
  },
};

export const FIXTURE_TRAFFIC: TrafficMetrics = {
  totalSessions: 10000,
  organicSessions: 7000,
  organicPercentage: 70.0,
  trend: {
    sessionsChange: 10.0,
    organicChange: 12.0,
  },
  period: {
    start: '2025-01-01',
    end: '2025-01-31',
  },
};

export const FIXTURE_FUNNEL: FunnelData = {
  name: 'Test Funnel',
  steps: [
    { name: 'Landing', eventName: 'session_start', users: 10000, dropOffRate: 0, conversionRate: 100, avgTimeToNext: 0 },
    { name: 'Product View', eventName: 'view_item', users: 6000, dropOffRate: 40, conversionRate: 60, avgTimeToNext: 0 },
    { name: 'Add to Cart', eventName: 'add_to_cart', users: 2400, dropOffRate: 60, conversionRate: 24, avgTimeToNext: 0 },
    { name: 'Checkout', eventName: 'begin_checkout', users: 720, dropOffRate: 70, conversionRate: 7.2, avgTimeToNext: 0 },
    { name: 'Purchase', eventName: 'purchase', users: 144, dropOffRate: 80, conversionRate: 1.44, avgTimeToNext: 0 },
  ],
  totalUsers: 10000,
  completionRate: 1.44,
  avgCompletionTime: 0,
  period: {
    start: '2025-01-01',
    end: '2025-01-31',
  },
};

export const FIXTURE_PRODUCTS: ProductMetrics[] = [
  {
    productName: 'Test Product 1',
    productId: 'prod_001',
    views: 5000,
    addToCarts: 1000,
    purchases: 200,
    revenue: 40000,
    addToCartRate: 20,
    purchaseRate: 4,
    avgPrice: 200,
    trend: 15,
  },
  {
    productName: 'Test Product 2',
    productId: 'prod_002',
    views: 3000,
    addToCarts: 600,
    purchases: 120,
    revenue: 18000,
    addToCartRate: 20,
    purchaseRate: 4,
    avgPrice: 150,
    trend: 10,
  },
];

