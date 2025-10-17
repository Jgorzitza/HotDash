// Ads metrics helpers with zero-division and non-finite guards
// Allowed path: app/lib/ads/**

export function roas(revenue: number, spend: number): number {
  if (!isFiniteNumber(revenue) || !isFiniteNumber(spend)) return 0;
  if (spend <= 0 || revenue <= 0) return 0;
  return revenue / spend;
}

export function cpc(spend: number, clicks: number): number {
  if (!isFiniteNumber(spend) || !isFiniteNumber(clicks)) return 0;
  if (clicks <= 0 || spend <= 0) return 0;
  return spend / clicks;
}

export function cpa(spend: number, conversions: number): number {
  if (!isFiniteNumber(spend) || !isFiniteNumber(conversions)) return 0;
  if (conversions <= 0 || spend <= 0) return 0;
  return spend / conversions;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}
