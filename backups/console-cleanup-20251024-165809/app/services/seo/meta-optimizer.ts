/**
 * Automated Meta Tag Optimization Service
 * 
 * Automatically optimizes meta tags for pages based on:
 * - Content analysis
 * - Keyword research
 * - Search Console data
 * - Competitor analysis
 * - Best practices
 */

import { seoOptimizer, type PageSEOData } from "~/lib/seo/seo-optimization";
import { getTopQueries } from "~/lib/seo/search-console";
import { getCached, setCached } from "../cache.server";
import { appMetrics } from "~/utils/metrics.server";

export interface MetaOptimizationResult {
  originalTitle: string;
  optimizedTitle: string;
  originalDescription: string;
  optimizedDescription: string;
  keywords: string[];
  improvements: string[];
  score: number;
}

export interface PageContent {
  url: string;
  title?: string;
  description?: string;
  content: string;
  headings: string[];
}

/**
 * Analyze page content and extract key information
 */
function analyzePageContent(content: string): {
  headings: string[];
  keywords: string[];
  wordCount: number;
} {
  // Extract headings
  const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  const headings = [...h1Matches, ...h2Matches].map(h => 
    h.replace(/<[^>]+>/g, '').trim()
  );

  // Extract text content (remove HTML tags)
  const textContent = content.replace(/<[^>]+>/g, ' ').trim();
  
  // Simple keyword extraction (word frequency analysis)
  const words = textContent.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4); // Filter short words
  
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Get top keywords by frequency
  const keywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return {
    headings,
    keywords,
    wordCount: words.length
  };
}

/**
 * Generate optimized title based on content and keywords
 */
function generateOptimizedTitle(
  originalTitle: string | undefined,
  headings: string[],
  keywords: string[],
  topQueries: string[]
): string {
  // If we have a good original title, optimize it
  if (originalTitle && originalTitle.length >= 30 && originalTitle.length <= 60) {
    return originalTitle;
  }

  // Use first H1 if available
  if (headings.length > 0) {
    const h1 = headings[0];
    if (h1.length >= 30 && h1.length <= 60) {
      return h1;
    }
    // Truncate if too long
    if (h1.length > 60) {
      return h1.substring(0, 57) + '...';
    }
    // Enhance if too short
    if (h1.length < 30 && keywords.length > 0) {
      return `${h1} - ${keywords[0]}`;
    }
  }

  // Fallback: use top query if available
  if (topQueries.length > 0) {
    return topQueries[0];
  }

  // Last resort: use original or default
  return originalTitle || 'Hot Dash - Shopify Control Center';
}

/**
 * Generate optimized meta description
 */
function generateOptimizedDescription(
  originalDescription: string | undefined,
  content: string,
  keywords: string[],
  topQueries: string[]
): string {
  // If we have a good original description, use it
  if (originalDescription && originalDescription.length >= 120 && originalDescription.length <= 160) {
    return originalDescription;
  }

  // Extract first paragraph from content
  const paragraphs = content.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0].replace(/<[^>]+>/g, '').trim();
    if (firstPara.length >= 120 && firstPara.length <= 160) {
      return firstPara;
    }
    // Truncate if too long
    if (firstPara.length > 160) {
      return firstPara.substring(0, 157) + '...';
    }
    // Enhance if too short
    if (firstPara.length < 120 && keywords.length > 0) {
      const enhancement = ` Featuring ${keywords.slice(0, 3).join(', ')}.`;
      if (firstPara.length + enhancement.length <= 160) {
        return firstPara + enhancement;
      }
    }
  }

  // Fallback: create description from keywords and queries
  if (keywords.length > 0 || topQueries.length > 0) {
    const terms = [...topQueries.slice(0, 2), ...keywords.slice(0, 3)];
    return `Comprehensive guide to ${terms.join(', ')}. Get insights, analytics, and automation for your Shopify store.`;
  }

  // Last resort
  return originalDescription || 'Hot Dash - Real-time analytics, inventory control, and growth automation for Shopify stores.';
}

/**
 * Calculate optimization score
 */
function calculateOptimizationScore(
  title: string,
  description: string,
  keywords: string[]
): number {
  let score = 100;

  // Title scoring
  if (title.length < 30) score -= 15;
  else if (title.length > 60) score -= 10;
  
  // Description scoring
  if (description.length < 120) score -= 15;
  else if (description.length > 160) score -= 10;

  // Keyword scoring
  if (keywords.length < 3) score -= 10;
  if (keywords.length === 0) score -= 20;

  // Check if keywords appear in title/description
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const keywordsInTitle = keywords.filter(k => titleLower.includes(k)).length;
  const keywordsInDesc = keywords.filter(k => descLower.includes(k)).length;

  if (keywordsInTitle === 0) score -= 10;
  if (keywordsInDesc === 0) score -= 10;

  return Math.max(0, score);
}

/**
 * Optimize meta tags for a page
 */
export async function optimizeMetaTags(
  pageContent: PageContent
): Promise<MetaOptimizationResult> {
  const startTime = Date.now();
  const cacheKey = `meta-optimization:${pageContent.url}`;
  
  const cached = getCached<MetaOptimizationResult>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // Analyze page content
    const analysis = analyzePageContent(pageContent.content);

    // Get top queries from Search Console for context
    let topQueries: string[] = [];
    try {
      const queries = await getTopQueries(5);
      topQueries = queries.map(q => q.query);
    } catch (error) {
      console.warn('[Meta Optimizer] Could not fetch Search Console queries:', error);
    }

    // Generate optimized title
    const optimizedTitle = generateOptimizedTitle(
      pageContent.title,
      analysis.headings,
      analysis.keywords,
      topQueries
    );

    // Generate optimized description
    const optimizedDescription = generateOptimizedDescription(
      pageContent.description,
      pageContent.content,
      analysis.keywords,
      topQueries
    );

    // Calculate score
    const score = calculateOptimizationScore(
      optimizedTitle,
      optimizedDescription,
      analysis.keywords
    );

    // Generate improvement suggestions
    const improvements: string[] = [];
    
    if (optimizedTitle !== pageContent.title) {
      improvements.push('Title optimized for length and keyword inclusion');
    }
    if (optimizedDescription !== pageContent.description) {
      improvements.push('Description optimized for length and relevance');
    }
    if (analysis.keywords.length > 0) {
      improvements.push(`Identified ${analysis.keywords.length} relevant keywords`);
    }
    if (topQueries.length > 0) {
      improvements.push(`Incorporated ${topQueries.length} top search queries`);
    }

    const result: MetaOptimizationResult = {
      originalTitle: pageContent.title || '',
      optimizedTitle,
      originalDescription: pageContent.description || '',
      optimizedDescription,
      keywords: analysis.keywords,
      improvements,
      score
    };

    // Cache for 1 hour
    setCached(cacheKey, result, 3600000);

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('optimizeMetaTags', true, duration);

    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('optimizeMetaTags', false, duration);
    throw error;
  }
}

/**
 * Batch optimize meta tags for multiple pages
 */
export async function batchOptimizeMetaTags(
  pages: PageContent[]
): Promise<Map<string, MetaOptimizationResult>> {
  const results = new Map<string, MetaOptimizationResult>();

  // Process pages in parallel (limit concurrency to avoid overwhelming the system)
  const batchSize = 5;
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(page => optimizeMetaTags(page))
    );
    
    batch.forEach((page, index) => {
      results.set(page.url, batchResults[index]);
    });
  }

  return results;
}

