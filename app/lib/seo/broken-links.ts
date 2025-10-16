/**
 * Broken Links Crawler
 * @module lib/seo/broken-links
 */

export interface BrokenLink {
  url: string;
  statusCode: number;
  foundOn: string[];
  errorType: '404' | '500' | 'timeout' | 'dns';
}

export function detectBrokenLinks(links: Array<{ url: string; status: number; source: string }>): BrokenLink[] {
  const brokenMap = new Map<string, BrokenLink>();
  
  links.forEach(link => {
    if (link.status >= 400) {
      const existing = brokenMap.get(link.url);
      const errorType = link.status === 404 ? '404' : link.status >= 500 ? '500' : 'timeout';
      
      if (existing) {
        existing.foundOn.push(link.source);
      } else {
        brokenMap.set(link.url, {
          url: link.url,
          statusCode: link.status,
          foundOn: [link.source],
          errorType,
        });
      }
    }
  });
  
  return Array.from(brokenMap.values()).sort((a, b) => b.foundOn.length - a.foundOn.length);
}

export function prioritizeBrokenLinks(broken: BrokenLink[]): BrokenLink[] {
  return broken.sort((a, b) => {
    if (a.errorType !== b.errorType) {
      const priority = { '500': 3, 'dns': 2, '404': 1, 'timeout': 0 };
      return priority[b.errorType] - priority[a.errorType];
    }
    return b.foundOn.length - a.foundOn.length;
  });
}
