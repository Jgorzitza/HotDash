/**
 * Canonical URL Checker
 *
 * Validate canonical URLs and detect issues
 *
 * @module lib/seo/canonical-checker
 */

export interface CanonicalIssue {
  url: string;
  issue: string;
  severity: 'error' | 'warning';
  canonical?: string;
  recommendation: string;
}

export interface CanonicalValidation {
  url: string;
  hasCanonical: boolean;
  canonicalUrl?: string;
  issues: CanonicalIssue[];
  isValid: boolean;
}

/**
 * Check if canonical URL is valid
 */
export function validateCanonical(url: string, canonical?: string): CanonicalIssue[] {
  const issues: CanonicalIssue[] = [];

  if (!canonical) {
    issues.push({
      url,
      issue: 'Missing canonical URL',
      severity: 'warning',
      recommendation: 'Add canonical URL to prevent duplicate content issues',
    });
    return issues;
  }

  if (!canonical.startsWith('http://') && !canonical.startsWith('https://')) {
    issues.push({
      url,
      issue: 'Canonical URL is not absolute',
      severity: 'error',
      canonical,
      recommendation: 'Use absolute URL for canonical',
    });
  }

  if (canonical !== url) {
    issues.push({
      url,
      issue: 'Canonical points to different URL',
      severity: 'warning',
      canonical,
      recommendation: 'Verify this is intentional',
    });
  }

  return issues;
}

export function detectCanonicalChain(
  pages: Array<{ url: string; canonical?: string }>
): string[][] {
  const chains: string[][] = [];
  const visited = new Set<string>();

  pages.forEach(page => {
    if (visited.has(page.url) || !page.canonical || page.canonical === page.url) {
      return;
    }

    const chain: string[] = [page.url];
    let current = page.canonical;

    while (current && !visited.has(current)) {
      chain.push(current);
      visited.add(current);

      const next = pages.find(p => p.url === current);
      if (!next || !next.canonical || next.canonical === current) {
        break;
      }

      current = next.canonical;

      if (chain.includes(current)) {
        chain.push(current);
        chains.push(chain);
        break;
      }
    }

    if (chain.length > 2) {
      chains.push(chain);
    }
  });

  return chains;
}
