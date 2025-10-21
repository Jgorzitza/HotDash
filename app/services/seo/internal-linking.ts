/**
 * Internal Linking Recommendations Service
 *
 * Analyzes internal linking structure and provides recommendations:
 * - Identifies orphan pages (no incoming links)
 * - Suggests relevant links based on content similarity
 * - Calculates page authority based on link graph
 * - Detects over-linked pages
 *
 * @module services/seo/internal-linking
 */

import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";

// ============================================================================
// Types
// ============================================================================

export interface PageLinkProfile {
  url: string;
  incomingLinks: number;
  outgoingLinks: number;
  pageAuthority: number; // 0-100
  isOrphan: boolean;
  isOverLinked: boolean;
  recommendations: LinkRecommendation[];
}

export interface LinkRecommendation {
  type: "add-internal-link" | "remove-excessive-links" | "fix-broken-link" | "add-contextual-link";
  fromPage: string;
  toPage: string;
  reason: string;
  priority: "high" | "medium" | "low";
  anchor: TextSuggestion?;
}

export interface LinkingAnalysis {
  summary: {
    totalPages: number;
    orphanPages: number;
    overLinkedPages: number;
    avgIncomingLinks: number;
    avgOutgoingLinks: number;
    totalInternalLinks: number;
  };
  pages: PageLinkProfile[];
  orphans: PageLinkProfile[];
  topRecommendations: LinkRecommendation[];
  analyzedAt: string;
}

export interface PageContentSimilarity {
  page1: string;
  page2: string;
  similarity: number; // 0-1
  commonKeywords: string[];
}

// ============================================================================
// Constants
// ============================================================================

const ORPHAN_THRESHOLD = 0; // Pages with 0 incoming links
const OVER_LINKED_THRESHOLD = 50; // Pages with 50+ outgoing links
const MIN_PAGE_AUTHORITY = 10;
const SIMILARITY_THRESHOLD = 0.3; // 30% similarity for link suggestions

// ============================================================================
// Link Graph Analysis
// ============================================================================

/**
 * Build link graph from crawled pages
 */
function buildLinkGraph(pages: Array<{ url: string; links: string[] }>): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  // Initialize graph
  pages.forEach(page => {
    if (!graph.has(page.url)) {
      graph.set(page.url, new Set());
    }
  });

  // Add edges
  pages.forEach(page => {
    page.links.forEach(link => {
      if (graph.has(link)) {
        graph.get(link)!.add(page.url);
      }
    });
  });

  return graph;
}

/**
 * Calculate PageRank-style authority score
 * Simplified algorithm: score based on incoming links weighted by source authority
 */
function calculatePageAuthority(
  url: string,
  incomingLinks: Set<string>,
  allPages: Map<string, Set<string>>,
  iterations: number = 5
): number {
  if (incomingLinks.size === 0) return MIN_PAGE_AUTHORITY;

  // Start with base score
  let authority = 50;

  // Iterative calculation (simplified PageRank)
  for (let i = 0; i < iterations; i++) {
    let newAuthority = 0;
    
    incomingLinks.forEach(incomingUrl => {
      const incomingPageLinks = allPages.get(incomingUrl);
      const outgoingCount = incomingPageLinks ? incomingPageLinks.size : 1;
      
      // Each link contributes proportionally
      newAuthority += 100 / Math.max(outgoingCount, 1);
    });

    // Damping factor (0.85)
    authority = (0.85 * newAuthority) + (0.15 * 50);
  }

  // Normalize to 0-100
  return Math.min(100, Math.max(MIN_PAGE_AUTHORITY, Math.round(authority)));
}

// ============================================================================
// Content Similarity
// ============================================================================

/**
 * Calculate content similarity between two pages using keyword overlap
 */
function calculateContentSimilarity(
  content1: string,
  content2: string
): PageContentSimilarity {
  const keywords1 = extractKeywords(content1);
  const keywords2 = extractKeywords(content2);

  // Find common keywords
  const commonKeywords = keywords1.filter(kw => keywords2.includes(kw));
  
  // Jaccard similarity: intersection / union
  const union = new Set([...keywords1, ...keywords2]);
  const similarity = commonKeywords.length / union.size;

  return {
    page1: "",
    page2: "",
    similarity,
    commonKeywords: commonKeywords.slice(0, 5),
  };
}

/**
 * Extract keywords from content (simple tf-idf-like approach)
 */
