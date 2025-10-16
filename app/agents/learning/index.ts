/**
 * Learning from Human Edits
 * 
 * Captures differences between AI drafts and human-approved versions
 * to improve future responses through fine-tuning.
 */

import { z } from 'zod';

/**
 * Edit diff schema
 */
export const EditDiffSchema = z.object({
  id: z.string(),
  approvalId: z.string(),
  conversationId: z.string(),
  agentId: z.string(),
  draftContent: z.string(),
  finalContent: z.string(),
  editDistance: z.number(),
  editType: z.enum(['minor', 'moderate', 'major', 'complete_rewrite']),
  changes: z.array(z.object({
    type: z.enum(['addition', 'deletion', 'modification']),
    original: z.string().optional(),
    revised: z.string().optional(),
    position: z.number(),
  })),
  grading: z.object({
    tone: z.number(),
    accuracy: z.number(),
    policy: z.number(),
  }).optional(),
  timestamp: z.string(),
});

export type EditDiff = z.infer<typeof EditDiffSchema>;

/**
 * Learning insight schema
 */
export const LearningInsightSchema = z.object({
  pattern: z.string(),
  frequency: z.number(),
  examples: z.array(z.string()),
  recommendation: z.string(),
});

export type LearningInsight = z.infer<typeof LearningInsightSchema>;

/**
 * Capture edit diff between draft and final
 * 
 * @param approvalId - Approval ID
 * @param draftContent - AI-generated draft
 * @param finalContent - Human-approved final version
 * @param grading - Optional grading data
 */
export async function captureEditDiff(
  approvalId: string,
  conversationId: string,
  agentId: string,
  draftContent: string,
  finalContent: string,
  grading?: { tone: number; accuracy: number; policy: number }
): Promise<EditDiff> {
  console.log('[Learning] Capturing edit diff for approval:', approvalId);

  // Calculate edit distance (Levenshtein distance)
  const editDistance = calculateEditDistance(draftContent, finalContent);
  
  // Determine edit type based on edit distance
  const editType = determineEditType(draftContent, finalContent, editDistance);
  
  // Extract specific changes
  const changes = extractChanges(draftContent, finalContent);

  const diff: EditDiff = {
    id: `diff_${Date.now()}`,
    approvalId,
    conversationId,
    agentId,
    draftContent,
    finalContent,
    editDistance,
    editType,
    changes,
    grading,
    timestamp: new Date().toISOString(),
  };

  // Try to store in Supabase if configured
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(url, key);
      const { error } = await sb.from('edit_diffs').insert({
        id: diff.id,
        approval_id: Number(approvalId),
        conversation_id: conversationId,
        agent_id: agentId,
        draft_content: draftContent,
        final_content: finalContent,
        edit_distance: editDistance,
        edit_type: editType,
        changes: diff.changes,
        grading: diff.grading || null,
        timestamp: diff.timestamp,
      });
      if (error) console.warn('[Learning] Supabase insert failed:', error.message);
    }
  } catch (e: any) {
    console.warn('[Learning] Persist diff failed:', e?.message || e);
  }

  return diff;
}

/**
 * Calculate Levenshtein edit distance
 */
function calculateEditDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Determine edit type based on edit distance
 */
function determineEditType(
  draft: string,
  final: string,
  editDistance: number
): 'minor' | 'moderate' | 'major' | 'complete_rewrite' {
  const maxLength = Math.max(draft.length, final.length);
  const editRatio = editDistance / maxLength;

  if (editRatio < 0.1) return 'minor';
  if (editRatio < 0.3) return 'moderate';
  if (editRatio < 0.6) return 'major';
  return 'complete_rewrite';
}

/**
 * Extract specific changes between draft and final
 */
function extractChanges(draft: string, final: string): EditDiff['changes'] {
  const changes: EditDiff['changes'] = [];

  // Simple word-level diff
  const draftWords = draft.split(/\s+/);
  const finalWords = final.split(/\s+/);

  let i = 0;
  let j = 0;

  while (i < draftWords.length || j < finalWords.length) {
    if (i >= draftWords.length) {
      // Addition
      changes.push({
        type: 'addition',
        revised: finalWords[j],
        position: j,
      });
      j++;
    } else if (j >= finalWords.length) {
      // Deletion
      changes.push({
        type: 'deletion',
        original: draftWords[i],
        position: i,
      });
      i++;
    } else if (draftWords[i] !== finalWords[j]) {
      // Modification
      changes.push({
        type: 'modification',
        original: draftWords[i],
        revised: finalWords[j],
        position: i,
      });
      i++;
      j++;
    } else {
      // No change
      i++;
      j++;
    }
  }

  return changes;
}

