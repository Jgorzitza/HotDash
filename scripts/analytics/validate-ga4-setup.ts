#!/usr/bin/env tsx
/**
 * GA4 Setup Validation Script
 * 
 * Validates that GA4 Property 339826228 is configured correctly for ANALYTICS-017
 * 
 * Checks:
 * 1. GA4 Data API access (service account authentication)
 * 2. Custom dimension hd_action_key exists
 * 3. Property metadata accessibility
 * 4. Sample query execution (if test data exists)
 * 
 * Usage:
 *   npm run validate:ga4
 *   OR
 *   tsx scripts/analytics/validate-ga4-setup.ts
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

const GA4_PROPERTY_ID = '339826228';

// Initialize GA4 client
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Validation Results
 */
interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

/**
 * Test 1: Service Account Authentication
 */
async function testAuthentication(): Promise<ValidationResult> {
  console.log('\n[Test 1] Service Account Authentication...');
  
  try {
    // Attempt to get metadata (requires authentication)
    const [metadata] = await analyticsDataClient.getMetadata({
      name: `properties/${GA4_PROPERTY_ID}/metadata`
    });
    
    console.log('  ✅ Authentication successful');
    console.log(`  ✅ Property accessible: ${GA4_PROPERTY_ID}`);
    
    return {
      test: 'Authentication',
      status: 'PASS',
      message: 'Service account authenticated successfully',
      details: {
        propertyId: GA4_PROPERTY_ID,
        dimensionsCount: metadata.dimensions?.length || 0,
        metricsCount: metadata.metrics?.length || 0
      }
    };
  } catch (error: any) {
    console.error('  ❌ Authentication failed:', error.message);
    
    return {
      test: 'Authentication',
      status: 'FAIL',
      message: `Authentication failed: ${error.message}`,
      details: {
        error: error.message,
        hint: 'Check GOOGLE_APPLICATION_CREDENTIALS environment variable'
      }
    };
  }
}

/**
 * Test 2: Custom Dimension hd_action_key
 */
