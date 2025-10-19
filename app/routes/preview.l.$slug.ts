import { json } from "@remix-run/node";

import { isFeatureEnabled } from "~/config/featureFlags";
import { getProgrammaticBlueprintDetail } from "~/services/programmatic-seo/blueprints.server";
import { validateHitlToken } from "~/utils/hitl.server";

function buildHeroSection(blueprint: {
  title: string;
  primaryTopic: Record<string, unknown>;
  heroContent: Record<string, unknown>;
}) {
  const headline =
    typeof blueprint.heroContent.headline === "string"
      ? blueprint.heroContent.headline
      : blueprint.title;
  const subheadline =
    typeof blueprint.heroContent.subheadline === "string"
      ? blueprint.heroContent.subheadline
      : null;
  const heroImage =
    typeof blueprint.heroContent.image === "string"
      ? blueprint.heroContent.image
      : null;

  return {
    title: headline,
    subtitle: subheadline,
    heroImage,
    context: blueprint.primaryTopic,
  };
}

function mapBlocks(structuredPayload: Record<string, unknown>) {
  const rawBlocks =
    Array.isArray(structuredPayload.blocks) && structuredPayload.blocks.length
      ? structuredPayload.blocks
      : [];

  return rawBlocks.map((block, index) => {
    if (typeof block === "object" && block !== null) {
      const typedBlock = block as Record<string, unknown>;
      return {
        id:
          typeof typedBlock.id === "string" ? typedBlock.id : `block-${index}`,
        type:
          typeof typedBlock.type === "string" ? typedBlock.type : "richtext",
        data:
          typeof typedBlock.data === "object" && typedBlock.data !== null
            ? typedBlock.data
            : typedBlock,
      };
    }

    return {
      id: `block-${index}`,
      type: "richtext",
      data: { value: block },
    };
  });
}

function mapAnchors(structuredPayload: Record<string, unknown>) {
  const rawAnchors =
    Array.isArray(structuredPayload.anchors) && structuredPayload.anchors.length
      ? structuredPayload.anchors
      : [];

  return rawAnchors
    .map((anchor) => {
      if (typeof anchor !== "object" || anchor === null) return null;
      const record = anchor as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : null;
      const label = typeof record.label === "string" ? record.label : null;
      if (!id || !label) return null;
      return { id, label };
    })
    .filter(Boolean) as { id: string; label: string }[];
}

function buildRelatedLinks(
  internalLinks: Array<{
    targetSlug: string;
    anchorText: string;
  }>,
) {
  if (!internalLinks.length) {
    return { links: [], max: 12 };
  }

  const links = internalLinks.slice(0, 12).map((link) => ({
    title: link.anchorText,
    href: `/l/${link.targetSlug}`,
  }));

  return { links, max: 12 };
}

function buildFaqSection(structuredPayload: Record<string, unknown>) {
  const candidates = [
    structuredPayload.faq,
    structuredPayload.faqs,
    structuredPayload.faqItems,
  ];

  const source = candidates.find((value) => Array.isArray(value));
  if (!Array.isArray(source) || source.length === 0) {
    return [] as { question: string; answer: string }[];
  }

  return source
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const question =
        typeof record.question === "string"
          ? record.question
          : typeof record.q === "string"
            ? record.q
            : null;
      const answer =
        typeof record.answer === "string"
          ? record.answer
          : typeof record.a === "string"
            ? record.a
            : null;
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(Boolean) as { question: string; answer: string }[];
}

function buildProductGridSection(structuredPayload: Record<string, unknown>) {
  const candidates = [
    structuredPayload.productGrid,
    structuredPayload.products,
    structuredPayload.relatedProducts,
  ];

  const source = candidates.find((value) => Array.isArray(value));
  if (!Array.isArray(source) || source.length === 0) {
    return { items: [] as Array<Record<string, unknown>>, layout: "grid" };
  }

  const items = source
    .map((item) =>
      typeof item === "object" && item !== null ? (item as Record<string, unknown>) : null,
    )
    .filter(Boolean) as Record<string, unknown>[];

  return {
    items,
    layout:
      typeof structuredPayload.productGridLayout === "string"
        ? structuredPayload.productGridLayout
        : "grid",
  };
}

