/**
 * Learning Service - Draft Diffs vs Approved
 * 
 * Capture and analyze differences between AI drafts and human-approved versions
 * to improve future content generation.
 */

import type { PostDraft } from './post-drafter';
import type { HITLPost } from './hitl-posting';

// ============================================================================
// Types
// ============================================================================

export interface DraftDiff {
  postId: string;
  field: string;
  original: string;
  edited: string;
  editType: 'addition' | 'deletion' | 'modification' | 'rewrite';
  editDistance: number; // Levenshtein distance
  significance: 'minor' | 'moderate' | 'major';
}

export interface LearningInsight {
  pattern: string;
  frequency: number;
  examples: string[];
  recommendation: string;
  confidence: number; // 0-1
}

export interface EditPattern {
  type: 'tone_adjustment' | 'factual_correction' | 'length_adjustment' | 'hashtag_change' | 'formatting';
  description: string;
  occurrences: number;
  avgImpact: number; // Impact on engagement
}

// ============================================================================
// Diff Analysis Functions
// ============================================================================

/**
 * Calculate diff between draft and approved version
 */
export function calculateDiff(
  original: PostDraft,
  edited: PostDraft
): DraftDiff[] {
  const diffs: DraftDiff[] = [];

  // Compare content
  if (original.content !== edited.content) {
    diffs.push({
      postId: '', // Will be set by caller
      field: 'content',
      original: original.content,
      edited: edited.content,
      editType: determineEditType(original.content, edited.content),
      editDistance: levenshteinDistance(original.content, edited.content),
      significance: determineSignificance(original.content, edited.content),
    });
  }

  // Compare hashtags
  const originalHashtags = original.metadata.hashtags.join(', ');
  const editedHashtags = edited.metadata.hashtags.join(', ');
  if (originalHashtags !== editedHashtags) {
    diffs.push({
      postId: '',
      field: 'hashtags',
      original: originalHashtags,
      edited: editedHashtags,
      editType: 'modification',
      editDistance: levenshteinDistance(originalHashtags, editedHashtags),
      significance: 'minor',
    });
  }

  return diffs;
}

/**
 * Analyze edit patterns across multiple posts
 */
