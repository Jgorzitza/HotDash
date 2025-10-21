/**
 * API Route: CEO Agent Stats
 *
 * GET /api/ceo-agent/stats
 *
 * Returns CEO AI agent activity stats including:
 * - Actions completed today
 * - Pending approvals
 * - Last action timestamp
 * - Recent activity
 *
 * NOTE: Currently returns mock data. Phase 11 will integrate with real OpenAI SDK backend.
 */

import { type LoaderFunctionArgs } from "react-router";

export interface CEOAgentAction {
  id: string;
  type: "data_analysis" | "report" | "decision" | "query";
  description: string;
  status: "pending" | "approved" | "completed" | "rejected";
  created_at: string;
  completed_at?: string;
}

export interface CEOAgentStatsResponse {
  success: boolean;
  data?: {
    actions_today: number;
    pending_approvals: number;
    last_action: string | null;
    recent_actions: CEOAgentAction[];
    source: "mock" | "openai_sdk";
  };
  error?: string;
  timestamp: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(_args: LoaderFunctionArgs) {
  const timestamp = new Date().toISOString();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Mock data - will be replaced in Phase 11 with real OpenAI SDK integration
  const mockActions: CEOAgentAction[] = [
    {
      id: "cea-001",
      type: "data_analysis",
      description: "Analyzed top customer trends for Q4",
      status: "completed",
      created_at: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(today.getTime() + 9.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "cea-002",
      type: "report",
      description: "Generated weekly performance summary",
      status: "pending",
      created_at: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "cea-003",
      type: "decision",
      description: "Reorder recommendation for SKU BOARD-XL",
      status: "pending",
      created_at: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "cea-004",
      type: "query",
      description: "Top customers this month analysis",
      status: "approved",
      created_at: new Date(today.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(today.getTime() + 8.2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const actionsToday = mockActions.filter((a) => {
    const actionDate = new Date(a.created_at);
    return actionDate >= today;
  }).length;

  const pendingApprovals = mockActions.filter((a) => a.status === "pending").length;

  const completedActions = mockActions
    .filter((a) => a.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  const lastAction = completedActions.length > 0 ? completedActions[0].completed_at! : null;

  const response: CEOAgentStatsResponse = {
    success: true,
    data: {
      actions_today: actionsToday,
      pending_approvals: pendingApprovals,
      last_action: lastAction,
      recent_actions: mockActions.slice(0, 5),
      source: "mock",
    },
    timestamp,
  };

  return Response.json(response);
}

