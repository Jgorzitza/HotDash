/**
 * URL Structure Analyzer
 * @module lib/seo/url-structure
 */

export interface URLIssue {
  url: string;
  issue: string;
  severity: 'error' | 'warning';
  recommendation: string;
}

export function analyzeURLStructure(url: string): URLIssue[] {
  const issues: URLIssue[] = [];
  
  if (url.length > 100) {
    issues.push({
      url,
      issue: 'URL too long',
      severity: 'warning',
      recommendation: 'Keep URLs under 100 characters',
    });
  }
  
  if (url.includes('_')) {
    issues.push({
      url,
      issue: 'Underscores in URL',
      severity: 'warning',
      recommendation: 'Use hyphens instead of underscores',
    });
  }
  
  if (/[A-Z]/.test(url)) {
    issues.push({
      url,
      issue: 'Uppercase characters in URL',
      severity: 'warning',
      recommendation: 'Use lowercase URLs',
    });
  }
  
  const params = url.split('?')[1];
  if (params && params.split('&').length > 3) {
    issues.push({
      url,
      issue: 'Too many URL parameters',
      severity: 'warning',
      recommendation: 'Minimize URL parameters',
    });
  }
  
  return issues;
}
