import { classify } from "./intent-classifier.server";
import type { Intent } from "./intent-classifier.server";
import type { ConversationMessage } from "../chatwoot/types";
import { logger } from "../../utils/logger.server";

export interface AutoResponseRequest {
  conversationId: number;
  customerMessage: string;
  conversationHistory: ConversationMessage[];
  customerMetadata?: {
    name?: string;
    email?: string;
    orderHistory?: string[];
  };
}

export interface AutoResponseResult {
  conversationId: number;
  proposedResponse: string;
  confidence: number;
  intent: Intent;
  sources: Array<{ title: string; url?: string }>;
  needsApproval: true; // Always true per direction
  shouldAutoRespond: boolean; // True if confidence > threshold
}

const CONFIDENCE_THRESHOLD = 0.85; // Only auto-respond if >85% confidence

/**
 * Auto-Response Engine
 * 
 * Generates contextual responses for customer messages using:
 * 1. Intent classification
 * 2. Knowledge base queries (LlamaIndex MCP)
 * 3. Dynamic data (Shopify orders, inventory)
 * 4. Template rendering with variables
 * 
 * ALL responses require CEO approval (needsApproval: true)
 */
export class AutoResponder {
  /**
   * Process incoming customer message and generate response
   */
  async processTicket(request: AutoResponseRequest): Promise<AutoResponseResult> {
    const { conversationId, customerMessage, conversationHistory, customerMetadata } = request;

    logger.info("Processing ticket for auto-response", {
      conversationId,
      messagePreview: customerMessage.substring(0, 100),
    });

    // Step 1: Classify intent
    const intent = classify(customerMessage, conversationHistory);

    logger.debug("Intent classified", {
      conversationId,
      category: intent.category,
      confidence: intent.confidence,
      sentiment: intent.sentiment,
      urgency: intent.urgency,
    });

    // Step 2: Determine if we should attempt auto-response
    const shouldAutoRespond = 
      intent.confidence >= CONFIDENCE_THRESHOLD &&
      intent.sentiment !== "negative" &&
      intent.category !== "complaint" &&
      intent.category !== "technical";

    if (!shouldAutoRespond) {
      logger.info("Auto-response not recommended - routing to human", {
        conversationId,
        reason: intent.confidence < CONFIDENCE_THRESHOLD 
          ? "low_confidence" 
          : intent.sentiment === "negative" 
          ? "negative_sentiment"
          : "complex_category",
      });

      return {
        conversationId,
        proposedResponse: "", // Empty = human only
        confidence: intent.confidence,
        intent,
        sources: [],
        needsApproval: true,
        shouldAutoRespond: false,
      };
    }

    // Step 3: Generate response based on intent
    const { response, sources } = await this.generateResponse(
      intent,
      customerMessage,
      customerMetadata
    );

    logger.info("Auto-response generated", {
      conversationId,
      intent: intent.category,
      confidence: intent.confidence,
      sourceCount: sources.length,
      responseLength: response.length,
    });

    return {
      conversationId,
      proposedResponse: response,
      confidence: intent.confidence,
      intent,
      sources,
      needsApproval: true, // CEO approves ALL
      shouldAutoRespond: true,
    };
  }

  /**
   * Generate response based on intent category
   * 
   * TODO: Integrate LlamaIndex MCP for knowledge base queries
   * TODO: Integrate Shopify MCP for order/product data
   */
  private async generateResponse(
    intent: Intent,
    customerMessage: string,
    customerMetadata?: { name?: string; email?: string }
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    const customerName = customerMetadata?.name || "there";

    switch (intent.category) {
      case "order_status":
        return this.generateOrderStatusResponse(intent, customerName);

      case "shipping_info":
        return this.generateShippingInfoResponse(intent, customerName);

      case "return_policy":
        return this.generateReturnPolicyResponse(customerName);

      case "product_availability":
        return this.generateProductAvailabilityResponse(intent, customerName);

      case "faq":
        return this.generateFaqResponse(customerMessage, customerName);

      case "product_fit":
        return this.generateProductFitResponse(intent, customerName);

      case "installation":
        return this.generateInstallationResponse(intent, customerName);

      default:
        return this.generateGenericResponse(customerName);
    }
  }

