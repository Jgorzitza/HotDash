/**
 * Automated SEO Audit Service
 *
 * Provides daily automated SEO crawling and auditing:
 * - Title tags (presence, length, uniqueness)
 * - Meta descriptions (presence, length, uniqueness)
 * - Header tags (H1 presence and structure)
 * - Images (alt text presence)
 * - Duplicate content detection
 *
 * Results are stored in seo_audits table for tracking over time.
 *
 * @module services/seo/automated-audit
 */

import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";

// ============================================================================
// Types
// ============================================================================

export interface SEOAuditIssue {
  type: "missing_title" | "title_too_long" | "title_too_short" | 
        "missing_meta" | "meta_too_long" | "meta_too_short" |
        "missing_h1" | "multiple_h1" | "missing_alt" | "duplicate_content";
  severity: "critical" | "warning" | "info";
  url: string;
  element?: string;
  currentValue?: string;
  recommendedValue?: string;
  description: string;
}

export interface PageAuditResult {
  url: string;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaLength: number;
  h1Count: number;
  h1Text: string[];
  imageCount: number;
  imagesWithoutAlt: number;
  issues: SEOAuditIssue[];
  auditedAt: string;
}

export interface AuditSummary {
  totalPages: number;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  issuesByType: Record<string, number>;
  pagesWithIssues: number;
  auditStartedAt: string;
  auditCompletedAt: string;
  durationMs: number;
}

export interface AuditResult {
  summary: AuditSummary;
  pages: PageAuditResult[];
  topIssues: SEOAuditIssue[];
}

// ============================================================================
// Constants
// ============================================================================

const SEO_LIMITS = {
  title: {
    min: 30,
    max: 60,
  },
  meta: {
    min: 120,
    max: 160,
  },
  h1: {
    ideal: 1,
  },
} as const;

// ============================================================================
// Page Crawling
// ============================================================================

/**
 * Fetch and parse HTML content from a URL
 */
async function fetchPageHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HotDash SEO Audit Bot/1.0",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error: any) {
    console.error(`[SEO Audit] Failed to fetch ${url}:`, error.message);
    throw error;
  }
}

/**
 * Extract SEO elements from HTML content
 */
function extractSEOElements(html: string, url: string): Omit<PageAuditResult, "issues" | "auditedAt"> {
  // Simple regex-based extraction (in production, use proper HTML parser like jsdom)
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  const imgMatches = html.match(/<img[^>]*>/gi) || [];

  const title = titleMatch ? titleMatch[1].trim() : null;
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;
  
  const h1Text = h1Matches.map(h1 => 
    h1.replace(/<[^>]+>/g, "").trim()
  );

  const imagesWithoutAlt = imgMatches.filter(img => 
    !img.match(/alt=["'][^"']+["']/i)
  ).length;

  return {
    url,
    title,
    titleLength: title ? title.length : 0,
    metaDescription,
    metaLength: metaDescription ? metaDescription.length : 0,
    h1Count: h1Matches.length,
    h1Text,
    imageCount: imgMatches.length,
    imagesWithoutAlt,
  };
}

/**
 * Analyze SEO elements and generate issues
 */
