/**
 * Agent Response Quality Rubric
 * 
 * Hot Rod AN-specific quality assessment for AI-generated responses
 */

export interface QualityScore {
  dimension: string;
  score: number; // 1-5
  weight: number;
  reasoning: string;
  examples: string[];
}

export interface QualityAssessment {
  overallScore: number; // Weighted average (1-5)
  dimensionScores: QualityScore[];
  passThreshold: boolean; // >= 4.0
  recommendations: string[];
  timestamp: string;
}

/**
 * Quality Rubric Dimensions for Hot Rod AN Responses
 */
export const QUALITY_DIMENSIONS = {
  accuracy: {
    name: 'Factual Accuracy',
    weight: 0.30,
    description: 'Correctness of product specs, technical details, policy information',
    criteria: {
      5: 'All facts verified from knowledge base, no errors, precise specifications',
      4: 'Facts correct, minor omissions, generally accurate',
      3: 'Mostly accurate, some imprecision, needs verification',
      2: 'Multiple factual errors, significant inaccuracies',
      1: 'Severely inaccurate, hallucinated information',
    },
  },
  
  completeness: {
    name: 'Completeness',
    weight: 0.20,
    description: 'Addresses all aspects of customer question, provides necessary context',
    criteria: {
      5: 'Fully answers question, anticipates follow-ups, provides context',
      4: 'Answers main question, some additional context',
      3: 'Answers question but misses important details',
      2: 'Partial answer, significant gaps',
      1: 'Does not answer the question',
    },
  },
  
  automotiveTone: {
    name: 'Automotive Tone & Terminology',
    weight: 0.15,
    description: 'Uses appropriate hot rod terminology, speaks to gearhead audience',
    criteria: {
      5: 'Perfect automotive terminology, authentic gearhead voice, technical yet accessible',
      4: 'Good automotive language, minor generic phrases',
      3: 'Mix of automotive and generic language',
      2: 'Mostly generic, few automotive terms',
      1: 'No automotive voice, corporate/generic language',
    },
  },
  
  helpfulness: {
    name: 'Helpfulness',
    weight: 0.15,
    description: 'Provides actionable next steps, links, recommendations',
    criteria: {
      5: 'Clear action items, helpful links, specific recommendations',
      4: 'Good next steps, some helpful info',
      3: 'Somewhat helpful, could be more actionable',
      2: 'Minimal guidance, vague suggestions',
      1: 'Not helpful, no clear path forward',
    },
  },
  
  clarity: {
    name: 'Clarity & Readability',
    weight: 0.10,
    description: 'Easy to understand, well-organized, appropriate length',
    criteria: {
      5: 'Crystal clear, perfect structure, ideal length',
      4: 'Clear and well-organized',
      3: 'Understandable but could be clearer',
      2: 'Confusing or poorly organized',
      1: 'Very unclear or incomprehensible',
    },
  },
  
  citations: {
    name: 'Source Citations',
    weight: 0.10,
    description: 'Cites knowledge base sources appropriately',
    criteria: {
      5: 'All facts cited, sources relevant, easy to verify',
      4: 'Most facts cited, good source selection',
      3: 'Some citations, could be more thorough',
      2: 'Few citations, hard to verify claims',
      1: 'No citations, cannot verify information',
    },
  },
};

/**
 * Calculate weighted overall score
 */
