/**
 * Multi-Touch Attribution
 *
 * Track customer journey across ad touchpoints
 *
 * @module app/lib/ads/attribution
 */

import type { Campaign } from "./types";

export enum AttributionModel {
  LAST_CLICK = "last_click",
  FIRST_CLICK = "first_click",
  LINEAR = "linear",
  TIME_DECAY = "time_decay",
  POSITION_BASED = "position_based",
}

export interface TouchPoint {
  campaignId: string;
  platform: string;
  timestamp: string;
  position: number;
}

export interface AttributedConversion {
  conversionId: string;
  conversionValue: number;
  touchPoints: TouchPoint[];
  attributions: Map<
    string,
    {
      campaignId: string;
      credit: number;
      creditPercentage: number;
    }
  >;
  model: AttributionModel;
}

/**
 * Calculate attribution credits using specified model
 *
 * @param touchPoints - Customer journey touchpoints
 * @param conversionValue - Value of conversion
 * @param model - Attribution model to use
 * @returns Attribution map
 */
export function calculateAttribution(
  touchPoints: TouchPoint[],
  conversionValue: number,
  model: AttributionModel = AttributionModel.LAST_CLICK,
): Map<
  string,
  { campaignId: string; credit: number; creditPercentage: number }
> {
  const attributions = new Map<
    string,
    { campaignId: string; credit: number; creditPercentage: number }
  >();

  if (touchPoints.length === 0) {
    return attributions;
  }

  switch (model) {
    case AttributionModel.LAST_CLICK:
      return attributeLastClick(touchPoints, conversionValue);
    case AttributionModel.FIRST_CLICK:
      return attributeFirstClick(touchPoints, conversionValue);
    case AttributionModel.LINEAR:
      return attributeLinear(touchPoints, conversionValue);
    case AttributionModel.TIME_DECAY:
      return attributeTimeDecay(touchPoints, conversionValue);
    case AttributionModel.POSITION_BASED:
      return attributePositionBased(touchPoints, conversionValue);
    default:
      return attributeLastClick(touchPoints, conversionValue);
  }
}

function attributeLastClick(
  touchPoints: TouchPoint[],
  value: number,
): Map<
  string,
  { campaignId: string; credit: number; creditPercentage: number }
> {
  const last = touchPoints[touchPoints.length - 1];
  const map = new Map();
  map.set(last.campaignId, {
    campaignId: last.campaignId,
    credit: value,
    creditPercentage: 100,
  });
  return map;
}

function attributeFirstClick(
  touchPoints: TouchPoint[],
  value: number,
): Map<
  string,
  { campaignId: string; credit: number; creditPercentage: number }
> {
  const first = touchPoints[0];
  const map = new Map();
  map.set(first.campaignId, {
    campaignId: first.campaignId,
    credit: value,
    creditPercentage: 100,
  });
  return map;
}

function attributeLinear(
  touchPoints: TouchPoint[],
  value: number,
): Map<
  string,
  { campaignId: string; credit: number; creditPercentage: number }
> {
  const map = new Map();
  const creditPerTouch = value / touchPoints.length;
  const percentPerTouch = 100 / touchPoints.length;

  for (const touch of touchPoints) {
    const existing = map.get(touch.campaignId);
    if (existing) {
      existing.credit += creditPerTouch;
      existing.creditPercentage += percentPerTouch;
    } else {
      map.set(touch.campaignId, {
        campaignId: touch.campaignId,
        credit: creditPerTouch,
        creditPercentage: percentPerTouch,
      });
    }
  }

  return map;
}

function attributeTimeDecay(
  touchPoints: TouchPoint[],
  value: number,
): Map<
  string,
  { campaignId: string; credit: number; creditPercentage: number }
> {
  const map = new Map();
  const halfLife = 7; // 7 days

  // Calculate weights
  const weights = touchPoints.map((touch, idx) => {
    const daysFromEnd = touchPoints.length - idx - 1;
    return Math.pow(0.5, daysFromEnd / halfLife);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  touchPoints.forEach((touch, idx) => {
    const credit = (weights[idx] / totalWeight) * value;
    const percentage = (weights[idx] / totalWeight) * 100;

    const existing = map.get(touch.campaignId);
    if (existing) {
      existing.credit += credit;
      existing.creditPercentage += percentage;
    } else {
      map.set(touch.campaignId, {
        campaignId: touch.campaignId,
        credit,
        creditPercentage: percentage,
      });
    }
  });

  return map;
}

function attributePositionBased(
  touchPoints: TouchPoint[],
  value: number,
): Map<
  string,
  { campaignId: string; credit: number; creditPercentage: number }
> {
  const map = new Map();

  if (touchPoints.length === 1) {
    map.set(touchPoints[0].campaignId, {
      campaignId: touchPoints[0].campaignId,
      credit: value,
      creditPercentage: 100,
    });
    return map;
  }

  // 40% first, 40% last, 20% distributed across middle
  const first = touchPoints[0];
  const last = touchPoints[touchPoints.length - 1];
  const middle = touchPoints.slice(1, -1);

  map.set(first.campaignId, {
    campaignId: first.campaignId,
    credit: value * 0.4,
    creditPercentage: 40,
  });

  if (first.campaignId !== last.campaignId) {
    map.set(last.campaignId, {
      campaignId: last.campaignId,
      credit: value * 0.4,
      creditPercentage: 40,
    });
  } else {
    const existing = map.get(last.campaignId)!;
    existing.credit += value * 0.4;
    existing.creditPercentage += 40;
  }

  if (middle.length > 0) {
    const middleCredit = value * 0.2;
    const middlePercent = 20;
    const perMiddle = middleCredit / middle.length;
    const percentPerMiddle = middlePercent / middle.length;

    for (const touch of middle) {
      const existing = map.get(touch.campaignId);
      if (existing) {
        existing.credit += perMiddle;
        existing.creditPercentage += percentPerMiddle;
      } else {
        map.set(touch.campaignId, {
          campaignId: touch.campaignId,
          credit: perMiddle,
          creditPercentage: percentPerMiddle,
        });
      }
    }
  }

  return map;
}
