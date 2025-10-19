import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "~/config/supabase.server";
import { isIdeaPoolSupabaseEnabled } from "~/utils/feature-flags.server";
import {
  IdeaPoolItem,
  IdeaPoolResponse,
  IdeaPoolResponseSchema,
} from "./schemas";

const MOCK_ITEMS: IdeaPoolItem[] = [
  {
    id: "mock-1",
    title: "Bundle hot rod detailing kit for Q4 gift season",
    status: "pending_review",
    rationale: "Holiday spikes historically lift bundle attach rate by 18%",
    projectedImpact: "+$4.2k revenue / month",
    priority: "high",
    confidence: 0.7,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    reviewer: "inventory",
  },
  {
    id: "mock-2",
    title: "Upsell ceramic coat add-on in approvals drawer",
    status: "draft",
    rationale: "Operator feedback shows customers ask for premium upsell",
    projectedImpact: "+$1.1k revenue / month",
    priority: "medium",
    confidence: 0.55,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "mock-3",
    title: "Automate reorder trigger for low stock kits",
    status: "approved",
    rationale: "Reduces manual pager duty events and stockouts",
    projectedImpact: "-30% stockouts",
    priority: "high",
    confidence: 0.85,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    reviewer: "manager",
  },
];

interface SupabaseIdeaRow {
  id: string;
  title: string;
  status: IdeaPoolItem["status"];
  rationale: string;
  projected_impact: string;
  priority: IdeaPoolItem["priority"];
  confidence: number | null;
  created_at: string;
  updated_at: string;
  reviewer?: string | null;
}

function summarise(items: IdeaPoolItem[]) {
  const totals = items.reduce(
    (acc, item) => {
      if (item.status === "pending_review") acc.pending += 1;
      if (item.status === "approved") acc.approved += 1;
      if (item.status === "rejected") acc.rejected += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 },
  );

  return { items, totals } as IdeaPoolResponse["data"];
}

function mapRow(row: SupabaseIdeaRow): IdeaPoolItem {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    rationale: row.rationale,
    projectedImpact: row.projected_impact,
    priority: row.priority,
    confidence: row.confidence ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewer: row.reviewer ?? undefined,
  };
}

export async function getIdeaPoolAnalytics(): Promise<IdeaPoolResponse> {
  const timestamp = new Date().toISOString();
  const warnings: string[] = [];

  if (!isIdeaPoolSupabaseEnabled()) {
    return IdeaPoolResponseSchema.parse({
      success: true,
      data: summarise(MOCK_ITEMS),
      source: "mock",
      timestamp,
    });
  }

  const config = getSupabaseConfig();
  if (!config) {
    warnings.push("Supabase credentials missing; returning mock dataset");
    return IdeaPoolResponseSchema.parse({
      success: true,
      data: summarise(MOCK_ITEMS),
      source: "mock",
      warnings,
      timestamp,
    });
  }

  try {
    const client = createClient(config.url, config.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client
      .from<SupabaseIdeaRow>("idea_pool")
      .select(
        "id,title,status,rationale,projected_impact,priority,confidence,created_at,updated_at,reviewer",
      )
      .limit(20)
      .order("created_at", { ascending: false });

    if (error) {
      warnings.push(`Supabase query failed: ${error.message}`);
      return IdeaPoolResponseSchema.parse({
        success: true,
        data: summarise(MOCK_ITEMS),
        source: "mock",
        warnings,
        timestamp,
      });
    }

    const items = (data ?? []).map(mapRow);
    return IdeaPoolResponseSchema.parse({
      success: true,
      data: summarise(items.length > 0 ? items : MOCK_ITEMS),
      source: data && data.length > 0 ? "supabase" : "mock",
      warnings:
        data && data.length > 0
          ? undefined
          : [
              ...warnings,
              "Supabase returned no records; using fallback dataset",
            ].filter(Boolean),
      timestamp,
    });
  } catch (error: any) {
    warnings.push(`Supabase client error: ${error?.message ?? String(error)}`);
    return IdeaPoolResponseSchema.parse({
      success: true,
      data: summarise(MOCK_ITEMS),
      source: "mock",
      warnings,
      timestamp,
    });
  }
}

export function getMockIdeaPoolItems(): IdeaPoolItem[] {
  return [...MOCK_ITEMS];
}
