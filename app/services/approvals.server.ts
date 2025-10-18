import { createClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Approval } from "~/types/approval";
import { getSupabaseConfig } from "../config/supabase.server";

export type ApprovalFilters = {
  limit?: number;
  offset?: number;
  state?: Approval["state"] | null;
  kind?: Approval["kind"] | null;
};

export interface ApprovalQueryResult {
  approvals: Approval[];
  total: number;
  error?: string;
}

type ApprovalCounts = Partial<Record<Approval["state"], number>>;

const DEFAULT_LIMIT = 50;

function toApproval(row: Record<string, unknown>): Approval {
  return {
    id: String(row.id ?? ""),
    kind: (row.kind as Approval["kind"]) ?? "misc",
    state: (row.state as Approval["state"]) ?? "draft",
    summary: String(row.summary ?? ""),
    created_by: String(row.created_by ?? "unknown"),
    reviewer: row.reviewer ? String(row.reviewer) : undefined,
    evidence: (row.evidence as Approval["evidence"]) ?? {},
    impact: (row.impact as Approval["impact"]) ?? {},
    risk: (row.risk as Approval["risk"]) ?? {},
    rollback: (row.rollback as Approval["rollback"]) ?? {},
    actions: Array.isArray(row.actions)
      ? (row.actions as Approval["actions"])
      : [],
    receipts: Array.isArray(row.receipts)
      ? (row.receipts as Approval["receipts"])
      : [],
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(
      row.updated_at ?? row.created_at ?? new Date().toISOString(),
    ),
    validation_errors: Array.isArray(row.validation_errors)
      ? (row.validation_errors as string[])
      : undefined,
  };
}

function formatError(error?: PostgrestError | null): string | undefined {
  if (!error) return undefined;
  return error.message ?? "Unknown Supabase error";
}

export async function getApprovals(
  filters: ApprovalFilters,
): Promise<ApprovalQueryResult> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      approvals: [],
      total: 0,
      error: "Supabase credentials missing",
    };
  }

  const client = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false },
  });

  const limit = Math.max(1, filters.limit ?? DEFAULT_LIMIT);
  const offset = Math.max(0, filters.offset ?? 0);

  let query = client
    .from("approvals")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.state) {
    query = query.eq("state", filters.state);
  }

  if (filters.kind) {
    query = query.eq("kind", filters.kind);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      approvals: [],
      total: 0,
      error: formatError(error),
    };
  }

  const approvals = Array.isArray(data) ? data.map(toApproval) : [];
  return {
    approvals,
    total: count ?? approvals.length,
  };
}

export async function getApprovalCounts(): Promise<ApprovalCounts> {
  const config = getSupabaseConfig();
  if (!config) {
    return {};
  }

  const client = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await client
    .from("approvals")
    .select("state, count:id");

  if (error || !Array.isArray(data)) {
    return {};
  }

  return data.reduce<ApprovalCounts>((acc, row) => {
    const state = row.state as Approval["state"] | undefined;
    const count = Number((row as Record<string, unknown>)["count"] ?? 0);
    if (state) {
      acc[state] = count;
    }
    return acc;
  }, {});
}
