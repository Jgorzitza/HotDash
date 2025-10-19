/**
 * Keyword Cannibalization Detection
 *
 * Detects when multiple pages compete for the same keywords
 */

import type { SearchConsoleQuery } from "./search-console";

export interface CannibalizationIssue {
  keyword: string;
  type: "organic-vs-organic";
  severity: "critical" | "warning";
  affectedPages: string[];
  recommendation: string;
}

/**
 * Detects multiple organic pages competing for same keyword
 *
 * Analyzes Search Console data to find keywords where multiple pages rank,
 * which dilutes authority and confuses search engines.
 *
 * @param queries - Search Console query data with page dimension
 * @returns Array of cannibalization issues with severity and affected pages
 *
 * @example
 * ```typescript
 * const queries = await fetchSearchConsoleQueries(config, startDate, endDate);
 * const issues = detectOrganicVsOrganicConflicts(queries);
 * // Returns issues where 2+ pages target same keyword
 * ```
 */
export function detectOrganicVsOrganicConflicts(
  queries: SearchConsoleQuery[],
): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = [];
  const keywordMap = new Map<string, SearchConsoleQuery[]>();

  for (const query of queries) {
    const keyword = query.query.toLowerCase();
    if (!keywordMap.has(keyword)) {
      keywordMap.set(keyword, []);
    }
    keywordMap.get(keyword)!.push(query);
  }

  for (const [keyword, pages] of keywordMap.entries()) {
    if (pages.length > 1) {
      issues.push({
        keyword,
        type: "organic-vs-organic",
        severity: pages.length >= 3 ? "critical" : "warning",
        affectedPages: pages.map((p) => p.page),
        recommendation: `${pages.length} pages compete for "${keyword}". Consolidate or differentiate.`,
      });
    }
  }

  return issues;
}
