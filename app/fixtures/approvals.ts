export interface ApprovalDetail {
  id: string;
  conversationId: number;
  createdAt: string;
  agent: string;
  tool: string;
  args: Record<string, any>;
  evidence: {
    summary: string;
    diffs?: Array<{ path: string; before: string; after: string }>;
    samples?: Array<{ label: string; content: string }>;
    queries?: Array<{ label: string; url: string }>;
    screenshots?: Array<{ label: string; url: string }>;
  };
  projectedImpact: string;
  risks: Array<{ description: string; level: "low" | "medium" | "high" }>;
  rollback: { steps: string[]; estimatedTime?: string };
}

export const mockApprovalDetails: ApprovalDetail[] = [
  {
    id: "approval-001",
    conversationId: 12345,
    createdAt: "2025-10-16T14:30:00Z",
    agent: "ai-customer",
    tool: "send_email",
    args: { to: "customer@example.com", subject: "Order Update", body: "Your order has been shipped\!" },
    evidence: {
      summary: "Customer requested shipping update. Order #7001 shipped via USPS. Tracking: 9400111899562537289417.",
      diffs: [{ path: "email/body", before: "[No email sent]", after: "Hi Jamie, your order #7001 has shipped\! Track it here: https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562537289417" }],
      samples: [{ label: "Customer Message", content: "When will my order ship? I need it by Friday\!" }, { label: "Order Status", content: "Order #7001 - Shipped 2025-10-16 via USPS Priority Mail" }],
      queries: [{ label: "Order Details", url: "https://admin.shopify.com/orders/7001" }, { label: "Tracking Info", url: "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562537289417" }],
    },
    projectedImpact: "Customer will receive tracking info within 5 minutes. Expected delivery: Oct 18. Reduces support tickets by preventing follow-up inquiries.",
    risks: [{ description: "Tracking number may not be active for 24 hours", level: "low" }, { description: "Customer may escalate if delivery is delayed", level: "medium" }],
    rollback: { steps: ["Send follow-up email with apology", "Offer expedited shipping on next order", "Escalate to manager if customer remains unsatisfied"], estimatedTime: "5 minutes" },
  },
];