  private async generateOrderStatusResponse(
    intent: Intent,
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // TODO: Query Shopify for actual order status
    const orderNumber = intent.entities.orderNumber;

    if (orderNumber) {
      // TODO: Replace with actual Shopify query
      const response = `Hi ${customerName}, I'm looking up order #${orderNumber} now. I'll have your tracking information shortly.`;
      
      return {
        response,
        sources: [{ title: "Order Tracking Guide", url: "/support/order-tracking" }],
      };
    }

    const response = `Hi ${customerName}, I'd be happy to check on your order. Could you provide your order number? It's in your confirmation email.`;
    
    return {
      response,
      sources: [{ title: "How to Find Your Order Number" }],
    };
  }

  private async generateShippingInfoResponse(
    intent: Intent,
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // TODO: Query knowledge base (data/support/shipping-policy.md)
    const response = `Hi ${customerName}, shipping is free on orders over $75. We offer standard (3-7 days), expedited (2 days), and overnight shipping. International shipping is available for most countries. What shipping method works best for you?`;

    return {
      response,
      sources: [
        { title: "Shipping Policy", url: "/support/shipping-policy" },
        { title: "International Shipping", url: "/support/shipping-policy#international" },
      ],
    };
  }

  private async generateReturnPolicyResponse(
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // TODO: Query knowledge base (data/support/refund-policy.md)
    const response = `Hi ${customerName}, we offer a 30-day return policy on unused items in original packaging. There's a 15% restocking fee on non-defective returns. Defective items can be exchanged at no cost. Would you like to start a return?`;

    return {
      response,
      sources: [
        { title: "Return Policy", url: "/support/refund-policy" },
        { title: "Exchange Process", url: "/support/exchange-process" },
      ],
    };
  }

  private async generateProductAvailabilityResponse(
    intent: Intent,
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // TODO: Query Shopify inventory
    const productName = intent.entities.productName || "that item";
    const response = `Hi ${customerName}, let me check availability for ${productName}. I'll have an update for you shortly.`;

    return {
      response,
      sources: [],
    };
  }

  private async generateFaqResponse(
    customerMessage: string,
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // TODO: Query FAQ knowledge base
    const response = `Hi ${customerName}, thanks for reaching out. You can contact us at customer.support@hotrodan.com or via this chat. Our hours are 9 AM - 5 PM EST, Monday-Friday. How can I help you today?`;

    return {
      response,
      sources: [{ title: "Contact Information", url: "/support/contact" }],
    };
  }

  private async generateProductFitResponse(
    intent: Intent,
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // Medium confidence - route to human but provide helpful context
    const response = `Hi ${customerName}, fitment questions are important to get right. Could you tell me your vehicle year, make, model, and engine? I'll verify compatibility and make sure you get the right part.`;

    return {
      response,
      sources: [{ title: "Fitment Verification Guide" }],
    };
  }

  private async generateInstallationResponse(
    intent: Intent,
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    // TODO: Query installation guides
    const response = `Hi ${customerName}, I can help with installation guidance. What specific part are you installing? I'll find the installation guide and torque specifications for you.`;

    return {
      response,
      sources: [{ title: "Installation Guides" }],
    };
  }

  private async generateGenericResponse(
    customerName: string
  ): Promise<{ response: string; sources: Array<{ title: string; url?: string }> }> {
    const response = `Hi ${customerName}, thanks for reaching out. I'm reviewing your message now and will get you an answer shortly.`;

    return {
      response,
      sources: [],
    };
  }
}

/**
 * Process a ticket and generate auto-response if confidence is high
 * 
 * CRITICAL: All responses require CEO approval (needsApproval: true)
 */
export async function processTicketForAutoResponse(
  request: AutoResponseRequest
): Promise<AutoResponseResult> {
  const responder = new AutoResponder();
  return responder.processTicket(request);
}

