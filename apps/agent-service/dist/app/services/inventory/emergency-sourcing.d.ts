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
export declare class EmergencySourcingService {
    /**
     * Analyze emergency sourcing opportunity for a product
     */
    analyzeEmergencySourcing(variantId: string, sku: string, productName: string, currentStock: number, demandForecast: number, averageLandedCost: number): Promise<EmergencySourcingAnalysis>;
    /**
     * Generate emergency sourcing action card
     */
    generateEmergencySourcingAction(analysis: EmergencySourcingAnalysis): Promise<EmergencySourcingAction | null>;
    /**
     * Calculate stockout risk based on current stock and demand forecast
     */
    private calculateStockoutRisk;
    /**
     * Calculate opportunity cost of stockout
     */
    private calculateOpportunityCost;
    /**
     * Get local vendor options for emergency sourcing
     */
    private getLocalVendorOptions;
    /**
     * Find the best emergency vendor based on cost, lead time, and reliability
     */
    private findBestEmergencyVendor;
    /**
     * Calculate incremental cost for emergency sourcing
     */
    private calculateIncrementalCost;
    /**
     * Determine recommended action based on analysis
     */
    private determineRecommendedAction;
    /**
     * Calculate urgency level
     */
    private calculateUrgency;
    /**
     * Calculate confidence in the recommendation
     */
    private calculateConfidence;
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
export declare function analyzeEmergencySourcing(input: EmergencySourcingInput): Promise<any>;
/**
 * Calculate emergency sourcing for a bundle
 */
export declare function calculateEmergencySourcing(input: any): Promise<any>;
/**
 * Get emergency sourcing history
 */
export declare function getEmergencySourcingHistory(filters?: any): Promise<any[]>;
/**
 * Batch calculate emergency sourcing for multiple items
 */
export declare function batchCalculateEmergencySourcing(items: any[]): Promise<any[]>;
/**
 * Update emergency sourcing status
 */
export declare function updateEmergencySourcingStatus(id: string, status: string): Promise<any>;
/**
 * Generate emergency sourcing action card
 */
export declare function generateEmergencySourcingAction(input: any): Promise<any>;
//# sourceMappingURL=emergency-sourcing.d.ts.map