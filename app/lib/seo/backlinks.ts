/**
 * Backlink Monitor
 * 
 * Track and analyze backlinks
 * 
 * @module lib/seo/backlinks
 */

export interface Backlink {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority?: number;
  firstSeen: string;
  lastSeen: string;
  isFollowed: boolean;
  status: 'active' | 'lost' | 'new';
}

export interface BacklinkSummary {
  totalBacklinks: number;
  followedBacklinks: number;
  nofollowBacklinks: number;
  newBacklinks: number;
  lostBacklinks: number;
  topReferringDomains: string[];
  averageDomainAuthority: number;
}

/**
 * Calculate backlink summary
 */
export function calculateBacklinkSummary(backlinks: Backlink[]): BacklinkSummary {
  const followed = backlinks.filter(b => b.isFollowed);
  const nofollow = backlinks.filter(b => !b.isFollowed);
  const newLinks = backlinks.filter(b => b.status === 'new');
  const lostLinks = backlinks.filter(b => b.status === 'lost');
  
  const domains = new Map<string, number>();
  backlinks.forEach(link => {
    const domain = new URL(link.sourceUrl).hostname;
    domains.set(domain, (domains.get(domain) || 0) + 1);
  });
  
  const topDomains = Array.from(domains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain]) => domain);
  
  const avgDA = backlinks.reduce((sum, b) => sum + (b.domainAuthority || 0), 0) / backlinks.length;
  
  return {
    totalBacklinks: backlinks.length,
    followedBacklinks: followed.length,
    nofollowBacklinks: nofollow.length,
    newBacklinks: newLinks.length,
    lostBacklinks: lostLinks.length,
    topReferringDomains: topDomains,
    averageDomainAuthority: Math.round(avgDA),
  };
}

/**
 * Detect lost backlinks
 */
export function detectLostBacklinks(
  current: Backlink[],
  previous: Backlink[]
): Backlink[] {
  const currentUrls = new Set(current.map(b => b.sourceUrl));
  return previous.filter(b => !currentUrls.has(b.sourceUrl));
}

/**
 * Detect new backlinks
 */
export function detectNewBacklinks(
  current: Backlink[],
  previous: Backlink[]
): Backlink[] {
  const previousUrls = new Set(previous.map(b => b.sourceUrl));
  return current.filter(b => !previousUrls.has(b.sourceUrl));
}

