/**
 * Agent Performance Monitoring Service
 * 
 * Tracks CEO Agent and Customer Agent performance metrics including
 * response quality, response time, throughput, and learning trends.
 * 
 * @module services/ai-customer/agent-performance
 */

import { prisma } from '~/db.server';

/**
 * Agent performance metrics
 */
export interface AgentPerformanceMetrics {
  // Response Quality
  avgDraftGrade: number; // 1-5 scale
  draftApprovalRate: number; // % drafts approved without edits
  
  // Response Time
  avgDraftGenerationTime: number; // seconds
  avgApprovalTime: number; // minutes (operator review time)
  
  // Throughput
  draftsGenerated: number;
  draftsApproved: number;
  draftsRejected: number;
  draftsEdited: number;
  
  // Learning
  avgEditDistance: number; // Levenshtein distance
  improvementTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Get agent performance metrics
 * 
 * Analyzes decision_log data to calculate performance metrics for
 * CEO Agent or Customer Agent over a specified time period.
 * 
 * @param agent - Agent type ('customer' | 'ceo')
 * @param days - Number of days to analyze (default: 7)
 * @returns Performance metrics
 * 
 * @example
 * ```typescript
 * const metrics = await getAgentPerformance('customer', 7);
 * console.log(`Approval rate: ${metrics.draftApprovalRate}%`);
 * console.log(`Trend: ${metrics.improvementTrend}`);
 * ```
 */
export async function getAgentPerformance(
  agent: 'customer' | 'ceo',
  days: number = 7
): Promise<AgentPerformanceMetrics> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Determine action filter based on agent type
    const actionFilter = agent === 'customer' 
      ? 'chatwoot.approve_send' 
      : 'ceo.execute_action';

    // Query decision_log for agent actions
    const records = await prisma.decisionLog.findMany({
      where: {
        action: actionFilter,
        createdAt: { gte: since },
      },
      select: {
        payload: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Initialize counters
    let draftsGenerated = 0;
    let draftsApproved = 0;
    let draftsRejected = 0;
    let draftsEdited = 0;

    let totalGrade = 0;
    let gradeCount = 0;
    let totalEditDistance = 0;
    let editDistanceCount = 0;
    let totalGenerationTime = 0;
    let generationTimeCount = 0;
    let totalApprovalTime = 0;
    let approvalTimeCount = 0;

    const gradesOverTime: Array<{ grade: number; timestamp: Date }> = [];

    for (const record of records) {
      const payload = record.payload as any;
      
      draftsGenerated++;

      // Extract grading data
      if (payload?.grades) {
        const { tone, accuracy, policy } = payload.grades;
        if (typeof tone === 'number' && typeof accuracy === 'number' && typeof policy === 'number') {
          const avgGrade = (tone + accuracy + policy) / 3;
          totalGrade += avgGrade;
          gradeCount++;
          gradesOverTime.push({ grade: avgGrade, timestamp: record.createdAt });
        }
      }

      // Extract approval status
      if (payload?.approvalStatus) {
        if (payload.approvalStatus === 'approved') {
          draftsApproved++;
        } else if (payload.approvalStatus === 'rejected') {
          draftsRejected++;
        }
      }

      // Extract edit distance
      if (typeof payload?.editDistance === 'number') {
        totalEditDistance += payload.editDistance;
        editDistanceCount++;
        
        if (payload.editDistance > 0) {
          draftsEdited++;
        }
      }

      // Extract generation time
      if (typeof payload?.generationTime === 'number') {
        totalGenerationTime += payload.generationTime;
        generationTimeCount++;
      }

      // Extract approval time
      if (typeof payload?.approvalTime === 'number') {
        totalApprovalTime += payload.approvalTime;
        approvalTimeCount++;
      }
    }

    // Calculate averages
    const avgDraftGrade = gradeCount > 0 ? totalGrade / gradeCount : 0;
    const draftApprovalRate = draftsGenerated > 0 
      ? (draftsApproved / draftsGenerated) * 100 
      : 0;
    const avgDraftGenerationTime = generationTimeCount > 0 
      ? totalGenerationTime / generationTimeCount 
      : 0;
    const avgApprovalTime = approvalTimeCount > 0 
      ? totalApprovalTime / approvalTimeCount / 60 // Convert seconds to minutes
      : 0;
    const avgEditDistance = editDistanceCount > 0 
      ? totalEditDistance / editDistanceCount 
      : 0;

    // Calculate improvement trend
    const improvementTrend = calculateImprovementTrend(gradesOverTime);

    return {
      avgDraftGrade: roundToTwo(avgDraftGrade),
      draftApprovalRate: roundToTwo(draftApprovalRate),
      avgDraftGenerationTime: roundToTwo(avgDraftGenerationTime),
      avgApprovalTime: roundToTwo(avgApprovalTime),
      draftsGenerated,
      draftsApproved,
      draftsRejected,
      draftsEdited,
      avgEditDistance: roundToTwo(avgEditDistance),
      improvementTrend,
    };

  } catch (error) {
    console.error('[Agent Performance] Error:', error);
    // Return empty metrics on error
    return {
      avgDraftGrade: 0,
      draftApprovalRate: 0,
      avgDraftGenerationTime: 0,
      avgApprovalTime: 0,
      draftsGenerated: 0,
      draftsApproved: 0,
      draftsRejected: 0,
      draftsEdited: 0,
      avgEditDistance: 0,
      improvementTrend: 'stable',
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Round to 2 decimal places
 */
function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Calculate improvement trend
 * 
 * Compares first half vs second half of grading data to determine
 * if quality is improving, stable, or declining.
 * 
 * @param gradesOverTime - Array of grades with timestamps
 * @returns Trend classification
 */
function calculateImprovementTrend(
  gradesOverTime: Array<{ grade: number; timestamp: Date }>
): 'improving' | 'stable' | 'declining' {
  if (gradesOverTime.length < 10) {
    // Not enough data to determine trend
    return 'stable';
  }

  // Split into first half and second half
  const midpoint = Math.floor(gradesOverTime.length / 2);
  const firstHalf = gradesOverTime.slice(0, midpoint);
  const secondHalf = gradesOverTime.slice(midpoint);

  const avgFirstHalf = 
    firstHalf.reduce((sum, item) => sum + item.grade, 0) / firstHalf.length;
  const avgSecondHalf = 
    secondHalf.reduce((sum, item) => sum + item.grade, 0) / secondHalf.length;

  const difference = avgSecondHalf - avgFirstHalf;

  // Threshold: 0.2 points on 1-5 scale
  if (difference > 0.2) {
    return 'improving';
  } else if (difference < -0.2) {
    return 'declining';
  } else {
    return 'stable';
  }
}

