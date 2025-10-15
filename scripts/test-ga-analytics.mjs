#!/usr/bin/env node
/**
 * Test GA4 Analytics API
 *
 * Tests the GA4 API directly to verify revenue and traffic metrics.
 *
 * Usage:
 *   node scripts/test-ga-analytics.mjs
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

async function testAnalytics() {
  console.log('🧪 Testing GA4 Analytics API...\n');

  const propertyId = process.env.GA_PROPERTY_ID;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!propertyId || !credentialsPath) {
    console.error('❌ ERROR: Missing required environment variables');
    console.error('   GOOGLE_APPLICATION_CREDENTIALS:', credentialsPath || 'NOT SET');
    console.error('   GA_PROPERTY_ID:', propertyId || 'NOT SET');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`  Property ID: ${propertyId}`);
  console.log(`  Credentials: ${credentialsPath}\n`);

  try {
    const client = new BetaAnalyticsDataClient();

    // Calculate date ranges (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    // Test Revenue Metrics
    console.log('💰 Testing Revenue Metrics...');
    const [revenueResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalRevenue' },
        { name: 'transactions' },
      ],
    });

    const revenue = parseFloat(revenueResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const transactions = parseInt(revenueResponse.rows?.[0]?.metricValues?.[1]?.value || '0', 10);
    const aov = transactions > 0 ? revenue / transactions : 0;

    console.log('✅ Revenue Metrics Retrieved:');
    console.log(`  Total Revenue: $${revenue.toFixed(2)}`);
    console.log(`  Transactions: ${transactions}`);
    console.log(`  Average Order Value: $${aov.toFixed(2)}`);
    console.log(`  Period: ${startDate} to ${endDate}\n`);

    // Test Traffic Metrics
    console.log('📊 Testing Traffic Metrics...');
    const [trafficResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
    });

    let totalSessions = 0;
    let organicSessions = 0;

    trafficResponse.rows?.forEach((row) => {
      const channelGroup = row.dimensionValues?.[0]?.value || '';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);

      totalSessions += sessions;

      if (channelGroup.toLowerCase().includes('organic')) {
        organicSessions += sessions;
      }
    });

    const organicPercentage = totalSessions > 0 ? (organicSessions / totalSessions) * 100 : 0;

    console.log('✅ Traffic Metrics Retrieved:');
    console.log(`  Total Sessions: ${totalSessions}`);
    console.log(`  Organic Sessions: ${organicSessions}`);
    console.log(`  Organic Percentage: ${organicPercentage.toFixed(1)}%`);
    console.log(`  Period: ${startDate} to ${endDate}\n`);

    // Test Conversion Rate
    console.log('🎯 Testing Conversion Metrics...');
    const conversionRate = totalSessions > 0 ? (transactions / totalSessions) * 100 : 0;

    console.log('✅ Conversion Metrics Calculated:');
    console.log(`  Conversion Rate: ${conversionRate.toFixed(2)}%`);
    console.log(`  Transactions: ${transactions}`);
    console.log(`  Sessions: ${totalSessions}\n`);

    console.log('✅ All tests passed! GA4 Analytics API is working correctly.\n');
    console.log('📝 Summary:');
    console.log(`  - Revenue data available: ${revenue > 0 ? 'YES' : 'NO'}`);
    console.log(`  - Traffic data available: ${totalSessions > 0 ? 'YES' : 'NO'}`);
    console.log(`  - Conversion tracking: ${transactions > 0 ? 'YES' : 'NO'}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

testAnalytics().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

