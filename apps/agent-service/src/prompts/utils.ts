/**
 * Prompt Utilities
 * 
 * Shared utilities for confidence scoring, citation formatting,
 * and response quality assessment.
 */

export interface ConfidenceScore {
  score: number;
  level: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface Citation {
  title: string;
  url?: string;
  snippet?: string;
  relevance: number;
  timestamp?: string;
}

export interface ResponseQuality {
  factuality: number;  // 1-5: How factually accurate
  helpfulness: number;  // 1-5: How helpful to customer
  tone: number;  // 1-5: Professional and appropriate tone
  completeness: number;  // 1-5: Addresses all aspects of question
  clarity: number;  // 1-5: Clear and easy to understand
}

/**
 * Calculate confidence score based on multiple factors
 */
export function calculateConfidence(params: {
  knowledgeBaseHits: number;
  sourceRelevance: number[];
  questionComplexity: number;
  informationCompleteness: number;
}): ConfidenceScore {
  const { knowledgeBaseHits, sourceRelevance, questionComplexity, informationCompleteness } = params;
  
  // Base score from knowledge base hits
  let score = knowledgeBaseHits > 0 ? 70 : 30;
  
  // Add points for source relevance (up to +20)
  if (sourceRelevance.length > 0) {
    const avgRelevance = sourceRelevance.reduce((a, b) => a + b, 0) / sourceRelevance.length;
    score += avgRelevance * 20;
  }
  
  // Adjust for question complexity (-10 to +10)
  score += (5 - questionComplexity) * 2;
  
  // Adjust for information completeness (up to +10)
  score += informationCompleteness * 10;
  
  // Cap at 100
  score = Math.min(100, Math.max(0, score));
  
  // Determine level
  let level: 'High' | 'Medium' | 'Low';
  let reasoning: string;
  
  if (score >= 90) {
    level = 'High';
    reasoning = 'Strong knowledge base match with complete information';
  } else if (score >= 70) {
    level = 'Medium';
    reasoning = 'Good knowledge base match, may need minor verification';
  } else {
    level = 'Low';
    reasoning = 'Limited knowledge base information, requires operator verification';
  }
  
  return { score, level, reasoning };
}

/**
 * Format citations for inclusion in response
 */
export function formatCitations(citations: Citation[]): string {
  if (citations.length === 0) {
    return '';
  }
  
  let formatted = '\n\n**Sources:**\n';
  
  citations.forEach((citation, index) => {
    formatted += `${index + 1}. ${citation.title}`;
    if (citation.url) {
      formatted += ` - ${citation.url}`;
    }
    formatted += '\n';
    
    if (citation.snippet) {
      formatted += `   "${citation.snippet}"\n`;
    }
  });
  
  return formatted;
}

/**
 * Format inline citation reference
 */
export function inlineCitation(text: string, citationIndex: number): string {
  return `${text} [${citationIndex}]`;
}

/**
 * Extract key details from customer inquiry
 */
export function extractKeyDetails(inquiry: string): {
  orderNumber?: string;
  productMentions: string[];
  urgencyIndicators: string[];
  questions: string[];
} {
  const details = {
    orderNumber: undefined as string | undefined,
    productMentions: [] as string[],
    urgencyIndicators: [] as string[],
    questions: [] as string[],
  };
  
  // Extract order number patterns
  const orderMatch = inquiry.match(/#?(\d{4,})/);
  if (orderMatch) {
    details.orderNumber = orderMatch[1];
  }
  
  // Detect urgency indicators
  const urgencyWords = ['urgent', 'asap', 'immediately', 'emergency', 'never', 'still waiting'];
  urgencyWords.forEach(word => {
    if (inquiry.toLowerCase().includes(word)) {
      details.urgencyIndicators.push(word);
    }
  });
  
  // Extract questions
  const sentences = inquiry.split(/[.!?]+/);
  details.questions = sentences.filter(s => s.trim().includes('?'));
  
  return details;
}

/**
 * Assess response quality
 */
export function assessResponseQuality(params: {
  hasSourceCitations: boolean;
  addressesAllQuestions: boolean;
  usesCustomerName: boolean;
  providesNextSteps: boolean;
  tone: 'professional' | 'casual' | 'cold';
}): ResponseQuality {
  const { hasSourceCitations, addressesAllQuestions, usesCustomerName, providesNextSteps, tone } = params;
  
  return {
    factuality: hasSourceCitations ? 5 : 3,
    helpfulness: addressesAllQuestions && providesNextSteps ? 5 : 3,
    tone: tone === 'professional' ? 5 : tone === 'casual' ? 4 : 2,
    completeness: addressesAllQuestions ? 5 : 3,
    clarity: usesCustomerName && providesNextSteps ? 5 : 4,
  };
}

/**
 * Generate approval queue metadata
 */
export interface ApprovalMetadata {
  agentType: string;
  confidence: ConfidenceScore;
  citations: Citation[];
  quality: ResponseQuality;
  requiresVerification: boolean;
  estimatedReviewTime: number; // seconds
  priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
}

export function generateApprovalMetadata(params: {
  agentType: string;
  confidence: ConfidenceScore;
  citations: Citation[];
  hasUrgencyFlags: boolean;
  requiresVerification: boolean;
}): ApprovalMetadata {
  const { agentType, confidence, citations, hasUrgencyFlags, requiresVerification } = params;
  
  // Estimate review time based on confidence and complexity
  let estimatedReviewTime = 30; // base 30 seconds
  if (confidence.level === 'Low') estimatedReviewTime += 60;
  if (requiresVerification) estimatedReviewTime += 45;
  if (citations.length > 3) estimatedReviewTime += 15;
  
  // Determine priority
  let priorityLevel: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  if (hasUrgencyFlags) {
    priorityLevel = 'urgent';
  } else if (confidence.level === 'High' && !requiresVerification) {
    priorityLevel = 'low';
  } else if (confidence.level === 'Low' || requiresVerification) {
    priorityLevel = 'high';
  }
  
  // Assess quality based on citations and confidence
  const quality = assessResponseQuality({
    hasSourceCitations: citations.length > 0,
    addressesAllQuestions: confidence.score >= 70,
    usesCustomerName: true, // Assume template includes personalization
    providesNextSteps: true, // Assume template includes next steps
    tone: 'professional',
  });
  
  return {
    agentType,
    confidence,
    citations,
    quality,
    requiresVerification,
    estimatedReviewTime,
    priorityLevel,
  };
}

