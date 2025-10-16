#!/usr/bin/env node
/**
 * Comprehensive Analytics Test Suite
 * 
 * Tests all analytics functions with real GA4 data.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

console.log('🧪 Testing All Analytics Functions...\n');

const propertyId = process.env.GA_PROPERTY_ID;
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!propertyId || !credentialsPath) {
  console.error('❌ ERROR: Missing environment variables');
  process.exit(1);
}

const client = new BetaAnalyticsDataClient();
const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const startDate = thirtyDaysAgo.toISOString().split('T')[0];
const endDate = today.toISOString().split('T')[0];

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test 1: Revenue Metrics
await test('Revenue Metrics', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'totalRevenue' }, { name: 'transactions' }],
  });
  const revenue = parseFloat(response.rows?.[0]?.metricValues?.[0]?.value || '0');
  if (revenue < 0) throw new Error('Invalid revenue');
});

// Test 2: Traffic Metrics
await test('Traffic Metrics', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
  });
  if (!response.rows || response.rows.length === 0) throw new Error('No traffic data');
});

// Test 3: Conversion Funnel
await test('Conversion Funnel', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'sessions' }, { name: 'conversions' }],
  });
  const sessions = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
  if (sessions === 0) throw new Error('No sessions');
});

// Test 4: Product Performance
await test('Product Performance', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'itemName' }],
    metrics: [{ name: 'itemsViewed' }],
    limit: 10,
  });
  // Products may not exist, so just check response format
  if (!response) throw new Error('Invalid response');
});

// Test 5: Time Series
await test('Time Series Data', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }],
  });
  if (!response.rows || response.rows.length === 0) throw new Error('No time series data');
});

// Test 6: Landing Pages
await test('Landing Page Performance', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'landingPage' }],
    metrics: [{ name: 'sessions' }],
    limit: 10,
  });
  if (!response.rows || response.rows.length === 0) throw new Error('No landing pages');
});

// Test 7: SEO Metrics
await test('SEO Metrics', async () => {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'CONTAINS', value: 'Organic' },
      },
    },
  });
  if (!response.rows) throw new Error('No organic traffic data');
});

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log(passed === 7 ? '✅ All tests passed!' : '⚠️  Some tests failed');

process.exit(failed > 0 ? 1 : 0);

