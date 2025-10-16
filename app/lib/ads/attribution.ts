/**
 * Attribution Modeling
 * 
 * Purpose: Multi-touch attribution for advertising campaigns
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform } from './tracking';

export type AttributionModel = 
  | 'last_click'
  | 'first_click'
  | 'linear'
  | 'time_decay'
  | 'position_based'
  | 'data_driven';

export interface Touchpoint {
  touchpointId: string;
  platform: AdPlatform;
  campaignId: string;
  campaignName: string;
  timestamp: string;
  adSpend: number;
  touchpointPosition: number;
}

export interface CustomerJourney {
  journeyId: string;
  customerId: string;
  touchpoints: Touchpoint[];
  conversionValue: number;
  conversionTimestamp: string;
  journeyDurationDays: number;
}

export interface TouchpointAttribution {
  touchpoint: Touchpoint;
  attributedRevenue: number;
  attributedConversions: number;
  attributionWeight: number;
  roas: number;
}

export interface CampaignAttribution {
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  totalAdSpend: number;
  attributedRevenue: number;
  attributedConversions: number;
  roas: number;
  touchpoints: number;
  averagePosition: number;
}

export function calculateAttribution(
  journey: CustomerJourney,
  model: AttributionModel
): TouchpointAttribution[] {
  const touchpoints = journey.touchpoints;
  const conversionValue = journey.conversionValue;

  if (touchpoints.length === 0) return [];

  const weights = calculateAttributionWeights(touchpoints, model);

  return touchpoints.map((touchpoint, index) => {
    const attributedRevenue = conversionValue * weights[index];
    const attributedConversions = weights[index];
    const roas = touchpoint.adSpend > 0 ? attributedRevenue / touchpoint.adSpend : 0;

    return {
      touchpoint,
      attributedRevenue,
      attributedConversions,
      attributionWeight: weights[index],
      roas,
    };
  });
}

function calculateAttributionWeights(
  touchpoints: Touchpoint[],
  model: AttributionModel
): number[] {
  const n = touchpoints.length;

  switch (model) {
    case 'last_click':
      return touchpoints.map((_, i) => i === n - 1 ? 1.0 : 0.0);

    case 'first_click':
      return touchpoints.map((_, i) => i === 0 ? 1.0 : 0.0);

    case 'linear':
      return touchpoints.map(() => 1.0 / n);

    case 'time_decay':
      const halfLife = 7;
      const weights = touchpoints.map((tp, i) => {
        const daysFromConversion = n - i - 1;
        return Math.pow(0.5, daysFromConversion / halfLife);
      });
      const sum = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => w / sum);

    case 'position_based':
      if (n === 1) return [1.0];
      if (n === 2) return [0.5, 0.5];
      const middleWeight = 0.2 / (n - 2);
      return touchpoints.map((_, i) => {
        if (i === 0) return 0.4;
        if (i === n - 1) return 0.4;
        return middleWeight;
      });

    case 'data_driven':
      return calculateAttributionWeights(touchpoints, 'position_based');

    default:
      return calculateAttributionWeights(touchpoints, 'linear');
  }
}

export function aggregateAttributionByCampaign(
  journeys: CustomerJourney[],
  model: AttributionModel
): CampaignAttribution[] {
  const campaignMap = new Map<string, {
    campaignName: string;
    platform: AdPlatform;
    totalAdSpend: number;
    attributedRevenue: number;
    attributedConversions: number;
    touchpoints: number;
    positionSum: number;
  }>();

  for (const journey of journeys) {
    const attributions = calculateAttribution(journey, model);

    for (const attribution of attributions) {
      const campaignId = attribution.touchpoint.campaignId;
      const existing = campaignMap.get(campaignId) || {
        campaignName: attribution.touchpoint.campaignName,
        platform: attribution.touchpoint.platform,
        totalAdSpend: 0,
        attributedRevenue: 0,
        attributedConversions: 0,
        touchpoints: 0,
        positionSum: 0,
      };

      campaignMap.set(campaignId, {
        campaignName: existing.campaignName,
        platform: existing.platform,
        totalAdSpend: existing.totalAdSpend + attribution.touchpoint.adSpend,
        attributedRevenue: existing.attributedRevenue + attribution.attributedRevenue,
        attributedConversions: existing.attributedConversions + attribution.attributedConversions,
        touchpoints: existing.touchpoints + 1,
        positionSum: existing.positionSum + attribution.touchpoint.touchpointPosition,
      });
    }
  }

  const result: CampaignAttribution[] = [];
  for (const [campaignId, data] of campaignMap.entries()) {
    result.push({
      campaignId,
      campaignName: data.campaignName,
      platform: data.platform,
      totalAdSpend: data.totalAdSpend,
      attributedRevenue: data.attributedRevenue,
      attributedConversions: data.attributedConversions,
      roas: data.totalAdSpend > 0 ? data.attributedRevenue / data.totalAdSpend : 0,
      touchpoints: data.touchpoints,
      averagePosition: data.touchpoints > 0 ? data.positionSum / data.touchpoints : 0,
    });
  }

  return result.sort((a, b) => b.roas - a.roas);
}

export function compareAttributionModels(
  journeys: CustomerJourney[],
  models: AttributionModel[] = ['last_click', 'first_click', 'linear', 'position_based']
): {
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    attributionByModel: Record<AttributionModel, { revenue: number; roas: number }>;
  }>;
  modelDifferences: Array<{
    model: AttributionModel;
    totalRevenue: number;
    averageRoas: number;
  }>;
  recommendation: string;
} {
  const modelResults = new Map<AttributionModel, CampaignAttribution[]>();
  
  for (const model of models) {
    modelResults.set(model, aggregateAttributionByCampaign(journeys, model));
  }

  const campaignIds = new Set<string>();
  for (const results of modelResults.values()) {
    for (const campaign of results) {
      campaignIds.add(campaign.campaignId);
    }
  }

  const campaigns = Array.from(campaignIds).map(campaignId => {
    const attributionByModel: Record<string, { revenue: number; roas: number }> = {};

    for (const [model, results] of modelResults.entries()) {
      const campaign = results.find(c => c.campaignId === campaignId);
      attributionByModel[model] = {
        revenue: campaign?.attributedRevenue || 0,
        roas: campaign?.roas || 0,
      };
    }

    let campaignName = campaignId;
    for (const results of modelResults.values()) {
      const campaign = results.find(c => c.campaignId === campaignId);
      if (campaign) {
        campaignName = campaign.campaignName;
        break;
      }
    }

    return {
      campaignId,
      campaignName,
      attributionByModel: attributionByModel as Record<AttributionModel, { revenue: number; roas: number }>,
    };
  });

  const modelDifferences = models.map(model => {
    const results = modelResults.get(model) || [];
    const totalRevenue = results.reduce((sum, c) => sum + c.attributedRevenue, 0);
    const averageRoas = results.length > 0
      ? results.reduce((sum, c) => sum + c.roas, 0) / results.length
      : 0;

    return { model, totalRevenue, averageRoas };
  });

  const bestModel = modelDifferences.reduce((best, current) =>
    current.averageRoas > best.averageRoas ? current : best
  );

  const recommendation = `Attribution varies by model. ${bestModel.model.replace('_', ' ')} shows highest average ROAS (${bestModel.averageRoas.toFixed(2)}x). Use position-based or data-driven for most accurate multi-touch attribution.`;

  return { campaigns, modelDifferences, recommendation };
}

export function calculateIncrementalLift(
  totalRevenue: number,
  baselineRevenue: number,
  adSpend: number
): {
  incrementalRevenue: number;
  incrementalRoas: number;
  liftPercent: number;
  recommendation: string;
} {
  const incrementalRevenue = totalRevenue - baselineRevenue;
  const incrementalRoas = adSpend > 0 ? incrementalRevenue / adSpend : 0;
  const liftPercent = baselineRevenue > 0 ? (incrementalRevenue / baselineRevenue) * 100 : 0;

  let recommendation = '';
  if (incrementalRoas >= 3.0) {
    recommendation = `Strong incremental lift (${incrementalRoas.toFixed(2)}x iROAS, ${liftPercent.toFixed(1)}% lift). Consider scaling budget.`;
  } else if (incrementalRoas >= 2.0) {
    recommendation = `Good incremental lift (${incrementalRoas.toFixed(2)}x iROAS, ${liftPercent.toFixed(1)}% lift). Maintain or moderately increase budget.`;
  } else if (incrementalRoas >= 1.0) {
    recommendation = `Moderate incremental lift (${incrementalRoas.toFixed(2)}x iROAS, ${liftPercent.toFixed(1)}% lift). Optimize before scaling.`;
  } else {
    recommendation = `Low incremental lift (${incrementalRoas.toFixed(2)}x iROAS, ${liftPercent.toFixed(1)}% lift). Review strategy.`;
  }

  return { incrementalRevenue, incrementalRoas, liftPercent, recommendation };
}

