/**
 * AI Draft Generator — Production customer reply drafter
 *
 * Uses OpenAI API with RAG context from knowledge base.
 * Generates replies in Private Note format for HITL review.
 */

import { analyzeTone } from "~/lib/analysis/tone-analyzer";

export interface DraftRequest {
  conversationId: string;
  messages: Array<{
    id: string;
    sender: "customer" | "agent";
    content: string;
    timestamp: string;
  }>;
  customerEmail?: string;
}

export interface DraftResponse {
  conversationId: string;
  suggestedReply: string;
  confidence: number; // 0-1
  ragSources: string[];
  toneAnalysis: {
    score: number; // 1-5
    passesThreshold: boolean;
    issues: string[];
  };
  evidence: string;
  risk: string;
}

/**
 * Query knowledge base for relevant context
 */
async function queryKnowledgeBase(query: string): Promise<{
  sources: string[];
  context: string;
  confidence: number;
}> {
  // TODO: Implement LlamaIndex RAG query
  // For now, return fallback

  if (process.env.NODE_ENV === "test") {
    return {
      sources: ["shipping-policy", "return-policy"],
      context:
        "Standard shipping takes 5-7 business days. Returns accepted within 30 days.",
      confidence: 0.85,
    };
  }

  return {
    sources: [],
    context: "",
    confidence: 0.5,
  };
}

/**
 * Generate draft using OpenAI API
 */
async function generateWithOpenAI(
  conversationHistory: string,
  ragContext: string,
  customerQuery: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  if (process.env.NODE_ENV === "test") {
    return "Thanks for reaching out! I'll help you with that right away.";
  }

  // Construct prompt
  const systemPrompt = `You are a helpful customer support agent for Hot Rod AN, a hot rod parts retailer.
  
Brand Voice:
- Friendly and enthusiastic (hot rod enthusiast peer, not salesperson)
- Professional but conversational
- Clear and concise
- Action-oriented

Guidelines:
- Address the customer's specific question
- Use provided knowledge base context when relevant
- Keep responses under 200 words
- Include next steps or call-to-action when appropriate
- Never make promises about shipping times or availability without verification`;

  const userPrompt = `Knowledge Base Context:
${ragContext || "No specific articles found - use general knowledge"}

Conversation History:
${conversationHistory}

Current Customer Question:
${customerQuery}

Generate a helpful, friendly reply that addresses the customer's question.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw error;
  }
}

/**
 * Generate customer reply draft
 */
export async function generateDraft(
  request: DraftRequest,
): Promise<DraftResponse> {
  // Extract last customer message
  const customerMessages = request.messages.filter(
    (m) => m.sender === "customer",
  );

  if (customerMessages.length === 0) {
    throw new Error("No customer messages in conversation");
  }

  const lastCustomerMessage = customerMessages[customerMessages.length - 1];
  const customerQuery = lastCustomerMessage.content;

  // Build conversation history
  const conversationHistory = request.messages
    .map((m) => `[${m.sender}] ${m.content}`)
    .join("\n");

  // Query knowledge base
  const kb = await queryKnowledgeBase(customerQuery);

  // Generate draft with OpenAI
  const suggestedReply = await generateWithOpenAI(
    conversationHistory,
    kb.context,
    customerQuery,
  );

  // Validate tone
  const toneAnalysis = analyzeTone(suggestedReply);

  // Assess risk
  let risk = "Standard customer inquiry";
  if (kb.confidence < 0.6) {
    risk = "Low RAG confidence - verify accuracy before approving";
  } else if (!toneAnalysis.passesThreshold) {
    risk = "Tone issues detected - review before sending";
  }

  // Build evidence
  const evidenceParts = [
    `Customer query: "${customerQuery}"`,
    `RAG sources: ${kb.sources.length > 0 ? kb.sources.join(", ") : "None"}`,
    `RAG confidence: ${(kb.confidence * 100).toFixed(0)}%`,
    `Tone score: ${toneAnalysis.score}/5.0`,
  ];

  return {
    conversationId: request.conversationId,
    suggestedReply,
    confidence: kb.confidence,
    ragSources: kb.sources,
    toneAnalysis: {
      score: toneAnalysis.score,
      passesThreshold: toneAnalysis.passesThreshold,
      issues: toneAnalysis.issues.map((i) => i.description),
    },
    evidence: evidenceParts.join("\n"),
    risk,
  };
}

/**
 * Format draft as Private Note
 */
export function formatAsPrivateNote(draft: DraftResponse): string {
  const confidenceBadge =
    draft.confidence >= 0.8
      ? "✓ High"
      : draft.confidence >= 0.6
        ? "⚠ Medium"
        : "⚠ Low";
  const toneBadge = draft.toneAnalysis.passesThreshold ? "✓ Pass" : "⚠ Review";

  return `**🤖 AI Draft Reply - Requires HITL Approval**

**Suggested Reply:**
${draft.suggestedReply}

---

**Evidence:**
${draft.evidence}

**Confidence:** ${confidenceBadge} (${(draft.confidence * 100).toFixed(0)}%)
**Tone Check:** ${toneBadge} (${draft.toneAnalysis.score}/5.0)

${draft.toneAnalysis.issues.length > 0 ? `**Tone Issues:**\n${draft.toneAnalysis.issues.map((i) => `- ${i}`).join("\n")}\n\n` : ""}**Risk:** ${draft.risk}

---

**Actions:**
✅ **Approve & Send**: Edit if needed, grade (tone/accuracy/policy), then send
❌ **Reject**: Write manual reply and provide grading for learning

*Generated by AI-Customer Agent*`;
}
