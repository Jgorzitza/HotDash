import { logDecision } from "~/services/decisions.server";

export interface EmergencySourcingAnalysis {
  variantId: string;
  sku: string;
  productName: string;
  currentStock: number;
  demandForecast: number;
  stockoutRisk: number;
  opportunityCost: number;
  incrementalCost: number;
  netBenefit: number;
  recommendedAction: 'source_emergency' | 'wait' | 'discontinue';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedLeadTime: number;
  localVendorOptions: LocalVendorOption[];
}

export interface LocalVendorOption {
  vendorId: string;
  vendorName: string;
  costPerUnit: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  reliabilityScore: number;
  totalCost: number;
  netBenefit: number;
}

export interface EmergencySourcingAction {
  id: string;
  type: 'emergency_sourcing_recommendation';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  variantId: string;
  sku: string;
  productName: string;
  currentStock: number;
  recommendedQuantity: number;
  bestVendor: LocalVendorOption | null;
  estimatedCost: number;
  estimatedBenefit: number;
  netBenefit: number;
  confidence: number;
  createdAt: Date;
}

export class EmergencySourcingService {
  /**
   * Analyze emergency sourcing opportunity for a product
   */
  async analyzeEmergencySourcing(
    variantId: string,
    sku: string,
    productName: string,
    currentStock: number,
    demandForecast: number,
    averageLandedCost: number
  ): Promise<EmergencySourcingAnalysis> {
    try {
      // Calculate stockout risk (probability of running out of stock)
      const stockoutRisk = this.calculateStockoutRisk(currentStock, demandForecast);
      
      // Calculate opportunity cost (lost revenue if stockout occurs)
      const opportunityCost = this.calculateOpportunityCost(
        stockoutRisk,
        demandForecast,
        averageLandedCost
      );

      // Get local vendor options for emergency sourcing
      const localVendorOptions = await this.getLocalVendorOptions(variantId);
      
      // Find best emergency vendor
      const bestVendor = this.findBestEmergencyVendor(localVendorOptions);
      
      // Calculate incremental cost for emergency sourcing
      const incrementalCost = bestVendor 
        ? this.calculateIncrementalCost(bestVendor, averageLandedCost, demandForecast)
        : 0;

      // Calculate net benefit
      const netBenefit = opportunityCost - incrementalCost;

      // Determine recommended action
      const recommendedAction = this.determineRecommendedAction(
        netBenefit,
        stockoutRisk,
        currentStock
      );

      // Calculate urgency
      const urgency = this.calculateUrgency(stockoutRisk, currentStock, demandForecast);

      const analysis: EmergencySourcingAnalysis = {
        variantId,
        sku,
        productName,
        currentStock,
        demandForecast,
        stockoutRisk,
        opportunityCost,
        incrementalCost,
        netBenefit,
        recommendedAction,
        urgency,
        estimatedLeadTime: bestVendor?.leadTimeDays || 0,
        localVendorOptions,
      };

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "analyze_emergency_sourcing",
        rationale: `Analyzed emergency sourcing for ${sku}: net benefit $${netBenefit.toFixed(2)}`,
        evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
        status: "completed",
        progressPct: 50,
      });

      return analysis;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "analyze_emergency_sourcing_error",
        rationale: `Failed to analyze emergency sourcing: ${error}`,
        evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Generate emergency sourcing action card
   */
  async generateEmergencySourcingAction(
    analysis: EmergencySourcingAnalysis
  ): Promise<EmergencySourcingAction | null> {
    try {
      // Only generate action if net benefit is positive and above threshold
      const minimumBenefitThreshold = 100; // $100 minimum benefit
      const marginThreshold = 0.2; // 20% margin threshold

      if (analysis.netBenefit < minimumBenefitThreshold) {
        return null;
      }

      const bestVendor = analysis.localVendorOptions[0]; // Already sorted by net benefit
      const recommendedQuantity = Math.ceil(analysis.demandForecast * 0.3); // 30% of forecast
      
      const action: EmergencySourcingAction = {
        id: `emergency-${analysis.variantId}-${Date.now()}`,
        type: 'emergency_sourcing_recommendation',
        title: `Emergency Sourcing: ${analysis.productName}`,
        description: `Stockout risk: ${(analysis.stockoutRisk * 100).toFixed(1)}%. Emergency sourcing recommended with ${analysis.localVendorOptions.length} vendor options.`,
        urgency: analysis.urgency,
        variantId: analysis.variantId,
        sku: analysis.sku,
        productName: analysis.productName,
        currentStock: analysis.currentStock,
        recommendedQuantity,
        bestVendor,
        estimatedCost: bestVendor?.totalCost || 0,
        estimatedBenefit: analysis.opportunityCost,
        netBenefit: analysis.netBenefit,
        confidence: this.calculateConfidence(analysis),
        createdAt: new Date(),
      };

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "generate_emergency_sourcing_action",
        rationale: `Generated emergency sourcing action for ${analysis.sku} with $${analysis.netBenefit.toFixed(2)} net benefit`,
        evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
        status: "completed",
        progressPct: 100,
      });

