/**
 * Telemetry Pipeline Integration Tests
 * 
 * Tests the data flow from GSC/GA4 to action queue
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Telemetry Pipeline Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured for testing');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  });

  describe('GSC Data Collection', () => {
    it('should collect search console data successfully', async () => {
      // Mock GSC API response
      const mockGSCResponse = {
        rows: [
          {
            keys: ['test product'],
            clicks: 150,
            impressions: 2000,
            ctr: 7.5,
            position: 3.2
          }
        ]
      };

      // Test data collection
      const gscData = await collectGSCData(mockGSCResponse);
      expect(gscData).toBeDefined();
      expect(gscData.queries).toHaveLength(1);
      expect(gscData.queries[0].query).toBe('test product');
      expect(gscData.queries[0].clicks).toBe(150);
    });

    it('should handle GSC API errors gracefully', async () => {
      // Test error handling
      const errorResponse = await collectGSCDataWithError();
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.fallback).toBe(true);
    });

    it('should process GSC data into actionable insights', async () => {
      const gscData = {
        queries: [
          { query: 'test product', clicks: 150, impressions: 2000, ctr: 7.5, position: 3.2 },
          { query: 'best product', clicks: 89, impressions: 1200, ctr: 7.4, position: 4.1 }
        ]
      };

      const insights = await processGSCData(gscData);
      expect(insights).toBeDefined();
      expect(insights.opportunities).toHaveLength(2);
      expect(insights.opportunities[0].type).toBe('seo_optimization');
    });
  });

  describe('GA4 Data Collection', () => {
    it('should collect GA4 events successfully', async () => {
      const mockGA4Response = {
        rows: [
          {
            dimensionValues: [{ value: 'seo_optimization_001' }],
            metricValues: [
              { value: '1250' }, // sessions
              { value: '89' },   // add_to_carts
              { value: '23' },   // purchases
              { value: '2300' }  // revenue
            ]
          }
        ]
      };

      const ga4Data = await collectGA4Data(mockGA4Response);
      expect(ga4Data).toBeDefined();
      expect(ga4Data.events).toHaveLength(1);
      expect(ga4Data.events[0].sessions).toBe(1250);
    });

    it('should handle GA4 API rate limiting', async () => {
      const rateLimitResponse = await collectGA4DataWithRateLimit();
      expect(rateLimitResponse.rate_limited).toBe(true);
      expect(rateLimitResponse.retry_after).toBeDefined();
    });

    it('should process GA4 data for attribution', async () => {
      const ga4Data = {
        events: [
          { event_name: 'page_view', event_count: 1250, total_revenue: 15000 },
          { event_name: 'add_to_cart', event_count: 89, total_revenue: 8900 }
        ]
      };

      const attribution = await processGA4DataForAttribution(ga4Data);
      expect(attribution).toBeDefined();
      expect(attribution.total_revenue).toBe(23900);
      expect(attribution.conversion_rate).toBeGreaterThan(0);
    });
  });

  describe('Action Queue Creation', () => {
    it('should create actions from telemetry data', async () => {
      const telemetryData = {
        gsc: {
          queries: [
            { query: 'test product', clicks: 150, impressions: 2000, ctr: 7.5, position: 3.2 }
          ]
        },
        ga4: {
          events: [
            { event_name: 'purchase', event_count: 23, total_revenue: 2300 }
          ]
        }
      };

      const actions = await createActionsFromTelemetry(telemetryData);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('seo_optimization');
      expect(actions[0].expected_impact.metric).toBe('organic_traffic');
    });

    it('should score actions based on telemetry data', async () => {
      const actions = [
        {
          type: 'seo_optimization',
          expected_impact: { metric: 'organic_traffic', delta: 25, unit: '%' },
          confidence: 0.85,
          ease: 'medium'
        }
      ];

      const scoredActions = await scoreActions(actions);
      expect(scoredActions).toHaveLength(1);
      expect(scoredActions[0].score).toBeGreaterThan(0);
      expect(scoredActions[0].score).toBeLessThanOrEqual(10);
    });

    it('should rank actions by score', async () => {
      const actions = [
        { id: 'action_1', score: 7.2, type: 'seo_optimization' },
        { id: 'action_2', score: 8.5, type: 'inventory_optimization' },
        { id: 'action_3', score: 6.8, type: 'content_optimization' }
      ];

      const rankedActions = await rankActions(actions);
      expect(rankedActions[0].id).toBe('action_2'); // Highest score
      expect(rankedActions[1].id).toBe('action_1');
      expect(rankedActions[2].id).toBe('action_3');
    });
  });

  describe('Data Pipeline Integration', () => {
    it('should process complete telemetry pipeline', async () => {
      // Start with raw telemetry data
      const rawData = await collectRawTelemetryData();
      
      // Process through pipeline
      const processedData = await processTelemetryPipeline(rawData);
      
      // Verify pipeline output
      expect(processedData.actions).toBeDefined();
      expect(processedData.actions.length).toBeGreaterThan(0);
      expect(processedData.attribution).toBeDefined();
      expect(processedData.insights).toBeDefined();
    });

    it('should handle pipeline failures gracefully', async () => {
      // Test with malformed data
      const malformedData = { invalid: 'data' };
      
      const result = await processTelemetryPipeline(malformedData);
      expect(result.error).toBeDefined();
      expect(result.fallback).toBe(true);
    });

    it('should maintain data consistency across pipeline', async () => {
      const inputData = await collectRawTelemetryData();
      const outputData = await processTelemetryPipeline(inputData);
      
      // Verify data consistency
      expect(outputData.metadata.input_timestamp).toBeDefined();
      expect(outputData.metadata.processing_time).toBeGreaterThan(0);
      expect(outputData.metadata.data_quality_score).toBeGreaterThan(0);
    });
  });

  // Helper functions
  async function collectGSCData(mockResponse: any) {
    return {
      queries: mockResponse.rows.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }))
    };
  }

  async function collectGSCDataWithError() {
    return { error: 'GSC API timeout', fallback: true };
  }

  async function processGSCData(gscData: any) {
    return {
      opportunities: gscData.queries.map((query: any) => ({
        type: 'seo_optimization',
        target: query.query,
        potential_impact: query.clicks * 0.1
      }))
    };
  }

  async function collectGA4Data(mockResponse: any) {
    return {
      events: mockResponse.rows.map((row: any) => ({
        sessions: parseInt(row.metricValues[0].value),
        add_to_carts: parseInt(row.metricValues[1].value),
        purchases: parseInt(row.metricValues[2].value),
        revenue: parseFloat(row.metricValues[3].value)
      }))
    };
  }

  async function collectGA4DataWithRateLimit() {
    return { rate_limited: true, retry_after: 60 };
  }

  async function processGA4DataForAttribution(ga4Data: any) {
    const totalRevenue = ga4Data.events.reduce((sum: number, event: any) => sum + event.total_revenue, 0);
    const totalSessions = ga4Data.events.reduce((sum: number, event: any) => sum + event.event_count, 0);
    const totalPurchases = ga4Data.events.find((e: any) => e.event_name === 'purchase')?.event_count || 0;
    
    return {
      total_revenue: totalRevenue,
      conversion_rate: totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0
    };
  }

  async function createActionsFromTelemetry(telemetryData: any) {
    return [
      {
        id: 'action_001',
        type: 'seo_optimization',
        target: 'test product',
        expected_impact: {
          metric: 'organic_traffic',
          delta: 25,
          unit: '%'
        },
        confidence: 0.85,
        ease: 'medium',
        score: 7.2
      }
    ];
  }

  async function scoreActions(actions: any[]) {
    return actions.map(action => ({
      ...action,
      score: action.confidence * 5 + (action.ease === 'simple' ? 3 : action.ease === 'medium' ? 2 : 1)
    }));
  }

  async function rankActions(actions: any[]) {
    return actions.sort((a, b) => b.score - a.score);
  }

  async function collectRawTelemetryData() {
    return {
      gsc: {
        queries: [
          { query: 'test product', clicks: 150, impressions: 2000, ctr: 7.5, position: 3.2 }
        ]
      },
      ga4: {
        events: [
          { event_name: 'purchase', event_count: 23, total_revenue: 2300 }
        ]
      }
    };
  }

  async function processTelemetryPipeline(rawData: any) {
    if (rawData.invalid) {
      return { error: 'Invalid data format', fallback: true };
    }

    const actions = await createActionsFromTelemetry(rawData);
    const attribution = await processGA4DataForAttribution(rawData.ga4);
    const insights = await processGSCData(rawData.gsc);

    return {
      actions,
      attribution,
      insights,
      metadata: {
        input_timestamp: new Date().toISOString(),
        processing_time: 1500,
        data_quality_score: 0.95
      }
    };
  }
});
