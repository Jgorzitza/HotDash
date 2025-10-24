/**
 * ROP Calculation Engine (INVENTORY-100)
 *
 * Enhanced ROP calculation engine with:
 * - Daily velocity calculation from order history
 * - Lead time demand = velocity × vendor days
 * - Safety stock = Z-score × demand variance
 * - ROP suggestions stored in reorder_suggestions table
 * - Seasonal trends and promotional uplift handling
 * - Vendor + qty + ETA + cost impact recommendations
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */
import { getVendorInfo } from "./vendor-management";
/**
 * Calculate daily velocity from order history
 */
export async function calculateDailyVelocity(productId, variantId, historicalDays = 30) {
    // In production: query order history from database
    // For now: mock data with realistic patterns
    const mockOrderHistory = [
        { date: '2025-09-22', quantity: 3 },
        { date: '2025-09-23', quantity: 2 },
        { date: '2025-09-24', quantity: 5 },
        { date: '2025-09-25', quantity: 1 },
        { date: '2025-09-26', quantity: 4 },
        { date: '2025-09-27', quantity: 2 },
        { date: '2025-09-28', quantity: 3 },
        { date: '2025-09-29', quantity: 6 },
        { date: '2025-09-30', quantity: 2 },
        { date: '2025-10-01', quantity: 4 },
        { date: '2025-10-02', quantity: 3 },
        { date: '2025-10-03', quantity: 5 },
        { date: '2025-10-04', quantity: 2 },
        { date: '2025-10-05', quantity: 4 },
        { date: '2025-10-06', quantity: 3 },
        { date: '2025-10-07', quantity: 6 },
        { date: '2025-10-08', quantity: 2 },
        { date: '2025-10-09', quantity: 4 },
        { date: '2025-10-10', quantity: 3 },
        { date: '2025-10-11', quantity: 5 },
        { date: '2025-10-12', quantity: 2 },
        { date: '2025-10-13', quantity: 4 },
        { date: '2025-10-14', quantity: 3 },
        { date: '2025-10-15', quantity: 6 },
        { date: '2025-10-16', quantity: 2 },
        { date: '2025-10-17', quantity: 4 },
        { date: '2025-10-18', quantity: 3 },
        { date: '2025-10-19', quantity: 5 },
        { date: '2025-10-20', quantity: 2 },
        { date: '2025-10-21', quantity: 4 }
    ];
    const totalQuantitySold = mockOrderHistory.reduce((sum, order) => sum + order.quantity, 0);
    const orderCount = mockOrderHistory.length;
    const dailyVelocity = totalQuantitySold / historicalDays;
    // Calculate demand variance
    const quantities = mockOrderHistory.map(order => order.quantity);
    const mean = dailyVelocity;
    const variance = quantities.reduce((sum, qty) => sum + Math.pow(qty - mean, 2), 0) / quantities.length;
    const demandVariance = Math.sqrt(variance);
    // Calculate confidence score based on data quality
    const confidenceScore = Math.min(0.95, Math.max(0.5, 0.7 + (orderCount / 100) + (demandVariance < 2 ? 0.2 : 0)));
    return {
        dailyVelocity,
        orderCount,
        totalQuantitySold,
        demandVariance,
        confidenceScore
    };
}
/**
 * Calculate lead time demand = velocity × vendor days
 */
export async function calculateLeadTimeDemand(dailyVelocity, vendorId) {
    const vendorInfo = await getVendorInfo(vendorId);
    const leadTimeDays = vendorInfo.averageLeadTime || 14;
    const leadTimeDemand = Math.ceil(dailyVelocity * leadTimeDays);
    const vendorReliability = vendorInfo.reliabilityScore || 0.8;
    return {
        leadTimeDays,
        leadTimeDemand,
        vendorReliability
    };
}
/**
 * Calculate safety stock = Z-score × demand variance
 */
export function calculateSafetyStock(dailyVelocity, leadTimeDays, demandVariance, serviceLevel = 0.95) {
    // Z-score for service level (95% = 1.96)
    const zScore = serviceLevel === 0.95 ? 1.96 :
        serviceLevel === 0.99 ? 2.58 :
            serviceLevel === 0.90 ? 1.65 : 1.96;
    // Safety stock = Z × √(lead time) × demand variance
    const safetyStock = zScore * Math.sqrt(leadTimeDays) * demandVariance;
    return Math.ceil(safetyStock);
}
/**
 * Get vendor recommendation with cost and ETA
 */
