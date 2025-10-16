/**
 * Sentiment Analysis
 * Backlog Task 4
 */

export interface SentimentResult {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  // Positive indicators
  if (lowerText.includes('thank')) score += 0.3;
  if (lowerText.includes('great')) score += 0.3;
  if (lowerText.includes('excellent')) score += 0.3;
  
  // Negative indicators
  if (lowerText.includes('angry')) score -= 0.4;
  if (lowerText.includes('terrible')) score -= 0.4;
  if (lowerText.includes('worst')) score -= 0.4;
  
  score = Math.max(-1, Math.min(1, score));
  
  let label: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (score > 0.2) label = 'positive';
  if (score < -0.2) label = 'negative';
  
  return { score, label, confidence: 0.7 };
}

