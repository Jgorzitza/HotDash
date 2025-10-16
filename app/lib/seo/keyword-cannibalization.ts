/**
 * Keyword Cannibalization Detector
 * @module lib/seo/keyword-cannibalization
 */

export interface CannibalizationIssue {
  keyword: string;
  urls: string[];
  positions: number[];
  severity: 'high' | 'medium' | 'low';
}

export function detectCannibalization(
  rankings: Array<{ keyword: string; url: string; position: number }>
): CannibalizationIssue[] {
  const keywordMap = new Map<string, Array<{ url: string; position: number }>>();
  
  rankings.forEach(r => {
    const existing = keywordMap.get(r.keyword) || [];
    existing.push({ url: r.url, position: r.position });
    keywordMap.set(r.keyword, existing);
  });
  
  const issues: CannibalizationIssue[] = [];
  
  keywordMap.forEach((pages, keyword) => {
    if (pages.length > 1) {
      const positions = pages.map(p => p.position);
      const bestPosition = Math.min(...positions);
      
      let severity: 'high' | 'medium' | 'low' = 'low';
      if (bestPosition <= 10) {
        severity = 'high';
      } else if (bestPosition <= 20) {
        severity = 'medium';
      }
      
      issues.push({
        keyword,
        urls: pages.map(p => p.url),
        positions,
        severity,
      });
    }
  });
  
  return issues.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
