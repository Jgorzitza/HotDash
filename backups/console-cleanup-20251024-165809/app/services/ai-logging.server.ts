// app/services/ai-logging.server.ts
// Log every AI-produced recommendation to packages/memory with scope 'build'
// Per docs/directions/ai.md

import { getMemory } from "../config/supabase.server";
import type { DecisionLog } from "../../packages/memory/index";
import { nanoid } from "nanoid";

export interface AIRecommendation {
  type:
    | "template_variant"
    | "brief"
    | "insight"
    | "anomaly_summary"
    | "reply_generation";
  promptVersion: string;
  inputs: Record<string, unknown>;
  output: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log AI-generated recommendation to Memory with scope 'build'
 * All AI outputs must be logged per AI agent direction
 */
export async function logAIRecommendation(
  recommendation: AIRecommendation,
  who: string = "ai-agent",
): Promise<void> {
  const memory = getMemory();

  const decision: DecisionLog = {
    id: nanoid(),
    scope: "build",
    who,
    what: `AI ${recommendation.type}: ${recommendation.output.slice(0, 100)}${recommendation.output.length > 100 ? "..." : ""}`,
    why: `Prompt v${recommendation.promptVersion} with inputs: ${JSON.stringify(recommendation.inputs).slice(0, 200)}`,
    evidenceUrl: recommendation.metadata?.sourceFactId
      ? `fact://${recommendation.metadata.sourceFactId}`
      : undefined,
    createdAt: new Date().toISOString(),
  };

  await memory.putDecision(decision);
}

/**
 * Log AI-generated copy variant for Chatwoot replies
 */
export async function logReplyGeneration(
  templateId: string,
  promptVersion: string,
  inputs: { customerName: string; conversationId: number; context: string },
  generatedReply: string,
  sourceFactId?: string,
): Promise<void> {
  await logAIRecommendation({
    type: "reply_generation",
    promptVersion,
    inputs: {
      templateId,
      ...inputs,
    },
    output: generatedReply,
    metadata: {
      sourceFactId,
      templateId,
    },
  });
}

/**
 * Log AI-generated anomaly summary
 */
export async function logAnomalySummary(
  factType: string,
  promptVersion: string,
  inputs: { anomalyData: unknown; threshold: unknown },
  summary: string,
  sourceFactId?: string,
): Promise<void> {
  await logAIRecommendation({
    type: "anomaly_summary",
    promptVersion,
    inputs: {
      factType,
      ...inputs,
    },
    output: summary,
    metadata: {
      sourceFactId,
      factType,
    },
  });
}

/**
 * Log AI-generated insight or brief
 */
export async function logInsight(
  topic: string,
  promptVersion: string,
  inputs: Record<string, unknown>,
  insight: string,
  sourceFactId?: string,
): Promise<void> {
  await logAIRecommendation({
    type: "insight",
    promptVersion,
    inputs: {
      topic,
      ...inputs,
    },
    output: insight,
    metadata: {
      sourceFactId,
      topic,
    },
  });
}
