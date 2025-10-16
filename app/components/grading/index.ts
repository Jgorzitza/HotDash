/**
 * Grading Module
 * 
 * Exports grading interface and utilities for HITL approval workflow.
 */

export { GradingInterface, GradingSchema, type Grading } from './GradingInterface';

/**
 * Store grading in Supabase
 * 
 * @param approvalId - Approval request ID
 * @param grading - Grading data
 */
export async function storeGrading(
  approvalId: string,
  grading: { tone: number; accuracy: number; policy: number; feedback?: string; reviewer?: string }
): Promise<void> {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn('[Grading] Supabase not configured; skipping persist');
      return;
    }
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(url, key);
    const { error } = await sb.from('approval_grades').insert({
      approval_id: Number(approvalId),
      reviewer: grading.reviewer || 'reviewer',
      tone: grading.tone,
      accuracy: grading.accuracy,
      policy: grading.policy,
      notes: grading.feedback || null,
    });
    if (error) throw error;
  } catch (e: any) {
    console.warn('[Grading] storeGrading failed:', e?.message || e);
  }
}

/**
 * Get average grades for an agent
 * 
 * @param agentId - Agent ID
 * @param days - Number of days to look back
 */
export async function getAverageGrades(
  agentId: string,
  days: number = 30
): Promise<{ tone: number; accuracy: number; policy: number }> {
  // TODO: Implement Supabase query
  console.log('[STUB] getAverageGrades:', { agentId, days });
  
  // Mock data
  return {
    tone: 4.5,
    accuracy: 4.7,
    policy: 4.8,
  };
}

/**
 * Get grading trends over time
 * 
 * @param agentId - Agent ID
 * @param days - Number of days to analyze
 */
export async function getGradingTrends(
  agentId: string,
  days: number = 30
): Promise<Array<{ date: string; tone: number; accuracy: number; policy: number }>> {
  // TODO: Implement Supabase query
  console.log('[STUB] getGradingTrends:', { agentId, days });
  
  // Mock data
  return [
    { date: '2025-10-01', tone: 4.3, accuracy: 4.5, policy: 4.6 },
    { date: '2025-10-08', tone: 4.4, accuracy: 4.6, policy: 4.7 },
    { date: '2025-10-15', tone: 4.5, accuracy: 4.7, policy: 4.8 },
  ];
}

