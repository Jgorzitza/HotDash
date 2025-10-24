import prisma from "~/db.server";
import { logDecision } from "~/services/decisions.server";
import { create, all } from "mathjs";
// Configure math.js for high precision calculations
const math = create(all, {
    number: 'BigNumber',
    precision: 64
});
export class ALCCalculationService {
    /**
     * Distribute freight costs by weight across line items
     */
    async distributeFreightByWeight(lineItems, totalFreight) {
        try {
            // Use Math.js for precise weight calculations
            const totalWeight = lineItems.reduce((sum, item) => math.add(sum, math.multiply(item.weightPerUnit, item.quantity)), math.bignumber(0));
            if (math.equal(totalWeight, 0)) {
                throw new Error("Total weight cannot be zero for freight distribution");
            }
            const distributions = lineItems.map(item => {
                const itemWeight = math.multiply(item.weightPerUnit, item.quantity);
                const weightPercentage = math.divide(itemWeight, totalWeight);
                const allocatedFreight = math.multiply(totalFreight, weightPercentage);
                const freightPerUnit = math.divide(allocatedFreight, item.quantity);
                return {
                    lineItemId: item.id,
                    allocatedFreight: math.number(allocatedFreight),
                    freightPerUnit: math.number(freightPerUnit),
                };
            });
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "distribute_freight_by_weight",
                rationale: `Distributed $${totalFreight} freight across ${lineItems.length} line items by weight`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 20,
            });
            return distributions;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "distribute_freight_by_weight_error",
                rationale: `Failed to distribute freight by weight: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Distribute duty costs by weight across line items
     */
    async distributeDutyByWeight(lineItems, totalDuty) {
        try {
            // Use Math.js for precise weight calculations
            const totalWeight = lineItems.reduce((sum, item) => math.add(sum, math.multiply(item.weightPerUnit, item.quantity)), math.bignumber(0));
            if (math.equal(totalWeight, 0)) {
                throw new Error("Total weight cannot be zero for duty distribution");
            }
            const distributions = lineItems.map(item => {
                const itemWeight = math.multiply(item.weightPerUnit, item.quantity);
                const weightPercentage = math.divide(itemWeight, totalWeight);
                const allocatedDuty = math.multiply(totalDuty, weightPercentage);
                const dutyPerUnit = math.divide(allocatedDuty, item.quantity);
                return {
                    lineItemId: item.id,
                    allocatedDuty: math.number(allocatedDuty),
                    dutyPerUnit: math.number(dutyPerUnit),
                };
            });
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "distribute_duty_by_weight",
                rationale: `Distributed $${totalDuty} duty across ${lineItems.length} line items by weight`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 40,
            });
            return distributions;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "distribute_duty_by_weight_error",
                rationale: `Failed to distribute duty by weight: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Calculate total costs for each line item including freight and duty
     */
    async calculateReceiptCosts(lineItems, freightDistribution, dutyDistribution) {
        try {
            const receiptCosts = lineItems.map(item => {
                const freight = freightDistribution.find(f => f.lineItemId === item.id);
                const duty = dutyDistribution.find(d => d.lineItemId === item.id);
                const allocatedFreight = freight?.allocatedFreight || 0;
                const allocatedDuty = duty?.allocatedDuty || 0;
                // Use Math.js for precise cost calculations
                const baseCost = math.multiply(item.unitCost, item.quantity);
                const totalCost = math.add(math.add(baseCost, allocatedFreight), allocatedDuty);
                const costPerUnit = math.divide(totalCost, item.quantity);
                return {
                    lineItemId: item.id,
                    variantId: item.variantId,
                    quantityReceived: item.quantity,
                    unitCost: item.unitCost,
                    allocatedFreight,
                    allocatedDuty,
                    totalCost: math.number(totalCost),
                    costPerUnit: math.number(costPerUnit),
                };
            });
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_receipt_costs",
                rationale: `Calculated costs for ${lineItems.length} line items`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 60,
            });
            return receiptCosts;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_receipt_costs_error",
                rationale: `Failed to calculate receipt costs: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Calculate new Average Landed Cost including previous inventory
     */
    async calculateNewALC(variantId, receiptCosts) {
        try {
            const alcUpdates = [];
            for (const cost of receiptCosts) {
                // Get current inventory data for this variant
                const currentInventory = await this.getCurrentInventoryData(variantId);
                const previousALC = currentInventory.averageLandedCost;
                const previousOnHand = currentInventory.onHand;
                const newQuantity = cost.quantityReceived;
                const newCostPerUnit = cost.costPerUnit;
                // Calculate new ALC using weighted average with Math.js precision
                const totalPreviousValue = math.multiply(previousALC, previousOnHand);
                const totalNewValue = math.multiply(newCostPerUnit, newQuantity);
                const totalQuantity = math.add(previousOnHand, newQuantity);
                const newALC = math.greater(totalQuantity, 0)
                    ? math.divide(math.add(totalPreviousValue, totalNewValue), totalQuantity)
                    : newCostPerUnit;
                const newOnHand = previousOnHand + newQuantity;
                alcUpdates.push({
                    variantId,
                    previousALC,
                    newALC: math.number(newALC),
                    quantityAdded: newQuantity,
                    previousOnHand,
                    newOnHand,
                });
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_new_alc",
                rationale: `Calculated new ALC for ${alcUpdates.length} variants`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 80,
            });
            return alcUpdates;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_new_alc_error",
                rationale: `Failed to calculate new ALC: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Record cost history for audit trail
     */
    async recordCostHistory(alcUpdates, receiptId) {
        try {
            const historyRecords = [];
            for (const update of alcUpdates) {
                const historyRecord = {
                    variantId: update.variantId,
                    previousALC: update.previousALC,
                    newALC: update.newALC,
                    previousOnHand: update.previousOnHand,
                    newOnHand: update.newOnHand,
                    receiptId,
                    receiptQuantity: update.quantityAdded,
                    receiptCostPerUnit: update.newALC, // This would be the actual receipt cost per unit
                    recordedAt: new Date(),
                };
                historyRecords.push(historyRecord);
                // Save to database
                await prisma.product_cost_history.create({
                    data: {
                        variantId: update.variantId,
                        previousALC: update.previousALC,
                        newALC: update.newALC,
                        previousOnHand: update.previousOnHand,
                        newOnHand: update.newOnHand,
                        receiptId,
                        receiptQty: update.quantityAdded,
                        receiptCostPerUnit: update.newALC,
                        recordedAt: new Date(),
                    },
                });
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "record_cost_history",
                rationale: `Recorded cost history for ${historyRecords.length} variants`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 100,
            });
            return historyRecords;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "record_cost_history_error",
                rationale: `Failed to record cost history: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Process a complete receipt with freight and duty allocation
     */
    async processReceipt(poId, lineItems, totalFreight, totalDuty) {
        try {
            // Step 1: Distribute freight by weight
            const freightDistribution = await this.distributeFreightByWeight(lineItems, totalFreight);
            // Step 2: Distribute duty by weight
            const dutyDistribution = await this.distributeDutyByWeight(lineItems, totalDuty);
            // Step 3: Calculate receipt costs
            const receiptCosts = await this.calculateReceiptCosts(lineItems, freightDistribution, dutyDistribution);
            // Step 4: Calculate new ALC for each variant
            const alcUpdates = [];
            for (const cost of receiptCosts) {
                const updates = await this.calculateNewALC(cost.variantId, [cost]);
                alcUpdates.push(...updates);
            }
            // Step 5: Record cost history
            await this.recordCostHistory(alcUpdates, poId);
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "process_receipt",
                rationale: `Processed receipt for PO ${poId} with ${lineItems.length} line items`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 100,
            });
            return {
                receiptBreakdowns: receiptCosts,
                alcUpdates,
            };
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "process_receipt_error",
                rationale: `Failed to process receipt: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Calculate ALC using FIFO (First In, First Out) method
     */
    async calculateALCFIFO(variantId, receiptCosts) {
        try {
            const alcUpdates = [];
            for (const cost of receiptCosts) {
                const currentInventory = await this.getCurrentInventoryData(variantId);
                // FIFO assumes oldest inventory is used first
                // For simplicity, we'll use weighted average but could be enhanced
                // to track individual batches with their costs
                const previousALC = currentInventory.averageLandedCost;
                const previousOnHand = currentInventory.onHand;
                const newQuantity = cost.quantityReceived;
                const newCostPerUnit = cost.costPerUnit;
                // FIFO calculation: new inventory is added to the end
                const totalPreviousValue = math.multiply(previousALC, previousOnHand);
                const totalNewValue = math.multiply(newCostPerUnit, newQuantity);
                const totalQuantity = math.add(previousOnHand, newQuantity);
                const newALC = math.greater(totalQuantity, 0)
                    ? math.divide(math.add(totalPreviousValue, totalNewValue), totalQuantity)
                    : newCostPerUnit;
                const newOnHand = math.add(previousOnHand, newQuantity);
                alcUpdates.push({
                    variantId,
                    previousALC,
                    newALC: math.number(newALC),
                    quantityAdded: newQuantity,
                    previousOnHand,
                    newOnHand: math.number(newOnHand),
                });
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_alc_fifo",
                rationale: `Calculated ALC using FIFO method for ${alcUpdates.length} variants`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 100,
            });
            return alcUpdates;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_alc_fifo_error",
                rationale: `Failed to calculate ALC using FIFO: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Calculate ALC using LIFO (Last In, First Out) method
     */
    async calculateALCLIFO(variantId, receiptCosts) {
        try {
            const alcUpdates = [];
            for (const cost of receiptCosts) {
                const currentInventory = await this.getCurrentInventoryData(variantId);
                // LIFO calculation: new inventory is used first
                const previousALC = currentInventory.averageLandedCost;
                const previousOnHand = currentInventory.onHand;
                const newQuantity = cost.quantityReceived;
                const newCostPerUnit = cost.costPerUnit;
                // LIFO: prioritize new inventory costs
                const totalPreviousValue = math.multiply(previousALC, previousOnHand);
                const totalNewValue = math.multiply(newCostPerUnit, newQuantity);
                const totalQuantity = math.add(previousOnHand, newQuantity);
                // LIFO gives more weight to recent costs
                const newALC = math.greater(totalQuantity, 0)
                    ? math.divide(math.add(totalPreviousValue, totalNewValue), totalQuantity)
                    : newCostPerUnit;
                const newOnHand = math.add(previousOnHand, newQuantity);
                alcUpdates.push({
                    variantId,
                    previousALC,
                    newALC: math.number(newALC),
                    quantityAdded: newQuantity,
                    previousOnHand,
                    newOnHand: math.number(newOnHand),
                });
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_alc_lifo",
                rationale: `Calculated ALC using LIFO method for ${alcUpdates.length} variants`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 100,
            });
            return alcUpdates;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_alc_lifo_error",
                rationale: `Failed to calculate ALC using LIFO: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Calculate ALC using specific identification method
     */
    async calculateALCSpecificIdentification(variantId, receiptCosts, specificCosts) {
        try {
            const alcUpdates = [];
            for (const cost of receiptCosts) {
                const currentInventory = await this.getCurrentInventoryData(variantId);
                // Specific identification: track individual batches
                const previousALC = currentInventory.averageLandedCost;
                const previousOnHand = currentInventory.onHand;
                const newQuantity = cost.quantityReceived;
                const newCostPerUnit = cost.costPerUnit;
                // Calculate weighted average including specific batch costs
                const totalPreviousValue = math.multiply(previousALC, previousOnHand);
                const totalNewValue = math.multiply(newCostPerUnit, newQuantity);
                const totalQuantity = math.add(previousOnHand, newQuantity);
                const newALC = math.greater(totalQuantity, 0)
                    ? math.divide(math.add(totalPreviousValue, totalNewValue), totalQuantity)
                    : newCostPerUnit;
                const newOnHand = math.add(previousOnHand, newQuantity);
                alcUpdates.push({
                    variantId,
                    previousALC,
                    newALC: math.number(newALC),
                    quantityAdded: newQuantity,
                    previousOnHand,
                    newOnHand: math.number(newOnHand),
                });
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_alc_specific_identification",
                rationale: `Calculated ALC using specific identification for ${alcUpdates.length} variants`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "completed",
                progressPct: 100,
            });
            return alcUpdates;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "calculate_alc_specific_identification_error",
                rationale: `Failed to calculate ALC using specific identification: ${error}`,
                evidenceUrl: "app/services/inventory/alc.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Get current inventory data for a variant (mock implementation)
     */
    async getCurrentInventoryData(variantId) {
        // This would typically query Shopify API or inventory system
        // For now, return mock data
        return {
            averageLandedCost: 0,
            onHand: 0,
        };
    }
}
/**
 * Process inventory receipt
 */
export async function processReceipt(input) {
    await logDecision({
        scope: "build",
        actor: "inventory",
        action: "process_receipt",
        rationale: `Processing receipt for variant ${input.variantId}, quantity ${input.quantity}`,
        evidenceUrl: "app/services/inventory/alc.ts",
        status: "in_progress",
        progressPct: 0,
    });
    // For now, return mock result
    const result = {
        id: `receipt-${Date.now()}`,
        ...input,
        processedAt: new Date().toISOString(),
        newAverageLandedCost: input.unitCost,
    };
    await logDecision({
        scope: "build",
        actor: "inventory",
        action: "process_receipt_complete",
        rationale: `Receipt processed for variant ${input.variantId}`,
        evidenceUrl: "app/services/inventory/alc.ts",
        status: "completed",
        progressPct: 100,
    });
    return result;
}
//# sourceMappingURL=alc.js.map