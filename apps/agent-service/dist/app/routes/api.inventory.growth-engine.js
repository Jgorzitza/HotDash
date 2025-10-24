/**
 * API Route: Growth Engine Inventory Agent
 *
 * POST /api/inventory/growth-engine/analyze
 * POST /api/inventory/growth-engine/reconciliation
 * GET /api/inventory/growth-engine/compliance
 *
 * Enhanced inventory agent that integrates with the Growth Engine framework
 * to provide advanced inventory management capabilities with MCP evidence,
 * heartbeat monitoring, and action queue integration.
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-534: Growth Engine inventory Task
 */
import { createGrowthEngineInventoryAgent, runGrowthEngineInventoryAnalysis } from "~/services/inventory/growth-engine-inventory-agent";
// GET /api/inventory/growth-engine/compliance - Get compliance status
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const agent = url.searchParams.get('agent') || 'inventory';
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
        const task = url.searchParams.get('task') || 'growth-engine-inventory-analysis';
        const estimatedHours = parseInt(url.searchParams.get('estimatedHours') || '3');
        const config = {
            agent,
            date,
            task,
            estimatedHours,
            shopDomain: 'hotrodan.myshopify.com',
            enableAdvancedFeatures: true,
            enableEmergencySourcing: true,
            enableROPCalculation: true,
            enableReconciliation: true
        };
        const inventoryAgent = createGrowthEngineInventoryAgent(config);
        await inventoryAgent.initialize();
        const compliance = await inventoryAgent.checkCompliance();
        const report = await inventoryAgent.getComplianceReport();
        return Response.json({
            success: true,
            data: {
                compliance,
                report,
                config: {
                    agent: config.agent,
                    date: config.date,
                    task: config.task,
                    estimatedHours: config.estimatedHours,
                    shopDomain: config.shopDomain
                }
            }
        });
    }
    catch (error) {
        console.error("[API] Growth Engine Inventory compliance error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to get compliance status",
        }, { status: 500 });
    }
}
// POST /api/inventory/growth-engine/analyze - Run inventory analysis
export async function action({ request }) {
    try {
        const body = await request.json();
        const { agent = 'inventory', date = new Date().toISOString().split('T')[0], task = 'growth-engine-inventory-analysis', estimatedHours = 3, shopDomain = 'hotrodan.myshopify.com', enableAdvancedFeatures = true, enableEmergencySourcing = true, enableROPCalculation = true, enableReconciliation = false, action: actionType = 'analyze' } = body;
        const config = {
            agent,
            date,
            task,
            estimatedHours,
            shopDomain,
            enableAdvancedFeatures,
            enableEmergencySourcing,
            enableROPCalculation,
            enableReconciliation
        };
        let actions = [];
        switch (actionType) {
            case 'analyze':
                actions = await runGrowthEngineInventoryAnalysis(config);
                break;
            case 'reconciliation':
                const inventoryAgent = createGrowthEngineInventoryAgent(config);
                await inventoryAgent.initialize();
                actions = await inventoryAgent.runNightlyReconciliation();
                break;
            default:
                return Response.json({
                    success: false,
                    error: "Invalid action. Use 'analyze' or 'reconciliation'",
                }, { status: 400 });
        }
        return Response.json({
            success: true,
            data: {
                actions,
                metadata: {
                    actionType,
                    agent,
                    date,
                    task,
                    estimatedHours,
                    shopDomain,
                    actionsGenerated: actions.length,
                    analysisTimestamp: new Date().toISOString()
                }
            }
        });
    }
    catch (error) {
        console.error("[API] Growth Engine Inventory analysis error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to run inventory analysis",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.growth-engine.js.map