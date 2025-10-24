export interface FreightDistribution {
    lineItemId: string;
    allocatedFreight: number;
    freightPerUnit: number;
}
export interface DutyDistribution {
    lineItemId: string;
    allocatedDuty: number;
    dutyPerUnit: number;
}
export interface ReceiptCosts {
    lineItemId: string;
    variantId: string;
    quantityReceived: number;
    unitCost: number;
    allocatedFreight: number;
    allocatedDuty: number;
    totalCost: number;
    costPerUnit: number;
}
export interface ALCUpdate {
    variantId: string;
    previousALC: number;
    newALC: number;
    quantityAdded: number;
    previousOnHand: number;
    newOnHand: number;
}
export interface CostHistoryRecord {
    variantId: string;
    previousALC: number;
    newALC: number;
    previousOnHand: number;
    newOnHand: number;
    receiptId: string;
    receiptQuantity: number;
    receiptCostPerUnit: number;
    recordedAt: Date;
}
export declare class ALCCalculationService {
    /**
     * Distribute freight costs by weight across line items
     */
    distributeFreightByWeight(lineItems: Array<{
        id: string;
        weightPerUnit: number;
        quantity: number;
    }>, totalFreight: number): Promise<FreightDistribution[]>;
    /**
     * Distribute duty costs by weight across line items
     */
    distributeDutyByWeight(lineItems: Array<{
        id: string;
        weightPerUnit: number;
        quantity: number;
    }>, totalDuty: number): Promise<DutyDistribution[]>;
    /**
     * Calculate total costs for each line item including freight and duty
     */
    calculateReceiptCosts(lineItems: Array<{
        id: string;
        variantId: string;
        quantity: number;
        unitCost: number;
        weightPerUnit: number;
    }>, freightDistribution: FreightDistribution[], dutyDistribution: DutyDistribution[]): Promise<ReceiptCosts[]>;
    /**
     * Calculate new Average Landed Cost including previous inventory
     */
    calculateNewALC(variantId: string, receiptCosts: ReceiptCosts[]): Promise<ALCUpdate[]>;
    /**
     * Record cost history for audit trail
     */
    recordCostHistory(alcUpdates: ALCUpdate[], receiptId: string): Promise<CostHistoryRecord[]>;
    /**
     * Process a complete receipt with freight and duty allocation
     */
    processReceipt(poId: string, lineItems: Array<{
        id: string;
        variantId: string;
        quantity: number;
        unitCost: number;
        weightPerUnit: number;
    }>, totalFreight: number, totalDuty: number): Promise<{
        receiptBreakdowns: ReceiptCosts[];
        alcUpdates: ALCUpdate[];
    }>;
    /**
     * Calculate ALC using FIFO (First In, First Out) method
     */
    calculateALCFIFO(variantId: string, receiptCosts: ReceiptCosts[]): Promise<ALCUpdate[]>;
    /**
     * Calculate ALC using LIFO (Last In, First Out) method
     */
    calculateALCLIFO(variantId: string, receiptCosts: ReceiptCosts[]): Promise<ALCUpdate[]>;
    /**
     * Calculate ALC using specific identification method
     */
    calculateALCSpecificIdentification(variantId: string, receiptCosts: ReceiptCosts[], specificCosts: Array<{
        batchId: string;
        costPerUnit: number;
        quantity: number;
    }>): Promise<ALCUpdate[]>;
    /**
     * Get current inventory data for a variant (mock implementation)
     */
    private getCurrentInventoryData;
}
/**
 * Receipt input type
 */
export interface ReceiptInput {
    variantId: string;
    quantity: number;
    unitCost: number;
    vendorId?: string;
    receivedDate?: string;
}
/**
 * Process inventory receipt
 */
export declare function processReceipt(input: ReceiptInput): Promise<any>;
//# sourceMappingURL=alc.d.ts.map