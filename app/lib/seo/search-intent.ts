/**
 * Search Intent Analyzer
 * @module lib/seo/search-intent
 */

export type SearchIntent = 'informational' | 'navigational' | 'transactional' | 'commercial';

export function classifySearchIntent(keyword: string): SearchIntent {
  const lower = keyword.toLowerCase();
  
  const transactionalWords = ['buy', 'purchase', 'order', 'shop', 'price', 'cheap', 'discount'];
  const commercialWords = ['best', 'top', 'review', 'compare', 'vs', 'alternative'];
  const informationalWords = ['how', 'what', 'why', 'when', 'guide', 'tutorial', 'tips'];
  
  if (transactionalWords.some(w => lower.includes(w))) {
    return 'transactional';
  }
  
  if (commercialWords.some(w => lower.includes(w))) {
    return 'commercial';
  }
  
  if (informationalWords.some(w => lower.includes(w))) {
    return 'informational';
  }
  
  return 'navigational';
}

export function matchContentToIntent(
  keyword: string,
  content: { type: 'product' | 'article' | 'category' | 'homepage' }
): { matches: boolean; recommendation: string } {
  const intent = classifySearchIntent(keyword);
  
  const matches = {
    transactional: content.type === 'product',
    commercial: content.type === 'category' || content.type === 'product',
    informational: content.type === 'article',
    navigational: content.type === 'homepage',
  };
  
  return {
    matches: matches[intent],
    recommendation: matches[intent] ? 'Content matches search intent' : `Consider creating ${intent} content`,
  };
}