/**
 * Analyze edit patterns to generate insights
 * 
 * @param agentId - Agent ID
 * @param days - Number of days to analyze
 */
export async function analyzeEditPatterns(
  agentId: string,
  days: number = 30
): Promise<LearningInsight[]> {
  console.log('[Learning] Analyzing edit patterns for agent:', agentId);

  // TODO: Implement Supabase query to get edit diffs
  // const { data: diffs } = await supabase
  //   .from('edit_diffs')
  //   .select('*')
  //   .eq('agent_id', agentId)
  //   .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  // Mock insights
  const insights: LearningInsight[] = [
    {
      pattern: 'Missing empathy phrases',
      frequency: 15,
      examples: [
        'Draft: "Your order will ship tomorrow." → Final: "I understand your concern. Your order will ship tomorrow."',
        'Draft: "We cannot process refunds." → Final: "I apologize for the inconvenience. Unfortunately, we cannot process refunds."',
      ],
      recommendation: 'Add empathy phrases at the beginning of responses, especially for negative situations.',
    },
    {
      pattern: 'Too formal tone',
      frequency: 12,
      examples: [
        'Draft: "We shall process your request." → Final: "We\'ll process your request."',
        'Draft: "Please be advised that..." → Final: "Just to let you know..."',
      ],
      recommendation: 'Use more conversational language. Avoid overly formal phrases.',
    },
    {
      pattern: 'Missing specific details',
      frequency: 8,
      examples: [
        'Draft: "Your order is on the way." → Final: "Your order #12345 is on the way via USPS and should arrive by Friday."',
      ],
      recommendation: 'Include specific details like order numbers, carriers, and estimated dates.',
    },
  ];

  return insights;
}

/**
 * Generate fine-tuning dataset from edit diffs
 * 
 * @param agentId - Agent ID
 * @param minGrade - Minimum grade threshold (only include high-quality examples)
 */
export async function generateFineTuningDataset(
  agentId: string,
  minGrade: number = 4.0
): Promise<Array<{ prompt: string; completion: string }>> {
  console.log('[Learning] Generating fine-tuning dataset for agent:', agentId);

  // TODO: Implement Supabase query
  // const { data: diffs } = await supabase
  //   .from('edit_diffs')
  //   .select('*, conversations(*)')
  //   .eq('agent_id', agentId)
  //   .gte('grading.tone', minGrade)
  //   .gte('grading.accuracy', minGrade)
  //   .gte('grading.policy', minGrade);

  // Mock dataset
  const dataset = [
    {
      prompt: 'Customer: Where is my order #12345?\n\nDraft a response:',
      completion: 'I understand your concern about order #12345. Let me check that for you right away. Your order shipped yesterday via USPS Priority Mail and should arrive within 3-5 business days. I\'ve sent the tracking number to your email.',
    },
    {
      prompt: 'Customer: I received the wrong item. I ordered AN-8 but got AN-6.\n\nDraft a response:',
      completion: 'I sincerely apologize for the mix-up with your order. That must be frustrating. We\'ll send you the correct AN-8 fittings right away with expedited shipping at no charge. You can keep or return the AN-6 fittings - whatever is easier for you. I\'ve already processed the replacement order.',
    },
  ];

  return dataset;
}

/**
 * Get learning metrics
 * 
 * @param agentId - Agent ID
 * @param days - Number of days to analyze
 */
export async function getLearningMetrics(
  agentId: string,
  days: number = 30
): Promise<{
  totalEdits: number;
  averageEditDistance: number;
  editTypeDistribution: Record<string, number>;
  improvementTrend: Array<{ date: string; avgGrade: number }>;
}> {
  console.log('[Learning] Getting learning metrics for agent:', agentId);

  // TODO: Implement Supabase query
  // Mock data
  return {
    totalEdits: 125,
    averageEditDistance: 45,
    editTypeDistribution: {
      minor: 60,
      moderate: 40,
      major: 20,
      complete_rewrite: 5,
    },
    improvementTrend: [
      { date: '2025-10-01', avgGrade: 4.2 },
      { date: '2025-10-08', avgGrade: 4.4 },
      { date: '2025-10-15', avgGrade: 4.6 },
    ],
  };
}

/**
 * Export fine-tuning data in OpenAI format
 * 
 * @param dataset - Fine-tuning dataset
 */
export function exportFineTuningData(
  dataset: Array<{ prompt: string; completion: string }>
): string {
  // OpenAI fine-tuning format (JSONL)
  return dataset
    .map((example) =>
      JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful customer support agent.' },
          { role: 'user', content: example.prompt },
          { role: 'assistant', content: example.completion },
        ],
      })
    )
    .join('\n');
}

