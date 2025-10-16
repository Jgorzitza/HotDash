/**
 * Thin Content Detector
 * @module lib/seo/thin-content
 */

export interface ThinContentPage {
  url: string;
  wordCount: number;
  uniqueWords: number;
  score: number;
  issues: string[];
}

export const THIN_CONTENT_THRESHOLDS = {
  minWordCount: 300,
  minUniqueWords: 150,
} as const;

export function detectThinContent(pages: Array<{ url: string; content: string }>): ThinContentPage[] {
  return pages.map(page => {
    const words = page.content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const issues: string[] = [];
    
    if (wordCount < THIN_CONTENT_THRESHOLDS.minWordCount) {
      issues.push(`Low word count (${wordCount} < ${THIN_CONTENT_THRESHOLDS.minWordCount})`);
    }
    
    if (uniqueWords < THIN_CONTENT_THRESHOLDS.minUniqueWords) {
      issues.push(`Low unique words (${uniqueWords} < ${THIN_CONTENT_THRESHOLDS.minUniqueWords})`);
    }
    
    const score = Math.min(100, (wordCount / THIN_CONTENT_THRESHOLDS.minWordCount) * 100);
    
    return {
      url: page.url,
      wordCount,
      uniqueWords,
      score,
      issues,
    };
  }).filter(p => p.issues.length > 0);
}
