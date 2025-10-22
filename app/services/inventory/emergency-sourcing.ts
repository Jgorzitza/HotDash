/**
 * Emergency Sourcing Logic (INVENTORY-101)
 *
 * Implements emergency sourcing recommendations with opportunity-cost logic:
 * - Calculates Expected Lost Profit = feasible_sales × bundle_margin
 * - Calculates Incremental Cost = (local_cost - primary_cost) × qty
 * - Recommends local vendor when ELP > IC and margin > 20%
 * - Shows comparison: primary vs local (cost, lead time, profit impact)
 * - Creates approval card for CEO review
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */

import { getBundleInfo } from "./bundles";
import { getVendorInfo } from "./vendor-management";

export interface EmergencySourcingParams {
  bundleId: string;
  blockingComponentId: string;
  primaryVendorId: string;
  primaryLeadTimeDays: number;
  primaryCost: number;
  bundleMargin: number;
  dailyVelocity: number;
  minimumMarginThreshold?: number; // Default 20%
}

export interface EmergencySourcingResult {
  bundleInfo: {
    bundleId: string;
    bundleName: string;
    blockingComponent: string;
    currentStock: number;
    daysUntilStockout: number;
  };
  opportunityCost: {
    expectedLostProfit: number;
    feasibleSalesDuringLeadTime: number;
    bundleMargin: number;
    primaryLeadTimeDays: number;
  };
  emergencyOptions: Array<{
    vendorId: string;
    vendorName: string;
    cost: number;
    leadTimeDays: number;
    incrementalCost: number;
    netBenefit: number;
    marginAfterEmergency: number;
    recommended: boolean;
    comparison: {
      costDifference: number;
      leadTimeDifference: number;
      profitImpact: number;
    };
  }>;
  recommendation: {
    shouldProceed: boolean;
    recommendedVendor?: string;
    netBenefit: number;
    riskLevel: 'low' | 'medium' | 'high';
    approvalRequired: boolean;
  };
  approvalCard: {
    title: string;
    summary: string;
    financialImpact: number;
    timelineImpact: number;
    riskAssessment: string;
    recommendation: string;
    requiresApproval: boolean;
  };
}

/**
 * Calculate Expected Lost Profit during primary lead time
 */
export function calculateExpectedLostProfit(
  dailyVelocity: number,
  primaryLeadTimeDays: number,
  bundleMargin: number
): {
  expectedLostProfit: number;
  feasibleSalesDuringLeadTime: number;
} {
  const feasibleSalesDuringLeadTime = dailyVelocity * primaryLeadTimeDays;
  const expectedLostProfit = feasibleSalesDuringLeadTime * bundleMargin;
  
  return {
    expectedLostProfit,
    feasibleSalesDuringLeadTime
  };
}

/**
 * Calculate Incremental Cost of emergency sourcing
 */
export function calculateIncrementalCost(
  emergencyCost: number,
  primaryCost: number,
  quantity: number
): number {
  return (emergencyCost - primaryCost) * quantity;
}

/**
 * Get emergency sourcing options for a component
 */
export async function getEmergencySourcingOptions(
  componentId: string,
  requiredQuantity: number
): Promise<Array<{
  vendorId: string;
  vendorName: string;
  cost: number;
  leadTimeDays: number;
  reliability: number;
  isLocal: boolean;
}>> {
  // In production: query emergency vendors database
  // For now: mock emergency vendors with different characteristics
  
  const emergencyVendors = [
    {
      vendorId: 'emergency_local_001',
      vendorName: 'Local Fast Supply Co',
      cost: 18.50, // Higher cost but fast
      leadTimeDays: 3,
      reliability: 0.95,
      isLocal: true
    },
    {
      vendorId: 'emergency_local_002', 
      vendorName: 'Quick Parts Express',
      cost: 22.75, // Even higher cost but very fast
      leadTimeDays: 2,
      reliability: 0.88,
      isLocal: true
    },
    {
      vendorId: 'emergency_regional_001',
      vendorName: 'Regional Supply Hub',
      cost: 16.25, // Moderate cost, moderate speed
      leadTimeDays: 5,
      reliability: 0.92,
      isLocal: false
    },
    {
      vendorId: 'emergency_premium_001',
      vendorName: 'Premium Emergency Supply',
      cost: 28.00, // High cost, guaranteed fast
      leadTimeDays: 1,
      reliability: 0.98,
      isLocal: true
    }
  ];

  return emergencyVendors;
}