export async function analyzeEditPatterns(
  posts: HITLPost[]
): Promise<EditPattern[]> {
  const patterns: Map<string, EditPattern> = new Map();

  posts.forEach(post => {
    if (!post.feedback?.edits) return;

    post.feedback.edits.forEach(edit => {
      const type = classifyEdit(edit.field, edit.original, edit.edited);
      const key = type;

      if (!patterns.has(key)) {
        patterns.set(key, {
          type,
          description: getEditDescription(type),
          occurrences: 0,
          avgImpact: 0,
        });
      }

      const pattern = patterns.get(key)!;
      pattern.occurrences++;
    });
  });

  return Array.from(patterns.values())
    .sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Generate learning insights from edit history
 */
export async function generateLearningInsights(
  posts: HITLPost[]
): Promise<LearningInsight[]> {
  const insights: LearningInsight[] = [];

  // Analyze tone adjustments
  const toneEdits = posts.filter(p => 
    p.feedback?.edits?.some(e => e.field === 'content' && p.feedback!.tone < 4)
  );

  if (toneEdits.length > 5) {
    insights.push({
      pattern: 'Tone Adjustments',
      frequency: toneEdits.length,
      examples: toneEdits.slice(0, 3).map(p => p.draft.content.slice(0, 100)),
      recommendation: 'Review brand voice guidelines and adjust tone to be more professional/casual',
      confidence: toneEdits.length / posts.length,
    });
  }

  // Analyze hashtag changes
  const hashtagEdits = posts.filter(p =>
    p.feedback?.edits?.some(e => e.field === 'hashtags')
  );

  if (hashtagEdits.length > 3) {
    insights.push({
      pattern: 'Hashtag Modifications',
      frequency: hashtagEdits.length,
      examples: hashtagEdits.slice(0, 3).map(p => p.draft.metadata.hashtags.join(', ')),
      recommendation: 'Update hashtag suggestion algorithm based on approved hashtags',
      confidence: hashtagEdits.length / posts.length,
    });
  }

  // Analyze length adjustments
  const lengthEdits = posts.filter(p => {
    if (!p.feedback?.edits) return false;
    const contentEdit = p.feedback.edits.find(e => e.field === 'content');
    if (!contentEdit) return false;
    const originalLength = contentEdit.original.length;
    const editedLength = contentEdit.edited.length;
    return Math.abs(originalLength - editedLength) > 50;
  });

  if (lengthEdits.length > 3) {
    const avgOriginal = lengthEdits.reduce((sum, p) => {
      const edit = p.feedback!.edits!.find(e => e.field === 'content')!;
      return sum + edit.original.length;
    }, 0) / lengthEdits.length;

    const avgEdited = lengthEdits.reduce((sum, p) => {
      const edit = p.feedback!.edits!.find(e => e.field === 'content')!;
      return sum + edit.edited.length;
    }, 0) / lengthEdits.length;

    insights.push({
      pattern: 'Length Adjustments',
      frequency: lengthEdits.length,
      examples: [`Avg original: ${avgOriginal.toFixed(0)} chars`, `Avg edited: ${avgEdited.toFixed(0)} chars`],
      recommendation: avgEdited > avgOriginal 
        ? 'Generate longer, more detailed content'
        : 'Generate more concise content',
      confidence: lengthEdits.length / posts.length,
    });
  }

  return insights.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract training data for supervised learning
 */
export async function extractTrainingData(
  posts: HITLPost[]
): Promise<{
  input: string;
  output: string;
  metadata: {
    platform: string;
    tone_grade: number;
    accuracy_grade: number;
    policy_grade: number;
  };
}[]> {
  return posts
    .filter(p => p.state === 'published' && p.feedback)
    .map(p => {
      const contentEdit = p.feedback?.edits?.find(e => e.field === 'content');
      
      return {
        input: contentEdit?.original || p.draft.content,
        output: contentEdit?.edited || p.draft.content,
        metadata: {
          platform: p.draft.platform,
          tone_grade: p.feedback?.tone || 0,
          accuracy_grade: p.feedback?.accuracy || 0,
          policy_grade: p.feedback?.policy || 0,
        },
      };
    });
}

// ============================================================================
// Helper Functions
// ============================================================================

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
 * Determine edit type
 */
function determineEditType(
  original: string,
  edited: string
): DraftDiff['editType'] {
  if (edited.length > original.length * 1.5) return 'addition';
  if (edited.length < original.length * 0.5) return 'deletion';
  if (levenshteinDistance(original, edited) > original.length * 0.7) return 'rewrite';
  return 'modification';
}

/**
 * Determine significance of edit
 */
function determineSignificance(
  original: string,
  edited: string
): DraftDiff['significance'] {
  const distance = levenshteinDistance(original, edited);
  const ratio = distance / Math.max(original.length, edited.length);

  if (ratio < 0.1) return 'minor';
  if (ratio < 0.3) return 'moderate';
  return 'major';
}

/**
 * Classify edit by type
 */
function classifyEdit(
  field: string,
  original: string,
  edited: string
): EditPattern['type'] {
  if (field === 'hashtags') return 'hashtag_change';
  
  const originalLower = original.toLowerCase();
  const editedLower = edited.toLowerCase();

  // Check for tone words
  const toneWords = ['please', 'thank', 'excited', 'amazing', 'great'];
  const originalTone = toneWords.filter(w => originalLower.includes(w)).length;
  const editedTone = toneWords.filter(w => editedLower.includes(w)).length;
  
  if (Math.abs(originalTone - editedTone) > 1) return 'tone_adjustment';

  // Check for length change
  if (Math.abs(original.length - edited.length) > 50) return 'length_adjustment';

  // Check for formatting
  if (original.split('\n').length !== edited.split('\n').length) return 'formatting';

  return 'factual_correction';
}

/**
 * Get description for edit type
 */
function getEditDescription(type: EditPattern['type']): string {
  const descriptions = {
    tone_adjustment: 'Adjustments to match brand voice and tone',
    factual_correction: 'Corrections to facts or product information',
    length_adjustment: 'Changes to content length',
    hashtag_change: 'Modifications to hashtag selection',
    formatting: 'Changes to text formatting and structure',
  };
  return descriptions[type];
}

