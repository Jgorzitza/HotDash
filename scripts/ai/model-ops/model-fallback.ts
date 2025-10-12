/**
 * Task V: Model Fallback and Graceful Degradation
 */

export const FALLBACK_CHAIN = [
  { model: 'gpt-4', cost: 'high', quality: 'best' },
  { model: 'gpt-4o-mini', cost: 'medium', quality: 'good' },
  { model: 'template-library', cost: 'free', quality: 'basic' },
  { model: 'human-escalation', cost: 'highest', quality: 'best' },
];

export async function generateWithFallback(query: string, timeout: number = 5000) {
  for (const fallback of FALLBACK_CHAIN) {
    try {
      const response = await Promise.race([
        callModel(fallback.model, query),
        timeoutPromise(timeout),
      ]);
      return { response, model: fallback.model, fallback_level: FALLBACK_CHAIN.indexOf(fallback) };
    } catch (error) {
      console.warn(`Model ${fallback.model} failed, trying next fallback`);
      continue;
    }
  }
  
  throw new Error('All fallback models failed');
}

