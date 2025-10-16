/**
 * KB Update Automation
 * Automatically updates KB articles based on learnings and usage patterns
 */

import { createClient } from '@supabase/supabase-js';
import { updateArticleConfidence } from '../../lib/knowledge/quality';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateTrigger {
  type: 'high_quality_approval' | 'significant_edit' | 'low_grade' | 'recurring_pattern';
  articleId?: number;
  data: any;
}

/**
 * Process update trigger and apply appropriate updates
 */
export async function processUpdateTrigger(trigger: UpdateTrigger): Promise<void> {
  switch (trigger.type) {
    case 'high_quality_approval':
      await handleHighQualityApproval(trigger.data);
      break;
    case 'significant_edit':
      await handleSignificantEdit(trigger.data);
      break;
    case 'low_grade':
      await handleLowGrade(trigger.data);
      break;
    case 'recurring_pattern':
      await handleRecurringPattern(trigger.data);
      break;
  }
}

/**
 * Handle high-quality approval (grades ≥ 4, edit_ratio < 0.1)
 */
async function handleHighQualityApproval(data: {
  articleId: number;
  grades: { tone: number; accuracy: number; policy: number };
}): Promise<void> {
  // Update confidence score (mark as successful)
  await updateArticleConfidence(data.articleId, true, data.grades);

  console.log('[Auto-Update] High quality approval processed:', data.articleId);
}

/**
 * Handle significant edit (edit_ratio ≥ 0.3, grades ≥ 4)
 */
