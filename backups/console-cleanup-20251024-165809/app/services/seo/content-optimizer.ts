/**
 * Automated Content Optimization Service
 *
 * Analyzes content and provides comprehensive SEO optimization recommendations:
 * - Flesch Reading Ease score for readability
 * - Keyword density calculation (target 1-3%)
 * - Heading structure analysis (H1-H6)
 * - Internal linking analysis
 * - Image alt text verification
 * - Overall SEO score (0-100) with letter grade (A-F)
 *
 * @module services/seo/content-optimizer
 */

import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";

// ============================================================================
// Types
// ============================================================================

export interface ContentAnalysis {
  url: string;
  readability: ReadabilityScore;
  keywords: KeywordAnalysis;
  headings: HeadingStructure;
  links: LinkAnalysis;
  images: ImageAnalysis;
  overallScore: SEOScore;
  recommendations: string[];
  analyzedAt: string;
}

export interface ReadabilityScore {
  fleschScore: number; // 0-100, higher is easier
  grade: string; // e.g., "8th grade", "College"
  interpretation: string;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
}

export interface KeywordAnalysis {
  targetKeyword: string;
  density: number; // percentage
  frequency: number;
  isOptimal: boolean; // true if 1-3%
  topKeywords: Array<{
    keyword: string;
    frequency: number;
    density: number;
  }>;
}

export interface HeadingStructure {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  hasProperStructure: boolean; // single H1, hierarchical
  headings: Array<{
    level: number;
    text: string;
    hasKeyword: boolean;
  }>;
}

export interface LinkAnalysis {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  linkDensity: number; // links per 100 words
  hasProperLinking: boolean; // 2-5 internal links per 100 words
}

export interface ImageAnalysis {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  altTextQuality: "good" | "fair" | "poor";
  avgAltLength: number;
}

export interface SEOScore {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: {
    readability: number; // 0-20
    keywords: number; // 0-20
    headings: number; // 0-20
    links: number; // 0-20
    images: number; // 0-20
  };
}

// ============================================================================
// Constants
// ============================================================================

const OPTIMAL_KEYWORD_DENSITY = { min: 1, max: 3 };
const OPTIMAL_LINK_DENSITY = { min: 2, max: 5 }; // per 100 words
const MIN_ALT_TEXT_LENGTH = 10;
const IDEAL_ALT_TEXT_LENGTH = 125;

// ============================================================================
// Readability Analysis (Flesch Reading Ease)
// ============================================================================

/**
 * Calculate Flesch Reading Ease score
 * Formula: 206.835 - 1.015(total words / total sentences) - 84.6(total syllables / total words)
 * Score ranges:
 * 90-100: Very Easy (5th grade)
 * 80-89: Easy (6th grade)
 * 70-79: Fairly Easy (7th grade)
 * 60-69: Standard (8th & 9th grade)
 * 50-59: Fairly Difficult (10th to 12th grade)
 * 30-49: Difficult (College)
 * 0-29: Very Difficult (College graduate)
 */
function calculateFleschScore(text: string): ReadabilityScore {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, " ");

  // Count sentences (. ! ?)
  const sentences = cleanText.match(/[.!?]+/g) || [];
  const sentenceCount = Math.max(sentences.length, 1);

  // Count words
  const words = cleanText.match(/\b\w+\b/g) || [];
  const wordCount = words.length;

  // Count syllables
  let syllableCount = 0;
  words.forEach((word) => {
    syllableCount += countSyllables(word);
  });

  // Calculate averages
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;

  // Flesch Reading Ease Formula
  const fleschScore = Math.round(
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord,
  );

  // Clamp to 0-100
  const normalizedScore = Math.max(0, Math.min(100, fleschScore));

  // Determine grade level and interpretation
  let grade: string;
  let interpretation: string;

  if (normalizedScore >= 90) {
    grade = "5th grade";
    interpretation = "Very easy to read. Easily understood by 11-year-olds.";
  } else if (normalizedScore >= 80) {
    grade = "6th grade";
    interpretation = "Easy to read. Conversational English for consumers.";
  } else if (normalizedScore >= 70) {
    grade = "7th grade";
    interpretation = "Fairly easy to read.";
  } else if (normalizedScore >= 60) {
    grade = "8th & 9th grade";
    interpretation = "Plain English. Easily understood by 13-15 year olds.";
  } else if (normalizedScore >= 50) {
    grade = "10th to 12th grade";
    interpretation = "Fairly difficult to read.";
  } else if (normalizedScore >= 30) {
    grade = "College";
    interpretation = "Difficult to read. Best understood by college graduates.";
  } else {
    grade = "College graduate";
    interpretation =
      "Very difficult to read. Best understood by university graduates.";
  }

  return {
    fleschScore: normalizedScore,
    grade,
    interpretation,
    wordCount,
    sentenceCount,
    syllableCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
  };
}