function extractKeywords(content: string): string[] {
  // Remove HTML and normalize
  const cleanContent = content.replace(/<[^>]*>/g, " ").toLowerCase();
  
  // Extract words
  const words = cleanContent.match(/\b\w{4,}\b/g) || [];
  
  // Remove common stopwords
  const stopwords = new Set(["this", "that", "with", "from", "have", "been", "will", "would", "could", "should"]);
  const filtered = words.filter(w => !stopwords.has(w));

  // Count frequencies
  const freq = new Map<string, number>();
  filtered.forEach(word => {
    freq.set(word, (freq.get(word) || 0) + 1);
  });

  // Get top keywords
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// ============================================================================
// Recommendation Generation
// ============================================================================

/**
 * Generate linking recommendations for a page
 */
function generateLinkingRecommendations(
  page: PageLinkProfile,
  allPages: PageLinkProfile[],
  contentMap: Map<string, string>
): LinkRecommendation[] {
  const recommendations: LinkRecommendation[] = [];

  // Orphan page recommendations
  if (page.isOrphan) {
    // Find similar pages that could link to this orphan
    const pageContent = contentMap.get(page.url) || "";
    
    allPages
      .filter(p => !p.isOrphan && p.url !== page.url)
      .forEach(potentialLinker => {
        const linkerContent = contentMap.get(potentialLinker.url) || "";
        const similarity = calculateContentSimilarity(pageContent, linkerContent);
        
        if (similarity.similarity >= SIMILARITY_THRESHOLD) {
          recommendations.push({
            type: "add-internal-link",
            fromPage: potentialLinker.url,
            toPage: page.url,
            reason: `Add link from related content (${Math.round(similarity.similarity * 100)}% similar). Common topics: ${similarity.commonKeywords.join(", ")}`,
            priority: "high",
            anchorSuggestion: null,
          });
        }
      });
  }

  // Over-linked page recommendations
  if (page.isOverLinked) {
    recommendations.push({
      type: "remove-excessive-links",
      fromPage: page.url,
      toPage: "",
      reason: `Page has ${page.outgoingLinks} outgoing links. Reduce to 20-30 for better link equity distribution.`,
      priority: "medium",
      anchorSuggestion: null,
    });
  }

  // Low authority page recommendations
  if (page.pageAuthority < 30 && !page.isOrphan) {
    const highAuthorityPages = allPages
      .filter(p => p.pageAuthority >= 60 && p.url !== page.url)
      .slice(0, 3);

    highAuthorityPages.forEach(authorityPage => {
      recommendations.push({
        type: "add-contextual-link",
        fromPage: authorityPage.url,
        toPage: page.url,
        reason: `Add contextual link from high-authority page (PA: ${authorityPage.pageAuthority}) to boost this page's authority.`,
        priority: "medium",
        anchorSuggestion: null,
      });
    });
  }

  return recommendations;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze internal linking structure across all pages
 */
export async function analyzeInternalLinking(
  pages: Array<{ url: string; links: string[]; content?: string }>
): Promise<LinkingAnalysis> {
  const startTime = Date.now();

  const cacheKey = `seo:linking:${pages.length}:${pages[0]?.url}`;
  const cached = getCached<LinkingAnalysis>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // Build link graph
    const linkGraph = buildLinkGraph(pages);
    
    // Build content map
    const contentMap = new Map<string, string>();
    pages.forEach(page => {
      if (page.content) {
        contentMap.set(page.url, page.content);
      }
    });

    // Analyze each page
    const pageProfiles: PageLinkProfile[] = pages.map(page => {
      const incomingLinks = linkGraph.get(page.url) || new Set();
      const outgoingLinks = page.links.length;
      const pageAuthority = calculatePageAuthority(page.url, incomingLinks, linkGraph);
      const isOrphan = incomingLinks.size === ORPHAN_THRESHOLD;
      const isOverLinked = outgoingLinks > OVER_LINKED_THRESHOLD;

      return {
        url: page.url,
        incomingLinks: incomingLinks.size,
        outgoingLinks,
        pageAuthority,
        isOrphan,
        isOverLinked,
        recommendations: [],
      };
    });

    // Generate recommendations for each page
    pageProfiles.forEach(profile => {
      profile.recommendations = generateLinkingRecommendations(
        profile,
        pageProfiles,
        contentMap
      );
    });

    // Calculate summary
    const totalInternalLinks = pageProfiles.reduce((sum, p) => sum + p.outgoingLinks, 0);
    const avgIncomingLinks = pageProfiles.reduce((sum, p) => sum + p.incomingLinks, 0) / pageProfiles.length;
    const avgOutgoingLinks = totalInternalLinks / pageProfiles.length;
    const orphanPages = pageProfiles.filter(p => p.isOrphan).length;
    const overLinkedPages = pageProfiles.filter(p => p.isOverLinked).length;

    // Get top recommendations (highest priority)
    const allRecommendations = pageProfiles.flatMap(p => p.recommendations);
    const topRecommendations = allRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10);

    const analysis: LinkingAnalysis = {
      summary: {
        totalPages: pages.length,
        orphanPages,
        overLinkedPages,
        avgIncomingLinks: Math.round(avgIncomingLinks * 10) / 10,
        avgOutgoingLinks: Math.round(avgOutgoingLinks * 10) / 10,
        totalInternalLinks,
      },
      pages: pageProfiles,
      orphans: pageProfiles.filter(p => p.isOrphan),
      topRecommendations,
      analyzedAt: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("analyzeInternalLinking", true, duration);

    // Cache for 6 hours
    setCached(cacheKey, analysis, 21600000);

    return analysis;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("analyzeInternalLinking", false, duration);
    throw error;
  }
}

/**
 * Get linking recommendations for a specific page
 */
export async function getPageLinkingRecommendations(
  url: string,
  allPages: Array<{ url: string; links: string[]; content?: string }>
): Promise<LinkRecommendation[]> {
  const analysis = await analyzeInternalLinking(allPages);
  const pageProfile = analysis.pages.find(p => p.url === url);
  
  return pageProfile?.recommendations || [];
}

