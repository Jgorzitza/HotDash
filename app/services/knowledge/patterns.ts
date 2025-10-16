/**
 * Recurring Issue Detection
 * Identifies patterns in customer issues and flags for KB article creation
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface IssuePattern {
  pattern: string;
  category: string;
  tags: string[];
  occurrenceCount: number;
  firstSeen: Date;
  lastSeen: Date;
  resolutionStatus: string;
}

/**
 * Normalize customer question to identify patterns
 */
function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length for pattern matching
}

/**
 * Extract key phrases from question
 */
function extractKeyPhrases(question: string): string[] {
  const normalized = normalizeQuestion(question);
  const words = normalized.split(' ');
  const phrases: string[] = [];

  // Extract 2-3 word phrases
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
    if (i < words.length - 2) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return phrases;
}

/**
 * Detect if a customer question matches a recurring pattern
 */
export async function detectRecurringPattern(
  customerQuestion: string,
  category: string,
  tags: string[]
): Promise<IssuePattern | null> {
  const normalized = normalizeQuestion(customerQuestion);
  const keyPhrases = extractKeyPhrases(customerQuestion);

  // Check if this pattern already exists
  const { data: existingIssues } = await supabase
    .from('kb_recurring_issues')
    .select('*')
    .eq('category', category)
    .gte('last_seen_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

  if (!existingIssues) return null;

  // Find matching pattern
  for (const issue of existingIssues) {
    const similarity = calculateSimilarity(normalized, issue.issue_pattern);
    
    if (similarity > 0.7) {
      // Update occurrence count
      const { data: updated } = await supabase
        .from('kb_recurring_issues')
        .update({
          occurrence_count: issue.occurrence_count + 1,
          last_seen_at: new Date().toISOString()
        })
        .eq('id', issue.id)
        .select()
        .single();

      if (updated) {
        return {
          pattern: updated.issue_pattern,
          category: updated.category,
          tags: updated.tags,
          occurrenceCount: updated.occurrence_count,
          firstSeen: new Date(updated.first_seen_at),
          lastSeen: new Date(updated.last_seen_at),
          resolutionStatus: updated.resolution_status
        };
      }
    }
  }

  // No existing pattern found, create new one
  const { data: newIssue } = await supabase
    .from('kb_recurring_issues')
    .insert({
      issue_pattern: normalized,
      category,
      tags,
      occurrence_count: 1
    })
    .select()
    .single();

  if (newIssue) {
    return {
      pattern: newIssue.issue_pattern,
      category: newIssue.category,
      tags: newIssue.tags,
      occurrenceCount: 1,
      firstSeen: new Date(newIssue.first_seen_at),
      lastSeen: new Date(newIssue.last_seen_at),
      resolutionStatus: newIssue.resolution_status
    };
  }

  return null;
}

/**
 * Calculate similarity between two strings (Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Get recurring issues that need KB articles
 */
export async function getIssuesNeedingKBArticles(): Promise<IssuePattern[]> {
  const { data: issues } = await supabase
    .from('kb_recurring_issues')
    .select('*')
    .gte('occurrence_count', 3)
    .eq('resolution_status', 'unresolved')
    .order('occurrence_count', { ascending: false });

  if (!issues) return [];

  return issues.map(issue => ({
    pattern: issue.issue_pattern,
    category: issue.category,
    tags: issue.tags,
    occurrenceCount: issue.occurrence_count,
    firstSeen: new Date(issue.first_seen_at),
    lastSeen: new Date(issue.last_seen_at),
    resolutionStatus: issue.resolution_status
  }));
}

/**
 * Mark recurring issue as resolved with KB article
 */
export async function markIssueResolved(
  issuePattern: string,
  kbArticleId: number
): Promise<void> {
  await supabase
    .from('kb_recurring_issues')
    .update({
      resolution_status: 'kb_created',
      kb_article_id: kbArticleId
    })
    .eq('issue_pattern', issuePattern);

  console.log('[Patterns] Marked issue as resolved:', issuePattern);
}

/**
 * Analyze issue trends over time
 */
export async function analyzeIssueTrends(days: number = 30): Promise<{
  totalIssues: number;
  newIssues: number;
  resolvedIssues: number;
  topCategories: Array<{ category: string; count: number }>;
  criticalIssues: IssuePattern[];
}> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const { data: allIssues } = await supabase
    .from('kb_recurring_issues')
    .select('*')
    .gte('first_seen_at', cutoffDate.toISOString());

  if (!allIssues) {
    return {
      totalIssues: 0,
      newIssues: 0,
      resolvedIssues: 0,
      topCategories: [],
      criticalIssues: []
    };
  }

  const newIssues = allIssues.filter(i => 
    new Date(i.first_seen_at) >= cutoffDate
  ).length;

  const resolvedIssues = allIssues.filter(i => 
    i.resolution_status === 'kb_created'
  ).length;

  // Count by category
  const categoryCount: Record<string, number> = {};
  allIssues.forEach(issue => {
    categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Critical issues: high occurrence, unresolved
  const criticalIssues = allIssues
    .filter(i => i.occurrence_count >= 5 && i.resolution_status === 'unresolved')
    .map(issue => ({
      pattern: issue.issue_pattern,
      category: issue.category,
      tags: issue.tags,
      occurrenceCount: issue.occurrence_count,
      firstSeen: new Date(issue.first_seen_at),
      lastSeen: new Date(issue.last_seen_at),
      resolutionStatus: issue.resolution_status
    }))
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount);

  return {
    totalIssues: allIssues.length,
    newIssues,
    resolvedIssues,
    topCategories,
    criticalIssues
  };
}

/**
 * Suggest KB articles for recurring issues
 */
export async function suggestKBArticlesForIssues(): Promise<Array<{
  issue: IssuePattern;
  suggestedQuestion: string;
  suggestedTags: string[];
}>> {
  const issues = await getIssuesNeedingKBArticles();
  
  return issues.map(issue => ({
    issue,
    suggestedQuestion: formatQuestionFromPattern(issue.pattern),
    suggestedTags: issue.tags
  }));
}

/**
 * Format a normalized pattern back into a proper question
 */
function formatQuestionFromPattern(pattern: string): string {
  // Capitalize first letter
  const formatted = pattern.charAt(0).toUpperCase() + pattern.slice(1);
  
  // Add question mark if not present
  return formatted.endsWith('?') ? formatted : `${formatted}?`;
}

/**
 * Escalate product/policy issues to manager
 */
export async function escalateSystemicIssues(): Promise<Array<{
  issue: IssuePattern;
  reason: string;
}>> {
  const { data: issues } = await supabase
    .from('kb_recurring_issues')
    .select('*')
    .gte('occurrence_count', 10)
    .eq('resolution_status', 'unresolved');

  if (!issues) return [];

  const escalated: Array<{ issue: IssuePattern; reason: string }> = [];

  for (const issue of issues) {
    // Check if this might be a product or policy issue
    const pattern = issue.issue_pattern.toLowerCase();
    
    let reason = '';
    if (pattern.includes('broken') || pattern.includes('defect') || pattern.includes('not working')) {
      reason = 'Potential product quality issue';
      await supabase
        .from('kb_recurring_issues')
        .update({ resolution_status: 'product_issue' })
        .eq('id', issue.id);
    } else if (pattern.includes('policy') || pattern.includes('unfair') || pattern.includes('should')) {
      reason = 'Potential policy update needed';
      await supabase
        .from('kb_recurring_issues')
        .update({ resolution_status: 'policy_update_needed' })
        .eq('id', issue.id);
    } else {
      reason = 'High occurrence count - needs immediate attention';
      await supabase
        .from('kb_recurring_issues')
        .update({ resolution_status: 'escalated' })
        .eq('id', issue.id);
    }

    escalated.push({
      issue: {
        pattern: issue.issue_pattern,
        category: issue.category,
        tags: issue.tags,
        occurrenceCount: issue.occurrence_count,
        firstSeen: new Date(issue.first_seen_at),
        lastSeen: new Date(issue.last_seen_at),
        resolutionStatus: issue.resolution_status
      },
      reason
    });
  }

  if (escalated.length > 0) {
    console.log('[Patterns] Escalated systemic issues:', escalated.length);
  }

  return escalated;
}

