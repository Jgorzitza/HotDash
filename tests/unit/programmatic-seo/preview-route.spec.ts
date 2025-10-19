import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_FLAG = process.env.FEATURE_PROGRAMMATICSEOFACTORY;
const ORIGINAL_TOKEN = process.env.HITL_PREVIEW_TOKEN;

afterEach(() => {
  if (ORIGINAL_FLAG === undefined) {
    delete process.env.FEATURE_PROGRAMMATICSEOFACTORY;
  } else {
    process.env.FEATURE_PROGRAMMATICSEOFACTORY = ORIGINAL_FLAG;
  }

  if (ORIGINAL_TOKEN === undefined) {
    delete process.env.HITL_PREVIEW_TOKEN;
  } else {
    process.env.HITL_PREVIEW_TOKEN = ORIGINAL_TOKEN;
  }

  vi.resetModules();
  vi.clearAllMocks();
});

describe("preview.l.$slug loader", () => {
  it("returns 404 when feature flag is disabled", async () => {
    process.env.FEATURE_PROGRAMMATICSEOFACTORY = "false";
    process.env.HITL_PREVIEW_TOKEN = "secret";

    const { loader } = await import("~/routes/preview.l.$slug");

    const response = await loader({
      request: new Request("https://example.test/preview/l/demo", {
        headers: { "x-hitl-token": "secret" },
      }),
      params: { slug: "demo" },
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it("returns 401 when HITL token is missing", async () => {
    process.env.FEATURE_PROGRAMMATICSEOFACTORY = "true";
    process.env.HITL_PREVIEW_TOKEN = "secret";

    const { loader } = await import("~/routes/preview.l.$slug");

    const response = await loader({
      request: new Request("https://example.test/preview/l/demo"),
      params: { slug: "demo" },
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/HITL token/i);
  });

  it("returns preview payload when blueprint exists", async () => {
    process.env.FEATURE_PROGRAMMATICSEOFACTORY = "true";
    process.env.HITL_PREVIEW_TOKEN = "secret";

    vi.doMock("~/services/programmatic-seo/blueprints.server", () => ({
      getProgrammaticBlueprintDetail: vi.fn(async () => ({
        blueprint: {
          id: "123",
          slug: "ram-1500-2022",
          metaobjectType: "landing_page" as const,
          title: "Ram 1500 2022 Performance Kit",
          status: "ready" as const,
          primaryTopic: { make: "Ram", model: "1500", year: 2022 },
          previewPath: "/preview/l/ram-1500-2022",
          productionPath: null,
          heroContent: { headline: "Unlock performance" },
          structuredPayload: {
            blocks: [
              {
                id: "intro",
                type: "richtext",
                data: { html: "<p>Intro copy</p>" },
              },
            ],
            faqs: [
              {
                question: "What trims are supported?",
                answer: "All Ram 1500 trims from 2020 onward.",
              },
            ],
            products: [
              {
                handle: "ram-1500-kit",
                title: "Ram 1500 Performance Kit",
              },
            ],
            cta: {
              headline: "Get a custom build plan",
              body: "Talk to our pit crew for a data-backed setup.",
              action: {
                label: "Book consultation",
                href: "/contact",
              },
            },
            schema: {
              "@context": "https://schema.org",
              "@type": "Article",
              name: "Ram 1500 Performance Kit",
            },
          },
          generationNotes: "Initial ingest",
          lastGeneratedAt: "2025-10-18T20:00:00Z",
          createdAt: "2025-10-18T19:00:00Z",
          updatedAt: "2025-10-18T20:05:00Z",
        },
        internalLinks: [
          {
            targetSlug: "ram-1500-2021",
            anchorText: "See 2021 builds",
          },
        ],
        generationRuns: [],
        fallbackReason: null,
      })),
    }));

    const { loader } = await import("~/routes/preview.l.$slug");

    const response = await loader({
      request: new Request("https://example.test/preview/l/ram-1500-2022", {
        headers: { "x-hitl-token": "secret" },
      }),
      params: { slug: "ram-1500-2022" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe("ram-1500-2022");
    expect(body.data.sections.hero.title).toBe("Unlock performance");
    expect(body.data.sections.related.links[0].href).toBe("/l/ram-1500-2021");
    expect(body.data.sections.faq[0].question).toMatch(/trims/);
    expect(body.data.sections.productGrid.items[0].handle).toBe("ram-1500-kit");
    expect(body.data.sections.cta.headline).toMatch(/custom build/);
    expect(body.data.structuredData["@type"]).toBe("Article");
  });
});
