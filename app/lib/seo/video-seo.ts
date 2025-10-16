/**
 * Video SEO Optimizer
 * @module lib/seo/video-seo
 */

export interface VideoSEOIssue {
  videoUrl: string;
  issue: string;
  severity: 'error' | 'warning';
  recommendation: string;
}

export function analyzeVideoSEO(video: {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  transcript?: string;
  duration?: number;
  hasSchema?: boolean;
}): VideoSEOIssue[] {
  const issues: VideoSEOIssue[] = [];
  
  if (!video.title) {
    issues.push({
      videoUrl: video.url,
      issue: 'Missing video title',
      severity: 'error',
      recommendation: 'Add descriptive title with target keyword',
    });
  }
  
  if (!video.description) {
    issues.push({
      videoUrl: video.url,
      issue: 'Missing video description',
      severity: 'error',
      recommendation: 'Add detailed description (200+ words)',
    });
  }
  
  if (!video.thumbnail) {
    issues.push({
      videoUrl: video.url,
      issue: 'Missing custom thumbnail',
      severity: 'warning',
      recommendation: 'Add high-quality custom thumbnail (1280x720)',
    });
  }
  
  if (!video.transcript) {
    issues.push({
      videoUrl: video.url,
      issue: 'Missing transcript',
      severity: 'warning',
      recommendation: 'Add full transcript for accessibility and SEO',
    });
  }
  
  if (!video.hasSchema) {
    issues.push({
      videoUrl: video.url,
      issue: 'Missing VideoObject schema',
      severity: 'error',
      recommendation: 'Add VideoObject structured data',
    });
  }
  
  return issues;
}
