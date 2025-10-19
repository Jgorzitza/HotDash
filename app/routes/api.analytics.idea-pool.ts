import { json, type LoaderFunctionArgs } from "@remix-run/node";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { isFeatureEnabled } from "~/config/featureFlags";
import { getSupabaseConfig } from "~/config/supabase.server";

const IDEA_POOL_FLAG = "supabase_idea_pool";
const FIXTURE_PATH = path.resolve(
  process.cwd(),
  "app/fixtures/content/idea-pool.json",
);

type IdeaPoolMetrics = {
  target: string;
  winRate: number;
};

export type IdeaPoolIdea = {
  id: string;
  title: string;
  category: string;
  status: string;
  confidence: number;
  impactScore: number;
  effortScore: number;
  owner: string;
  channels: string[];
  summary: string;
  nextAction: string;
  metrics: IdeaPoolMetrics;
  mocked: boolean;
  createdAt: string;
  updatedAt: string;
};

type IdeaPoolSuccess = {
  success: true;
  timestamp: string;
  data: {
    ideas: IdeaPoolIdea[];
    total: number;
    source: "fixture" | "supabase";
    featureFlagEnabled: boolean;
    fallbackReason?: string;
  };
};

type IdeaPoolFailure = {
  success: false;
  timestamp: string;
  error: string;
  featureFlagEnabled: boolean;
};

type IdeaPoolResponse = IdeaPoolSuccess | IdeaPoolFailure;

let cachedFixture: IdeaPoolIdea[] | null = null;
type IdeaPoolFetchResult = {
  ideas: IdeaPoolIdea[];
  error?: { message?: string } | null;
};

let supabaseFetcherOverride: null | (() => Promise<IdeaPoolFetchResult>) = null;

export function __setIdeaPoolSupabaseFetcher(
  override: typeof supabaseFetcherOverride,
) {
  supabaseFetcherOverride = override;
}

function cloneIdeas(ideas: IdeaPoolIdea[]): IdeaPoolIdea[] {
  return ideas.map((idea) => ({
    ...idea,
    channels: [...idea.channels],
    metrics: { ...idea.metrics },
  }));
}

function loadFixtureIdeas(): IdeaPoolIdea[] {
  if (!cachedFixture) {
    const contents = fs.readFileSync(FIXTURE_PATH, "utf8");
    const parsed = JSON.parse(contents) as { ideas?: IdeaPoolIdea[] };
    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
    cachedFixture = ideas.map((idea) => ({
      ...idea,
      mocked: true,
      channels: Array.isArray(idea.channels) ? idea.channels.map(String) : [],
      metrics: {
        target: idea.metrics?.target ?? "",
        winRate: Number(idea.metrics?.winRate ?? 0),
      },
    }));
  }

  return cloneIdeas(cachedFixture);
}

function toIdea(row: Record<string, unknown>): IdeaPoolIdea {
  const metricsValue = row.metrics as
    | { target?: string; winRate?: number; win_rate?: number }
    | undefined;
  const fallbackTarget =
    typeof (row as Record<string, unknown>).target === "string"
      ? ((row as Record<string, string>).target ?? "")
      : "";
  const fallbackWin = Number(
    (row as Record<string, unknown>).win_rate ??
      (row as Record<string, unknown>).winRate ??
      0,
  );

  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    category: String(row.category ?? "unknown"),
    status: String(row.status ?? "draft"),
    confidence: Number(row.confidence ?? 0),
    impactScore: Number(row.impact_score ?? row.impactScore ?? 0),
    effortScore: Number(row.effort_score ?? row.effortScore ?? 0),
    owner: String(row.owner ?? "unknown"),
    channels: Array.isArray(row.channels)
      ? row.channels.map((channel) => String(channel))
      : [],
    summary: String(row.summary ?? ""),
    nextAction: String(row.next_action ?? row.nextAction ?? ""),
    metrics: {
      target: metricsValue?.target ?? fallbackTarget ?? "",
      winRate: Number(
        metricsValue?.winRate ?? metricsValue?.win_rate ?? fallbackWin ?? 0,
      ),
    },
    mocked: Boolean(row.mocked),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(
      row.updated_at ?? row.created_at ?? new Date().toISOString(),
    ),
  };
}

