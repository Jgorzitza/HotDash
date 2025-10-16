/**
 * Response Quality Tracking
 * 
 * Tracks grading and quality metrics for AI-generated responses
 * Based on HITL workflow from docs/specs/chatwoot_integration.md
 */

export interface QualityGrade {
  conversationId: string;
  messageId: string;
  draftContent: string;
  finalContent: string;
  toneGrade: number; // 1-5
  accuracyGrade: number; // 1-5
  policyGrade: number; // 1-5
  wasEdited: boolean;
  editDistance: number;
  reviewedBy: string;
  reviewedAt: Date;
  aiModel?: string;
  confidence?: number;
}

export interface QualityMetrics {
  totalReviews: number;
  avgToneGrade: number;
  avgAccuracyGrade: number;
  avgPolicyGrade: number;
  avgOverallGrade: number;
  editRate: number;
  avgEditDistance: number;
  gradeDistribution: {
    tone: Record<number, number>;
    accuracy: Record<number, number>;
    policy: Record<number, number>;
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
 * Record a quality grade
 */
export function recordGrade(
  conversationId: string,
  messageId: string,
  draftContent: string,
  finalContent: string,
  grades: { tone: number; accuracy: number; policy: number },
  reviewedBy: string,
  metadata?: { aiModel?: string; confidence?: number }
): QualityGrade {
  const wasEdited = draftContent !== finalContent;
  const editDistance = wasEdited ? levenshteinDistance(draftContent, finalContent) : 0;
  
  return {
    conversationId,
    messageId,
    draftContent,
    finalContent,
    toneGrade: grades.tone,
    accuracyGrade: grades.accuracy,
    policyGrade: grades.policy,
    wasEdited,
    editDistance,
    reviewedBy,
    reviewedAt: new Date(),
    aiModel: metadata?.aiModel,
    confidence: metadata?.confidence,
  };
}

/**
 * Calculate quality metrics from grades
 */
export function calculateMetrics(grades: QualityGrade[]): QualityMetrics {
  if (grades.length === 0) {
    return {
      totalReviews: 0,
      avgToneGrade: 0,
      avgAccuracyGrade: 0,
      avgPolicyGrade: 0,
      avgOverallGrade: 0,
      editRate: 0,
      avgEditDistance: 0,
      gradeDistribution: {
        tone: {},
        accuracy: {},
        policy: {},
      },
    };
  }
  
  const avgToneGrade = grades.reduce((sum, g) => sum + g.toneGrade, 0) / grades.length;
  const avgAccuracyGrade = grades.reduce((sum, g) => sum + g.accuracyGrade, 0) / grades.length;
  const avgPolicyGrade = grades.reduce((sum, g) => sum + g.policyGrade, 0) / grades.length;
  const avgOverallGrade = (avgToneGrade + avgAccuracyGrade + avgPolicyGrade) / 3;
  
  const editedCount = grades.filter(g => g.wasEdited).length;
  const editRate = editedCount / grades.length;
  
  const totalEditDistance = grades.reduce((sum, g) => sum + g.editDistance, 0);
  const avgEditDistance = totalEditDistance / grades.length;
  
  // Grade distribution
  const toneDistribution: Record<number, number> = {};
  const accuracyDistribution: Record<number, number> = {};
  const policyDistribution: Record<number, number> = {};
  
  grades.forEach(g => {
    toneDistribution[g.toneGrade] = (toneDistribution[g.toneGrade] || 0) + 1;
    accuracyDistribution[g.accuracyGrade] = (accuracyDistribution[g.accuracyGrade] || 0) + 1;
    policyDistribution[g.policyGrade] = (policyDistribution[g.policyGrade] || 0) + 1;
  });
  
  return {
    totalReviews: grades.length,
    avgToneGrade: Math.round(avgToneGrade * 10) / 10,
    avgAccuracyGrade: Math.round(avgAccuracyGrade * 10) / 10,
    avgPolicyGrade: Math.round(avgPolicyGrade * 10) / 10,
    avgOverallGrade: Math.round(avgOverallGrade * 10) / 10,
    editRate: Math.round(editRate * 100) / 100,
    avgEditDistance: Math.round(avgEditDistance),
    gradeDistribution: {
      tone: toneDistribution,
      accuracy: accuracyDistribution,
      policy: policyDistribution,
    },
  };
}

/**
 * Check if grades meet quality targets
 */
export function meetsQualityTargets(metrics: QualityMetrics): {
  meets: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  
  // Targets from Chatwoot integration spec
  if (metrics.avgToneGrade < 4.5) {
    failures.push(`Tone grade ${metrics.avgToneGrade} below target 4.5`);
  }
  
  if (metrics.avgAccuracyGrade < 4.7) {
    failures.push(`Accuracy grade ${metrics.avgAccuracyGrade} below target 4.7`);
  }
  
  if (metrics.avgPolicyGrade < 4.8) {
    failures.push(`Policy grade ${metrics.avgPolicyGrade} below target 4.8`);
  }
  
  return {
    meets: failures.length === 0,
    failures,
  };
}

/**
 * Get quality trends over time
 */
export function getQualityTrends(grades: QualityGrade[], windowDays: number = 7) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  
  const recentGrades = grades.filter(g => g.reviewedAt >= windowStart);
  const olderGrades = grades.filter(g => g.reviewedAt < windowStart);
  
  const recentMetrics = calculateMetrics(recentGrades);
  const olderMetrics = calculateMetrics(olderGrades);
  
  return {
    recent: recentMetrics,
    previous: olderMetrics,
    trends: {
      tone: recentMetrics.avgToneGrade - olderMetrics.avgToneGrade,
      accuracy: recentMetrics.avgAccuracyGrade - olderMetrics.avgAccuracyGrade,
      policy: recentMetrics.avgPolicyGrade - olderMetrics.avgPolicyGrade,
      editRate: recentMetrics.editRate - olderMetrics.editRate,
    },
  };
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Quality Tracking\n');
  
  const testGrades: QualityGrade[] = [
    recordGrade(
      'conv1',
      'msg1',
      'Your order will ship soon.',
      'Your order will ship within 2 business days.',
      { tone: 5, accuracy: 5, policy: 5 },
      'operator1',
      { aiModel: 'gpt-4', confidence: 0.9 }
    ),
    recordGrade(
      'conv2',
      'msg2',
      'We can process a refund.',
      'We can process a refund for you. Please allow 5-7 business days.',
      { tone: 4, accuracy: 5, policy: 5 },
      'operator1'
    ),
    recordGrade(
      'conv3',
      'msg3',
      'The product is defective.',
      'I understand the product is defective. Let me help you with a replacement.',
      { tone: 5, accuracy: 4, policy: 5 },
      'operator2'
    ),
    recordGrade(
      'conv4',
      'msg4',
      'Contact support for help.',
      'Contact support for help.',
      { tone: 3, accuracy: 4, policy: 4 },
      'operator2'
    ),
  ];
  
  const metrics = calculateMetrics(testGrades);
  
  console.log('📊 Quality Metrics:');
  console.log(JSON.stringify(metrics, null, 2));
  console.log();
  
  const targetCheck = meetsQualityTargets(metrics);
  console.log('🎯 Quality Targets:');
  console.log(`  Meets targets: ${targetCheck.meets ? 'YES' : 'NO'}`);
  if (!targetCheck.meets) {
    console.log('  Failures:');
    targetCheck.failures.forEach(f => console.log(`    - ${f}`));
  }
}

