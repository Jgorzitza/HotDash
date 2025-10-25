/**
 * API Route: Vendor Emergency Sourcing
 *
 * POST /api/vendor/emergency-sourcing
 *
 * Analyzes emergency sourcing recommendation for OOS components
 * Returns vendor comparison and recommendation
 */

import type { ActionFunctionArgs } from "react-router";
import { analyzeEmergencySourcing } from "~/services/inventory/emergency-sourcing";
import type { EmergencySourcingInput } from "~/services/inventory/emergency-sourcing";

export interface EmergencySourcingRequest {
  variantId: string;
  bundleProductId: string;
  bundleMargin: number;
  avgBundleSalesPerDay: number;
  qtyNeeded: number;
}

export interface EmergencySourcingResponse {
  success: boolean;
  recommendation?: {
    shouldUseFastVendor: boolean;
    primaryVendor: {
      vendorId: string;
      vendorName: string;
      leadTimeDays: number;
      costPerUnit: number;
      totalCost: number;
      reliabilityScore: number;
    };
    localVendor: {
      vendorId: string;
      vendorName: string;
      leadTimeDays: number;
      costPerUnit: number;
      totalCost: number;
      reliabilityScore: number;
    };
    analysis: {
      daysSaved: number;
      feasibleSalesDuringSavedTime: number;
      expectedLostProfit: number;
      incrementalCost: number;
      netBenefit: number;
      resultingBundleMargin: number;
    };
    reason: string;
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
    const body: EmergencySourcingRequest = await request.json();

    // Validate required fields
    if (!body.variantId || !body.bundleProductId) {
      return Response.json(
        { success: false, error: "variantId and bundleProductId are required" },
        { status: 400 }
      );
    }

    if (typeof body.bundleMargin !== "number" || body.bundleMargin <= 0) {
      return Response.json(
        { success: false, error: "bundleMargin must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof body.avgBundleSalesPerDay !== "number" || body.avgBundleSalesPerDay < 0) {
      return Response.json(
        { success: false, error: "avgBundleSalesPerDay must be a non-negative number" },
        { status: 400 }
      );
    }

    if (typeof body.qtyNeeded !== "number" || body.qtyNeeded <= 0) {
      return Response.json(
        { success: false, error: "qtyNeeded must be a positive number" },
        { status: 400 }
      );
    }

    const input: EmergencySourcingInput = {
      variantId: body.variantId,
      bundleProductId: body.bundleProductId,
      bundleMargin: body.bundleMargin,
      avgBundleSalesPerDay: body.avgBundleSalesPerDay,
      qtyNeeded: body.qtyNeeded,
    };

    const recommendation = await analyzeEmergencySourcing(input);

    const response: EmergencySourcingResponse = {
      success: true,
      recommendation,
    };

    return Response.json(response);
  } catch (error) {
    console.error("[Vendor Emergency Sourcing] Error:", error);
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
    { error: "Method not allowed. Use POST to analyze emergency sourcing." },
    { status: 405 }
  );
}
