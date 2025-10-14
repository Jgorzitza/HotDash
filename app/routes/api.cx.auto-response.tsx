import { json } from "react-router";
import type { Route } from "./+types/api.cx.auto-response";
import { processTicketForAutoResponse } from "../services/cx/auto-responder.server";
import type { AutoResponseRequest } from "../services/cx/auto-responder.server";
import { logger } from "../utils/logger.server";

/**
 * Auto-Response API Endpoint
 * 
 * Called by Chatwoot webhook to classify intent and generate responses
 * All responses require CEO approval (needsApproval: true)
 */
export async function action({ request }: Route.ActionArgs) {
  try {
    const body: AutoResponseRequest = await request.json();

    logger.info("Auto-response API called", {
      conversationId: body.conversationId,
      messageLength: body.customerMessage?.length,
    });

    const result = await processTicketForAutoResponse(body);

    logger.info("Auto-response processed", {
      conversationId: result.conversationId,
      intent: result.intent.category,
      confidence: result.confidence,
      shouldAutoRespond: result.shouldAutoRespond,
      needsApproval: result.needsApproval,
    });

    return json(result);
  } catch (error) {
    logger.logError(
      error as Error,
      "api.cx.auto-response",
      undefined,
      { endpoint: "/api/cx/auto-response" }
    );

    return json(
      { error: "Failed to process auto-response", details: (error as Error).message },
      { status: 500 }
    );
  }
}

