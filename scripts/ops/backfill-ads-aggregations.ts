/**
 * Backfill Ads Aggregations CLI
 *
 * Usage:
 *   npx -y tsx scripts/ops/backfill-ads-aggregations.ts --start=2025-10-01 --end=2025-10-15
 */

import { backfillAggregations } from '../../app/services/ads/aggregation-job';

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (const arg of argv.slice(2)) {
    const [key, value] = arg.split('=');
    if (key && value) {
      args[key.replace(/^--/, '')] = value;
    }
  }
  return args as { start?: string; end?: string };
}

function defaultWindow(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  const toDateStr = (d: Date) => d.toISOString().split('T')[0];
  return { start: toDateStr(start), end: toDateStr(end) };
}

async function main() {
  const { start, end } = parseArgs(process.argv);
  const window = start && end ? { start, end } : defaultWindow();

  console.log(`[ads-backfill] Starting backfill from ${window.start} to ${window.end}`);
  const processed = await backfillAggregations(window.start, window.end);
  console.log(`[ads-backfill] Completed. Days processed: ${processed}`);
}

main().catch((err) => {
  console.error('[ads-backfill] Failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});

