import { describe, expect, it } from 'vitest';
import {
  detectTrafficAnomalies,
  detectRankingAnomalies,
  aggregateSEOAnomalies,
  ANOMALY_THRESHOLDS,
  type TrafficAnomalyInput,
  type RankingAnomalyInput,
} from '../../app/lib/seo/anomalies';

describe('SEO Anomaly Detection', () => {
  describe('detectTrafficAnomalies', () => {
    it('detects critical traffic drops', () => {
      const inputs: TrafficAnomalyInput[] = [
        {
          landingPage: '/products/hot-rods',
          currentSessions: 600,
          previousSessions: 1000,
          wowDelta: -0.40,
        },
      ];

      const anomalies = detectTrafficAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe('critical');
      expect(anomalies[0].type).toBe('traffic');
    });

    it('ignores minor traffic changes', () => {
      const inputs: TrafficAnomalyInput[] = [
        {
          landingPage: '/pages/about',
          currentSessions: 850,
          previousSessions: 1000,
          wowDelta: -0.15,
        },
      ];

      const anomalies = detectTrafficAnomalies(inputs);

      expect(anomalies).toHaveLength(0);
    });
  });

  describe('detectRankingAnomalies', () => {
    it('detects critical ranking drops', () => {
      const inputs: RankingAnomalyInput[] = [
        {
          keyword: 'custom hot rods',
          currentPosition: 15,
          previousPosition: 3,
          url: '/collections/custom',
        },
      ];

      const anomalies = detectRankingAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe('critical');
    });
  });

  describe('aggregateSEOAnomalies', () => {
    it('aggregates and categorizes anomalies by severity', () => {
      const anomalies = [
        {
          id: 'test-1',
          type: 'traffic' as const,
          severity: 'critical' as const,
          title: 'Critical issue',
          description: 'Test',
          metric: { current: 100 },
          detectedAt: '2025-10-15T10:00:00Z',
        },
      ];

      const result = aggregateSEOAnomalies(anomalies);

      expect(result.all).toHaveLength(1);
      expect(result.critical).toHaveLength(1);
      expect(result.summary.total).toBe(1);
    });
  });

  describe('ANOMALY_THRESHOLDS', () => {
    it('has correct traffic thresholds', () => {
      expect(ANOMALY_THRESHOLDS.traffic.critical).toBe(-0.40);
      expect(ANOMALY_THRESHOLDS.traffic.warning).toBe(-0.20);
    });
  });
});
