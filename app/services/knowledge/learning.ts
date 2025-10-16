/**
 * Learning Extraction Pipeline
 * Extracts learnings from human edits to AI drafts
 */

import { createClient } from '@supabase/supabase-js';

// Lazily configure Supabase for tests: don't throw at import time if env is missing
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : (process.env.NODE_ENV === 'test'
      ? createClient('http://localhost', 'test-key')
      : (() => { throw new Error('Supabase not configured'); })());

interface LearningInput {
  approvalId: number;
  conversationId: number;
  aiDraft: string;
  humanFinal: string;
  customerQuestion: string;
  grades: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  reviewer: string;
  category?: string;
  tags?: string[];
}

interface EditAnalysis {
  editDistance: number;
  editRatio: number;
  learningType: 'tone_improvement' | 'factual_correction' | 'policy_clarification' | 'template_refinement' | 'new_pattern';
  shouldCreateArticle: boolean;
  suggestedArticle?: {
    question: string;
    answer: string;
    category: string;
    tags: string[];
  };
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Analyze the type of edit made by human
 */
function analyzeEdit(aiDraft: string, humanFinal: string, grades: LearningInput['grades']): EditAnalysis {
  const editDistance = levenshteinDistance(aiDraft, humanFinal);
  const editRatio = editDistance / Math.max(aiDraft.length, 1);

  // Determine learning type based on grades and edit ratio
  let learningType: EditAnalysis['learningType'];
  
  if (grades.tone <= 3 && grades.accuracy >= 4 && grades.policy >= 4) {
    learningType = 'tone_improvement';
  } else if (grades.accuracy <= 3) {
    learningType = 'factual_correction';
  } else if (grades.policy <= 3) {
    learningType = 'policy_clarification';
  } else if (editRatio < 0.3 && grades.tone >= 4 && grades.accuracy >= 4) {
    learningType = 'template_refinement';
  } else {
    learningType = 'new_pattern';
  }

  // Decide if we should create a new KB article
  const shouldCreateArticle = (
    (editRatio >= 0.3 && grades.tone >= 4 && grades.accuracy >= 4 && grades.policy >= 4) ||
    learningType === 'new_pattern'
  );

  return {
    editDistance,
    editRatio,
    learningType,
    shouldCreateArticle
  };
}

/**
 * Extract learning from approval with human edits
 */
export async function extractLearning(input: LearningInput): Promise<void> {
  const analysis = analyzeEdit(input.aiDraft, input.humanFinal, input.grades);

  // Insert learning edit record
  const { data: learningEdit, error: insertError } = await supabase
    .from('kb_learning_edits')
    .insert({
      approval_id: input.approvalId,
      conversation_id: input.conversationId,
      ai_draft: input.aiDraft,
      human_final: input.humanFinal,
      edit_distance: analysis.editDistance,
      edit_ratio: analysis.editRatio,
      tone_grade: input.grades.tone,
      accuracy_grade: input.grades.accuracy,
      policy_grade: input.grades.policy,
      customer_question: input.customerQuestion,
      category: input.category,
      tags: input.tags || [],
      learning_type: analysis.learningType,
      reviewer: input.reviewer
    })
    .select()
    .single();

  if (insertError) {
    console.error('[Learning Extraction] Error inserting learning edit:', insertError);
    throw insertError;
  }

  // Create KB article if analysis suggests it
  if (analysis.shouldCreateArticle) {
    await createKBArticleFromLearning({
      question: input.customerQuestion,
      answer: input.humanFinal,
      category: input.category || inferCategory(input.customerQuestion),
      tags: input.tags || extractTags(input.customerQuestion, input.humanFinal),
      learningEditId: learningEdit.id,
      grades: input.grades
    });
  }

  // Update existing KB articles if this was a refinement
  if (analysis.learningType === 'template_refinement') {
    await updateRelatedKBArticles(input.customerQuestion, input.humanFinal, input.grades);
  }

  console.log('[Learning Extraction] Completed:', {
    learningEditId: learningEdit.id,
    learningType: analysis.learningType,
    editRatio: analysis.editRatio,
    articleCreated: analysis.shouldCreateArticle
  });
}

/**
 * Create KB article from learning
 */
async function createKBArticleFromLearning(params: {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  learningEditId: number;
  grades: LearningInput['grades'];
}): Promise<void> {
  // Calculate initial confidence based on grades
  const initialConfidence = (
    (params.grades.tone / 5) * 0.2 +
    (params.grades.accuracy / 5) * 0.3 +
    (params.grades.policy / 5) * 0.1 +
    0.4 * 0.5 // Default success rate component
  );

  const { data: article, error } = await supabase
    .from('kb_articles')
    .insert({
      question: params.question,
      answer: params.answer,
      category: params.category,
      tags: params.tags,
      source: 'extracted',
      created_by: 'learning_pipeline',
      confidence_score: initialConfidence,
      avg_tone_grade: params.grades.tone,
      avg_accuracy_grade: params.grades.accuracy,
      avg_policy_grade: params.grades.policy,
      usage_count: 1,
      success_count: 1
    })
    .select()
    .single();

  if (error) {
    console.error('[Learning] Error creating KB article:', error);
    throw error;
  }

  // Link back to learning edit
  await supabase
    .from('kb_learning_edits')
    .update({ kb_article_id: article.id })
    .eq('id', params.learningEditId);

  console.log('[Learning] Created KB article:', article.id);
}

/**
 * Update related KB articles based on refinement
 */
async function updateRelatedKBArticles(
  question: string,
  improvedAnswer: string,
  grades: LearningInput['grades']
): Promise<void> {
  // Find similar KB articles (simplified - in production use embeddings)
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .ilike('question', `%${question.substring(0, 50)}%`)
    .limit(5);

  if (!articles || articles.length === 0) return;

  // Update the most similar article
  const targetArticle = articles[0];
  
  // Recalculate confidence with new grades
  const newAvgTone = ((targetArticle.avg_tone_grade || 0) + grades.tone) / 2;
  const newAvgAccuracy = ((targetArticle.avg_accuracy_grade || 0) + grades.accuracy) / 2;
  const newAvgPolicy = ((targetArticle.avg_policy_grade || 0) + grades.policy) / 2;

  await supabase
    .from('kb_articles')
    .update({
      avg_tone_grade: newAvgTone,
      avg_accuracy_grade: newAvgAccuracy,
      avg_policy_grade: newAvgPolicy,
      updated_at: new Date().toISOString()
    })
    .eq('id', targetArticle.id);

  console.log('[Learning] Updated related KB article:', targetArticle.id);
}

/**
 * Infer category from question content
 */
function inferCategory(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('order') || lowerQuestion.includes('purchase')) {
    return 'orders';
  } else if (lowerQuestion.includes('ship') || lowerQuestion.includes('deliver') || lowerQuestion.includes('track')) {
    return 'shipping';
  } else if (lowerQuestion.includes('return') || lowerQuestion.includes('refund') || lowerQuestion.includes('exchange')) {
    return 'returns';
  } else if (lowerQuestion.includes('product') || lowerQuestion.includes('item') || lowerQuestion.includes('stock')) {
    return 'products';
  } else if (lowerQuestion.includes('login') || lowerQuestion.includes('account') || lowerQuestion.includes('password') || lowerQuestion.includes('error')) {
    return 'technical';
  } else if (lowerQuestion.includes('policy') || lowerQuestion.includes('warranty') || lowerQuestion.includes('terms')) {
    return 'policies';
  }
  
