import { describe, expect, it } from 'vitest';
import {
  transformAnomaliesForTile,
  transformRankingsForTile,
  createSEOTileData,
  createSEOTileState,
} from '../../app/services/seo/tile-data';
import type { SEOAnomaly } from '../../app/lib/seo/anomalies';
import type { KeywordRanking, RankingChange } from '../../app/lib/seo/rankings';

describe('SEO Tile Data Transformations', () => {
  describe('transformAnomaliesForTile', () => {
    it('transforms critical anomalies correctly', () => {
      const anomalies: SEOAnomaly[] = [
        {
          id: 'test-1',
          type: 'traffic',
          severity: 'critical',
          title: 'Traffic drop',
          description: 'Sessions dropped 40%',
          metric: { current: 600, previous: 1000, changePercent: -0.4 },
          affectedUrl: '/products/test',
          detectedAt: '2025-10-16T10:00:00Z',
        },
      ];

      const result = transformAnomaliesForTile(anomalies);

      expect(result.alertCount).toBe(1);
      expect(result.severity).toBe('critical');
      expect(result.topAlert).toContain('/products/test');
      expect(result.anomalies).toHaveLength(1);
    });

    it('returns ok status when no anomalies', () => {
      const result = transformAnomaliesForTile([]);

      expect(result.alertCount).toBe(0);
      expect(result.severity).toBe('ok');
      expect(result.topAlert).toBeUndefined();
    });
  });

  describe('transformRankingsForTile', () => {
    it('calculates ranking metrics correctly', () => {
      const rankings: KeywordRanking[] = [
        {
          keyword: 'test',
          url: '/test',
          position: 5,
          device: 'mobile',
          country: 'US',
          clicks: 10,
          impressions: 100,
          ctr: 0.1,
          date: '2025-10-16',
        },
      ];

      const changes: RankingChange[] = [
        {
          keyword: 'test',
          url: '/test',
          currentPosition: 5,
          previousPosition: 10,
          change: -5,
          changeType: 'improvement',
          severity: 'major',
          date: '2025-10-16',
        },
      ];

      const result = transformRankingsForTile(rankings, changes);

      expect(result.totalKeywords).toBe(1);
      expect(result.improvements).toBe(1);
      expect(result.declines).toBe(0);
      expect(result.avgPosition).toBe(5);
    });
  });

  describe('createSEOTileData', () => {
    it('creates tile data with critical status', () => {
      const anomalies: SEOAnomaly[] = [
        {
          id: 'test-1',
          type: 'traffic',
          severity: 'critical',
          title: 'Traffic drop',
          description: 'Sessions dropped 40%',
          metric: { current: 600, previous: 1000, changePercent: -0.4 },
          affectedUrl: '/products/test',
          detectedAt: '2025-10-16T10:00:00Z',
        },
      ];

      const result = createSEOTileData(anomalies);

      expect(result.summary.status).toBe('critical');
      expect(result.anomalies.critical).toBe(1);
      expect(result.summary.primaryMessage).toContain('critical');
    });

    it('creates tile data with healthy status', () => {
      const result = createSEOTileData([]);

      expect(result.summary.status).toBe('healthy');
      expect(result.summary.primaryMessage).toContain('stable');
    });
  });

  describe('createSEOTileState', () => {
    it('wraps data in TileState format', () => {
      const data = createSEOTileData([]);
      const state = createSEOTileState(data, 'fresh');

      expect(state.status).toBe('ok');
      expect(state.data).toBe(data);
      expect(state.source).toBe('fresh');
      expect(state.fact).toBeDefined();
    });

    it('sets error status for critical anomalies', () => {
      const anomalies: SEOAnomaly[] = [
        {
          id: 'test-1',
          type: 'traffic',
          severity: 'critical',
          title: 'Traffic drop',
          description: 'Sessions dropped 40%',
          metric: { current: 600, previous: 1000, changePercent: -0.4 },
          affectedUrl: '/products/test',
          detectedAt: '2025-10-16T10:00:00Z',
        },
      ];

      const data = createSEOTileData(anomalies);
      const state = createSEOTileState(data);

      expect(state.status).toBe('error');
    });
  });
});