      return action;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "generate_emergency_sourcing_action_error",
        rationale: `Failed to generate emergency sourcing action: ${error}`,
        evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Calculate stockout risk based on current stock and demand forecast
   */
  private calculateStockoutRisk(currentStock: number, demandForecast: number): number {
    if (currentStock <= 0) return 1.0; // 100% risk if out of stock
    if (demandForecast <= 0) return 0.0; // No risk if no demand
    
    // Simple probability calculation (can be enhanced with more sophisticated models)
    const stockoutRisk = Math.max(0, Math.min(1, (demandForecast - currentStock) / demandForecast));
    return stockoutRisk;
  }

  /**
   * Calculate opportunity cost of stockout
   */
  private calculateOpportunityCost(
    stockoutRisk: number,
    demandForecast: number,
    averageLandedCost: number
  ): number {
    // Opportunity cost = stockout risk × demand forecast × average landed cost × margin factor
    const marginFactor = 0.3; // Assume 30% margin
    return stockoutRisk * demandForecast * averageLandedCost * marginFactor;
  }

  /**
   * Get local vendor options for emergency sourcing
   */
  private async getLocalVendorOptions(variantId: string): Promise<LocalVendorOption[]> {
    // This would typically query the vendor service
    // For now, return mock data
    return [
      {
        vendorId: "vendor-1",
        vendorName: "Local Fast Vendor",
        costPerUnit: 15.50,
        leadTimeDays: 3,
        minimumOrderQuantity: 10,
        reliabilityScore: 85,
        totalCost: 0, // Will be calculated
        netBenefit: 0, // Will be calculated
      },
      {
        vendorId: "vendor-2",
        vendorName: "Express Supplier",
        costPerUnit: 18.75,
        leadTimeDays: 2,
        minimumOrderQuantity: 5,
        reliabilityScore: 90,
        totalCost: 0, // Will be calculated
        netBenefit: 0, // Will be calculated
      },
    ];
  }

  /**
   * Find the best emergency vendor based on cost, lead time, and reliability
   */
  private findBestEmergencyVendor(vendors: LocalVendorOption[]): LocalVendorOption | null {
    if (vendors.length === 0) return null;

    // Sort by composite score (lower cost, faster delivery, higher reliability)
    return vendors.sort((a, b) => {
      const scoreA = (a.costPerUnit * 0.4) + (a.leadTimeDays * 0.3) + ((100 - a.reliabilityScore) * 0.3);
      const scoreB = (b.costPerUnit * 0.4) + (b.leadTimeDays * 0.3) + ((100 - b.reliabilityScore) * 0.3);
      return scoreA - scoreB;
    })[0];
  }

  /**
   * Calculate incremental cost for emergency sourcing
   */
  private calculateIncrementalCost(
    vendor: LocalVendorOption,
    averageLandedCost: number,
    demandForecast: number
  ): number {
    const quantity = Math.ceil(demandForecast * 0.3); // 30% of forecast
    const emergencyCost = vendor.costPerUnit * quantity;
    const regularCost = averageLandedCost * quantity;
    return emergencyCost - regularCost;
  }

  /**
   * Determine recommended action based on analysis
   */
  private determineRecommendedAction(
    netBenefit: number,
    stockoutRisk: number,
    currentStock: number
  ): 'source_emergency' | 'wait' | 'discontinue' {
    if (currentStock <= 0 && stockoutRisk > 0.8) {
      return 'source_emergency';
    } else if (netBenefit > 0 && stockoutRisk > 0.5) {
      return 'source_emergency';
    } else if (stockoutRisk < 0.2) {
      return 'wait';
    } else {
      return 'discontinue';
    }
  }

