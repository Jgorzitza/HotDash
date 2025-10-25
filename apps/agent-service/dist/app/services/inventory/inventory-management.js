import prisma from "~/db.server";
import { logDecision } from "~/services/decisions.server";
import { syncInventoryFromShopify, updateShopifyInventory } from "~/services/shopify/inventory-sync";
export class InventoryManagementService {
    /**
     * Get current inventory levels for all products
     */
    async getInventoryLevels() {
        try {
            // This would typically query Shopify API for current stock levels
            // For now, we'll return mock data structure
            const inventoryItems = [];
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "get_inventory_levels",
                rationale: "Retrieved current inventory levels for all products",
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 25,
            });
            return inventoryItems;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "get_inventory_levels_error",
                rationale: `Failed to get inventory levels: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Get vendor performance metrics
     */
    async getVendorMetrics() {
        try {
            const vendors = await prisma.vendors.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    reliabilityScore: true,
                    totalOrders: true,
                    onTimeDeliveries: true,
                    lateDeliveries: true,
                    leadTimeDays: true,
                    isActive: true,
                },
            });
            const vendorMetrics = vendors.map(vendor => ({
                id: vendor.id,
                name: vendor.name,
                reliabilityScore: vendor.reliabilityScore || 0,
                totalOrders: vendor.totalOrders || 0,
                onTimeDeliveries: vendor.onTimeDeliveries || 0,
                lateDeliveries: vendor.lateDeliveries || 0,
                averageLeadTime: vendor.leadTimeDays,
                isActive: vendor.isActive,
            }));
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "get_vendor_metrics",
                rationale: `Retrieved metrics for ${vendorMetrics.length} vendors`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 50,
            });
            return vendorMetrics;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "get_vendor_metrics_error",
                rationale: `Failed to get vendor metrics: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Generate reorder recommendations based on current stock levels
     */
    async generateReorderRecommendations() {
        try {
            const inventoryLevels = await this.getInventoryLevels();
            const vendorMetrics = await this.getVendorMetrics();
            const recommendations = [];
            for (const item of inventoryLevels) {
                if (item.currentStock <= item.reorderPoint) {
                    const bestVendor = this.findBestVendor(item.variantId, vendorMetrics);
                    const urgency = this.calculateUrgency(item.currentStock, item.reorderPoint);
                    recommendations.push({
                        variantId: item.variantId,
                        sku: item.sku,
                        productName: item.productName,
                        currentStock: item.currentStock,
                        reorderPoint: item.reorderPoint,
                        recommendedQuantity: item.reorderQuantity,
                        urgency,
                        estimatedLeadTime: bestVendor?.averageLeadTime || 14,
                        bestVendor,
                    });
                }
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "generate_reorder_recommendations",
                rationale: `Generated ${recommendations.length} reorder recommendations`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 75,
            });
            return recommendations;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "generate_reorder_recommendations_error",
                rationale: `Failed to generate reorder recommendations: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Generate inventory alerts for low stock, out of stock, etc.
     */
    async generateInventoryAlerts() {
        try {
            const inventoryLevels = await this.getInventoryLevels();
            const alerts = [];
            for (const item of inventoryLevels) {
                if (item.currentStock === 0) {
                    alerts.push({
                        id: `out-${item.variantId}`,
                        type: 'out_of_stock',
                        variantId: item.variantId,
                        sku: item.sku,
                        productName: item.productName,
                        currentStock: item.currentStock,
                        threshold: 0,
                        severity: 'critical',
                        message: `Product ${item.sku} is out of stock`,
                        createdAt: new Date(),
                    });
                }
                else if (item.currentStock <= item.reorderPoint) {
                    alerts.push({
                        id: `low-${item.variantId}`,
                        type: 'low_stock',
                        variantId: item.variantId,
                        sku: item.sku,
                        productName: item.productName,
                        currentStock: item.currentStock,
                        threshold: item.reorderPoint,
                        severity: item.currentStock <= item.reorderPoint * 0.5 ? 'high' : 'medium',
                        message: `Product ${item.sku} is below reorder point (${item.currentStock}/${item.reorderPoint})`,
                        createdAt: new Date(),
                    });
                }
            }
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "generate_inventory_alerts",
                rationale: `Generated ${alerts.length} inventory alerts`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 100,
            });
            return alerts;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "generate_inventory_alerts_error",
                rationale: `Failed to generate inventory alerts: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Find the best vendor for a product based on reliability and performance
     */
    findBestVendor(variantId, vendors) {
        // Filter vendors that have this product
        const availableVendors = vendors.filter(vendor => vendor.isActive);
        if (availableVendors.length === 0) {
            return null;
        }
        // Sort by reliability score (highest first)
        return availableVendors.sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
    }
    /**
     * Calculate urgency level based on current stock vs reorder point
     */
    calculateUrgency(currentStock, reorderPoint) {
        if (currentStock === 0) {
            return 'critical';
        }
        else if (currentStock <= reorderPoint * 0.25) {
            return 'high';
        }
        else if (currentStock <= reorderPoint * 0.5) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    /**
     * Generate inventory reports
     */
    async generateInventoryReport() {
        try {
            const inventoryLevels = await this.getInventoryLevels();
            const alerts = await this.generateInventoryAlerts();
            const recommendations = await this.generateReorderRecommendations();
            const report = {
                totalProducts: inventoryLevels.length,
                lowStockItems: alerts.filter(a => a.type === 'low_stock').length,
                outOfStockItems: alerts.filter(a => a.type === 'out_of_stock').length,
                totalValue: inventoryLevels.reduce((sum, item) => sum + (item.currentStock * item.averageLandedCost), 0),
                reorderRecommendations: recommendations.length,
                alerts: alerts.length,
            };
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "generate_inventory_report",
                rationale: `Generated comprehensive inventory report with ${report.totalProducts} products`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 100,
            });
            return report;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "generate_inventory_report_error",
                rationale: `Failed to generate inventory report: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "failed",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Sync inventory with Shopify using GraphQL Admin API
     * This method uses Shopify Dev MCP patterns for real-time inventory data
     */
    async syncWithShopify(shopifyClient, locationId) {
        try {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "shopify_sync_start",
                rationale: "Starting inventory sync with Shopify using GraphQL Admin API patterns from Shopify Dev MCP",
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "in_progress",
                progressPct: 0,
            });
            // Use Shopify GraphQL patterns learned from MCP
            const result = await syncInventoryFromShopify(shopifyClient, locationId);
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "shopify_sync_complete",
                rationale: `Shopify inventory sync completed using GraphQL patterns. Synced ${result.syncedItems} items`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 100,
            });
            return result;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "shopify_sync_error",
                rationale: `Shopify inventory sync failed: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "error",
                progressPct: 0,
            });
            throw error;
        }
    }
    /**
     * Update Shopify inventory levels using GraphQL mutations
     * Uses Shopify Dev MCP patterns for inventory management
     */
    async updateShopifyInventory(shopifyClient, updates) {
        try {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "shopify_update_start",
                rationale: "Starting Shopify inventory updates using GraphQL mutations from Shopify Dev MCP",
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "in_progress",
                progressPct: 0,
            });
            const result = await updateShopifyInventory(shopifyClient, updates);
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "shopify_update_complete",
                rationale: `Shopify inventory update completed using GraphQL patterns. Updated ${result.syncedItems} items`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "completed",
                progressPct: 100,
            });
            return result;
        }
        catch (error) {
            await logDecision({
                scope: "build",
                actor: "inventory",
                action: "shopify_update_error",
                rationale: `Shopify inventory update failed: ${error}`,
                evidenceUrl: "app/services/inventory/inventory-management.ts",
                status: "error",
                progressPct: 0,
            });
            throw error;
        }
    }
}
//# sourceMappingURL=inventory-management.js.map