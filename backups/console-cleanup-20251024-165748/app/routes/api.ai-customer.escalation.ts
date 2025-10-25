/**
 * API Route: AI-Customer Escalation Detection
 *
 * GET /api/ai-customer/escalation
 *
 * Detects conversations requiring CEO/human escalation based on
 * sentiment analysis, complexity, policy violations, and request types.
 *
 * Query Parameters: None
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-003
 */

import { type LoaderFunctionArgs } from "react-router";
import {
  detectEscalations,
  type EscalationDetectionResult,
} from "../services/ai-customer/escalation";

/**
 * API Response structure
 */
interface EscalationResponse {
  success: boolean;
  data?: EscalationDetectionResult;
  error?: string;
  timestamp: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Get Chatwoot credentials (optional for testing)
    const chatwootUrl = process.env.CHATWOOT_URL;
    const chatwootKey = process.env.CHATWOOT_API_KEY;

    // Detect escalations
    const result = await detectEscalations(
      supabaseUrl,
      supabaseKey,
      chatwootUrl,
      chatwootKey,
    );

    const response: EscalationResponse = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error: any) {
    console.error("[API] Escalation detection error:", error);

    const errorResponse: EscalationResponse = {
      success: false,
      error: error.message || "Failed to detect escalations",
      timestamp: new Date().toISOString(),
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