async function fetchIdeasFromSupabase() {
  if (supabaseFetcherOverride) {
    const overridden = await supabaseFetcherOverride();
    const ideas = Array.isArray(overridden.ideas) ? overridden.ideas : [];
    const error = overridden.error ?? null;
    return { ideas, error };
  }

  const config = getSupabaseConfig();
  if (!config) {
    return {
      ideas: [] as IdeaPoolIdea[],
      error: {
        message: "Supabase credentials missing",
      },
    };
  }

  const client = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await client
    .from("idea_pool")
    .select("*")
    .order("updated_at", { ascending: false });

  const ideas = Array.isArray(data) ? data.map((row) => toIdea(row)) : [];
  return { ideas, error: error ? { message: error.message } : null };
}

function buildSuccess(
  ideas: IdeaPoolIdea[],
  featureFlagEnabled: boolean,
  source: "fixture" | "supabase",
  fallbackReason?: string,
): IdeaPoolSuccess {
  const timestamp = new Date().toISOString();
  return {
    success: true,
    timestamp,
    data: {
      ideas,
      total: ideas.length,
      source,
      featureFlagEnabled,
      ...(fallbackReason ? { fallbackReason } : {}),
    },
  };
}

function buildFailure(
  message: string,
  featureFlagEnabled: boolean,
): IdeaPoolFailure {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: message,
    featureFlagEnabled,
  };
}

export async function loader(_args: LoaderFunctionArgs) {
  void _args;
  const featureFlagEnabled = isFeatureEnabled(IDEA_POOL_FLAG, false);

  if (!featureFlagEnabled) {
    try {
      const ideas = loadFixtureIdeas();
      return json<IdeaPoolResponse>(buildSuccess(ideas, false, "fixture"));
    } catch (error) {
      console.error("[idea-pool] Failed to load fixture", error);
      return json<IdeaPoolResponse>(
        buildFailure(
          error instanceof Error ? error.message : "Failed to load fixture",
          false,
        ),
        { status: 500 },
      );
    }
  }

  try {
    const { ideas, error } = await fetchIdeasFromSupabase();
    if (error) {
      console.warn("[idea-pool] Supabase query failed", error);
      try {
        const fixtureIdeas = loadFixtureIdeas();
        return json<IdeaPoolResponse>(
          buildSuccess(
            fixtureIdeas,
            true,
            "fixture",
            error.message ?? "Supabase query failed",
          ),
        );
      } catch (fixtureError) {
        console.error("[idea-pool] Fixture fallback failed", fixtureError);
        return json<IdeaPoolResponse>(
          buildFailure(
            fixtureError instanceof Error
              ? fixtureError.message
              : "Fixture fallback failed",
            true,
          ),
          { status: 500 },
        );
      }
    }

    return json<IdeaPoolResponse>(buildSuccess(ideas, true, "supabase"));
  } catch (error) {
    console.error("[idea-pool] Unexpected error", error);
    try {
      const fixtureIdeas = loadFixtureIdeas();
      return json<IdeaPoolResponse>(
        buildSuccess(
          fixtureIdeas,
          true,
          "fixture",
          error instanceof Error ? error.message : String(error),
        ),
        { status: 200 },
      );
    } catch (fixtureError) {
      console.error(
        "[idea-pool] Fixture fallback failed after exception",
        fixtureError,
      );
      return json<IdeaPoolResponse>(
        buildFailure(
          fixtureError instanceof Error
            ? fixtureError.message
            : "Fixture fallback failed",
          true,
        ),
        { status: 500 },
      );
    }
  }
}
