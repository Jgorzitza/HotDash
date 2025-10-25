export interface VendorWithMetrics {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    paymentTerms: string | null;
    leadTimeDays: number;
    shipMethod: string | null;
    dropShip: boolean;
    currency: string;
    reliabilityScore: number;
    totalOrders: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    onTimePercentage: number;
    averageLeadTime: number;
    isActive: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface VendorOption {
    id: string;
    name: string;
    reliabilityScore: number;
    averageLeadTime: number;
    costPerUnit: number;
    minimumOrderQuantity: number;
    isPreferred: boolean;
    lastOrderDate: Date | null;
}
export interface VendorReliabilityUpdate {
    vendorId: string;
    onTimeDelivery: boolean;
    actualLeadTime: number;
    expectedLeadTime: number;
    newReliabilityScore: number;
}
export declare class VendorService {
    /**
     * Get vendor with comprehensive metrics
     */
    getVendorWithMetrics(vendorId: string): Promise<VendorWithMetrics | null>;
    /**
     * Update vendor reliability based on delivery performance
     */
    updateVendorReliability(vendorId: string, expectedDeliveryDate: Date, actualDeliveryDate: Date): Promise<VendorReliabilityUpdate>;
    /**
     * Find the best vendor for a specific product
     */
    getBestVendorForProduct(variantId: string): Promise<VendorOption | null>;
    /**
     * Get all vendor options for a product with rankings
     */
    getVendorOptions(variantId: string): Promise<VendorOption[]>;
    /**
       * Get all vendors with their metrics
       */
    getAllVendorsWithMetrics(): Promise<VendorWithMetrics[]>;
}
/**
 * Update vendor reliability metrics
 */
export declare function updateVendorReliability(vendorId: string, metrics: any): Promise<any>;
/**
 * Get vendor options for selection
 */
export declare function getVendorOptions(): Promise<any[]>;
/**
 * Get best vendor for a product
 */
export declare function getBestVendorForProduct(productId: string): Promise<any>;
//# sourceMappingURL=vendor-service.d.ts.map