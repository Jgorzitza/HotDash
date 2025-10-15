export interface Approval {
  id: string;
  conversationId: number;
  createdAt: string;
  pending: {
    agent: string;
    tool: string;
    args: Record<string, any>;
  }[];
}

export const mockApprovals: Approval[] = [
  {
    id: "approval-001",
    conversationId: 12345,
    createdAt: "2025-10-15T14:30:00Z",
    pending: [{
      agent: "ai-customer",
      tool: "chatwoot.reply.fromNote",
      args: {
        conversationId: 12345,
        noteId: "note-789",
        message: "Hi Jamie, thanks for your patience. We're expediting your order update now.",
      },
    }],
  },
  {
    id: "approval-002",
    conversationId: 12346,
    createdAt: "2025-10-15T14:25:00Z",
    pending: [{
      agent: "ai-inventory",
      tool: "supabase.rpc.updateReorderPoint",
      args: {
        sku: "BOARD-XL",
        newRop: 40,
        reason: "Sales velocity increase + lead time adjustment",
      },
    }],
  },
  {
    id: "approval-003",
    conversationId: 12347,
    createdAt: "2025-10-15T14:20:00Z",
    pending: [{
      agent: "ai-growth",
      tool: "social.post.ayrshare",
      args: {
        text: "NEW: Thermal Gloves Pro - 15% off with code WARM15.",
        platforms: ["instagram", "facebook"],
      },
    }],
  },
];

export const mockEmptyApprovals: Approval[] = [];
