/**
 * SEO Diagnostics Service
 * Checks title tags, meta descriptions, schema.org markup, Open Graph
 */

import type { SEOAnomaly } from "./anomalies";

export interface SEODiagnosticResult {
  url: string;
  title: {
    present: boolean;
    length: number;
    content: string;
    issues: string[];
  };
  metaDescription: {
    present: boolean;
    length: number;
    content: string;
    issues: string[];
  };
  schema: {
    present: boolean;
    types: string[];
    valid: boolean;
    issues: string[];
  };
  openGraph: {
    present: boolean;
    imagePresent: boolean;
    titlePresent: boolean;
    issues: string[];
  };
  score: number; // 0-100
}

export function buildSeoDiagnostics(bundle: {
  anomalies: {
    all: SEOAnomaly[];
  };
}) {
  const totals = bundle.anomalies.all.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) as number;
      acc[a.severity] += 1;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 } as Record<string, number>,
  );
  return { totals };
}

/**
 * Diagnose SEO issues for a page
 */
export function diagnosePage(html: string, url: string): SEODiagnosticResult {
  let score = 100;

  // Check title tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = {
    present: !!titleMatch,
    length: titleMatch ? titleMatch[1].trim().length : 0,
    content: titleMatch ? titleMatch[1].trim() : "",
    issues: [] as string[],
  };

  if (!title.present) {
    title.issues.push("Missing title tag");
    score -= 20;
  } else if (title.length < 30 || title.length > 60) {
    title.issues.push(`Title length ${title.length} (recommend 30-60 chars)`);
    score -= 10;
  }

  // Check meta description
  const metaMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
  );
  const metaDescription = {
    present: !!metaMatch,
    length: metaMatch ? metaMatch[1].trim().length : 0,
    content: metaMatch ? metaMatch[1].trim() : "",
    issues: [] as string[],
  };

  if (!metaDescription.present) {
    metaDescription.issues.push("Missing meta description");
    score -= 15;
  } else if (metaDescription.length < 120 || metaDescription.length > 160) {
    metaDescription.issues.push(
      `Meta description length ${metaDescription.length} (recommend 120-160 chars)`,
    );
    score -= 8;
  }

  // Check schema.org
  const schemaMatches = html.matchAll(
    /<script\s+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis,
  );
  const schemas = Array.from(schemaMatches);
  const schema = {
    present: schemas.length > 0,
    types: [] as string[],
    valid: true,
    issues: [] as string[],
  };

  if (!schema.present) {
    schema.issues.push("No schema.org markup found");
    score -= 15;
  } else {
    for (const match of schemas) {
      try {
        const parsed = JSON.parse(match[1].trim());
        schema.types.push(parsed["@type"] || "Unknown");
      } catch {
        schema.valid = false;
        schema.issues.push("Invalid JSON-LD");
        score -= 10;
      }
    }
  }

  // Check Open Graph
  const ogImage = html.match(
    /<meta\s+property=["']og:image["']\s+content=["'].*?["']/i,
  );
  const ogTitle = html.match(
    /<meta\s+property=["']og:title["']\s+content=["'].*?["']/i,
  );
  const openGraph = {
    present: !!(ogImage || ogTitle),
    imagePresent: !!ogImage,
    titlePresent: !!ogTitle,
    issues: [] as string[],
  };

  if (!openGraph.imagePresent) {
    openGraph.issues.push("Missing og:image");
    score -= 5;
  }
  if (!openGraph.titlePresent) {
    openGraph.issues.push("Missing og:title");
    score -= 5;
  }

  return {
    url,
    title,
    metaDescription,
    schema,
    openGraph,
    score: Math.max(0, score),
  };
}
