/**
 * Pagination SEO Analyzer
 * @module lib/seo/pagination-seo
 */

export interface PaginationIssue {
  url: string;
  issue: string;
  severity: 'error' | 'warning';
}

export function analyzePagination(pages: Array<{
  url: string;
  hasRelNext?: boolean;
  hasRelPrev?: boolean;
  pageNumber: number;
  totalPages: number;
}>): PaginationIssue[] {
  const issues: PaginationIssue[] = [];
  
  pages.forEach(page => {
    if (page.pageNumber > 1 && !page.hasRelPrev) {
      issues.push({
        url: page.url,
        issue: 'Missing rel="prev" link',
        severity: 'warning',
      });
    }
    
    if (page.pageNumber < page.totalPages && !page.hasRelNext) {
      issues.push({
        url: page.url,
        issue: 'Missing rel="next" link',
        severity: 'warning',
      });
    }
  });
  
  return issues;
}