async function testCustomDimension(): Promise<ValidationResult> {
  console.log('\n[Test 2] Custom Dimension: hd_action_key...');
  
  try {
    const [metadata] = await analyticsDataClient.getMetadata({
      name: `properties/${GA4_PROPERTY_ID}/metadata`
    });
    
    // Search for hd_action_key dimension
    const hdActionKey = metadata.dimensions?.find(
      d => d.apiName === 'customEvent:hd_action_key'
    );
    
    if (hdActionKey) {
      console.log('  ✅ Custom dimension exists');
      console.log(`     API Name: ${hdActionKey.apiName}`);
      console.log(`     UI Name: ${hdActionKey.uiName}`);
      console.log(`     Description: ${hdActionKey.description}`);
      
      return {
        test: 'Custom Dimension',
        status: 'PASS',
        message: 'Custom dimension hd_action_key found',
        details: {
          apiName: hdActionKey.apiName,
          uiName: hdActionKey.uiName,
          description: hdActionKey.description
        }
      };
    } else {
      console.error('  ❌ Custom dimension NOT FOUND');
      console.error('     Expected: customEvent:hd_action_key');
      
      // List all custom dimensions for debugging
      const customDimensions = metadata.dimensions?.filter(
        d => d.apiName?.startsWith('customEvent:') || d.apiName?.startsWith('customUser:')
      ) || [];
      
      console.log('\n     Available custom dimensions:');
      customDimensions.forEach(d => {
        console.log(`       - ${d.apiName} (${d.uiName})`);
      });
      
      return {
        test: 'Custom Dimension',
        status: 'FAIL',
        message: 'Custom dimension hd_action_key not found',
        details: {
          availableCustomDimensions: customDimensions.map(d => ({
            apiName: d.apiName,
            uiName: d.uiName
          })),
          hint: 'DevOps must create dimension in GA4 Admin → Data Display → Custom Definitions'
        }
      };
    }
  } catch (error: any) {
    console.error('  ❌ Failed to retrieve metadata:', error.message);
    
    return {
      test: 'Custom Dimension',
      status: 'FAIL',
      message: `Failed to check custom dimension: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Test 3: Sample Query Execution
 */
async function testSampleQuery(): Promise<ValidationResult> {
  console.log('\n[Test 3] Sample Query Execution...');
  
  try {
    // Query last 7 days for any events with hd_action_key
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{
        startDate: '7daysAgo',
        endDate: 'today'
      }],
      dimensions: [
        { name: 'eventName' },
        { name: 'customEvent:hd_action_key' }
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'customEvent:hd_action_key',
          stringFilter: {
            matchType: 'EXACT',
            value: 'test_action',
            caseSensitive: false
          }
        }
      },
      limit: 10
    });
    
    const eventCount = response.rows?.length || 0;
    
    if (eventCount > 0) {
      console.log('  ✅ Query executed successfully');
      console.log(`     Found ${eventCount} events with hd_action_key`);
      
      // Display sample events
      console.log('\n     Sample events:');
      response.rows?.slice(0, 3).forEach(row => {
        console.log(`       - ${row.dimensionValues?.[0]?.value}: ${row.dimensionValues?.[1]?.value} (${row.metricValues?.[0]?.value} events)`);
      });
      
      return {
        test: 'Sample Query',
        status: 'PASS',
        message: `Query executed successfully, found ${eventCount} events`,
        details: {
          eventCount,
          sampleEvents: response.rows?.slice(0, 3).map(row => ({
            eventName: row.dimensionValues?.[0]?.value,
            actionKey: row.dimensionValues?.[1]?.value,
            count: row.metricValues?.[0]?.value
          }))
        }
      };
    } else {
      console.log('  ⚠️  Query executed but no data found');
      console.log('     This is expected if no events have been sent yet');
      console.log('     Engineers need to implement client tracking (ENG-032, 033)');
      
      return {
        test: 'Sample Query',
        status: 'WARN',
        message: 'Query executed successfully but no events found (expected before client tracking)',
        details: {
          hint: 'Wait for Engineer to implement client tracking (ENG-032, 033)'
        }
      };
    }
  } catch (error: any) {
    console.error('  ❌ Query failed:', error.message);
    
    return {
      test: 'Sample Query',
      status: 'FAIL',
      message: `Query failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Test 4: Standard Dimensions Accessibility
 */
async function testStandardDimensions(): Promise<ValidationResult> {
  console.log('\n[Test 4] Standard Dimensions (sessions, pageviews, etc.)...');
  
  try {
    // Query for basic GA4 metrics
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{
        startDate: '7daysAgo',
        endDate: 'today'
      }],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'totalUsers' }
      ]
    });
    
    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      const sessions = parseInt(row.metricValues?.[0]?.value || '0');
      const pageviews = parseInt(row.metricValues?.[1]?.value || '0');
      const users = parseInt(row.metricValues?.[2]?.value || '0');
      
      console.log('  ✅ Standard metrics accessible');
      console.log(`     Sessions (7d): ${sessions}`);
      console.log(`     Pageviews (7d): ${pageviews}`);
      console.log(`     Users (7d): ${users}`);
      
      return {
        test: 'Standard Dimensions',
        status: 'PASS',
        message: 'Standard GA4 metrics accessible',
        details: {
          sessions,
          pageviews,
          users
        }
      };
    } else {
      console.log('  ⚠️  No data in last 7 days');
      
      return {
        test: 'Standard Dimensions',
        status: 'WARN',
        message: 'No GA4 data in last 7 days (property may be new)',
        details: {}
      };
    }
  } catch (error: any) {
    console.error('  ❌ Standard metrics query failed:', error.message);
    
    return {
      test: 'Standard Dimensions',
      status: 'FAIL',
      message: `Standard metrics query failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Main Validation
 */
async function main() {
  console.log('='.repeat(60));
  console.log('GA4 SETUP VALIDATION - ANALYTICS-017');
  console.log('='.repeat(60));
  console.log(`Property ID: ${GA4_PROPERTY_ID}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Run all tests
  results.push(await testAuthentication());
  results.push(await testCustomDimension());
  results.push(await testStandardDimensions());
  results.push(await testSampleQuery());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  
  // Overall status
  if (failed > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ VALIDATION FAILED');
    console.log('='.repeat(60));
    console.log('Action Required: Fix failed tests before proceeding');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
    console.log('='.repeat(60));
    console.log('Setup is functional but some features need additional work');
    process.exit(0);
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('✅ VALIDATION PASSED');
    console.log('='.repeat(60));
    console.log('GA4 setup is ready for production use');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('\n❌ VALIDATION SCRIPT FAILED');
  console.error(error);
  process.exit(1);
});