  return 'products'; // Default
}

/**
 * Extract relevant tags from question and answer
 */
function extractTags(question: string, answer: string): string[] {
  const tags: string[] = [];
  const combined = (question + ' ' + answer).toLowerCase();
  
  // Order tags
  if (combined.includes('track')) tags.push('order_tracking');
  if (combined.includes('cancel')) tags.push('order_cancellation');
  if (combined.includes('modify') || combined.includes('change')) tags.push('order_modification');
  
  // Shipping tags
  if (combined.includes('eta') || combined.includes('when')) tags.push('shipping_eta');
  if (combined.includes('international')) tags.push('shipping_international');
  if (combined.includes('delay')) tags.push('shipping_delay');
  if (combined.includes('cost') || combined.includes('price')) tags.push('shipping_cost');
  
  // Return tags
  if (combined.includes('return policy')) tags.push('return_policy');
  if (combined.includes('return process')) tags.push('return_process');
  if (combined.includes('refund')) tags.push('refund_timeline');
  
  // Product tags
  if (combined.includes('stock') || combined.includes('available')) tags.push('product_availability');
  if (combined.includes('spec') || combined.includes('dimension')) tags.push('product_specs');
  
  // Technical tags
  if (combined.includes('login') || combined.includes('password')) tags.push('account_login');
  if (combined.includes('payment') || combined.includes('checkout')) tags.push('payment_issue');
  
  // Policy tags
  if (combined.includes('privacy')) tags.push('privacy_policy');
  if (combined.includes('warranty')) tags.push('warranty_info');
  
  return tags.length > 0 ? tags : ['general'];
}

/**
 * Track recurring issues
 */
export async function trackRecurringIssue(
  issuePattern: string,
  category: string,
  tags: string[]
): Promise<void> {
  // Check if issue already exists
  const { data: existing } = await supabase
    .from('kb_recurring_issues')
    .select('*')
    .eq('issue_pattern', issuePattern)
    .single();

  if (existing) {
    // Update occurrence count
    await supabase
      .from('kb_recurring_issues')
      .update({
        occurrence_count: existing.occurrence_count + 1,
        last_seen_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    // If occurrence count >= 3, flag for KB article creation
    if (existing.occurrence_count + 1 >= 3 && existing.resolution_status === 'unresolved') {
      console.log('[Recurring Issue] Threshold reached, flagging for KB creation:', issuePattern);
      // In production, this would trigger a notification or workflow
    }
  } else {
    // Create new recurring issue record
    await supabase
      .from('kb_recurring_issues')
      .insert({
        issue_pattern: issuePattern,
        category,
        tags,
        occurrence_count: 1
      });
  }
}

