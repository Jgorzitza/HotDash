/**
 * Actions Test Data Generator for Growth Features
 * Generates AI action scenarios for approval flow testing
 */

export interface ActionExample {
  conversationId: number;
  message: string;
  action: {
    tool: string;
    args: Record<string, unknown>;
    reasoning: string;
  };
  requiresApproval: boolean;
  approvalReason?: string;
}

export interface ActionType {
  type: string;
  description: string;
  examples: ActionExample[];
}

/**
 * Generate product recommendation action
 */
export function generateProductRecommendationAction(convId: number): ActionExample {
  return {
    conversationId: convId,
    message: "I need a fuel pump for my LS swap. Budget around $200.",
    action: {
      tool: "shopify_search_products",
      args: {
        query: "fuel pump LS under:200",
        limit: 3,
      },
      reasoning: "Customer needs budget-conscious fuel pump recommendation for LS application",
    },
    requiresApproval: false,
  };
}

/**
 * Generate order lookup action
 */
export function generateOrderLookupAction(convId: number): ActionExample {
  const orderId = Math.floor(Math.random() * 9000) + 1000;
  
  return {
    conversationId: convId,
    message: `Where is my order #${orderId}?`,
    action: {
      tool: "shopify_get_order",
      args: {
        orderId: `gid://shopify/Order/${orderId}`,
      },
      reasoning: "Customer requesting order status update",
    },
    requiresApproval: true,
    approvalReason: "Accessing customer order data requires operator approval",
  };
}

/**
 * Generate technical guidance action
 */
export function generateTechnicalGuidanceAction(convId: number): ActionExample {
  return {
    conversationId: convId,
    message: "How do I install AN fittings correctly? Do they need sealant?",
    action: {
      tool: "query_support",
      args: {
        query: "AN fitting installation procedure metal seal no teflon tape",
      },
      reasoning: "Customer needs installation guidance from knowledge base",
    },
    requiresApproval: false,
  };
}

/**
 * Generate price quote action
 */
export function generatePriceQuoteAction(convId: number): ActionExample {
  return {
    conversationId: convId,
    message: "How much for a complete twin turbo fuel system with dual A1000 pumps?",
    action: {
      tool: "shopify_calculate_bundle_price",
      args: {
        items: [
          "aeromotive-a1000-dual-pump",
          "an8-ptfe-feed-line-20ft",
          "an6-ptfe-return-line-15ft",
          "adjustable-regulator-boost-ref",
          "inline-fuel-filters-an8",
        ],
      },
      reasoning: "Customer requesting pricing for custom high-performance fuel system build",
    },
    requiresApproval: true,
    approvalReason: "Custom pricing quotes require operator review and approval",
  };
}

/**
 * Generate inventory check action
 */
export function generateInventoryCheckAction(convId: number): ActionExample {
  return {
    conversationId: convId,
    message: "Is the Walbro 255 pump in stock? I need it by Friday.",
    action: {
      tool: "shopify_check_inventory",
      args: {
        sku: "WALBRO-GCA758-KIT",
      },
      reasoning: "Customer asking about product availability with time constraint",
    },
    requiresApproval: false,
  };
}

/**
 * Generate escalation action
 */
export function generateEscalationAction(convId: number): ActionExample {
  return {
    conversationId: convId,
    message: "I received the wrong fittings and my build is on hold! I need this resolved ASAP!",
    action: {
      tool: "chatwoot_escalate_conversation",
      args: {
        conversationId: convId,
        reason: "Wrong parts shipped, customer project delayed, urgent resolution needed",
        priority: "high",
      },
      reasoning: "Order fulfillment error requiring immediate human intervention",
    },
    requiresApproval: true,
    approvalReason: "Customer service escalation with order issue requires operator handling",
  };
}

/**
 * Generate all action type examples
 */
export function generateAllActionTypes(): ActionType[] {
  return [
    {
      type: "product_recommendation",
      description: "AI recommends specific products based on customer needs",
      examples: [generateProductRecommendationAction(1001), generateProductRecommendationAction(1002)],
    },
    {
      type: "order_lookup",
      description: "AI looks up customer order status",
      examples: [generateOrderLookupAction(2001), generateOrderLookupAction(2002)],
    },
    {
      type: "technical_guidance",
      description: "AI provides installation or technical help",
      examples: [generateTechnicalGuidanceAction(3001), generateTechnicalGuidanceAction(3002)],
    },
    {
      type: "price_quote",
      description: "AI provides pricing for custom configurations",
      examples: [generatePriceQuoteAction(4001)],
    },
    {
      type: "inventory_check",
      description: "AI checks product availability",
      examples: [generateInventoryCheckAction(5001)],
    },
    {
      type: "escalation",
      description: "AI escalates complex issues to human operator",
      examples: [generateEscalationAction(6001), generateEscalationAction(6002)],
    },
  ];
}

/**
 * Generate approval queue test data
 */
export interface ApprovalQueueItem {
  id: string;
  conversationId: number;
  createdAt: string;
  pending: Array<{
    agent: string;
    tool: string;
    args: Record<string, unknown>;
  }>;
}

export function generateApprovalQueue(count: number = 5): ApprovalQueueItem[] {
  const queue: ApprovalQueueItem[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    const convId = 7000 + i;
    const actionType = i % 3; // Rotate through action types

    let tool = "shopify_get_order";
    let args: Record<string, unknown> = { orderId: `gid://shopify/Order/${2000 + i}` };

    if (actionType === 1) {
      tool = "shopify_calculate_bundle_price";
      args = { items: ["product-a", "product-b"] };
    } else if (actionType === 2) {
      tool = "chatwoot_escalate_conversation";
      args = { conversationId: convId, reason: "Customer issue", priority: "high" };
    }

    queue.push({
      id: `approval-${7000 + i}`,
      conversationId: convId,
      createdAt: new Date(baseTime - i * 600000).toISOString(), // Stagger by 10 min
      pending: [
        {
          agent: "AI Agent",
          tool,
          args,
        },
      ],
    });
  }

  return queue;
}

