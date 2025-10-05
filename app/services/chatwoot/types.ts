import type { DashboardFact } from "@prisma/client";

export interface ChatwootConversation {
  id: number;
  inbox_id: number;
  status: "open" | "pending" | "resolved";
  created_at: number;
  meta?: {
    sender?: { name?: string | null };
    assignee?: { name?: string | null };
  };
  contacts?: Array<{ name?: string | null }>;
  tags?: Array<string>;
}

export interface ChatwootMessage {
  id: number;
  message_type: 0 | 1;
  content: string;
  created_at: number;
}

export interface EscalationConversation {
  id: number;
  inboxId: number;
  status: "open" | "pending" | "resolved";
  customerName: string;
  createdAt: string;
  breachedAt?: string | null;
  lastMessageAt: string;
  slaBreached: boolean;
  tags: string[];
  suggestedReplyId?: string;
  suggestedReply?: string;
  evidenceFactId?: number;
}

export interface EscalationResult {
  data: EscalationConversation[];
  fact: DashboardFact;
  source: "fresh" | "cache";
}
