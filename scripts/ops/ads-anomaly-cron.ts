/**
 * Ads Anomaly Cron (Read-Only)
 *
 * Purpose: Run anomaly detection on recent performance and log results.
 * Schedule via external cron to run hourly/daily as needed.
 *
 * Note: No external Slack/email hooks here (TODO placeholders only).
 */

import { detectAllAnomalies } from '../../app/lib/ads/anomaly-detection';

function rand(n: number, variance = 0.2) {
  const delta = (Math.random() - 0.5) * 2 * variance;
  return Math.max(0, n * (1 + delta));
}

function mockSeries(base: number, days = 14) {
  return Array.from({ length: days }, () => rand(base));
}

async function main() {
  // Mock current metrics and historical series; replace with real fetch
  const current = {
    spend: rand(500),
    roas: rand(3.0),
    ctr: rand(1.2),
    conversionRate: rand(2.5),
    cpa: rand(25),
  };
  const historical = {
    spend: mockSeries(450),
    roas: mockSeries(3.2),
    ctr: mockSeries(1.4),
    conversionRate: mockSeries(2.8),
    cpa: mockSeries(22),
  };

  const anomalies = detectAllAnomalies(current, historical);
  if (anomalies.length === 0) {
    console.log('[ads-anomaly-cron] No anomalies detected.');
  } else {
    console.log(`[ads-anomaly-cron] Detected ${anomalies.length} anomalies:`);
    for (const a of anomalies) {
      console.log(`- [${a.severity}] ${a.type}: ${a.message}`);
    }
  }

  // TODO: Slack/email integration (read-only first)
}

main().catch((err) => {
  console.error('[ads-anomaly-cron] Failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});