/**
 * Calculate margin after emergency sourcing
 */
export function calculateMarginAfterEmergency(
  bundleMargin: number,
  incrementalCost: number,
  feasibleSales: number
): number {
  if (feasibleSales === 0) return 0;
  
  const costPerUnit = incrementalCost / feasibleSales;
  const adjustedMargin = bundleMargin - costPerUnit;
  
  return Math.max(0, adjustedMargin);
}

/**
 * Assess risk level of emergency sourcing
 */
export function assessRiskLevel(
  netBenefit: number,
  incrementalCost: number,
  vendorReliability: number,
  leadTimeDifference: number
): 'low' | 'medium' | 'high' {
  const riskFactors = [];
  
  // Net benefit risk
  if (netBenefit < 0) riskFactors.push('negative_benefit');
  if (netBenefit < incrementalCost * 0.5) riskFactors.push('low_benefit');
  
  // Vendor reliability risk
  if (vendorReliability < 0.85) riskFactors.push('low_reliability');
  
  // Lead time risk
  if (leadTimeDifference > 10) riskFactors.push('long_lead_time');
  
  // Determine risk level based on severity
  const hasNegativeBenefit = netBenefit < 0;
  const hasLowReliability = vendorReliability < 0.80;
  const hasLongLeadTime = leadTimeDifference > 15;
  
  if (hasNegativeBenefit || (hasLowReliability && hasLongLeadTime)) return 'high';
  if (riskFactors.length >= 2 || hasLowReliability || hasLongLeadTime) return 'medium';
  return 'low';
}

/**
 * Create approval card for CEO review
 */
export function createApprovalCard(
  bundleInfo: EmergencySourcingResult['bundleInfo'],
  opportunityCost: EmergencySourcingResult['opportunityCost'],
  emergencyOptions: EmergencySourcingResult['emergencyOptions'],
  recommendation: EmergencySourcingResult['recommendation']
): EmergencySourcingResult['approvalCard'] {
  const recommendedOption = emergencyOptions.find(opt => opt.recommended);
  
  if (!recommendedOption) {
    return {
      title: 'Emergency Sourcing Not Recommended',
      summary: `Emergency sourcing for ${bundleInfo.bundleName} is not recommended due to cost/benefit analysis.`,
      financialImpact: 0,
      timelineImpact: 0,
      riskAssessment: 'Low risk - no action required',
      recommendation: 'Continue with primary vendor timeline',
      requiresApproval: false
    };
  }

  const financialImpact = recommendedOption.netBenefit;
  const timelineImpact = opportunityCost.primaryLeadTimeDays - recommendedOption.leadTimeDays;

  return {
    title: `Emergency Sourcing Recommendation: ${bundleInfo.bundleName}`,
    summary: `Blocked bundle ${bundleInfo.bundleName} can be unblocked with emergency sourcing from ${recommendedOption.vendorName}. Expected net benefit: $${financialImpact.toFixed(2)}.`,
    financialImpact,
    timelineImpact,
    riskAssessment: `Risk level: ${recommendation.riskLevel}. ${recommendation.riskLevel === 'high' ? 'High risk due to cost or reliability factors.' : 'Acceptable risk level for emergency sourcing.'}`,
    recommendation: `Proceed with ${recommendedOption.vendorName} for emergency sourcing. Net benefit: $${financialImpact.toFixed(2)}, timeline improvement: ${timelineImpact} days.`,
    requiresApproval: recommendation.approvalRequired
  };
}

/**
 * Main emergency sourcing calculation
 */
