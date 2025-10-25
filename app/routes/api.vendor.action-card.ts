/**
 * API Route: Emergency Sourcing Action Card
 *
 * POST /api/vendor/action-card
 *
 * Generates Action Queue card for emergency sourcing recommendation
 * Used by Inventory agent to create actionable recommendations
 */

import type { ActionFunctionArgs } from "react-router";
import { generateEmergencySourcingAction } from "~/services/inventory/emergency-sourcing";

export interface ActionCardRequest {
  variantId: string;
  bundleProductId: string;
}

export interface ActionCardResponse {
  success: boolean;
  actionCard?: {
    type: string;
    title: string;
    description: string;
    expectedRevenue: number;
    confidence: number;
    ease: number;
    evidence: Record<string, unknown>;
  };
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body: ActionCardRequest = await request.json();

    // Validate required fields
    if (!body.variantId || !body.bundleProductId) {
      return Response.json(
        { success: false, error: "variantId and bundleProductId are required" },
        { status: 400 }
      );
    }

    const actionCard = await generateEmergencySourcingAction(
      body.variantId,
      body.bundleProductId
    );

    if (!actionCard) {
      return Response.json(
        { success: true, error: "No emergency sourcing action recommended" }
      );
    }

    const response: ActionCardResponse = {
      success: true,
      actionCard,
    };

    return Response.json(response);
  } catch (error) {
    console.error("[Vendor Action Card] Error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function loader() {
  return Response.json(
    { error: "Method not allowed. Use POST to generate action card." },
    { status: 405 }
  );
}
