/**
 * Task Q: Agent Capability Discovery and Documentation
 */

export interface AgentCapability {
  agent: string;
  capabilities: string[];
  tools: string[];
  handoffs: string[];
  limitations: string[];
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
  {
    agent: "Triage",
    capabilities: ["intent_classification", "routing", "clarification"],
    tools: ["set_intent"],
    handoffs: ["OrderSupport", "ProductQA"],
    limitations: [
      "Cannot answer questions directly",
      "Cannot access order data",
    ],
  },
  {
    agent: "OrderSupport",
    capabilities: [
      "order_lookup",
      "return_processing",
      "refund_handling",
      "tracking",
    ],
    tools: ["shopify_find_orders", "answer_from_docs", "shopify_cancel_order"],
    handoffs: ["Supervisor", "TechnicalSupport"],
    limitations: ["Cannot modify products", "Refunds >$500 need approval"],
  },
  {
    agent: "ProductQA",
    capabilities: [
      "product_info",
      "availability_check",
      "recommendations",
      "specifications",
    ],
    tools: ["answer_from_docs", "product_catalog"],
    handoffs: ["TechnicalSupport"],
    limitations: ["Cannot check order status", "Cannot process returns"],
  },
];

export function discoverCapabilities(query: string): string[] {
  const capableAgents = AGENT_CAPABILITIES.filter((a) =>
    a.capabilities.some((c) =>
      query.toLowerCase().includes(c.replace("_", " ")),
    ),
  );
  return capableAgents.map((a) => a.agent);
}
