/**
 * Anchor Text Analyzer
 * @module lib/seo/anchor-text
 */

export interface AnchorTextAnalysis {
  text: string;
  count: number;
  urls: string[];
  type: 'exact-match' | 'partial-match' | 'branded' | 'generic';
}

export function analyzeAnchorText(links: Array<{
  text: string;
  href: string;
  targetKeyword?: string;
}>): AnchorTextAnalysis[] {
  const anchorMap = new Map<string, { count: number; urls: Set<string> }>();
  
  links.forEach(link => {
    const existing = anchorMap.get(link.text) || { count: 0, urls: new Set() };
    existing.count++;
    existing.urls.add(link.href);
    anchorMap.set(link.text, existing);
  });
  
  return Array.from(anchorMap.entries()).map(([text, data]) => ({
    text,
    count: data.count,
    urls: Array.from(data.urls),
    type: 'generic' as const,
  })).sort((a, b) => b.count - a.count);
}
