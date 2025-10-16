/**
 * Voice Search Optimizer
 * @module lib/seo/voice-search
 */

export interface VoiceSearchOptimization {
  keyword: string;
  isVoiceOptimized: boolean;
  score: number;
  recommendations: string[];
}

export function analyzeVoiceSearchOptimization(content: {
  keyword: string;
  text: string;
  hasFAQ: boolean;
  hasQuestionFormat: boolean;
  readabilityScore: number;
}): VoiceSearchOptimization {
  const recommendations: string[] = [];
  let score = 0;
  
  if (content.keyword.split(' ').length >= 3) {
    score += 25;
  } else {
    recommendations.push('Use long-tail keywords (3+ words)');
  }
  
  if (content.hasFAQ) {
    score += 25;
  } else {
    recommendations.push('Add FAQ section with natural questions');
  }
  
  if (content.hasQuestionFormat) {
    score += 25;
  } else {
    recommendations.push('Use question-based headings (Who, What, Where, When, Why, How)');
  }
  
  if (content.readabilityScore >= 60) {
    score += 25;
  } else {
    recommendations.push('Improve readability for conversational tone');
  }
  
  return {
    keyword: content.keyword,
    isVoiceOptimized: score >= 75,
    score,
    recommendations,
  };
}
