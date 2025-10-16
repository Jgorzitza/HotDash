/**
 * Attribution Modeling
 *
 * Pure functions to compute credit distribution across touchpoints.
 * This is UI/backend-agnostic and fully testable without GA access.
 */

export type AttributionModel = 'last_click' | 'first_click' | 'linear' | 'time_decay';

export interface Touchpoint {
  source: string; // e.g., "google / cpc", "email", "direct"
  timestamp: number; // ms epoch
}

export interface CreditMap {
  [source: string]: number; // sum of fractional credit across touches
}

/**
 * Compute multi-touch attribution credits per source.
 * - last_click: 100% to the last touch
 * - first_click: 100% to the first touch
 * - linear: equal split across all touches
 * - time_decay: later touches receive exponentially more credit
 */
export function attribute(
  touches: Touchpoint[],
  model: AttributionModel = 'last_click',
  options: { decayHalfLife?: number } = {}
): CreditMap {
  const ordered = [...touches].sort((a, b) => a.timestamp - b.timestamp);
  const credits: CreditMap = {};

  if (ordered.length === 0) return credits;

  switch (model) {
    case 'last_click': {
      const last = ordered[ordered.length - 1];
      credits[last.source] = (credits[last.source] || 0) + 1;
      return credits;
    }
    case 'first_click': {
      const first = ordered[0];
      credits[first.source] = (credits[first.source] || 0) + 1;
      return credits;
    }
    case 'linear': {
      const share = 1 / ordered.length;
      for (const t of ordered) credits[t.source] = (credits[t.source] || 0) + share;
      return credits;
    }
    case 'time_decay': {
      // Exponential weighting favoring recency.
      // weight = 0.5 ^ ((t_last - t_i) / halfLife)
      const halfLife = options.decayHalfLife ?? 7 * 24 * 60 * 60 * 1000; // 7 days
      const lastTs = ordered[ordered.length - 1].timestamp;
      const weights = ordered.map((t) => Math.pow(0.5, Math.max(0, (lastTs - t.timestamp) / halfLife)));
      const sum = weights.reduce((a, b) => a + b, 0);
      for (let i = 0; i < ordered.length; i++) {
        const w = sum > 0 ? weights[i] / sum : 0;
        const src = ordered[i].source;
        credits[src] = (credits[src] || 0) + w;
      }
      return credits;
    }
    default:
      return credits;
  }
}

/**
 * Normalize and round credit map for display or CSV export
 */
export function normalizeCredits(credits: CreditMap, precision = 4): CreditMap {
  const sum = Object.values(credits).reduce((a, b) => a + b, 0) || 1;
  const out: CreditMap = {};
  for (const [k, v] of Object.entries(credits)) {
    out[k] = parseFloat(((v / sum)).toFixed(precision));
  }
  return out;
}