async function handleSignificantEdit(data: {
  articleId: number;
  originalAnswer: string;
  improvedAnswer: string;
  grades: { tone: number; accuracy: number; policy: number };
}): Promise<void> {
  const { data: article } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('id', data.articleId)
    .single();

  if (!article) return;

  // Update the article with improved answer
  await supabase
    .from('kb_articles')
    .update({
      answer: data.improvedAnswer,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.articleId);

  // Update confidence with new grades
  await updateArticleConfidence(data.articleId, true, data.grades);

  console.log('[Auto-Update] Article updated with improved answer:', data.articleId);
}

/**
 * Handle low grade (any grade ≤ 2)
 */
async function handleLowGrade(data: {
  articleId: number;
  grades: { tone: number; accuracy: number; policy: number };
}): Promise<void> {
  // Update confidence score (mark as unsuccessful)
  await updateArticleConfidence(data.articleId, false, data.grades);

  // Flag for manual review if confidence drops too low
  const { data: article } = await supabase
    .from('kb_articles')
    .select('confidence_score')
    .eq('id', data.articleId)
    .single();

  if (article && article.confidence_score < 0.40) {
    console.log('[Auto-Update] Article flagged for review due to low confidence:', data.articleId);
    // In production, this would trigger a notification
  }

  console.log('[Auto-Update] Low grade processed:', data.articleId);
}

/**
 * Handle recurring pattern (≥ 3 occurrences in 7 days)
 */
async function handleRecurringPattern(data: {
  pattern: string;
  category: string;
  tags: string[];
  occurrenceCount: number;
}): Promise<void> {
  // Check if KB article already exists for this pattern
  const { data: existingArticles } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('category', data.category)
    .contains('tags', data.tags)
    .limit(5);

  if (existingArticles && existingArticles.length > 0) {
    // Article exists, just log
    console.log('[Auto-Update] Recurring pattern matches existing article');
    return;
  }

  // No article exists, flag for creation
  console.log('[Auto-Update] Recurring pattern needs KB article:', {
    pattern: data.pattern,
    occurrenceCount: data.occurrenceCount
  });

  // In production, this would trigger a workflow for article creation
}

/**
 * Batch update all articles based on recent learnings
 */
export async function batchUpdateFromLearnings(hours: number = 24): Promise<{
  updated: number;
  created: number;
  flagged: number;
}> {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Get recent learning edits
  const { data: learnings } = await supabase
    .from('kb_learning_edits')
    .select('*')
    .gte('created_at', cutoffDate.toISOString());

  if (!learnings || learnings.length === 0) {
    return { updated: 0, created: 0, flagged: 0 };
  }

  let updated = 0;
  let created = 0;
  let flagged = 0;

  for (const learning of learnings) {
    const avgGrade = (learning.tone_grade + learning.accuracy_grade + learning.policy_grade) / 3;

    if (learning.edit_ratio < 0.1 && avgGrade >= 4) {
      // High quality approval
      if (learning.kb_article_id) {
        await handleHighQualityApproval({
          articleId: learning.kb_article_id,
          grades: {
            tone: learning.tone_grade,
            accuracy: learning.accuracy_grade,
            policy: learning.policy_grade
          }
        });
        updated++;
      }
    } else if (learning.edit_ratio >= 0.3 && avgGrade >= 4) {
      // Significant edit
      if (learning.kb_article_id) {
        await handleSignificantEdit({
          articleId: learning.kb_article_id,
          originalAnswer: learning.ai_draft,
          improvedAnswer: learning.human_final,
          grades: {
            tone: learning.tone_grade,
            accuracy: learning.accuracy_grade,
            policy: learning.policy_grade
          }
        });
        updated++;
      } else {
        // Create new article
        created++;
      }
    } else if (avgGrade <= 2) {
      // Low grade
      if (learning.kb_article_id) {
        await handleLowGrade({
          articleId: learning.kb_article_id,
          grades: {
            tone: learning.tone_grade,
            accuracy: learning.accuracy_grade,
            policy: learning.policy_grade
          }
        });
        flagged++;
      }
    }
  }

  console.log('[Auto-Update] Batch update completed:', { updated, created, flagged });

  return { updated, created, flagged };
}

/**
 * Detect and update stale articles
 */
export async function updateStaleArticles(): Promise<number> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  if (!articles) return 0;

  let updated = 0;

  for (const article of articles) {
    const daysSinceLastUse = article.last_used_at 
      ? Math.floor((Date.now() - new Date(article.last_used_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Mark as needing review if not used in 60 days
    if (daysSinceLastUse > 60 && daysSinceLastUse < 90) {
      // In production, this would flag for review
      console.log('[Auto-Update] Stale article detected:', article.id);
      updated++;
    }
  }

  return updated;
}

/**
 * Merge duplicate articles
 */
export async function mergeDuplicateArticles(): Promise<number> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null)
    .order('confidence_score', { ascending: false });

  if (!articles || articles.length < 2) return 0;

  let merged = 0;

  // Simple duplicate detection based on question similarity
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const similarity = calculateQuestionSimilarity(
        articles[i].question,
        articles[j].question
      );

      if (similarity > 0.85 && articles[i].category === articles[j].category) {
        // Merge j into i (keep higher confidence)
        const keepArticle = articles[i].confidence_score >= articles[j].confidence_score ? articles[i] : articles[j];
        const archiveArticle = articles[i].confidence_score >= articles[j].confidence_score ? articles[j] : articles[i];

        // Combine usage stats
        await supabase
          .from('kb_articles')
          .update({
            usage_count: keepArticle.usage_count + archiveArticle.usage_count,
            success_count: keepArticle.success_count + archiveArticle.success_count
          })
          .eq('id', keepArticle.id);

        // Archive duplicate
        await supabase
          .from('kb_articles')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', archiveArticle.id);

        console.log('[Auto-Update] Merged duplicate articles:', {
          kept: keepArticle.id,
          archived: archiveArticle.id
        });

        merged++;
      }
    }
  }

  return merged;
}

/**
 * Calculate similarity between two questions
 */
function calculateQuestionSimilarity(q1: string, q2: string): number {
  const words1 = new Set(q1.toLowerCase().split(/\s+/));
  const words2 = new Set(q2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Schedule automatic updates (to be called by cron job)
 */
export async function runScheduledUpdates(): Promise<{
  batchUpdate: { updated: number; created: number; flagged: number };
  staleArticles: number;
  mergedDuplicates: number;
}> {
  console.log('[Auto-Update] Running scheduled updates...');

  const batchUpdate = await batchUpdateFromLearnings(24);
  const staleArticles = await updateStaleArticles();
  const mergedDuplicates = await mergeDuplicateArticles();

  console.log('[Auto-Update] Scheduled updates completed:', {
    batchUpdate,
    staleArticles,
    mergedDuplicates
  });

  return {
    batchUpdate,
    staleArticles,
    mergedDuplicates
  };
}

