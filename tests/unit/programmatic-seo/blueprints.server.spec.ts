import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

afterEach(() => {
  process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_KEY = ORIGINAL_SUPABASE_KEY;
  vi.resetModules();
});

function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const promise = Promise.resolve(result);
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };

  return builder;
}

describe("listProgrammaticBlueprints", () => {
  it("returns fallback when Supabase credentials are missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;

    const { listProgrammaticBlueprints } = await import(
      "~/services/programmatic-seo/blueprints.server"
    );
    const { __setSupabaseProgrammaticClientOverride } = await import(
      "~/services/programmatic-seo/supabase.server"
    );

    __setSupabaseProgrammaticClientOverride(null);

    const result = await listProgrammaticBlueprints();

    expect(result.blueprints).toHaveLength(0);
    expect(result.fallbackReason).toContain("Supabase");
  });

  it("returns parsed blueprints when Supabase responds successfully", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.test";
    process.env.SUPABASE_SERVICE_KEY = "service-key";

    const row = {
      id: "3a32f5d7-6f81-4cc5-9e6c-d3c7071f0f87",
      blueprint_slug: "ram-1500-2022",
      metaobject_type: "landing_page" as const,
      title: "2022 Ram 1500 Performance Kit",
      status: "draft" as const,
      primary_topic: { make: "Ram", model: "1500", year: 2022 },
      preview_path: "/preview/l/ram-1500-2022",
      production_path: null,
      hero_content: { headline: "Unlock performance" },
      structured_payload: { faq: [] },
      generation_notes: "Initial ingest",
      last_generated_at: "2025-10-18T16:00:00Z",
      created_at: "2025-10-18T15:00:00Z",
      updated_at: "2025-10-18T17:00:00Z",
    };

    const queryBuilder = createQueryBuilder({ data: [row], error: null });

    const fromMock = vi.fn(() => queryBuilder);

    const { __setSupabaseProgrammaticClientOverride } = await import(
      "~/services/programmatic-seo/supabase.server"
    );
    __setSupabaseProgrammaticClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const { listProgrammaticBlueprints } = await import(
      "~/services/programmatic-seo/blueprints.server"
    );

    const result = await listProgrammaticBlueprints({ limit: 10 });

    expect(fromMock).toHaveBeenCalledWith("programmatic_seo_blueprints");
    expect(result.fallbackReason).toBeUndefined();
    expect(result.blueprints).toHaveLength(1);
    const [blueprint] = result.blueprints;
    expect(blueprint.slug).toBe("ram-1500-2022");
    expect(blueprint.metaobjectType).toBe("landing_page");
    expect(blueprint.primaryTopic.make).toBe("Ram");
  });
});

describe("getProgrammaticBlueprintDetail", () => {
  it("returns blueprint detail with internal links and generation runs", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.test";
    process.env.SUPABASE_SERVICE_KEY = "service-key";

    const blueprintRow = {
      id: "9ac7bf00-3381-4efb-a9c1-56933b4dad6c",
      blueprint_slug: "ram-1500-2022",
      metaobject_type: "landing_page" as const,
      title: "Ram 1500 2022 Performance Kit",
      status: "ready" as const,
      primary_topic: { make: "Ram" },
      preview_path: "/preview/l/ram-1500-2022",
      production_path: null,
      hero_content: {},
      structured_payload: {},
      generation_notes: null,
      last_generated_at: "2025-10-18T22:11:00Z",
      created_at: "2025-10-18T21:00:00Z",
      updated_at: "2025-10-18T22:12:00Z",
    };

    const internalLinkRows = [
      {
        id: 42,
        blueprint_id: blueprintRow.id,
        target_slug: "ram-1500-2021",
        anchor_text: "See 2021 builds",
        relationship: "related" as const,
        confidence: 0.64,
        created_at: "2025-10-18T22:15:00Z",
      },
    ];

    const generationRunRows = [
      {
        id: 11,
        blueprint_id: blueprintRow.id,
        requested_by: "ai-customer",
        template_version: "v1",
        status: "succeeded" as const,
        run_started_at: "2025-10-18T22:05:00Z",
        run_completed_at: "2025-10-18T22:06:30Z",
        payload: { sections: 8 },
        failure_reason: null,
      },
    ];

    const blueprintQueryBuilder = createQueryBuilder({
      data: [blueprintRow],
      error: null,
    });
    const internalLinksBuilder = createQueryBuilder({
      data: internalLinkRows,
      error: null,
    });
    const generationRunsBuilder = createQueryBuilder({
      data: generationRunRows,
      error: null,
    });

    const fromMock = vi.fn((table: string) => {
      switch (table) {
        case "programmatic_seo_blueprints":
          return blueprintQueryBuilder;
        case "programmatic_seo_internal_links":
          return internalLinksBuilder;
        case "programmatic_seo_generation_runs":
          return generationRunsBuilder;
        default:
          throw new Error(`Unexpected table ${table}`);
      }
    });

    const { __setSupabaseProgrammaticClientOverride } = await import(
      "~/services/programmatic-seo/supabase.server"
    );
    __setSupabaseProgrammaticClientOverride({
      from: fromMock,
    } as unknown as { from: typeof fromMock });

    const { getProgrammaticBlueprintDetail } = await import(
      "~/services/programmatic-seo/blueprints.server"
    );

    const detail = await getProgrammaticBlueprintDetail("ram-1500-2022");

    expect(detail.fallbackReason).toBeUndefined();
    expect(detail.blueprint?.slug).toBe("ram-1500-2022");
    expect(detail.internalLinks).toHaveLength(1);
    expect(detail.internalLinks[0].targetSlug).toBe("ram-1500-2021");
    expect(detail.generationRuns).toHaveLength(1);
    expect(detail.generationRuns[0].status).toBe("succeeded");
  });
});
