/**
 * Attribution Modeling
 *
 * Implements multi-touch attribution models to understand
 * which marketing channels drive conversions.
 */

export interface TouchPoint {
  channel: string;
  timestamp: string;
  value?: number;
}

export interface AttributionResult {
  channel: string;
  attributedRevenue: number;
  attributedConversions: number;
  attribution: number; // Percentage (0-100)
}

export type AttributionModel =
  | "last_click"
  | "first_click"
  | "linear"
  | "time_decay"
  | "position_based";

/**
 * Last-click attribution: 100% credit to last touchpoint
 */
function lastClickAttribution(touchpoints: TouchPoint[]): number[] {
  const weights = new Array(touchpoints.length).fill(0);
  if (touchpoints.length > 0) {
    weights[touchpoints.length - 1] = 1;
  }
  return weights;
}

/**
 * First-click attribution: 100% credit to first touchpoint
 */
function firstClickAttribution(touchpoints: TouchPoint[]): number[] {
  const weights = new Array(touchpoints.length).fill(0);
  if (touchpoints.length > 0) {
    weights[0] = 1;
  }
  return weights;
}

/**
 * Linear attribution: Equal credit to all touchpoints
 */
function linearAttribution(touchpoints: TouchPoint[]): number[] {
  const weight = touchpoints.length > 0 ? 1 / touchpoints.length : 0;
  return new Array(touchpoints.length).fill(weight);
}

/**
 * Time-decay attribution: More recent touchpoints get more credit
 */
function timeDecayAttribution(touchpoints: TouchPoint[]): number[] {
  if (touchpoints.length === 0) return [];
  if (touchpoints.length === 1) return [1];

  const halfLife = 7; // days
  const now = new Date(touchpoints[touchpoints.length - 1].timestamp);

  const weights = touchpoints.map((tp) => {
    const daysDiff =
      (now.getTime() - new Date(tp.timestamp).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.pow(2, -daysDiff / halfLife);
  });

  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / sum);
}

/**
 * Position-based attribution: 40% first, 40% last, 20% middle
 */
function positionBasedAttribution(touchpoints: TouchPoint[]): number[] {
  if (touchpoints.length === 0) return [];
  if (touchpoints.length === 1) return [1];
  if (touchpoints.length === 2) return [0.5, 0.5];

  const weights = new Array(touchpoints.length).fill(0);
  weights[0] = 0.4; // First touch
  weights[touchpoints.length - 1] = 0.4; // Last touch

  const middleWeight = 0.2 / (touchpoints.length - 2);
  for (let i = 1; i < touchpoints.length - 1; i++) {
    weights[i] = middleWeight;
  }

  return weights;
}

/**
 * Apply attribution model to customer journey
 */
export function attributeConversion(
  touchpoints: TouchPoint[],
  conversionValue: number,
  model: AttributionModel = "linear",
): AttributionResult[] {
  let weights: number[] = [];

  switch (model) {
    case "last_click":
      weights = lastClickAttribution(touchpoints);
      break;
    case "first_click":
      weights = firstClickAttribution(touchpoints);
      break;
    case "linear":
      weights = linearAttribution(touchpoints);
      break;
    case "time_decay":
      weights = timeDecayAttribution(touchpoints);
      break;
    case "position_based":
      weights = positionBasedAttribution(touchpoints);
      break;
  }

  const attributionByChannel = new Map<string, number>();

  touchpoints.forEach((tp, idx) => {
    const credit = weights[idx] * conversionValue;
    const current = attributionByChannel.get(tp.channel) || 0;
    attributionByChannel.set(tp.channel, current + credit);
  });

  const results: AttributionResult[] = [];
  attributionByChannel.forEach((revenue, channel) => {
    results.push({
      channel,
      attributedRevenue: revenue,
      attributedConversions: revenue / conversionValue,
      attribution: (revenue / conversionValue) * 100,
    });
  });

  return results.sort((a, b) => b.attributedRevenue - a.attributedRevenue);
}
