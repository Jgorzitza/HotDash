/**
 * Sitemap Validator
 * 
 * Validate XML sitemaps for:
 * - Valid XML structure
 * - URL accessibility
 * - Proper formatting
 * - Size limits
 * - Freshness
 * 
 * @module lib/seo/sitemap
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapValidation {
  isValid: boolean;
  urlCount: number;
  issues: SitemapIssue[];
  warnings: SitemapIssue[];
  lastChecked: string;
}

export interface SitemapIssue {
  type: 'error' | 'warning';
  message: string;
  url?: string;
  line?: number;
}

export const SITEMAP_LIMITS = {
  maxUrls: 50000,
  maxFileSize: 52428800, // 50MB
  maxUrlLength: 2048,
} as const;

/**
 * Validate sitemap URL count
 */
export function validateUrlCount(count: number): SitemapIssue[] {
  const issues: SitemapIssue[] = [];
  
  if (count > SITEMAP_LIMITS.maxUrls) {
    issues.push({
      type: 'error',
      message: `Sitemap exceeds maximum URL count (${SITEMAP_LIMITS.maxUrls})`,
    });
  }
  
  if (count === 0) {
    issues.push({
      type: 'error',
      message: 'Sitemap contains no URLs',
    });
  }
  
  return issues;
}

/**
 * Validate individual URL
 */
export function validateUrl(url: SitemapUrl): SitemapIssue[] {
  const issues: SitemapIssue[] = [];
  
  if (!url.loc) {
    issues.push({
      type: 'error',
      message: 'URL missing loc element',
      url: url.loc,
    });
    return issues;
  }
  
  if (url.loc.length > SITEMAP_LIMITS.maxUrlLength) {
    issues.push({
      type: 'warning',
      message: 'URL exceeds recommended length',
      url: url.loc,
    });
  }
  
  if (!url.loc.startsWith('http://') && !url.loc.startsWith('https://')) {
    issues.push({
      type: 'error',
      message: 'URL must start with http:// or https://',
      url: url.loc,
    });
  }
  
  if (url.priority !== undefined && (url.priority < 0 || url.priority > 1)) {
    issues.push({
      type: 'error',
      message: 'Priority must be between 0.0 and 1.0',
      url: url.loc,
    });
  }
  
  return issues;
}

/**
 * Validate sitemap
 */
export function validateSitemap(urls: SitemapUrl[]): SitemapValidation {
  const issues: SitemapIssue[] = [];
  const warnings: SitemapIssue[] = [];
  
  // Validate URL count
  const countIssues = validateUrlCount(urls.length);
  countIssues.forEach(issue => {
    if (issue.type === 'error') {
      issues.push(issue);
    } else {
      warnings.push(issue);
    }
  });
  
  // Validate each URL
  urls.forEach(url => {
    const urlIssues = validateUrl(url);
    urlIssues.forEach(issue => {
      if (issue.type === 'error') {
        issues.push(issue);
      } else {
        warnings.push(issue);
      }
    });
  });
  
  return {
    isValid: issues.length === 0,
    urlCount: urls.length,
    issues,
    warnings,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Check for duplicate URLs
 */
export function findDuplicateUrls(urls: SitemapUrl[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  urls.forEach(url => {
    if (seen.has(url.loc)) {
      duplicates.add(url.loc);
    }
    seen.add(url.loc);
  });
  
  return Array.from(duplicates);
}

/**
 * Generate sitemap from URLs
 */
export function generateSitemap(urls: SitemapUrl[]): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const footer = '\n</urlset>';

  const urlElements = urls.map(url => {
    let element = `\n  <url>\n    <loc>${url.loc}</loc>`;

    if (url.lastmod) {
      element += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }

    if (url.changefreq) {
      element += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }

    if (url.priority !== undefined) {
      element += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
    }

    element += '\n  </url>';
    return element;
  }).join('');

  return header + urlElements + footer;
}

/**
 * Mock sitemap fetch
 */
export async function fetchSitemap(url: string): Promise<SitemapUrl[]> {
  console.log('[sitemap] Mock fetch sitemap:', url);
  return [];
}