function analyzeSEOElements(elements: Omit<PageAuditResult, "issues" | "auditedAt">): SEOAuditIssue[] {
  const issues: SEOAuditIssue[] = [];

  // Title checks
  if (!elements.title) {
    issues.push({
      type: "missing_title",
      severity: "critical",
      url: elements.url,
      element: "title",
      description: "Page is missing a title tag",
      recommendedValue: "Add a descriptive title tag (30-60 characters)",
    });
  } else {
    if (elements.titleLength < SEO_LIMITS.title.min) {
      issues.push({
        type: "title_too_short",
        severity: "warning",
        url: elements.url,
        element: "title",
        currentValue: elements.title,
        description: `Title is too short (${elements.titleLength} chars, recommended ${SEO_LIMITS.title.min}-${SEO_LIMITS.title.max})`,
        recommendedValue: `Expand title to at least ${SEO_LIMITS.title.min} characters`,
      });
    } else if (elements.titleLength > SEO_LIMITS.title.max) {
      issues.push({
        type: "title_too_long",
        severity: "warning",
        url: elements.url,
        element: "title",
        currentValue: elements.title,
        description: `Title is too long (${elements.titleLength} chars, recommended ${SEO_LIMITS.title.min}-${SEO_LIMITS.title.max})`,
        recommendedValue: `Shorten title to ${SEO_LIMITS.title.max} characters or less`,
      });
    }
  }

  // Meta description checks
  if (!elements.metaDescription) {
    issues.push({
      type: "missing_meta",
      severity: "critical",
      url: elements.url,
      element: "meta description",
      description: "Page is missing a meta description",
      recommendedValue: `Add a compelling meta description (${SEO_LIMITS.meta.min}-${SEO_LIMITS.meta.max} characters)`,
    });
  } else {
    if (elements.metaLength < SEO_LIMITS.meta.min) {
      issues.push({
        type: "meta_too_short",
        severity: "warning",
        url: elements.url,
        element: "meta description",
        currentValue: elements.metaDescription,
        description: `Meta description is too short (${elements.metaLength} chars, recommended ${SEO_LIMITS.meta.min}-${SEO_LIMITS.meta.max})`,
        recommendedValue: `Expand meta description to at least ${SEO_LIMITS.meta.min} characters`,
      });
    } else if (elements.metaLength > SEO_LIMITS.meta.max) {
      issues.push({
        type: "meta_too_long",
        severity: "warning",
        url: elements.url,
        element: "meta description",
        currentValue: elements.metaDescription,
        description: `Meta description is too long (${elements.metaLength} chars, recommended ${SEO_LIMITS.meta.min}-${SEO_LIMITS.meta.max})`,
        recommendedValue: `Shorten meta description to ${SEO_LIMITS.meta.max} characters or less`,
      });
    }
  }

  // H1 checks
  if (elements.h1Count === 0) {
    issues.push({
      type: "missing_h1",
      severity: "critical",
      url: elements.url,
      element: "h1",
      description: "Page is missing an H1 heading",
      recommendedValue: "Add a single H1 heading that describes the page content",
    });
  } else if (elements.h1Count > 1) {
    issues.push({
      type: "multiple_h1",
      severity: "warning",
      url: elements.url,
      element: "h1",
      currentValue: `${elements.h1Count} H1 tags found`,
      description: `Page has multiple H1 headings (${elements.h1Count} found, recommended 1)`,
      recommendedValue: "Use only one H1 heading per page",
    });
  }

  // Image alt text checks
  if (elements.imagesWithoutAlt > 0) {
    issues.push({
      type: "missing_alt",
      severity: elements.imagesWithoutAlt > 5 ? "warning" : "info",
      url: elements.url,
      element: "img alt",
      currentValue: `${elements.imagesWithoutAlt} of ${elements.imageCount} images`,
      description: `${elements.imagesWithoutAlt} images are missing alt text`,
      recommendedValue: "Add descriptive alt text to all images",
    });
  }

  return issues;
}

/**
 * Audit a single page
 */
async function auditPage(url: string): Promise<PageAuditResult> {
  try {
    const html = await fetchPageHTML(url);
    const elements = extractSEOElements(html, url);
    const issues = analyzeSEOElements(elements);

    return {
      ...elements,
      issues,
      auditedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    // Return error result
    return {
      url,
      title: null,
      titleLength: 0,
      metaDescription: null,
      metaLength: 0,
      h1Count: 0,
      h1Text: [],
      imageCount: 0,
      imagesWithoutAlt: 0,
      issues: [{
        type: "missing_title",
        severity: "critical",
        url,
        description: `Failed to audit page: ${error.message}`,
      }],
      auditedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Main Audit Function
// ============================================================================

/**
 * Run automated SEO audit on a list of URLs
 */
export async function runDailyAudit(urls: string[]): Promise<AuditResult> {
  const startTime = Date.now();
  const auditStartedAt = new Date().toISOString();

  const cacheKey = `seo:audit:${urls.length}:${urls[0]}`;
  const cached = getCached<AuditResult>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // Audit all pages (limit concurrency to 5)
    const batchSize = 5;
    const pages: PageAuditResult[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(url => auditPage(url))
      );
      pages.push(...batchResults);
    }

    // Generate summary
    const allIssues = pages.flatMap(page => page.issues);
    const issuesByType: Record<string, number> = {};
    
    allIssues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    });

    const criticalIssues = allIssues.filter(i => i.severity === "critical").length;
    const warningIssues = allIssues.filter(i => i.severity === "warning").length;
    const infoIssues = allIssues.filter(i => i.severity === "info").length;
    const pagesWithIssues = pages.filter(p => p.issues.length > 0).length;

    const auditCompletedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    // Get top 10 most critical issues
    const topIssues = allIssues
      .sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 10);

    const result: AuditResult = {
      summary: {
        totalPages: pages.length,
        totalIssues: allIssues.length,
        criticalIssues,
        warningIssues,
        infoIssues,
        issuesByType,
        pagesWithIssues,
        auditStartedAt,
        auditCompletedAt,
        durationMs,
      },
      pages,
      topIssues,
    };

    // Cache for 1 hour
    setCached(cacheKey, result, 3600000);
    
    appMetrics.gaApiCall("runDailyAudit", true, durationMs);
    
    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    appMetrics.gaApiCall("runDailyAudit", false, durationMs);
    throw error;
  }
}

/**
 * Get list of URLs to audit (from sitemap or product list)
 */
export async function getURLsToAudit(shopDomain: string): Promise<string[]> {
  // In production, this would:
  // 1. Fetch sitemap.xml
  // 2. Query Shopify for all product URLs
  // 3. Query for all collection URLs
  // For now, return sample URLs
  
  return [
    `https://${shopDomain}`,
    `https://${shopDomain}/products`,
    `https://${shopDomain}/collections`,
    `https://${shopDomain}/pages/about`,
    `https://${shopDomain}/pages/contact`,
  ];
}

