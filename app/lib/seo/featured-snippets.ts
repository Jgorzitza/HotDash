/**
 * Featured Snippets Optimizer
 * @module lib/seo/featured-snippets
 */

export type SnippetType = 'paragraph' | 'list' | 'table' | 'video';

export interface SnippetOpportunity {
  keyword: string;
  currentPosition: number;
  snippetType: SnippetType;
  hasSnippet: boolean;
  recommendation: string;
}

export function identifySnippetOpportunities(
  keywords: Array<{ keyword: string; position: number; hasSnippet: boolean }>
): SnippetOpportunity[] {
  return keywords
    .filter(k => k.position >= 1 && k.position <= 10 && !k.hasSnippet)
    .map(k => ({
      keyword: k.keyword,
      currentPosition: k.position,
      snippetType: determineSnippetType(k.keyword),
      hasSnippet: k.hasSnippet,
      recommendation: getSnippetRecommendation(k.keyword),
    }));
}

function determineSnippetType(keyword: string): SnippetType {
  const lower = keyword.toLowerCase();
  
  if (lower.includes('how to') || lower.includes('steps')) {
    return 'list';
  }
  
  if (lower.includes('vs') || lower.includes('compare')) {
    return 'table';
  }
  
  if (lower.includes('video') || lower.includes('watch')) {
    return 'video';
  }
  
  return 'paragraph';
}

function getSnippetRecommendation(keyword: string): string {
  const type = determineSnippetType(keyword);
  
  const recommendations = {
    paragraph: 'Add concise 40-60 word answer in first paragraph',
    list: 'Use numbered or bulleted lists with clear steps',
    table: 'Create comparison table with key features',
    video: 'Embed relevant video with schema markup',
  };
  
  return recommendations[type];
}
