/**
 * Duplicate Content Detector
 * @module lib/seo/duplicate-content
 */

export interface DuplicateContent {
  url1: string;
  url2: string;
  similarity: number;
  type: 'exact' | 'near-duplicate' | 'similar';
}

export function calculateSimilarity(content1: string, content2: string): number {
  const words1 = new Set(content1.toLowerCase().split(/\s+/));
  const words2 = new Set(content2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

export function detectDuplicates(
  pages: Array<{ url: string; content: string }>
): DuplicateContent[] {
  const duplicates: DuplicateContent[] = [];
  
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const similarity = calculateSimilarity(pages[i].content, pages[j].content);
      
      if (similarity > 0.5) {
        duplicates.push({
          url1: pages[i].url,
          url2: pages[j].url,
          similarity,
          type: similarity > 0.95 ? 'exact' : similarity > 0.8 ? 'near-duplicate' : 'similar',
        });
      }
    }
  }
  
  return duplicates.sort((a, b) => b.similarity - a.similarity);
}