/**
 * Count syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove final 'e', 'es', 'ed' if preceded by consonant
  word = word.replace(/(?:[^laeiouy]es?|ed)$/i, "");

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Minimum of 1 syllable
  return Math.max(count, 1);
}

// ============================================================================
// Keyword Analysis
// ============================================================================

/**
 * Analyze keyword density and frequency
 */
function analyzeKeywords(text: string, targetKeyword: string): KeywordAnalysis {
  // Remove HTML and normalize text
  const cleanText = text.replace(/<[^>]*>/g, " ").toLowerCase();
  const words = cleanText.match(/\b\w+\b/g) || [];
  const totalWords = words.length;

  // Count target keyword frequency
  const keywordRegex = new RegExp(`\\b${targetKeyword.toLowerCase()}\\b`, "g");
  const matches = cleanText.match(keywordRegex) || [];
  const frequency = matches.length;
  const density = totalWords > 0 ? (frequency / totalWords) * 100 : 0;

  // Check if optimal (1-3%)
  const isOptimal =
    density >= OPTIMAL_KEYWORD_DENSITY.min &&
    density <= OPTIMAL_KEYWORD_DENSITY.max;

  // Find top keywords (2-3 word phrases)
  const phrases = extractPhrases(cleanText, 2, 3);
  const phraseCounts = new Map<string, number>();

  phrases.forEach((phrase) => {
    phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
  });

  const topKeywords = Array.from(phraseCounts.entries())
    .map(([keyword, freq]) => ({
      keyword,
      frequency: freq,
      density: (freq / totalWords) * 100,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  return {
    targetKeyword,
    density: Math.round(density * 100) / 100,
    frequency,
    isOptimal,
    topKeywords,
  };
}

/**
 * Extract n-gram phrases from text
 */
function extractPhrases(
  text: string,
  minLength: number,
  maxLength: number,
): string[] {
  const words = text.match(/\b\w+\b/g) || [];
  const phrases: string[] = [];

  for (let n = minLength; n <= maxLength; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(" ");
      phrases.push(phrase);
    }
  }

  return phrases;
}

// ============================================================================
// Heading Structure Analysis
// ============================================================================

/**
 * Analyze heading structure (H1-H6)
 */
function analyzeHeadings(
  html: string,
  targetKeyword: string,
): HeadingStructure {
  const headingMatches = {
    h1: html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [],
    h2: html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [],
    h3: html.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [],
    h4: html.match(/<h4[^>]*>(.*?)<\/h4>/gi) || [],
    h5: html.match(/<h5[^>]*>(.*?)<\/h5>/gi) || [],
    h6: html.match(/<h6[^>]*>(.*?)<\/h6>/gi) || [],
  };

  const headings: HeadingStructure["headings"] = [];

  Object.entries(headingMatches).forEach(([level, matches]) => {
    const levelNum = parseInt(level.substring(1));
    matches.forEach((match) => {
      const text = match.replace(/<[^>]+>/g, "").trim();
      const hasKeyword = text
        .toLowerCase()
        .includes(targetKeyword.toLowerCase());
      headings.push({ level: levelNum, text, hasKeyword });
    });
  });

  // Sort by level
  headings.sort((a, b) => a.level - b.level);

  // Check proper structure: single H1, hierarchical
  const h1Count = headingMatches.h1.length;
  const hasProperStructure = h1Count === 1;

  return {
    h1Count,
    h2Count: headingMatches.h2.length,
    h3Count: headingMatches.h3.length,
    h4Count: headingMatches.h4.length,
    h5Count: headingMatches.h5.length,
    h6Count: headingMatches.h6.length,
    hasProperStructure,
    headings,
  };
}

// ============================================================================
// Link Analysis
// ============================================================================

/**
 * Analyze internal and external links
 */
function analyzeLinks(
  html: string,
  baseUrl: string,
  wordCount: number,
): LinkAnalysis {
  const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];

  let internalLinks = 0;
  let externalLinks = 0;

  const baseDomain = new URL(baseUrl).hostname;

  linkMatches.forEach((link) => {
    const hrefMatch = link.match(/href=["']([^"']*)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];

      if (href.startsWith("http")) {
        const linkDomain = new URL(href).hostname;
        if (linkDomain === baseDomain) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } else if (href.startsWith("/") || !href.includes(":")) {
        // Relative link = internal
        internalLinks++;
      }
    }
  });

  const totalLinks = internalLinks + externalLinks;
  const linkDensity = wordCount > 0 ? (totalLinks / wordCount) * 100 : 0;

  // Optimal: 2-5 internal links per 100 words
  const optimalInternal = wordCount > 0 ? (internalLinks / wordCount) * 100 : 0;
  const hasProperLinking =
    optimalInternal >= OPTIMAL_LINK_DENSITY.min &&
    optimalInternal <= OPTIMAL_LINK_DENSITY.max;

  return {
    totalLinks,
    internalLinks,
    externalLinks,
    brokenLinks: 0, // Would require actual link checking
    linkDensity: Math.round(linkDensity * 100) / 100,
    hasProperLinking,
  };
}

// ============================================================================
// Image Analysis
// ============================================================================

/**
 * Analyze image alt text
 */
function analyzeImages(html: string): ImageAnalysis {
  const imageMatches = html.match(/<img[^>]*>/gi) || [];
  const totalImages = imageMatches.length;

  let imagesWithAlt = 0;
  let totalAltLength = 0;

  imageMatches.forEach((img) => {
    const altMatch = img.match(/alt=["']([^"']*)["']/i);
    if (altMatch && altMatch[1].trim().length > 0) {
      imagesWithAlt++;
      totalAltLength += altMatch[1].length;
    }
  });

  const imagesWithoutAlt = totalImages - imagesWithAlt;
  const avgAltLength =
    imagesWithAlt > 0 ? Math.round(totalAltLength / imagesWithAlt) : 0;

  let altTextQuality: "good" | "fair" | "poor";
  if (
    imagesWithAlt === totalImages &&
    avgAltLength >= MIN_ALT_TEXT_LENGTH &&
    avgAltLength <= IDEAL_ALT_TEXT_LENGTH
  ) {
    altTextQuality = "good";
  } else if (imagesWithAlt >= totalImages * 0.7) {
    altTextQuality = "fair";
  } else {
    altTextQuality = "poor";
  }

  return {
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt,
    altTextQuality,
    avgAltLength,
  };
}

// ============================================================================
// Overall SEO Score Calculation
// ============================================================================

/**
 * Calculate overall SEO score (0-100) with breakdown
 */
function calculateSEOScore(
  readability: ReadabilityScore,
  keywords: KeywordAnalysis,
  headings: HeadingStructure,
  links: LinkAnalysis,
  images: ImageAnalysis,
): SEOScore {
  // Readability (0-20): Based on Flesch score
  const readabilityScore = Math.round((readability.fleschScore / 100) * 20);

  // Keywords (0-20): Optimal density + presence in headings
  let keywordsScore = 0;
  if (keywords.isOptimal) keywordsScore += 15;
  else if (keywords.density > 0) keywordsScore += 8;

  const headingsWithKeyword = headings.headings.filter(
    (h) => h.hasKeyword,
  ).length;
  if (headingsWithKeyword > 0) keywordsScore += 5;

  // Headings (0-20): Proper structure + count
  let headingsScore = 0;
  if (headings.hasProperStructure) headingsScore += 10;
  if (headings.h2Count >= 2) headingsScore += 5;
  if (headings.h3Count >= 1) headingsScore += 5;

  // Links (0-20): Proper internal linking
  let linksScore = 0;
  if (links.hasProperLinking) linksScore += 15;
  else if (links.internalLinks > 0) linksScore += 8;
  if (links.externalLinks >= 1 && links.externalLinks <= 3) linksScore += 5;

  // Images (0-20): Alt text quality
  let imagesScore = 0;
  if (images.altTextQuality === "good") imagesScore = 20;
  else if (images.altTextQuality === "fair") imagesScore = 12;
  else if (images.totalImages === 0)
    imagesScore = 15; // No images is acceptable
  else imagesScore = 5;

  const totalScore =
    readabilityScore + keywordsScore + headingsScore + linksScore + imagesScore;

  let grade: "A" | "B" | "C" | "D" | "F";
  if (totalScore >= 90) grade = "A";
  else if (totalScore >= 80) grade = "B";
  else if (totalScore >= 70) grade = "C";
  else if (totalScore >= 60) grade = "D";
  else grade = "F";

  return {
    score: totalScore,
    grade,
    breakdown: {
      readability: readabilityScore,
      keywords: keywordsScore,
      headings: headingsScore,
      links: linksScore,
      images: imagesScore,
    },
  };
}

// ============================================================================
// Recommendations Generation
// ============================================================================

/**
 * Generate SEO recommendations based on analysis
 */
function generateRecommendations(
  analysis: Omit<ContentAnalysis, "recommendations" | "analyzedAt">,
): string[] {
  const recommendations: string[] = [];

  // Readability recommendations
  if (analysis.readability.fleschScore < 60) {
    recommendations.push(
      `Improve readability (current: ${analysis.readability.fleschScore}/100). Use shorter sentences and simpler words.`,
    );
  }

  // Keyword recommendations
  if (!analysis.keywords.isOptimal) {
    if (analysis.keywords.density < OPTIMAL_KEYWORD_DENSITY.min) {
      recommendations.push(
        `Increase keyword density for "${analysis.keywords.targetKeyword}" (current: ${analysis.keywords.density}%, target: 1-3%).`,
      );
    } else if (analysis.keywords.density > OPTIMAL_KEYWORD_DENSITY.max) {
      recommendations.push(
        `Reduce keyword density for "${analysis.keywords.targetKeyword}" (current: ${analysis.keywords.density}%, target: 1-3%). Avoid keyword stuffing.`,
      );
    }
  }

  // Heading recommendations
  if (!analysis.headings.hasProperStructure) {
    if (analysis.headings.h1Count === 0) {
      recommendations.push(
        "Add a single H1 heading that describes the page content.",
      );
    } else if (analysis.headings.h1Count > 1) {
      recommendations.push(
        `Use only one H1 heading (current: ${analysis.headings.h1Count}). Use H2-H6 for subheadings.`,
      );
    }
  }

  if (analysis.headings.h2Count === 0) {
    recommendations.push("Add H2 headings to break up content into sections.");
  }

  const headingsWithKeyword = analysis.headings.headings.filter(
    (h) => h.hasKeyword,
  ).length;
  if (headingsWithKeyword === 0) {
    recommendations.push(
      `Include your target keyword "${analysis.keywords.targetKeyword}" in at least one heading.`,
    );
  }

  // Link recommendations
  if (!analysis.links.hasProperLinking) {
    if (analysis.links.internalLinks === 0) {
      recommendations.push(
        "Add internal links to related pages (target: 2-5 links per 100 words).",
      );
    } else {
      const optimalRange = `${Math.round((analysis.readability.wordCount / 100) * 2)}-${Math.round((analysis.readability.wordCount / 100) * 5)}`;
      recommendations.push(
        `Adjust internal linking (current: ${analysis.links.internalLinks}, optimal: ${optimalRange} for ${analysis.readability.wordCount} words).`,
      );
    }
  }

  if (analysis.links.externalLinks === 0) {
    recommendations.push(
      "Consider adding 1-2 external links to authoritative sources.",
    );
  }

  // Image recommendations
  if (analysis.images.imagesWithoutAlt > 0) {
    recommendations.push(
      `Add alt text to ${analysis.images.imagesWithoutAlt} image(s) for better accessibility and SEO.`,
    );
  }

  if (analysis.images.altTextQuality === "poor") {
    recommendations.push(
      "Improve alt text quality. Use descriptive, keyword-rich alt text (10-125 characters).",
    );
  }

  // Overall score recommendations
  if (analysis.overallScore.score < 70) {
    recommendations.push(
      `Overall SEO score is ${analysis.overallScore.grade} (${analysis.overallScore.score}/100). Focus on improving weak areas.`,
    );
  }

  return recommendations;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze content and provide comprehensive SEO optimization recommendations
 */
export async function analyzeContent(
  url: string,
  html: string,
  targetKeyword: string,
): Promise<ContentAnalysis> {
  const startTime = Date.now();

  const cacheKey = `seo:content:${url}:${targetKeyword}`;
  const cached = getCached<ContentAnalysis>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // Run all analyses
    const readability = calculateFleschScore(html);
    const keywords = analyzeKeywords(html, targetKeyword);
    const headings = analyzeHeadings(html, targetKeyword);
    const links = analyzeLinks(html, url, readability.wordCount);
    const images = analyzeImages(html);
    const overallScore = calculateSEOScore(
      readability,
      keywords,
      headings,
      links,
      images,
    );

    const partialAnalysis = {
      url,
      readability,
      keywords,
      headings,
      links,
      images,
      overallScore,
    };

    const recommendations = generateRecommendations(partialAnalysis);

    const analysis: ContentAnalysis = {
      ...partialAnalysis,
      recommendations,
      analyzedAt: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("analyzeContent", true, duration);

    // Cache for 1 hour
    setCached(cacheKey, analysis, 3600000);

    return analysis;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("analyzeContent", false, duration);
    throw error;
  }
}

/**
 * Fetch and analyze content from a URL
 */
export async function analyzeContentFromURL(
  url: string,
  targetKeyword: string,
): Promise<ContentAnalysis> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HotDash Content Optimizer/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return await analyzeContent(url, html, targetKeyword);
  } catch (error: any) {
    console.error(
      `[Content Optimizer] Failed to analyze ${url}:`,
      error.message,
    );
    throw error;
  }
}
