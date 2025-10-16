/**
 * GA4 Quota and Rate Limiting
 * 
 * Handle GA4 API quotas with exponential backoff.
 */

import { appMetrics } from '../../utils/metrics.server.ts';

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a quota error
      if (error.code === 429 || error.message?.includes('quota')) {
        appMetrics.gaQuotaExceeded();
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.warn(`[GA4 Quota] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await sleep(delay);
          continue;
        }
        
        throw new QuotaExceededError('GA4 API quota exceeded after retries');
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw lastError || new Error('Unknown error in withRetry');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function checkSampling(response: any): boolean {
  // GA4 includes sampling info in response metadata
  const samplesReadCount = response.metadata?.samplesReadCount;
  const samplingSpaceSizes = response.metadata?.samplingSpaceSizes;
  
  if (samplesReadCount && samplingSpaceSizes) {
    const samplingRate = parseInt(samplesReadCount, 10) / parseInt(samplingSpaceSizes[0], 10);
    
    if (samplingRate < 1.0) {
      console.warn(`[GA4 Sampling] Data is sampled at ${(samplingRate * 100).toFixed(2)}%`);
      appMetrics.gaSamplingDetected(samplingRate);
      return true;
    }
  }
  
  return false;
}

