/**
 * AI-Customer Growth Engine API Route
 *
 * Provides API endpoints for Growth Engine AI functionality including
 * initialization, workflow execution, status monitoring, and configuration.
 *
 * @route /api/ai-customer/growth-engine
 * @see app/services/ai-customer/growth-engine-ai.ts
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { growthEngineAIService } from "~/services/ai-customer/growth-engine-ai";
import { logDecision } from "~/services/decisions.server";

/**
 * GET /api/ai-customer/growth-engine
 * Get Growth Engine AI status and configuration
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "status":
        return json({
          success: true,
          data: growthEngineAIService.getStatus(),
        });

      case "config":
        return json({
          success: true,
          data: growthEngineAIService.getConfig(),
        });

      default:
        return json({
          success: true,
          data: {
            status: growthEngineAIService.getStatus(),
            config: growthEngineAIService.getConfig(),
          },
        });
    }
  } catch (error) {
    console.error("Growth Engine API error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-customer/growth-engine
 * Execute Growth Engine AI operations
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { action: operation, ...params } = body;

    switch (operation) {
      case "initialize":
        await growthEngineAIService.initialize();
        
        await logDecision({
          scope: "build",
          actor: "ai-customer",
          action: "growth_engine_ai_initialized",
          rationale: "Growth Engine AI service initialized successfully",
          evidenceUrl: "app/routes/api.ai-customer.growth-engine.ts",
        });

        return json({
          success: true,
          message: "Growth Engine AI initialized successfully",
        });

      case "execute":
        const results = await growthEngineAIService.executeWorkflow();
        
        await logDecision({
          scope: "build",
          actor: "ai-customer",
          action: "growth_engine_ai_workflow_executed",
          rationale: "Growth Engine AI workflow executed successfully",
          evidenceUrl: "app/routes/api.ai-customer.growth-engine.ts",
        });

        return json({
          success: true,
          data: results,
        });

      case "update-config":
        const { config } = params;
        growthEngineAIService.updateConfig(config);
        
        await logDecision({
          scope: "build",
          actor: "ai-customer",
          action: "growth_engine_ai_config_updated",
          rationale: "Growth Engine AI configuration updated",
          evidenceUrl: "app/routes/api.ai-customer.growth-engine.ts",
        });

        return json({
          success: true,
          message: "Configuration updated successfully",
          data: growthEngineAIService.getConfig(),
        });

      default:
        return json(
          {
            success: false,
            error: `Unknown operation: ${operation}`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Growth Engine API error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
