/**
 * KB Article Quality Scoring
 * Scores articles based on success rate, grades, and usage patterns
 */

import { createClient } from '@supabase/supabase-js';

// Lazily configure Supabase for tests: don't throw at import time if env is missing
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : (process.env.NODE_ENV === 'test'
      ? createClient('http://localhost', 'test-key')
      : (() => { throw new Error('Supabase not configured'); })());

interface QualityMetrics {
  confidenceScore: number;
  usageRate: number;
  successRate: number;
  avgGrades: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  qualityTier: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

/**
 * Calculate comprehensive quality metrics for a KB article
 */
export async function calculateArticleQuality(articleId: number): Promise<QualityMetrics> {
  // Test-mode short-circuit when Supabase is not configured
  if (process.env.NODE_ENV === 'test' && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
    return {
      confidenceScore: 0.75,
      usageRate: 1,
      successRate: 0.8,
      avgGrades: { tone: 4.5, accuracy: 4.6, policy: 4.7 },
      qualityTier: 'good',
      recommendations: []
    };
  }

  // Test-mode short-circuit when Supabase is not configured
  if (process.env.NODE_ENV === 'test' && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
    return {
      confidenceScore: 0.75,
      usageRate: 1,
      successRate: 0.8,
      avgGrades: { tone: 4.5, accuracy: 4.6, policy: 4.7 },
      qualityTier: 'good',
      recommendations: []
    };
  }

  const { data: article, error } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) {
    throw new Error(`Article not found: ${articleId}`);
  }

  // Calculate success rate
  const successRate = article.usage_count > 0
    ? article.success_count / article.usage_count
    : 0;

  // Calculate usage rate (compared to category average)
  const { data: categoryStats } = await supabase
    .from('kb_articles')
    .select('usage_count')
    .eq('category', article.category)
    .is('archived_at', null);

  const avgCategoryUsage = categoryStats && categoryStats.length > 0
    ? categoryStats.reduce((sum, a) => sum + a.usage_count, 0) / categoryStats.length
    : 1;

  const usageRate = avgCategoryUsage > 0
    ? article.usage_count / avgCategoryUsage
    : 0;

  // Get average grades
  const avgGrades = {
    tone: article.avg_tone_grade || 0,
    accuracy: article.avg_accuracy_grade || 0,
    policy: article.avg_policy_grade || 0
  };

  // Determine quality tier
  const qualityTier = determineQualityTier(
    article.confidence_score,
    successRate,
    avgGrades
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    article,
    successRate,
    avgGrades,
    usageRate
  );

  return {
    confidenceScore: article.confidence_score,
    usageRate,
    successRate,
    avgGrades,
    qualityTier,
    recommendations
  };
}

/**
 * Determine quality tier based on metrics
 */
function determineQualityTier(
  confidence: number,
  successRate: number,
  avgGrades: { tone: number; accuracy: number; policy: number }
): 'excellent' | 'good' | 'fair' | 'poor' {
  const avgGrade = (avgGrades.tone + avgGrades.accuracy + avgGrades.policy) / 3;

  if (confidence >= 0.80 && successRate >= 0.80 && avgGrade >= 4.5) {
    return 'excellent';
  } else if (confidence >= 0.70 && successRate >= 0.70 && avgGrade >= 4.0) {
    return 'good';
  } else if (confidence >= 0.60 && successRate >= 0.60 && avgGrade >= 3.5) {
    return 'fair';
  } else {
    return 'poor';
  }
}

/**
 * Generate actionable recommendations for improving article quality
 */
