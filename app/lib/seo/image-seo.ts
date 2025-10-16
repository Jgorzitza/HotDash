/**
 * Image SEO Analyzer
 * @module lib/seo/image-seo
 */

export interface ImageSEOIssue {
  url: string;
  src: string;
  issue: string;
  severity: 'error' | 'warning';
}

export function analyzeImageSEO(images: Array<{
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format?: string;
}>): ImageSEOIssue[] {
  const issues: ImageSEOIssue[] = [];
  
  images.forEach(img => {
    if (!img.alt) {
      issues.push({
        url: '',
        src: img.src,
        issue: 'Missing alt text',
        severity: 'error',
      });
    }
    
    if (img.fileSize && img.fileSize > 200000) {
      issues.push({
        url: '',
        src: img.src,
        issue: `Large file size (${Math.round(img.fileSize / 1024)}KB)`,
        severity: 'warning',
      });
    }
    
    if (!img.width || !img.height) {
      issues.push({
        url: '',
        src: img.src,
        issue: 'Missing width/height attributes',
        severity: 'warning',
      });
    }
  });
  
  return issues;
}
