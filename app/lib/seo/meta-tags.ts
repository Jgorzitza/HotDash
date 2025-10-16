/**
 * Meta Tag Optimization Recommendations
 * 
 * Analyze and recommend improvements for:
 * - Title tags
 * - Meta descriptions
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URLs
 * - Structured data
 * 
 * @module lib/seo/meta-tags
 */

export interface MetaTags {
  url: string;
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  structuredData?: object[];
}

export interface MetaTagIssue {
  url: string;
  field: keyof MetaTags;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  currentValue?: string;
  recommendedValue?: string;
  recommendation: string;
}

export interface MetaTagScore {
  url: string;
  score: number; // 0-100
  issues: MetaTagIssue[];
  strengths: string[];
}

/**
 * Meta tag best practices
 */
export const META_TAG_RULES = {
  title: {
    minLength: 30,
    maxLength: 60,
    optimal: 50,
  },
  description: {
    minLength: 120,
    maxLength: 160,
    optimal: 155,
  },
} as const;

/**
 * Check title tag
 */
export function checkTitle(title?: string): MetaTagIssue[] {
  const issues: MetaTagIssue[] = [];
  
  if (!title) {
    issues.push({
      url: '',
      field: 'title',
      issue: 'Missing title tag',
      severity: 'critical',
      recommendation: 'Add a descriptive title tag (30-60 characters)',
    });
    return issues;
  }
  
  const length = title.length;
  
  if (length < META_TAG_RULES.title.minLength) {
    issues.push({
      url: '',
      field: 'title',
      issue: 'Title too short',
      severity: 'warning',
      currentValue: title,
      recommendation: `Expand title to at least ${META_TAG_RULES.title.minLength} characters`,
    });
  }
  
  if (length > META_TAG_RULES.title.maxLength) {
    issues.push({
      url: '',
      field: 'title',
      issue: 'Title too long',
      severity: 'warning',
      currentValue: title,
      recommendation: `Shorten title to ${META_TAG_RULES.title.maxLength} characters or less`,
    });
  }
  
  return issues;
}

/**
 * Check meta description
 */
export function checkDescription(description?: string): MetaTagIssue[] {
  const issues: MetaTagIssue[] = [];
  
  if (!description) {
    issues.push({
      url: '',
      field: 'description',
      issue: 'Missing meta description',
      severity: 'critical',
      recommendation: 'Add a compelling meta description (120-160 characters)',
    });
    return issues;
  }
  
  const length = description.length;
  
  if (length < META_TAG_RULES.description.minLength) {
    issues.push({
      url: '',
      field: 'description',
      issue: 'Description too short',
      severity: 'warning',
      currentValue: description,
      recommendation: `Expand description to at least ${META_TAG_RULES.description.minLength} characters`,
    });
  }
  
  if (length > META_TAG_RULES.description.maxLength) {
    issues.push({
      url: '',
      field: 'description',
      issue: 'Description too long',
      severity: 'warning',
      currentValue: description,
      recommendation: `Shorten description to ${META_TAG_RULES.description.maxLength} characters or less`,
    });
  }
  
  return issues;
}

/**
 * Check Open Graph tags
 */
export function checkOpenGraph(tags: MetaTags): MetaTagIssue[] {
  const issues: MetaTagIssue[] = [];
  
  if (!tags.ogTitle) {
    issues.push({
      url: tags.url,
      field: 'ogTitle',
      issue: 'Missing og:title',
      severity: 'warning',
      recommendation: 'Add og:title for better social sharing',
    });
  }
  
  if (!tags.ogDescription) {
    issues.push({
      url: tags.url,
      field: 'ogDescription',
      issue: 'Missing og:description',
      severity: 'warning',
      recommendation: 'Add og:description for better social sharing',
    });
  }
  
  if (!tags.ogImage) {
    issues.push({
      url: tags.url,
      field: 'ogImage',
      issue: 'Missing og:image',
      severity: 'warning',
      recommendation: 'Add og:image (1200x630px recommended)',
    });
  }
  
  return issues;
}

/**
 * Check canonical URL
 */
export function checkCanonical(tags: MetaTags): MetaTagIssue[] {
  const issues: MetaTagIssue[] = [];
  
  if (!tags.canonical) {
    issues.push({
      url: tags.url,
      field: 'canonical',
      issue: 'Missing canonical URL',
      severity: 'warning',
      recommendation: 'Add canonical URL to prevent duplicate content issues',
    });
  }
  
  return issues;
}

/**
 * Analyze meta tags and generate score
 */
export function analyzeMetaTags(tags: MetaTags): MetaTagScore {
  const issues: MetaTagIssue[] = [];
  const strengths: string[] = [];
  
  // Check title
  const titleIssues = checkTitle(tags.title);
  titleIssues.forEach(issue => {
    issue.url = tags.url;
    issues.push(issue);
  });
  
  if (titleIssues.length === 0 && tags.title) {
    strengths.push('Well-optimized title tag');
  }
  
  // Check description
  const descIssues = checkDescription(tags.description);
  descIssues.forEach(issue => {
    issue.url = tags.url;
    issues.push(issue);
  });
  
  if (descIssues.length === 0 && tags.description) {
    strengths.push('Well-optimized meta description');
  }
  
  // Check Open Graph
  const ogIssues = checkOpenGraph(tags);
  issues.push(...ogIssues);
  
  if (tags.ogTitle && tags.ogDescription && tags.ogImage) {
    strengths.push('Complete Open Graph tags');
  }
  
  // Check canonical
  const canonicalIssues = checkCanonical(tags);
  issues.push(...canonicalIssues);
  
  if (tags.canonical) {
    strengths.push('Canonical URL set');
  }
  
  // Calculate score
  const maxPoints = 100;
  const criticalPenalty = 20;
  const warningPenalty = 10;
  const infoPenalty = 5;
  
  let score = maxPoints;
  
  issues.forEach(issue => {
    if (issue.severity === 'critical') {
      score -= criticalPenalty;
    } else if (issue.severity === 'warning') {
      score -= warningPenalty;
    } else {
      score -= infoPenalty;
    }
  });
  
  score = Math.max(0, score);
  
  return {
    url: tags.url,
    score,
    issues,
    strengths,
  };
}

/**
 * Get pages with low meta tag scores
 */
export function getLowScorePages(
  scores: MetaTagScore[],
  threshold: number = 70
): MetaTagScore[] {
  return scores.filter(score => score.score < threshold);
}

/**
 * Generate meta tag recommendations
 */
export function generateRecommendations(tags: MetaTags): string[] {
  const recommendations: string[] = [];
  const analysis = analyzeMetaTags(tags);
  
  analysis.issues.forEach(issue => {
    recommendations.push(`${issue.field}: ${issue.recommendation}`);
  });
  
  return recommendations;
}

/**
 * Mock function to fetch meta tags from URL
 * TODO: Replace with real scraper/crawler
 */
export async function fetchMetaTags(url: string): Promise<MetaTags> {
  console.log('[meta-tags] Mock fetch meta tags:', url);
  
  return {
    url,
    title: 'Example Page',
    description: 'This is an example page description',
  };
}