function buildCtaSection(structuredPayload: Record<string, unknown>) {
  const ctaSource =
    typeof structuredPayload.cta === "object" && structuredPayload.cta !== null
      ? (structuredPayload.cta as Record<string, unknown>)
      : undefined;

  if (!ctaSource) {
    return null;
  }

  const actionValue =
    typeof ctaSource.action === "object" && ctaSource.action !== null
      ? (ctaSource.action as Record<string, unknown>)
      : undefined;

  return {
    headline:
      typeof ctaSource.headline === "string"
        ? ctaSource.headline
        : typeof ctaSource.title === "string"
          ? ctaSource.title
          : null,
    body:
      typeof ctaSource.body === "string"
        ? ctaSource.body
        : typeof ctaSource.copy === "string"
          ? ctaSource.copy
          : null,
    action: actionValue
      ? {
          label:
            typeof actionValue.label === "string"
              ? actionValue.label
              : typeof actionValue.text === "string"
                ? actionValue.text
                : null,
          href:
            typeof actionValue.href === "string"
              ? actionValue.href
              : typeof actionValue.url === "string"
                ? actionValue.url
                : null,
        }
      : null,
  };
}

function extractStructuredData(structuredPayload: Record<string, unknown>) {
  const schemaCandidates = [
    structuredPayload.structuredData,
    structuredPayload.schema,
    structuredPayload.schemaJson,
  ];

  const source = schemaCandidates.find(
    (value) => typeof value === "object" && value !== null,
  );

  if (source && typeof source === "object") {
    return source as Record<string, unknown>;
  }

  if (typeof structuredPayload.schema === "string") {
    try {
      return JSON.parse(structuredPayload.schema);
    } catch {
      return null;
    }
  }

  return null;
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { slug?: string };
}) {
  if (!isFeatureEnabled("programmaticSeoFactory")) {
    return json(
      {
        success: false,
        error: "Programmatic SEO Factory flag disabled",
        timestamp: new Date().toISOString(),
      },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  const tokenValidation = validateHitlToken(request);
  if (!tokenValidation.valid) {
    return json(
      {
        success: false,
        error: tokenValidation.reason ?? "Invalid HITL token",
        timestamp: new Date().toISOString(),
      },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const slug = params.slug?.trim();
  if (!slug) {
    return json(
      {
        success: false,
        error: "Missing preview slug",
        timestamp: new Date().toISOString(),
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const detail = await getProgrammaticBlueprintDetail(slug);

  if (!detail.blueprint) {
    return json(
      {
        success: false,
        error: detail.fallbackReason ?? "Blueprint not found",
        timestamp: new Date().toISOString(),
      },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  const structuredPayload =
    detail.blueprint.structuredPayload ?? ({} as Record<string, unknown>);

  const previewPayload = {
    slug: detail.blueprint.slug,
    meta: {
      title: detail.blueprint.title,
      status: detail.blueprint.status,
      previewPath: detail.blueprint.previewPath,
      productionPath: detail.blueprint.productionPath,
      lastGeneratedAt: detail.blueprint.lastGeneratedAt,
    },
    sections: {
      hero: buildHeroSection(detail.blueprint),
      toc: { anchors: mapAnchors(structuredPayload) },
      blocks: mapBlocks(structuredPayload),
      faq: buildFaqSection(structuredPayload),
      productGrid: buildProductGridSection(structuredPayload),
      cta: buildCtaSection(structuredPayload),
      related: buildRelatedLinks(detail.internalLinks),
    },
    evidenceRef:
      typeof structuredPayload.evidenceRef === "string"
        ? structuredPayload.evidenceRef
        : detail.blueprint.generationNotes,
    structuredData: extractStructuredData(structuredPayload),
  };

  return json(
    {
      success: true,
      data: previewPayload,
      fallbackReason: detail.fallbackReason ?? null,
      timestamp: new Date().toISOString(),
    },
    {
      status: detail.fallbackReason ? 207 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
