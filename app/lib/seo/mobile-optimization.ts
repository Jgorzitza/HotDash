/**
 * Mobile Optimization Checker
 * @module lib/seo/mobile-optimization
 */

export interface MobileIssue {
  type: 'viewport' | 'font-size' | 'tap-targets' | 'content-width';
  severity: 'error' | 'warning';
  message: string;
}

export function checkMobileOptimization(page: {
  hasViewport: boolean;
  minFontSize: number;
  tapTargetSize: number;
  contentWidth: number;
  viewportWidth: number;
}): MobileIssue[] {
  const issues: MobileIssue[] = [];
  
  if (!page.hasViewport) {
    issues.push({
      type: 'viewport',
      severity: 'error',
      message: 'Missing viewport meta tag',
    });
  }
  
  if (page.minFontSize < 12) {
    issues.push({
      type: 'font-size',
      severity: 'warning',
      message: `Font size too small (${page.minFontSize}px < 12px)`,
    });
  }
  
  if (page.tapTargetSize < 48) {
    issues.push({
      type: 'tap-targets',
      severity: 'warning',
      message: `Tap targets too small (${page.tapTargetSize}px < 48px)`,
    });
  }
  
  if (page.contentWidth > page.viewportWidth) {
    issues.push({
      type: 'content-width',
      severity: 'error',
      message: 'Content wider than viewport',
    });
  }
  
  return issues;
}
