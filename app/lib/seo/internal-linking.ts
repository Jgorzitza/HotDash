/**
 * Internal Linking Analyzer
 * @module lib/seo/internal-linking
 */

export interface LinkAnalysis {
  url: string;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  orphanedPages: string[];
  linkDepth: number;
}

export function analyzeInternalLinking(pages: Array<{
  url: string;
  links: Array<{ href: string; isInternal: boolean; isBroken: boolean }>;
}>): LinkAnalysis[] {
  const urlSet = new Set(pages.map(p => p.url));
  const incomingLinks = new Map<string, number>();
  
  pages.forEach(page => {
    page.links.forEach(link => {
      if (link.isInternal) {
        incomingLinks.set(link.href, (incomingLinks.get(link.href) || 0) + 1);
      }
    });
  });
  
  return pages.map(page => {
    const internal = page.links.filter(l => l.isInternal).length;
    const external = page.links.filter(l => !l.isInternal).length;
    const broken = page.links.filter(l => l.isBroken).length;
    const orphaned = Array.from(urlSet).filter(url => !incomingLinks.has(url));
    
    return {
      url: page.url,
      internalLinks: internal,
      externalLinks: external,
      brokenLinks: broken,
      orphanedPages: orphaned,
      linkDepth: 0,
    };
  });
}
