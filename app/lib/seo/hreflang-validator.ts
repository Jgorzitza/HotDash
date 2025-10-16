/**
 * Hreflang Validator
 * @module lib/seo/hreflang-validator
 */

export interface HreflangTag {
  url: string;
  hreflang: string;
  href: string;
}

export interface HreflangIssue {
  url: string;
  issue: string;
  severity: 'error' | 'warning';
  tags?: HreflangTag[];
}

export function validateHreflang(tags: HreflangTag[]): HreflangIssue[] {
  const issues: HreflangIssue[] = [];
  const urlMap = new Map<string, HreflangTag[]>();
  
  tags.forEach(tag => {
    const existing = urlMap.get(tag.url) || [];
    existing.push(tag);
    urlMap.set(tag.url, existing);
  });
  
  urlMap.forEach((pageTags, url) => {
    const hasXDefault = pageTags.some(t => t.hreflang === 'x-default');
    if (!hasXDefault && pageTags.length > 1) {
      issues.push({
        url,
        issue: 'Missing x-default hreflang',
        severity: 'warning',
        tags: pageTags,
      });
    }
    
    const hreflangs = new Set(pageTags.map(t => t.hreflang));
    if (hreflangs.size !== pageTags.length) {
      issues.push({
        url,
        issue: 'Duplicate hreflang values',
        severity: 'error',
        tags: pageTags,
      });
    }
  });
  
  return issues;
}
