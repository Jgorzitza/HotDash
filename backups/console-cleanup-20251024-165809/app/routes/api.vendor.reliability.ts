/**
 * API Route: Vendor Reliability Update
 *
 * POST /api/vendor/reliability
 *
 * Updates vendor reliability score when PO is received
 * Used by Inventory agent to track vendor performance
 */

import type { ActionFunctionArgs } from "react-router";
import { updateVendorReliability } from "~/services/inventory/vendor-service";

export interface VendorReliabilityRequest {
  vendorId: string;
  expectedDate: string; // ISO 8601 format
  actualDate: string; // ISO 8601 format
}

export interface VendorReliabilityResponse {
  success: boolean;
  result?: {
    onTime: boolean;
    reliabilityScore: number;
    totalOrders: number;
    onTimeDeliveries: number;
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
    const body: VendorReliabilityRequest = await request.json();

    // Validate required fields
    if (!body.vendorId) {
      return Response.json(
        { success: false, error: "vendorId is required" },
        { status: 400 }
      );
    }

    if (!body.expectedDate || !body.actualDate) {
      return Response.json(
        { success: false, error: "expectedDate and actualDate are required" },
        { status: 400 }
      );
    }

    // Validate date format
    const expectedDate = new Date(body.expectedDate);
    const actualDate = new Date(body.actualDate);

    if (isNaN(expectedDate.getTime()) || isNaN(actualDate.getTime())) {
      return Response.json(
        { success: false, error: "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)" },
        { status: 400 }
      );
    }

    // Validate that actual date is not before expected date by more than 30 days
    const daysDiff = (actualDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < -30) {
      return Response.json(
        { success: false, error: "Actual date cannot be more than 30 days before expected date" },
        { status: 400 }
      );
    }

    const result = await updateVendorReliability(
      body.vendorId,
      expectedDate,
      actualDate
    );

    const response: VendorReliabilityResponse = {
      success: true,
      result,
    };

    return Response.json(response);
  } catch (error) {
    console.error("[Vendor Reliability] Error:", error);
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
    { error: "Method not allowed. Use POST to update vendor reliability." },
    { status: 405 }
  );
}
