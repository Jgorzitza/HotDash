/**
 * Chatwoot Message Processing Pipeline
 *
 * Parses incoming messages, extracts intent, and routes to AI-Customer agent
 */

import { logger } from "../../utils/logger.server";
import { getChatwootClient } from "./chatwoot-client";

export interface ProcessedMessage {
  conversationId: number;
  messageId: number;
  content: string;
  messageType: "incoming" | "outgoing";
  intent: MessageIntent;
  routed: boolean;
  routedTo?: string;
}

export interface MessageIntent {
  category:
    | "general"
    | "urgent"
    | "billing"
    | "shipping"
    | "returns"
    | "product_question";
  confidence: number;
  keywords: string[];
  requiresImmediate: boolean;
}

/**
 * Extract intent from message content using keyword matching
 */
function extractIntent(content: string): MessageIntent {
  const lowerContent = content.toLowerCase();
  const keywords: string[] = [];
  let category: MessageIntent["category"] = "general";
  let confidence = 0.5;
  let requiresImmediate = false;

  // Urgent keywords
  const urgentTerms = [
    "urgent",
    "asap",
    "immediately",
    "emergency",
    "help",
    "issue",
    "problem",
  ];
  if (urgentTerms.some((term) => lowerContent.includes(term))) {
    keywords.push(...urgentTerms.filter((term) => lowerContent.includes(term)));
    category = "urgent";
    confidence = 0.9;
    requiresImmediate = true;
  }

  // Billing keywords
  const billingTerms = [
    "payment",
    "charge",
    "invoice",
    "refund",
    "billing",
    "credit card",
  ];
  if (billingTerms.some((term) => lowerContent.includes(term))) {
    keywords.push(
      ...billingTerms.filter((term) => lowerContent.includes(term)),
    );
    if (category === "general") {
      category = "billing";
      confidence = 0.8;
    }
  }

  // Shipping keywords
  const shippingTerms = [
    "shipping",
    "tracking",
    "delivery",
    "shipped",
    "package",
    "arrive",
  ];
  if (shippingTerms.some((term) => lowerContent.includes(term))) {
    keywords.push(
      ...shippingTerms.filter((term) => lowerContent.includes(term)),
    );
    if (category === "general") {
      category = "shipping";
      confidence = 0.8;
    }
  }

  // Returns keywords
  const returnTerms = [
    "return",
    "exchange",
    "refund",
    "send back",
    "wrong item",
  ];
  if (returnTerms.some((term) => lowerContent.includes(term))) {
    keywords.push(...returnTerms.filter((term) => lowerContent.includes(term)));
    if (category === "general") {
      category = "returns";
      confidence = 0.8;
    }
  }

  // Product question keywords
  const productTerms = [
    "size",
    "fit",
    "color",
    "available",
    "stock",
    "material",
    "specs",
  ];
  if (productTerms.some((term) => lowerContent.includes(term))) {
    keywords.push(
      ...productTerms.filter((term) => lowerContent.includes(term)),
    );
    if (category === "general") {
      category = "product_question";
      confidence = 0.7;
    }
  }

  return {
    category,
    confidence,
    keywords,
    requiresImmediate,
  };
}

/**
 * Process Chatwoot message and route to AI-Customer agent
 *
 * @param payload - Chatwoot webhook payload
 * @returns Processing result
 */
export async function processMessage(payload: any): Promise<ProcessedMessage> {
  const conversationId = payload.conversation?.id;
  const messageId = payload.id;
  const content = payload.content || "";
  const messageType = payload.message_type === 0 ? "incoming" : "outgoing";

  logger.info("[message-processor] Processing message", {
    conversationId,
    messageId,
    messageType,
    contentLength: content.length,
  });

  // Only process incoming messages from customers
  if (messageType !== "incoming") {
    logger.debug("[message-processor] Skipping outgoing message");
    return {
      conversationId,
      messageId,
      content,
      messageType,
      intent: {
        category: "general",
        confidence: 0,
        keywords: [],
        requiresImmediate: false,
      },
      routed: false,
    };
  }

  // Extract intent
  const intent = extractIntent(content);

  logger.info("[message-processor] Intent extracted", {
    conversationId,
    category: intent.category,
    confidence: intent.confidence,
    requiresImmediate: intent.requiresImmediate,
  });

  // Route to AI-Customer agent for draft generation
  // This would trigger the Agent SDK to generate a draft response
  // For now, we log that routing would occur
  const shouldRoute = intent.confidence > 0.6;

  if (shouldRoute) {
    logger.info("[message-processor] Routing to AI-Customer agent", {
      conversationId,
      intent: intent.category,
    });

    // Future: Trigger AI-Customer agent via Agent SDK
    // The Agent SDK webhook handler will handle this
    // For now, we've already forwarded the webhook in webhook-retry.ts
  }

  return {
    conversationId,
    messageId,
    content,
    messageType,
    intent,
    routed: shouldRoute,
    routedTo: shouldRoute ? "ai-customer" : undefined,
  };
}

/**
 * Batch process multiple messages
 */
export async function processMessageBatch(
  payloads: any[],
): Promise<ProcessedMessage[]> {
  logger.info("[message-processor] Processing batch", {
    count: payloads.length,
  });

  const results = await Promise.allSettled(
    payloads.map((payload) => processMessage(payload)),
  );

  const processed: ProcessedMessage[] = [];
  const errors: any[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      processed.push(result.value);
    } else {
      errors.push({
        index,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  if (errors.length > 0) {
    logger.error("[message-processor] Batch processing errors", {
      errorCount: errors.length,
      errors,
    });
  }

  return processed;
}
