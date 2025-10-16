/**
 * A/B Test Tracking
 * 
 * Purpose: Track and analyze ad A/B tests
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform } from './tracking';

export interface TestVariant {
  variantId: string;
  variantName: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpend: number;
  revenue: number;
}

export interface VariantPerformance extends TestVariant {
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversionRate: number;
  sampleSize: number;
}

export interface ABTestConfig {
  testId: string;
  testName: string;
  platform: AdPlatform;
  hypothesis: string;
  testVariable: 'creative' | 'audience' | 'copy' | 'cta' | 'placement' | 'bidding';
  startDate: string;
  endDate?: string;
  minSampleSize: number;
  confidenceLevel: number;
}

export interface ABTestResult {
  config: ABTestConfig;
  variants: VariantPerformance[];
  winner: VariantPerformance | null;
  isStatisticallySignificant: boolean;
  confidenceLevel: number;
  pValue: number;
  liftPercent: number;
  recommendation: string;
  status: 'running' | 'complete' | 'inconclusive';
}

export function calculateVariantPerformance(variant: TestVariant): VariantPerformance {
  const ctr = variant.impressions > 0 ? (variant.clicks / variant.impressions) * 100 : 0;
  const cpc = variant.clicks > 0 ? variant.adSpend / variant.clicks : 0;
  const cpa = variant.conversions > 0 ? variant.adSpend / variant.conversions : 0;
  const roas = variant.adSpend > 0 ? variant.revenue / variant.adSpend : 0;
  const conversionRate = variant.clicks > 0 ? (variant.conversions / variant.clicks) * 100 : 0;
  const sampleSize = variant.impressions;

  return {
    ...variant,
    ctr,
    cpc,
    cpa,
    roas,
    conversionRate,
    sampleSize,
  };
}

export function calculateStatisticalSignificance(
  variantA: VariantPerformance,
  variantB: VariantPerformance,
  confidenceLevel: number = 0.95
): {
  isSignificant: boolean;
  pValue: number;
  zScore: number;
} {
  const p1 = variantA.conversions / variantA.impressions;
  const p2 = variantB.conversions / variantB.impressions;
  const n1 = variantA.impressions;
  const n2 = variantB.impressions;

  const pPool = (variantA.conversions + variantB.conversions) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  const zScore = (p2 - p1) / se;

  const criticalValues: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const criticalValue = criticalValues[confidenceLevel] || 1.96;
  const isSignificant = Math.abs(zScore) >= criticalValue;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return { isSignificant, pValue, zScore };
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function analyzeABTest(
  config: ABTestConfig,
  variants: TestVariant[]
): ABTestResult {
  if (variants.length < 2) {
    throw new Error('A/B test requires at least 2 variants');
  }

  const variantPerformances = variants.map(calculateVariantPerformance);
  const sortedVariants = [...variantPerformances].sort((a, b) => b.roas - a.roas);
  const bestVariant = sortedVariants[0];
  const controlVariant = variantPerformances[0];

  const hasMinSampleSize = variantPerformances.every(v => v.sampleSize >= config.minSampleSize);
  const significance = calculateStatisticalSignificance(controlVariant, bestVariant, config.confidenceLevel);
  const liftPercent = ((bestVariant.roas - controlVariant.roas) / controlVariant.roas) * 100;

  let winner: VariantPerformance | null = null;
  let status: ABTestResult['status'] = 'running';
  let recommendation = '';

  if (!hasMinSampleSize) {
    status = 'running';
    recommendation = `Test is still running. Need ${config.minSampleSize} impressions per variant. Current: ${Math.min(...variantPerformances.map(v => v.sampleSize))} impressions.`;
  } else if (significance.isSignificant) {
    winner = bestVariant;
    status = 'complete';
    recommendation = `Winner: ${winner.variantName} with ${liftPercent.toFixed(1)}% lift (${winner.roas.toFixed(2)}x ROAS vs ${controlVariant.roas.toFixed(2)}x). Statistically significant at ${(config.confidenceLevel * 100).toFixed(0)}% confidence. Allocate 100% budget to winning variant.`;
  } else {
    status = 'inconclusive';
    recommendation = `No statistically significant winner yet (p-value: ${significance.pValue.toFixed(3)}). Continue test or increase sample size. Current best: ${bestVariant.variantName} (${bestVariant.roas.toFixed(2)}x ROAS).`;
  }

  return {
    config,
    variants: variantPerformances,
    winner,
    isStatisticallySignificant: significance.isSignificant,
    confidenceLevel: config.confidenceLevel,
    pValue: significance.pValue,
    liftPercent,
    recommendation,
    status,
  };
}

export function calculateRequiredSampleSize(
  baselineConversionRate: number,
  minimumDetectableEffect: number,
  confidenceLevel: number = 0.95,
  power: number = 0.80
): number {
  const zAlpha = confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.95 ? 1.96 : 1.645;
  const zBeta = power === 0.90 ? 1.282 : power === 0.80 ? 0.842 : 1.036;

  const p1 = baselineConversionRate;
  const p2 = p1 * (1 + minimumDetectableEffect);
  const pBar = (p1 + p2) / 2;

  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(p2 - p1, 2);

  return Math.ceil(numerator / denominator);
}

export function recommendTestDuration(
  requiredSampleSize: number,
  dailyImpressions: number
): {
  durationDays: number;
  recommendation: string;
} {
  const durationDays = Math.ceil(requiredSampleSize / dailyImpressions);

  let recommendation = '';
  if (durationDays <= 7) {
    recommendation = `Run test for ${durationDays} days (1 week). Quick test with sufficient traffic.`;
  } else if (durationDays <= 14) {
    recommendation = `Run test for ${durationDays} days (2 weeks). Standard test duration.`;
  } else if (durationDays <= 30) {
    recommendation = `Run test for ${durationDays} days (${Math.ceil(durationDays / 7)} weeks). Longer test needed due to lower traffic.`;
  } else {
    recommendation = `Test requires ${durationDays} days (${Math.ceil(durationDays / 30)} months). Consider increasing budget or testing with higher-traffic campaigns.`;
  }

  return { durationDays, recommendation };
}

export function recommendNextTest(previousTest: ABTestResult): {
  testVariable: ABTestConfig['testVariable'];
  hypothesis: string;
  reasoning: string;
} {
  const winner = previousTest.winner;

  if (!winner) {
    return {
      testVariable: previousTest.config.testVariable,
      hypothesis: `Continue testing ${previousTest.config.testVariable} with larger sample size`,
      reasoning: 'Previous test was inconclusive. Increase sample size or test duration.',
    };
  }

  const testSequence: ABTestConfig['testVariable'][] = ['creative', 'audience', 'copy', 'cta', 'placement', 'bidding'];
  const currentIndex = testSequence.indexOf(previousTest.config.testVariable);
  const nextVariable = testSequence[(currentIndex + 1) % testSequence.length];

  const hypotheses: Record<ABTestConfig['testVariable'], string> = {
    creative: 'New creative format will improve engagement and ROAS',
    audience: 'Refined audience targeting will lower CPA and improve conversion rate',
    copy: 'Updated ad copy will increase CTR and conversions',
    cta: 'Stronger call-to-action will improve conversion rate',
    placement: 'Optimized ad placement will reduce CPC and improve ROAS',
    bidding: 'Different bidding strategy will improve cost efficiency',
  };

  return {
    testVariable: nextVariable,
    hypothesis: hypotheses[nextVariable],
    reasoning: `Previous ${previousTest.config.testVariable} test complete. Next, optimize ${nextVariable} to further improve performance.`,
  };
}