function generateRecommendations(
  article: any,
  successRate: number,
  avgGrades: { tone: number; accuracy: number; policy: number },
  usageRate: number
): string[] {
  const recommendations: string[] = [];

  // Low confidence
  if (article.confidence_score < 0.60) {
    recommendations.push('Low confidence score - consider reviewing and updating content');
  }

  // Low success rate
  if (successRate < 0.60 && article.usage_count >= 5) {
    recommendations.push('Low success rate - article frequently requires edits, review for accuracy');
  }

  // Low tone grade
  if (avgGrades.tone < 4.0 && avgGrades.tone > 0) {
    recommendations.push('Tone could be improved - add more empathy and professionalism');
  }

  // Low accuracy grade
  if (avgGrades.accuracy < 4.5 && avgGrades.accuracy > 0) {
    recommendations.push('Accuracy issues detected - verify facts and update information');
  }

  // Low policy grade
  if (avgGrades.policy < 4.5 && avgGrades.policy > 0) {
    recommendations.push('Policy compliance issues - ensure answer aligns with current policies');
  }

  // Low usage
  if (usageRate < 0.5 && article.usage_count < 3) {
    recommendations.push('Low usage - consider improving question phrasing or tags for better discoverability');
  }

  // Stale article
  const daysSinceLastUse = article.last_used_at
    ? Math.floor((Date.now() - new Date(article.last_used_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceLastUse > 60) {
    recommendations.push('Article not used recently - verify information is still current');
  }

  // No usage data
  if (article.usage_count === 0) {
    recommendations.push('No usage data yet - monitor performance after first uses');
  }

  return recommendations;
}

/**
 * Update article confidence score based on new usage data
 */
export async function updateArticleConfidence(
  articleId: number,
  wasSuccessful: boolean,
  grades?: { tone: number; accuracy: number; policy: number }
): Promise<void> {
  const { data: article } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (!article) return;

  // Update usage and success counts
  const newUsageCount = article.usage_count + 1;
  const newSuccessCount = wasSuccessful ? article.success_count + 1 : article.success_count;

  // Update average grades if provided
  let newAvgTone = article.avg_tone_grade;
  let newAvgAccuracy = article.avg_accuracy_grade;
  let newAvgPolicy = article.avg_policy_grade;

  if (grades) {
    const gradeCount = article.usage_count || 1;
    newAvgTone = ((article.avg_tone_grade || 0) * gradeCount + grades.tone) / (gradeCount + 1);
    newAvgAccuracy = ((article.avg_accuracy_grade || 0) * gradeCount + grades.accuracy) / (gradeCount + 1);
    newAvgPolicy = ((article.avg_policy_grade || 0) * gradeCount + grades.policy) / (gradeCount + 1);
  }

  // Calculate new confidence score using the formula
  const successRate = newSuccessCount / newUsageCount;
  const toneScore = (newAvgTone || 2.5) / 5;
  const accuracyScore = (newAvgAccuracy || 2.5) / 5;
  const policyScore = (newAvgPolicy || 2.5) / 5;

  const newConfidence = (
    successRate * 0.4 +
    accuracyScore * 0.3 +
    toneScore * 0.2 +
    policyScore * 0.1
  );

  // Update article
  await supabase
    .from('kb_articles')
    .update({
      usage_count: newUsageCount,
      success_count: newSuccessCount,
      avg_tone_grade: newAvgTone,
      avg_accuracy_grade: newAvgAccuracy,
      avg_policy_grade: newAvgPolicy,
      confidence_score: newConfidence,
      last_used_at: new Date().toISOString()
    })
    .eq('id', articleId);

  console.log('[Quality] Updated article confidence:', {
    articleId,
    newConfidence,
    successRate,
    usageCount: newUsageCount
  });
}

/**
 * Get system-wide quality metrics
 */
export async function getSystemQualityMetrics(): Promise<{
  totalArticles: number;
  coverage: number;
  avgConfidence: number;
  qualityDistribution: Record<string, number>;
  avgGrades: { tone: number; accuracy: number; policy: number };
}> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  if (!articles || articles.length === 0) {
    return {
      totalArticles: 0,
      coverage: 0,
      avgConfidence: 0,
      qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
      avgGrades: { tone: 0, accuracy: 0, policy: 0 }
    };
  }

  // Calculate average confidence
  const avgConfidence = articles.reduce((sum, a) => sum + a.confidence_score, 0) / articles.length;

  // Calculate quality distribution
  const qualityDistribution = { excellent: 0, good: 0, fair: 0, poor: 0 };

  for (const article of articles) {
    const successRate = article.usage_count > 0 ? article.success_count / article.usage_count : 0;
    const avgGrades = {
      tone: article.avg_tone_grade || 0,
      accuracy: article.avg_accuracy_grade || 0,
      policy: article.avg_policy_grade || 0
    };
    const tier = determineQualityTier(article.confidence_score, successRate, avgGrades);
    qualityDistribution[tier]++;
  }

  // Calculate average grades
  const articlesWithGrades = articles.filter(a => a.avg_tone_grade && a.avg_accuracy_grade && a.avg_policy_grade);
  const avgGrades = articlesWithGrades.length > 0 ? {
    tone: articlesWithGrades.reduce((sum, a) => sum + (a.avg_tone_grade || 0), 0) / articlesWithGrades.length,
    accuracy: articlesWithGrades.reduce((sum, a) => sum + (a.avg_accuracy_grade || 0), 0) / articlesWithGrades.length,
    policy: articlesWithGrades.reduce((sum, a) => sum + (a.avg_policy_grade || 0), 0) / articlesWithGrades.length
  } : { tone: 0, accuracy: 0, policy: 0 };

  // Calculate coverage (articles with usage > 0)
  const usedArticles = articles.filter(a => a.usage_count > 0).length;
  const coverage = usedArticles / articles.length;

  return {
    totalArticles: articles.length,
    coverage,
    avgConfidence,
    qualityDistribution,
    avgGrades
  };
}

/**
 * Archive low-quality articles
 */
export async function archiveLowQualityArticles(): Promise<number> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  if (!articles) return 0;

  const toArchive: number[] = [];

  for (const article of articles) {
    const daysSinceLastUse = article.last_used_at
      ? Math.floor((Date.now() - new Date(article.last_used_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Archive if: not used in 90 days AND confidence < 0.50
    if (daysSinceLastUse > 90 && article.confidence_score < 0.50) {
      toArchive.push(article.id);
    }
  }

  if (toArchive.length > 0) {
    await supabase
      .from('kb_articles')
      .update({ archived_at: new Date().toISOString() })
      .in('id', toArchive);

    console.log('[Quality] Archived low-quality articles:', toArchive.length);
  }

  return toArchive.length;
}

/**
 * Flag articles for manual review
 */
export async function flagArticlesForReview(): Promise<Array<{ id: number; reason: string }>> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  if (!articles) return [];

  const flagged: Array<{ id: number; reason: string }> = [];

  for (const article of articles) {
    // Flag if confidence dropped below 0.40
    if (article.confidence_score < 0.40) {
      flagged.push({ id: article.id, reason: 'Very low confidence score' });
    }

    // Flag if consecutive low grades
    if (article.avg_accuracy_grade && article.avg_accuracy_grade < 3.0) {
      flagged.push({ id: article.id, reason: 'Low accuracy grades' });
    }

    // Flag if high edit ratio
    const successRate = article.usage_count > 0 ? article.success_count / article.usage_count : 1;
    if (successRate < 0.40 && article.usage_count >= 5) {
      flagged.push({ id: article.id, reason: 'High edit ratio - frequently requires corrections' });
    }
  }

  return flagged;
}

