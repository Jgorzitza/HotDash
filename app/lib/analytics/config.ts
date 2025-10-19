export function isAnalyticsTilesEnabled(): boolean {
  const v = process.env.ANALYTICS_TILES_ENABLED;
  if (!v) return false;
  return v === '1' || v?.toLowerCase() === 'true';
}

