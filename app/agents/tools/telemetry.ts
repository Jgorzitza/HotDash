/**
 * Cost and Latency Telemetry
 * 
 * Tracks agent performance metrics.
 * Backlog task #18: Cost/latency telemetry
 */

import { z } from 'zod';

/**
 * Telemetry event schema
 */
export const TelemetryEventSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  eventType: z.enum(['agent_run', 'tool_call', 'approval_request']),
  duration: z.number(),
  cost: z.number().optional(),
  tokens: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string(),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

/**
 * Track agent run
 */
export async function trackAgentRun(
  agentId: string,
  duration: number,
  tokens?: { prompt: number; completion: number; total: number },
  metadata?: Record<string, unknown>
): Promise<void> {
  const cost = tokens ? calculateCost(tokens) : undefined;

  const event: TelemetryEvent = {
    id: `telemetry_${Date.now()}`,
    agentId,
    eventType: 'agent_run',
    duration,
    cost,
    tokens,
    metadata,
    timestamp: new Date().toISOString(),
  };

  console.log('[Telemetry]', JSON.stringify(event));

  // TODO: Store in Supabase or metrics service
}

/**
 * Calculate cost based on token usage
 * Using GPT-4 pricing as example
 */
function calculateCost(tokens: { prompt: number; completion: number }): number {
  const PROMPT_COST_PER_1K = 0.03; // $0.03 per 1K prompt tokens
  const COMPLETION_COST_PER_1K = 0.06; // $0.06 per 1K completion tokens

  const promptCost = (tokens.prompt / 1000) * PROMPT_COST_PER_1K;
  const completionCost = (tokens.completion / 1000) * COMPLETION_COST_PER_1K;

  return promptCost + completionCost;
}

/**
 * Get telemetry metrics
 */
export async function getTelemetryMetrics(
  agentId: string,
  days: number = 30
): Promise<{
  totalRuns: number;
  avgDuration: number;
  totalCost: number;
  avgCost: number;
  totalTokens: number;
}> {
  // TODO: Query from Supabase
  return {
    totalRuns: 1250,
    avgDuration: 2500, // ms
    totalCost: 45.50,
    avgCost: 0.036,
    totalTokens: 1500000,
  };
}