  /**
   * Calculate urgency level
   */
  private calculateUrgency(
    stockoutRisk: number,
    currentStock: number,
    demandForecast: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (currentStock <= 0) return 'critical';
    if (stockoutRisk > 0.8) return 'high';
    if (stockoutRisk > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence in the recommendation
   */
  private calculateConfidence(analysis: EmergencySourcingAnalysis): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data quality
    if (analysis.demandForecast > 0) confidence += 0.2;
    if (analysis.localVendorOptions.length > 0) confidence += 0.2;
    if (analysis.netBenefit > 0) confidence += 0.1;

    return Math.min(1.0, confidence);
  }
}

/**
 * Input for emergency sourcing analysis
 */
export interface EmergencySourcingInput {
  variantId: string;
  bundleProductId: string;
  bundleMargin: number;
  avgBundleSalesPerDay: number;
  qtyNeeded: number;
}

/**
 * Standalone function to analyze emergency sourcing
 * This is a wrapper around the EmergencySourcingService class
 */
export async function analyzeEmergencySourcing(input: EmergencySourcingInput): Promise<any> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "emergency_sourcing_analysis",
    rationale: `Analyzing emergency sourcing for variant ${input.variantId}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return a mock recommendation
  // In a real implementation, this would use the EmergencySourcingService class
  const recommendation = {
    shouldUseFastVendor: true,
    primaryVendor: {
      vendorId: "primary-vendor-1",
      vendorName: "Primary Vendor",
      leadTimeDays: 30,
      costPerUnit: 10.0,
      totalCost: input.qtyNeeded * 10.0,
      reliabilityScore: 0.95,
    },
    localVendor: {
      vendorId: "local-vendor-1",
      vendorName: "Local Vendor",
      leadTimeDays: 7,
      costPerUnit: 15.0,
      totalCost: input.qtyNeeded * 15.0,
      reliabilityScore: 0.85,
    },
    analysis: {
      daysSaved: 23,
      feasibleSalesDuringSavedTime: input.avgBundleSalesPerDay * 23,
      expectedLostProfit: input.avgBundleSalesPerDay * 23 * input.bundleMargin,
      incrementalCost: input.qtyNeeded * (15.0 - 10.0),
      netBenefit: (input.avgBundleSalesPerDay * 23 * input.bundleMargin) - (input.qtyNeeded * 5.0),
      resultingBundleMargin: input.bundleMargin - 5.0,
    },
    reason: "Emergency sourcing recommended to avoid stockout",
  };

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "emergency_sourcing_complete",
    rationale: `Emergency sourcing analysis complete. Net benefit: ${recommendation.analysis.netBenefit}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "completed",
    progressPct: 100,
  });

  return recommendation;
}

/**
 * Calculate emergency sourcing for a bundle
 */
export async function calculateEmergencySourcing(input: any): Promise<any> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "calculate_emergency_sourcing",
    rationale: `Calculating emergency sourcing for bundle ${input.bundleId}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return a mock result
  // In a real implementation, this would calculate the emergency sourcing
  const result = {
    shouldUseFastVendor: true,
    netBenefit: 150.0,
    incrementalCost: 50.0,
    daysSaved: 7,
    feasibleSalesDuringSavedTime: 10,
  };

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "calculate_emergency_sourcing_complete",
    rationale: `Emergency sourcing calculation complete. Net benefit: ${result.netBenefit}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "completed",
    progressPct: 100,
  });

  return result;
}

/**
 * Get emergency sourcing history
 */
export async function getEmergencySourcingHistory(filters?: any): Promise<any[]> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "get_emergency_sourcing_history",
    rationale: `Retrieving emergency sourcing history`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock history
  // In a real implementation, this would query the database
  const history = [
    {
      id: "1",
      variantId: "variant-1",
      bundleProductId: "bundle-1",
      decision: "approved",
      netBenefit: 150.0,
      createdAt: new Date().toISOString(),
    },
  ];

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "get_emergency_sourcing_history_complete",
    rationale: `Retrieved ${history.length} emergency sourcing records`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "completed",
    progressPct: 100,
  });

  return history;
}

/**
 * Batch calculate emergency sourcing for multiple items
 */
export async function batchCalculateEmergencySourcing(items: any[]): Promise<any[]> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "batch_calculate_emergency_sourcing",
    rationale: `Batch calculating emergency sourcing for ${items.length} items`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock results
  const results = items.map((item, index) => ({
    ...item,
    shouldUseFastVendor: index % 2 === 0,
    netBenefit: 100 + index * 10,
  }));

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "batch_calculate_emergency_sourcing_complete",
    rationale: `Batch calculation complete for ${results.length} items`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "completed",
    progressPct: 100,
  });

  return results;
}

/**
 * Update emergency sourcing status
 */
export async function updateEmergencySourcingStatus(id: string, status: string): Promise<any> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "update_emergency_sourcing_status",
    rationale: `Updating emergency sourcing ${id} to status ${status}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock result
  const result = {
    id,
    status,
    updatedAt: new Date().toISOString(),
  };

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "update_emergency_sourcing_status_complete",
    rationale: `Updated emergency sourcing ${id} to ${status}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "completed",
    progressPct: 100,
  });

  return result;
}

/**
 * Generate emergency sourcing action card
 */
export async function generateEmergencySourcingAction(input: any): Promise<any> {
  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "generate_emergency_sourcing_action",
    rationale: `Generating emergency sourcing action for variant ${input.variantId}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "in_progress",
    progressPct: 0,
  });

  // For now, return mock action card
  const action = {
    id: `action-${Date.now()}`,
    type: "emergency_sourcing",
    title: "Emergency Sourcing Recommended",
    description: `Consider emergency sourcing for variant ${input.variantId}`,
    priority: "high",
    estimatedImpact: 150.0,
    createdAt: new Date().toISOString(),
  };

  await logDecision({
    scope: "build",
    actor: "inventory",
    action: "generate_emergency_sourcing_action_complete",
    rationale: `Generated emergency sourcing action ${action.id}`,
    evidenceUrl: "app/services/inventory/emergency-sourcing.ts",
    status: "completed",
    progressPct: 100,
  });

  return action;
}