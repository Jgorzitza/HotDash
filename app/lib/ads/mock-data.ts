import type {
  AdsAttributionRow,
  AdsAttributionSummary,
  AdsPacingRow,
  AdsPacingSummary,
} from "./types";

const today = new Date();
const isoDate = today.toISOString().slice(0, 10);

const fallbackPacingRows: AdsPacingRow[] = [
  {
    metricDate: isoDate,
    platform: "google_ads",
    campaign: "Brand - Core",
    spend: 1450,
    budget: 1800,
    pacingPercentage: Number(((1450 / 1800) * 100).toFixed(2)),
    status: "behind",
    clicks: 2120,
    conversions: 112,
    revenue: 5800,
  },
  {
    metricDate: isoDate,
    platform: "meta_ads",
    campaign: "Prospecting - Broad",
    spend: 980,
    budget: 900,
    pacingPercentage: Number(((980 / 900) * 100).toFixed(2)),
    status: "ahead",
    clicks: 1620,
    conversions: 86,
    revenue: 4200,
  },
  {
    metricDate: isoDate,
    platform: "google_ads",
    campaign: "Brand - Canada",
    spend: 640,
    budget: 650,
    pacingPercentage: Number(((640 / 650) * 100).toFixed(2)),
    status: "on_track",
    clicks: 890,
    conversions: 54,
    revenue: 3100,
  },
];

const fallbackAttributionRows: AdsAttributionRow[] = [
  {
    platform: "google_ads",
    campaign: "Brand - Core",
    spend: 1450,
    revenue: 5800,
    conversions: 112,
    roas: Number((5800 / 1450).toFixed(2)),
    cpa: Number((1450 / 112).toFixed(2)),
    conversionRatePct: Number(((112 / 2120) * 100).toFixed(2)),
  },
  {
    platform: "meta_ads",
    campaign: "Prospecting - Broad",
    spend: 980,
    revenue: 4200,
    conversions: 86,
    roas: Number((4200 / 980).toFixed(2)),
    cpa: Number((980 / 86).toFixed(2)),
    conversionRatePct: Number(((86 / 1620) * 100).toFixed(2)),
  },
  {
    platform: "google_ads",
    campaign: "Brand - Canada",
    spend: 640,
    revenue: 3100,
    conversions: 54,
    roas: Number((3100 / 640).toFixed(2)),
    cpa: Number((640 / 54).toFixed(2)),
    conversionRatePct: Number(((54 / 890) * 100).toFixed(2)),
  },
];

export function buildFallbackPacingSummary(reason: string): AdsPacingSummary {
  return {
    rows: fallbackPacingRows,
    fallbackReason: reason,
    generatedAt: new Date().toISOString(),
  };
}

export function buildFallbackAttributionSummary(
  reason: string,
): AdsAttributionSummary {
  return {
    rows: fallbackAttributionRows,
    fallbackReason: reason,
    generatedAt: new Date().toISOString(),
  };
}