export function calculateOverallScore(scores: QualityScore[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
  return weightedSum / totalWeight;
}

/**
 * Assess a response against the quality rubric
 */
export function assessResponse(params: {
  response: string;
  customerQuery: string;
  sources: Array<{ text: string; metadata: any; score: number }>;
  expectedInfo?: string[];
}): QualityAssessment {
  const { response, customerQuery, sources, expectedInfo = [] } = params;
  
  const responseLower = response.toLowerCase();
  const scores: QualityScore[] = [];
  
  // 1. Accuracy (30%)
  const hasExpectedInfo = expectedInfo.length === 0 ? true :
    expectedInfo.filter(info => responseLower.includes(info.toLowerCase())).length / expectedInfo.length;
  const hasHallucinations = response.includes('I don\'t have') || response.includes('cannot verify');
  
  let accuracyScore = 3;
  let accuracyReasoning = 'Baseline - no verification';
  
  if (sources.length >= 2 && hasExpectedInfo >= 0.8) {
    accuracyScore = 5;
    accuracyReasoning = 'High source count, contains expected information';
  } else if (sources.length >= 1 && hasExpectedInfo >= 0.6) {
    accuracyScore = 4;
    accuracyReasoning = 'Good sources, mostly correct information';
  } else if (hasHallucinations) {
    accuracyScore = 2;
    accuracyReasoning = 'Contains uncertainty markers';
  }
  
  scores.push({
    dimension: 'accuracy',
    score: accuracyScore,
    weight: QUALITY_DIMENSIONS.accuracy.weight,
    reasoning: accuracyReasoning,
    examples: sources.slice(0, 2).map(s => s.metadata.url || s.text.substring(0, 50)),
  });
  
  // 2. Completeness (20%)
  const answerLength = response.length;
  const hasMultiplePoints = response.includes('\n') || response.includes('- ');
  const addressesQuery = response.toLowerCase().includes(customerQuery.toLowerCase().split(' ')[0]);
  
  let completenessScore = 3;
  let completenessReasoning = 'Baseline';
  
  if (answerLength > 200 && hasMultiplePoints && addressesQuery) {
    completenessScore = 5;
    completenessReasoning = 'Comprehensive answer with multiple points';
  } else if (answerLength > 100 && addressesQuery) {
    completenessScore = 4;
    completenessReasoning = 'Good answer, addresses question';
  } else if (!addressesQuery) {
    completenessScore = 2;
    completenessReasoning = 'Does not directly address query';
  }
  
  scores.push({
    dimension: 'completeness',
    score: completenessScore,
    weight: QUALITY_DIMENSIONS.completeness.weight,
    reasoning: completenessReasoning,
    examples: [],
  });
  
  // 3. Automotive Tone (15%)
  const automotiveTerms = [
    'ls swap', 'hot rod', 'fuel system', 'horsepower', 'hp',
    'efi', 'carb', 'intake', 'exhaust', 'turbo', 'supercharged',
    'an fitting', 'ptfe', 'braided', 'pressure rating',
    'build', 'install', 'swap', 'upgrade'
  ];
  
  const termsFound = automotiveTerms.filter(term => 
    responseLower.includes(term)
  ).length;
  
  const hasGearheadVoice = responseLower.includes('build') || 
                           responseLower.includes('setup') ||
                           responseLower.includes('performance');
  
  let toneScore = 3;
  let toneReasoning = 'Neutral tone';
  
  if (termsFound >= 3 && hasGearheadVoice) {
    toneScore = 5;
    toneReasoning = `Strong automotive voice (${termsFound} automotive terms)`;
  } else if (termsFound >= 2) {
    toneScore = 4;
    toneReasoning = `Good automotive terminology (${termsFound} terms)`;
  } else if (termsFound >= 1) {
    toneScore = 3;
    toneReasoning = `Some automotive language (${termsFound} term)`;
  } else {
    toneScore = 2;
    toneReasoning = 'Generic language, no automotive voice';
  }
  
  scores.push({
    dimension: 'automotiveTone',
    score: toneScore,
    weight: QUALITY_DIMENSIONS.automotiveTone.weight,
    reasoning: toneReasoning,
    examples: automotiveTerms.filter(t => responseLower.includes(t)),
  });
  
  // 4. Helpfulness (15%)
  const hasLinks = response.includes('http') || response.includes('[link]');
  const hasRecommendations = responseLower.includes('recommend') || responseLower.includes('suggest');
  const hasNextSteps = responseLower.includes('next') || responseLower.includes('let me know');
  
  let helpfulnessScore = 3;
  let helpfulnessReasoning = 'Basic answer';
  
  if (hasLinks && hasRecommendations && hasNextSteps) {
    helpfulnessScore = 5;
    helpfulnessReasoning = 'Includes links, recommendations, and next steps';
  } else if ((hasLinks || hasRecommendations) && hasNextSteps) {
    helpfulnessScore = 4;
    helpfulnessReasoning = 'Has helpful elements and next steps';
  }
  
  scores.push({
    dimension: 'helpfulness',
    score: helpfulnessScore,
    weight: QUALITY_DIMENSIONS.helpfulness.weight,
    reasoning: helpfulnessReasoning,
    examples: [],
  });
  
  // 5. Clarity (10%)
  const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgSentenceLength = response.length / sentenceCount;
  const wellStructured = hasMultiplePoints || sentenceCount >= 3;
  
  let clarityScore = 3;
  let clarityReasoning = 'Adequate clarity';
  
  if (avgSentenceLength < 100 && wellStructured) {
    clarityScore = 5;
    clarityReasoning = 'Clear, well-structured, concise sentences';
  } else if (avgSentenceLength < 150) {
    clarityScore = 4;
    clarityReasoning = 'Clear and reasonably structured';
  } else if (avgSentenceLength > 200) {
    clarityScore = 2;
    clarityReasoning = 'Overly long sentences, hard to follow';
  }
  
  scores.push({
    dimension: 'clarity',
    score: clarityScore,
    weight: QUALITY_DIMENSIONS.clarity.weight,
    reasoning: clarityReasoning,
    examples: [],
  });
  
  // 6. Citations (10%)
  const citationCount = sources.length;
  const highRelevanceSources = sources.filter(s => s.score >= 0.85).length;
  
  let citationScore = 3;
  let citationReasoning = 'Some sources';
  
  if (citationCount >= 3 && highRelevanceSources >= 2) {
    citationScore = 5;
    citationReasoning = `${citationCount} sources with ${highRelevanceSources} highly relevant`;
  } else if (citationCount >= 2) {
    citationScore = 4;
    citationReasoning = `${citationCount} sources provided`;
  } else if (citationCount >= 1) {
    citationScore = 3;
    citationReasoning = '1 source provided';
  } else {
    citationScore = 1;
    citationReasoning = 'No sources cited';
  }
  
  scores.push({
    dimension: 'citations',
    score: citationScore,
    weight: QUALITY_DIMENSIONS.citations.weight,
    reasoning: citationReasoning,
    examples: sources.map(s => s.metadata.url || 'no-url').slice(0, 2),
  });
  
  // Calculate overall score
  const overallScore = calculateOverallScore(scores);
  const passThreshold = overallScore >= 4.0;
  
  // Generate recommendations
  const recommendations: string[] = [];
  scores.forEach(score => {
    if (score.score < 4) {
      recommendations.push(`Improve ${score.dimension}: ${score.reasoning}`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Excellent response - no improvements needed');
  }
  
  return {
    overallScore,
    dimensionScores: scores,
    passThreshold,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Batch assess multiple responses
 */
export function batchAssess(responses: Array<{
  response: string;
  customerQuery: string;
  sources: any[];
  expectedInfo?: string[];
}>): {
  assessments: QualityAssessment[];
  summary: {
    totalResponses: number;
    passRate: number;
    avgOverallScore: number;
    avgByDimension: Record<string, number>;
    commonIssues: string[];
  };
} {
  const assessments = responses.map(r => assessResponse(r));
  
  const totalResponses = assessments.length;
  const passRate = assessments.filter(a => a.passThreshold).length / totalResponses;
  const avgOverallScore = assessments.reduce((sum, a) => sum + a.overallScore, 0) / totalResponses;
  
  // Average by dimension
  const avgByDimension: Record<string, number> = {};
  Object.keys(QUALITY_DIMENSIONS).forEach(dim => {
    const scores = assessments.map(a => 
      a.dimensionScores.find(s => s.dimension === dim)?.score || 0
    );
    avgByDimension[dim] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  });
  
  // Find common issues
  const allRecs = assessments.flatMap(a => a.recommendations);
  const recCounts: Record<string, number> = {};
  allRecs.forEach(rec => {
    const key = rec.split(':')[0]; // Get dimension
    recCounts[key] = (recCounts[key] || 0) + 1;
  });
  
  const commonIssues = Object.entries(recCounts)
    .filter(([_, count]) => count >= totalResponses * 0.3)
    .map(([issue]) => issue)
    .sort((a, b) => recCounts[b] - recCounts[a]);
  
  return {
    assessments,
    summary: {
      totalResponses,
      passRate,
      avgOverallScore,
      avgByDimension,
      commonIssues,
    },
  };
}

