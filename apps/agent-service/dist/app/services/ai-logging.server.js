// app/services/ai-logging.server.ts
// Log every AI-produced recommendation to packages/memory with scope 'build'
// Per docs/directions/ai.md
import { getMemory } from "../config/supabase.server";
import { nanoid } from "nanoid";
/**
 * Log AI-generated recommendation to Memory with scope 'build'
 * All AI outputs must be logged per AI agent direction
 */
export async function logAIRecommendation(recommendation, who = "ai-agent") {
    const memory = getMemory();
    const decision = {
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
export async function logReplyGeneration(templateId, promptVersion, inputs, generatedReply, sourceFactId) {
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
export async function logAnomalySummary(factType, promptVersion, inputs, summary, sourceFactId) {
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
export async function logInsight(topic, promptVersion, inputs, insight, sourceFactId) {
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
//# sourceMappingURL=ai-logging.server.js.map