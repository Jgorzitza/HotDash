/**
 * Draft Reply Generator — Customer support AI with RAG context
 *
 * Generates customer reply drafts using conversation context and RAG from AI-Knowledge base.
 * Outputs Private Note format for HITL approval workflow.
 */

import type { ReplyDraft } from "./logger.stub";

export interface ConversationMessage {
  id: string;
  sender: "customer" | "agent";
  content: string;
  timestamp: string;
}

export interface RAGContext {
  sources: string[];
  relevantArticles: Array<{
    title: string;
    excerpt: string;
    url?: string;
  }>;
  confidence: number; // 0-1
}

export interface DraftReplyOptions {
  conversationId: string;
  messages: ConversationMessage[];
  customerEmail?: string;
  ragContext?: RAGContext;
}

/**
 * Query RAG knowledge base for relevant context
 * In test mode, returns mock context
 */
async function queryRAGKnowledgeBase(query: string): Promise<RAGContext> {
  if (process.env.NODE_ENV === "test") {
    return {
      sources: ["test-article-1", "test-article-2"],
      relevantArticles: [
        {
          title: "Return Policy",
          excerpt: "Our return policy allows returns within 30 days...",
        },
      ],
      confidence: 0.85,
    };
  }

  // TODO: Implement LlamaIndex RAG query
  // Use app/services/ai-knowledge or similar integration
  console.warn("RAG knowledge base not implemented, using fallback");

  return {
    sources: [],
    relevantArticles: [],
    confidence: 0.0,
  };
}

/**
 * Generate reply draft using conversation context and RAG
 */
export async function generateReplyDraft(
  options: DraftReplyOptions,
): Promise<ReplyDraft> {
  const { conversationId, messages, ragContext } = options;

  // Extract last customer message as the query
  const lastCustomerMessage = messages
    .filter((m) => m.sender === "customer")
    .slice(-1)[0];

  if (!lastCustomerMessage) {
    throw new Error("No customer message found in conversation");
  }

  // Query RAG knowledge base if context not provided
  const rag =
    ragContext || (await queryRAGKnowledgeBase(lastCustomerMessage.content));

  // Build conversation context
  const conversationContext = messages.map((m) => `[${m.sender}] ${m.content}`);

  // Generate draft reply
  // TODO: Use OpenAI Agents SDK or similar LLM integration
  const suggestedReply = await generateDraftReplyWithLLM({
    conversationContext,
    ragArticles: rag.relevantArticles,
    customerQuery: lastCustomerMessage.content,
  });

  return {
    conversationId,
    context: conversationContext,
    suggestedReply,
    evidence: {
      ragSources: rag.sources,
      confidence: rag.confidence,
    },
    risk:
      rag.confidence < 0.7
        ? "Low confidence - manual review recommended"
        : "Standard customer inquiry",
    rollback: "Delete Private Note if draft is rejected",
  };
}

/**
 * Generate draft reply using OpenAI API with RAG context
 */
async function generateDraftReplyWithLLM(params: {
  conversationContext: string[];
  ragArticles: RAGContext["relevantArticles"];
  customerQuery: string;
}): Promise<string> {
  const { conversationContext, ragArticles, customerQuery } = params;

  if (process.env.NODE_ENV === "test") {
    return "Thank you for reaching out! Based on our policy, we can help you with that.";
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Build context from RAG articles
  const articleContext =
    ragArticles.length > 0
      ? `\n\nRelevant knowledge base articles:\n${ragArticles.map((a) => `- ${a.title}: ${a.excerpt}`).join("\n")}`
      : "";

  const systemPrompt = `You are a customer support agent for Hot Rod AN, a hot rod parts retailer.

Brand Voice:
- Friendly and enthusiastic (hot rod enthusiast peer, not salesperson)
- Professional but conversational  
- Clear and concise
- Action-oriented

Guidelines:
- Address customer's specific question
- Use knowledge base context when provided
- Keep under 200 words
- Include next steps when appropriate
- Never promise shipping/availability without verification`;

  const userPrompt = `Conversation History:
${conversationContext.join("\n")}${articleContext}

Current Customer Question: ${customerQuery}

Generate a helpful, friendly reply.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${response.status} - ${JSON.stringify(error)}`,
      );
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw error;
  }
}

/**
 * Format draft as Chatwoot Private Note
 */
export function formatAsPrivateNote(draft: ReplyDraft): string {
  const { suggestedReply, evidence, risk } = draft;

  return `**AI Draft Reply (HITL Review Required)**

**Suggested Reply:**
${suggestedReply}

**Evidence:**
- RAG Sources: ${evidence.ragSources?.join(", ") || "None"}
- Confidence: ${((evidence.confidence || 0) * 100).toFixed(0)}%

**Risk Assessment:**
${risk}

**Actions:**
✅ Approve & Send: Edit if needed, then send as public reply
❌ Reject: Provide manual reply and grade for learning

*Generated by AI-Customer Agent*`;
}
