import { z } from "zod";

import { getSupabaseProgrammaticClient } from "./supabase.server";

const BlueprintStatusEnum = z.enum(["draft", "ready", "approved", "archived"]);

const BlueprintRowSchema = z.object({
  id: z.string().uuid(),
  blueprint_slug: z.string(),
  metaobject_type: z.enum(["landing_page", "comparison", "location_page"]),
  title: z.string(),
  status: BlueprintStatusEnum,
  primary_topic: z.record(z.any()).default({}),
  preview_path: z.string().nullable(),
  production_path: z.string().nullable(),
  hero_content: z.record(z.any()).default({}),
  structured_payload: z.record(z.any()).default({}),
  generation_notes: z.string().nullable(),
  last_generated_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const InternalLinkRowSchema = z.object({
  id: z.number().int().positive(),
  blueprint_id: z.string().uuid(),
  target_slug: z.string(),
  anchor_text: z.string(),
  relationship: z.enum(["related", "upsell", "faq", "supporting"]),
  confidence: z.number().min(0).max(1).nullable().optional(),
  created_at: z.string().datetime(),
});

const GenerationRunRowSchema = z.object({
  id: z.number().int().positive(),
  blueprint_id: z.string().uuid(),
  requested_by: z.string().nullable(),
  template_version: z.string().nullable(),
  status: z.enum(["pending", "succeeded", "failed"]),
  run_started_at: z.string().datetime(),
  run_completed_at: z.string().datetime().nullable(),
  payload: z.record(z.any()).nullable().optional(),
  failure_reason: z.string().nullable(),
});

const BlueprintRowListSchema = z.array(BlueprintRowSchema);
const InternalLinkRowListSchema = z.array(InternalLinkRowSchema);
const GenerationRunRowListSchema = z.array(GenerationRunRowSchema);

export type ProgrammaticSeoBlueprintStatus = z.infer<
  typeof BlueprintStatusEnum
>;

export interface ProgrammaticSeoBlueprint {
  id: string;
  slug: string;
  metaobjectType: "landing_page" | "comparison" | "location_page";
  title: string;
  status: ProgrammaticSeoBlueprintStatus;
  primaryTopic: Record<string, unknown>;
  previewPath: string | null;
  productionPath: string | null;
  heroContent: Record<string, unknown>;
  structuredPayload: Record<string, unknown>;
  generationNotes: string | null;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammaticSeoInternalLink {
  id: number;
  blueprintId: string;
  targetSlug: string;
  anchorText: string;
  relationship: "related" | "upsell" | "faq" | "supporting";
  confidence: number | null | undefined;
  createdAt: string;
}

export interface ProgrammaticSeoGenerationRun {
  id: number;
  blueprintId: string;
  requestedBy: string | null;
  templateVersion: string | null;
  status: "pending" | "succeeded" | "failed";
  startedAt: string;
  completedAt: string | null;
  payload: Record<string, unknown> | null | undefined;
  failureReason: string | null;
}

export interface BlueprintListResult {
  blueprints: ProgrammaticSeoBlueprint[];
  fallbackReason?: string;
}

export interface BlueprintDetailResult {
  blueprint: ProgrammaticSeoBlueprint | null;
  internalLinks: ProgrammaticSeoInternalLink[];
  generationRuns: ProgrammaticSeoGenerationRun[];
  fallbackReason?: string;
}

function mapBlueprintRow(row: z.infer<typeof BlueprintRowSchema>) {
  return {
    id: row.id,
    slug: row.blueprint_slug,
    metaobjectType: row.metaobject_type,
    title: row.title,
    status: row.status,
    primaryTopic: row.primary_topic ?? {},
    previewPath: row.preview_path ?? null,
    productionPath: row.production_path ?? null,
    heroContent: row.hero_content ?? {},
    structuredPayload: row.structured_payload ?? {},
    generationNotes: row.generation_notes ?? null,
    lastGeneratedAt: row.last_generated_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies ProgrammaticSeoBlueprint;
}

function mapInternalLinkRow(
  row: z.infer<typeof InternalLinkRowSchema>,
): ProgrammaticSeoInternalLink {
  return {
    id: row.id,
    blueprintId: row.blueprint_id,
    targetSlug: row.target_slug,
    anchorText: row.anchor_text,
    relationship: row.relationship,
    confidence: row.confidence ?? null,
    createdAt: row.created_at,
  };
}

function mapGenerationRunRow(
  row: z.infer<typeof GenerationRunRowSchema>,
): ProgrammaticSeoGenerationRun {
  return {
    id: row.id,
    blueprintId: row.blueprint_id,
    requestedBy: row.requested_by ?? null,
    templateVersion: row.template_version ?? null,
    status: row.status,
    startedAt: row.run_started_at,
    completedAt: row.run_completed_at ?? null,
    payload: row.payload ?? null,
    failureReason: row.failure_reason ?? null,
  };
}

export async function listProgrammaticBlueprints(options?: {
  status?: ProgrammaticSeoBlueprintStatus;
  limit?: number;
}): Promise<BlueprintListResult> {
  const client = getSupabaseProgrammaticClient();
  if (!client) {
    return {
      blueprints: [],
      fallbackReason: "Supabase credentials missing",
    };
  }

  const limit = Math.max(1, Math.min(options?.limit ?? 25, 200));

  try {
    let query = client
      .from("programmatic_seo_blueprints")
      .select("*")
      .order("updated_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      return {
        blueprints: [],
        fallbackReason: error.message ?? "Supabase query error",
      };
    }

    const parsed = BlueprintRowListSchema.safeParse(data ?? undefined);
    if (!parsed.success) {
      return {
        blueprints: [],
        fallbackReason: "Blueprint payload validation failed",
      };
    }

    const blueprints = parsed.data.map(mapBlueprintRow);

    return {
      blueprints,
      fallbackReason:
        blueprints.length === 0 ? "No blueprints available" : undefined,
    };
  } catch (error) {
    return {
      blueprints: [],
      fallbackReason:
        error instanceof Error ? error.message : "Unknown Supabase error",
    };
  }
}

export async function getProgrammaticBlueprintDetail(slug: string) {
  const client = getSupabaseProgrammaticClient();
  if (!client) {
    return {
      blueprint: null,
      internalLinks: [],
      generationRuns: [],
      fallbackReason: "Supabase credentials missing",
    } satisfies BlueprintDetailResult;
  }

  try {
    const blueprintQuery = client
      .from("programmatic_seo_blueprints")
      .select("*")
      .eq("blueprint_slug", slug)
      .limit(1);

    const { data: blueprintRows, error: blueprintError } = await blueprintQuery;

    if (blueprintError) {
      return {
        blueprint: null,
        internalLinks: [],
        generationRuns: [],
        fallbackReason: blueprintError.message ?? "Supabase query error",
      } satisfies BlueprintDetailResult;
    }

    const parsedBlueprint = BlueprintRowListSchema.safeParse(blueprintRows);
    if (!parsedBlueprint.success || parsedBlueprint.data.length === 0) {
      return {
        blueprint: null,
        internalLinks: [],
        generationRuns: [],
        fallbackReason: "Blueprint not found",
      } satisfies BlueprintDetailResult;
    }

    const [blueprintRow] = parsedBlueprint.data;
    const blueprint = mapBlueprintRow(blueprintRow);

    const internalLinksQuery = client
      .from("programmatic_seo_internal_links")
      .select("*")
      .eq("blueprint_id", blueprint.id)
      .order("created_at", { ascending: false });

    const generationRunsQuery = client
      .from("programmatic_seo_generation_runs")
      .select("*")
      .eq("blueprint_id", blueprint.id)
      .order("run_started_at", { ascending: false })
      .limit(25);

    const [
      { data: internalLinkRows, error: internalLinkError },
      { data: generationRunRows, error: generationRunError },
    ] = await Promise.all([internalLinksQuery, generationRunsQuery]);

    if (internalLinkError) {
      return {
        blueprint,
        internalLinks: [],
        generationRuns: [],
        fallbackReason:
          internalLinkError.message ?? "Failed to load internal links",
      } satisfies BlueprintDetailResult;
    }

    if (generationRunError) {
      return {
        blueprint,
        internalLinks: [],
        generationRuns: [],
        fallbackReason:
          generationRunError.message ?? "Failed to load generation runs",
      } satisfies BlueprintDetailResult;
    }

    const parsedLinks = InternalLinkRowListSchema.safeParse(
      internalLinkRows ?? [],
    );
    const parsedRuns = GenerationRunRowListSchema.safeParse(
      generationRunRows ?? [],
    );

    if (!parsedLinks.success) {
      return {
        blueprint,
        internalLinks: [],
        generationRuns: [],
        fallbackReason: "Internal link payload validation failed",
      } satisfies BlueprintDetailResult;
    }

    if (!parsedRuns.success) {
      return {
        blueprint,
        internalLinks: parsedLinks.data.map(mapInternalLinkRow),
        generationRuns: [],
        fallbackReason: "Generation run payload validation failed",
      } satisfies BlueprintDetailResult;
    }

    return {
      blueprint,
      internalLinks: parsedLinks.data.map(mapInternalLinkRow),
      generationRuns: parsedRuns.data.map(mapGenerationRunRow),
    } satisfies BlueprintDetailResult;
  } catch (error) {
    return {
      blueprint: null,
      internalLinks: [],
      generationRuns: [],
      fallbackReason:
        error instanceof Error ? error.message : "Unknown Supabase error",
    } satisfies BlueprintDetailResult;
  }
}