export async function calculateEmergencySourcing(
  params: EmergencySourcingParams
): Promise<EmergencySourcingResult> {
  const {
    bundleId,
    blockingComponentId,
    primaryVendorId,
    primaryLeadTimeDays,
    primaryCost,
    bundleMargin,
    dailyVelocity,
    minimumMarginThreshold = 20
  } = params;

  // 1. Get bundle information
  const bundleInfo = await getBundleInfo(bundleId);
  
  // 2. Calculate opportunity cost
  const opportunityCost = calculateExpectedLostProfit(
    dailyVelocity,
    primaryLeadTimeDays,
    bundleMargin
  );

  // 3. Get emergency sourcing options
  const emergencyOptions = await getEmergencySourcingOptions(blockingComponentId, 1);
  
  // 4. Calculate costs and benefits for each option
  const optionsWithAnalysis = await Promise.all(
    emergencyOptions.map(async (option) => {
      const incrementalCost = calculateIncrementalCost(
        option.cost,
        primaryCost,
        opportunityCost.feasibleSalesDuringLeadTime
      );
      
      const netBenefit = opportunityCost.expectedLostProfit - incrementalCost;
      
      const marginAfterEmergency = calculateMarginAfterEmergency(
        bundleMargin,
        incrementalCost,
        opportunityCost.feasibleSalesDuringLeadTime
      );
      
      const leadTimeDifference = primaryLeadTimeDays - option.leadTimeDays;
      
      const riskLevel = assessRiskLevel(
        netBenefit,
        incrementalCost,
        option.reliability,
        leadTimeDifference
      );
      
      // Determine if this option is recommended
      const isRecommended = netBenefit > 0 && 
                           marginAfterEmergency >= (minimumMarginThreshold / 100) &&
                           riskLevel !== 'high';
      
      return {
        vendorId: option.vendorId,
        vendorName: option.vendorName,
        cost: option.cost,
        leadTimeDays: option.leadTimeDays,
        incrementalCost,
        netBenefit,
        marginAfterEmergency,
        recommended: isRecommended,
        comparison: {
          costDifference: option.cost - primaryCost,
          leadTimeDifference,
          profitImpact: netBenefit
        }
      };
    })
  );

  // 5. Find best recommendation
  const recommendedOptions = optionsWithAnalysis.filter(opt => opt.recommended);
  const bestOption = recommendedOptions.reduce((best, current) => 
    current.netBenefit > best.netBenefit ? current : best, 
    recommendedOptions[0]
  );

  // 6. Create recommendation
  const recommendation = {
    shouldProceed: recommendedOptions.length > 0,
    recommendedVendor: bestOption?.vendorId,
    netBenefit: bestOption?.netBenefit || 0,
    riskLevel: bestOption ? assessRiskLevel(
      bestOption.netBenefit,
      bestOption.incrementalCost,
      0.9, // Mock reliability
      bestOption.comparison.leadTimeDifference
    ) : 'high' as const,
    approvalRequired: bestOption ? bestOption.netBenefit > 1000 || bestOption.comparison.costDifference > 5 : false
  };

  // 7. Create approval card
  const approvalCard = createApprovalCard(
    {
      bundleId,
      bundleName: bundleInfo.productName,
      blockingComponent: blockingComponentId,
      currentStock: 0, // Mock - would get from inventory
      daysUntilStockout: 0
    },
    opportunityCost,
    optionsWithAnalysis,
    recommendation
  );

  return {
    bundleInfo: {
      bundleId,
      bundleName: bundleInfo.productName,
      blockingComponent: blockingComponentId,
      currentStock: 0,
      daysUntilStockout: 0
    },
    opportunityCost,
    emergencyOptions: optionsWithAnalysis,
    recommendation,
    approvalCard
  };
}

/**
 * Batch calculate emergency sourcing for multiple bundles
 */
export async function batchCalculateEmergencySourcing(
  bundleParams: EmergencySourcingParams[]
): Promise<EmergencySourcingResult[]> {
  const results = await Promise.all(
    bundleParams.map(params => calculateEmergencySourcing(params))
  );

  return results;
}

/**
 * Get emergency sourcing history for a bundle
 */
export async function getEmergencySourcingHistory(
  bundleId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  bundleId: string;
  calculatedAt: string;
  recommended: boolean;
  netBenefit: number;
  vendorUsed?: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
}>> {
  // In production: query emergency sourcing history table
  // For now: return mock data
  return [
    {
      id: 'emergency_001',
      bundleId,
      calculatedAt: new Date().toISOString(),
      recommended: true,
      netBenefit: 1250.50,
      vendorUsed: 'emergency_local_001',
      status: 'implemented'
    }
  ];
}

/**
 * Update emergency sourcing recommendation status
 */
export async function updateEmergencySourcingStatus(
  recommendationId: string,
  status: 'pending' | 'approved' | 'rejected' | 'implemented',
  approvedBy?: string,
  notes?: string
): Promise<boolean> {
  // In production: update emergency sourcing status in database
  console.log(`[Emergency Sourcing] Updated recommendation ${recommendationId} to status ${status}`);
  return true;
}