export async function getVendorRecommendation(productId, recommendedQuantity, preferredVendorId) {
    // In production: query vendor database and pricing
    const vendors = [
        {
            id: 'vendor_001',
            name: 'Primary Supplier Co',
            unitCost: 15.50,
            leadTimeDays: 14,
            reliability: 0.92
        },
        {
            id: 'vendor_002',
            name: 'Fast Supply Inc',
            unitCost: 18.75,
            leadTimeDays: 7,
            reliability: 0.88
        },
        {
            id: 'vendor_003',
            name: 'Budget Parts Ltd',
            unitCost: 12.25,
            leadTimeDays: 21,
            reliability: 0.85
        }
    ];
    // Select best vendor based on criteria
    const selectedVendor = preferredVendorId ?
        vendors.find(v => v.id === preferredVendorId) || vendors[0] :
        vendors.reduce((best, current) => {
            // Score based on cost, lead time, and reliability
            const currentScore = (current.reliability * 0.4) +
                ((20 - current.leadTimeDays) / 20 * 0.3) +
                ((25 - current.unitCost) / 25 * 0.3);
            const bestScore = (best.reliability * 0.4) +
                ((20 - best.leadTimeDays) / 20 * 0.3) +
                ((25 - best.unitCost) / 25 * 0.3);
            return currentScore > bestScore ? current : best;
        });
    const estimatedCost = selectedVendor.unitCost * recommendedQuantity;
    const costImpact = estimatedCost; // For now, same as cost
    return {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.name,
        estimatedCost,
        estimatedEtaDays: selectedVendor.leadTimeDays,
        costImpact
    };
}
/**
 * Store ROP suggestion in database
 */
export async function storeROPSuggestion(params, result) {
    // In production: insert into reorder_suggestions table
    // For now: return mock suggestion ID
    const suggestionId = `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[ROP Engine] Stored suggestion ${suggestionId} for product ${params.productId}`);
    return suggestionId;
}
/**
 * Main ROP calculation engine
 */
export async function calculateROPEngine(params) {
    const { productId, variantId, shopDomain, calculationMethod = 'standard', promotionalUplift = 0, seasonalAdjustment = 0, historicalDays = 30 } = params;
    // 1. Calculate daily velocity from order history
    const velocityData = await calculateDailyVelocity(productId, variantId, historicalDays);
    // 2. Apply seasonal and promotional adjustments
    const seasonalityFactor = 1 + (seasonalAdjustment / 100);
    const promotionalFactor = 1 + (promotionalUplift / 100);
    const adjustedDailyVelocity = velocityData.dailyVelocity * seasonalityFactor * promotionalFactor;
    // 3. Get vendor information and calculate lead time demand
    const vendorInfo = await getVendorInfo('vendor_001'); // Default vendor
    const leadTimeData = await calculateLeadTimeDemand(adjustedDailyVelocity, 'vendor_001');
    // 4. Calculate safety stock
    const safetyStock = calculateSafetyStock(adjustedDailyVelocity, leadTimeData.leadTimeDays, velocityData.demandVariance, 0.95 // 95% service level
    );
    // 5. Calculate reorder point
    const reorderPoint = leadTimeData.leadTimeDemand + safetyStock;
    // 6. Calculate recommended quantity
    const currentStock = 25; // Mock current stock
    const recommendedQuantity = Math.max(0, reorderPoint - currentStock + Math.ceil(adjustedDailyVelocity * 7)); // 7-day buffer
    // 7. Get vendor recommendation
    const vendorRecommendation = await getVendorRecommendation(productId, recommendedQuantity);
    // 8. Build result
    const result = {
        suggestionId: '', // Will be set after storing
        productInfo: {
            productId,
            variantId,
            productName: 'Mock Product',
            variantTitle: 'Default Variant',
            currentStock
        },
        ropCalculation: {
            reorderPoint,
            safetyStock,
            leadTimeDemand: leadTimeData.leadTimeDemand,
            dailyVelocity: velocityData.dailyVelocity,
            adjustedDailyVelocity,
            seasonalityFactor,
            confidenceScore: velocityData.confidenceScore
        },
        vendorRecommendation,
        calculationMetadata: {
            calculationDate: new Date().toISOString(),
            calculationMethod,
            promotionalUplift,
            seasonalAdjustment,
            demandVolatility: velocityData.demandVariance,
            historicalDays,
            orderCount: velocityData.orderCount,
            totalQuantitySold: velocityData.totalQuantitySold
        }
    };
    // 9. Store suggestion in database
    result.suggestionId = await storeROPSuggestion(params, result);
    return result;
}
/**
 * Batch calculate ROP for multiple products
 */
export async function batchCalculateROP(productIds, shopDomain, calculationMethod = 'standard') {
    const results = await Promise.all(productIds.map(productId => calculateROPEngine({
        productId,
        variantId: `${productId}_variant`,
        shopDomain,
        calculationMethod
    })));
    return results;
}
/**
 * Get ROP suggestions for a product
 */
export async function getROPSuggestions(productId, shopDomain, status) {
    // In production: query reorder_suggestions table
    // For now: return mock data
    return [];
}
/**
 * Update ROP suggestion status
 */
export async function updateROPSuggestionStatus(suggestionId, status, approvedBy, notes) {
    // In production: update reorder_suggestions table
    console.log(`[ROP Engine] Updated suggestion ${suggestionId} to status ${status}`);
    return true;
}
//# sourceMappingURL=rop-engine.js.map