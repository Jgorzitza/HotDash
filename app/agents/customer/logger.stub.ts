/**
 * Edge Logger Stub — Supabase grading metadata storage
 *
 * This stub provides a test-safe interface for logging customer reply
 * drafts and grading metadata without requiring live Supabase connection.
 * Used in tests to keep npm run test:ci green.
 */

export interface GradingMetadata {
  conversationId: string;
  draftReply: string;
  humanReply?: string;
  tone: number; // 1-5
  accuracy: number; // 1-5
  policy: number; // 1-5
  editDistance?: number;
  timestamp: string;
}

export interface ReplyDraft {
  conversationId: string;
  context: string[];
  suggestedReply: string;
  evidence: {
    ragSources?: string[];
    confidence?: number;
  };
  risk: string;
  rollback: string;
}

/**
 * Log a customer reply draft to Supabase edge function
 * In test mode, returns success without actual network call
 */
export async function logReplyDraft(
  draft: ReplyDraft,
): Promise<{ success: boolean; id?: string }> {
  if (process.env.NODE_ENV === "test") {
    return { success: true, id: `test-draft-${Date.now()}` };
  }

  // Production: call Supabase edge function
  // TODO: Implement actual Supabase edge function call
  console.warn("logReplyDraft: Supabase edge function not implemented");
  return { success: false };
}

/**
 * Log grading metadata for learning signal collection
 * In test mode, returns success without actual network call
 */
export async function logGradingMetadata(
  grading: GradingMetadata,
): Promise<{ success: boolean; id?: string }> {
  if (process.env.NODE_ENV === "test") {
    return { success: true, id: `test-grading-${Date.now()}` };
  }

  // Production: call Supabase edge function
  // TODO: Implement actual Supabase edge function call
  console.warn("logGradingMetadata: Supabase edge function not implemented");
  return { success: false };
}

/**
 * Calculate Levenshtein edit distance between two strings
 * Used for learning signal collection
 */
export function calculateEditDistance(str1: string, str2: string): number {
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
