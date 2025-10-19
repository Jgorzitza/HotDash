/**
 * Chatwoot Conversation Tagger — Auto-tag conversations for analytics
 *
 * Automatically applies tags to Chatwoot conversations based on:
 * - Customer intent
 * - Product categories
 * - Resolution status
 * - Quality metrics
 */

export type ConversationTag =
  | "shipping"
  | "returns"
  | "product_compatibility"
  | "installation"
  | "pricing"
  | "order_modification"
  | "technical_support"
  | "vip"
  | "escalated"
  | "ai_drafted"
  | "high_quality"
  | "needs_review";

export interface TagSuggestion {
  tag: ConversationTag;
  confidence: number; // 0-1
  reason: string;
}

/**
 * Analyze conversation and suggest tags
 */
export function suggestTags(messages: string[]): TagSuggestion[] {
  const suggestions: TagSuggestion[] = [];
  const conversationText = messages.join(" ").toLowerCase();

  // Intent-based tags
  if (/ship|shipping|track|deliver/i.test(conversationText)) {
    suggestions.push({
      tag: "shipping",
      confidence: 0.9,
      reason: "Conversation mentions shipping/delivery",
    });
  }

  if (/return|refund|exchange/i.test(conversationText)) {
    suggestions.push({
      tag: "returns",
      confidence: 0.9,
      reason: "Conversation mentions returns/refunds",
    });
  }

  if (/compatible|fit|work with|will.*fit/i.test(conversationText)) {
    suggestions.push({
      tag: "product_compatibility",
      confidence: 0.85,
      reason: "Customer asking about product compatibility",
    });
  }

  if (/install|how to|instructions/i.test(conversationText)) {
    suggestions.push({
      tag: "installation",
      confidence: 0.8,
      reason: "Customer needs installation help",
    });
  }

  if (/price|cost|discount|coupon/i.test(conversationText)) {
    suggestions.push({
      tag: "pricing",
      confidence: 0.85,
      reason: "Pricing-related inquiry",
    });
  }

  if (/cancel|change.*order|modify/i.test(conversationText)) {
    suggestions.push({
      tag: "order_modification",
      confidence: 0.85,
      reason: "Customer wants to modify order",
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Apply quality-based tags
 */
export function suggestQualityTags(
  draftConfidence: number | undefined,
  qualityScore: number | undefined,
  approved: boolean | undefined,
): TagSuggestion[] {
  const suggestions: TagSuggestion[] = [];

  // AI drafted tag
  if (draftConfidence !== undefined) {
    suggestions.push({
      tag: "ai_drafted",
      confidence: 1.0,
      reason: "AI generated draft reply",
    });
  }

  // High quality tag
  if (qualityScore && qualityScore >= 4.7 && approved) {
    suggestions.push({
      tag: "high_quality",
      confidence: 0.9,
      reason: `High quality score: ${qualityScore.toFixed(1)}/5.0`,
    });
  }

  // Needs review tag
  if (draftConfidence && draftConfidence < 0.7) {
    suggestions.push({
      tag: "needs_review",
      confidence: 0.85,
      reason: `Low AI confidence: ${(draftConfidence * 100).toFixed(0)}%`,
    });
  }

  return suggestions;
}

/**
 * Apply tags via Chatwoot API
 */
export async function applyTags(
  chatwootConfig: { baseUrl: string; apiKey: string; accountId: string },
  conversationId: number,
  tags: string[],
): Promise<boolean> {
  const url = new URL(
    `/api/v1/accounts/${chatwootConfig.accountId}/conversations/${conversationId}/labels`,
    chatwootConfig.baseUrl,
  );

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        api_access_token: chatwootConfig.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ labels: tags }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to apply tags:", error);
    return false;
  }
}

/**
 * Auto-tag conversation based on content and quality
 */
export async function autoTagConversation(
  chatwootConfig: { baseUrl: string; apiKey: string; accountId: string },
  conversationId: number,
  messages: string[],
  qualityData?: {
    draftConfidence?: number;
    qualityScore?: number;
    approved?: boolean;
  },
): Promise<{ applied: string[]; suggested: TagSuggestion[] }> {
  // Get intent-based suggestions
  const intentSuggestions = suggestTags(messages);

  // Get quality-based suggestions
  const qualitySuggestions = qualityData
    ? suggestQualityTags(
        qualityData.draftConfidence,
        qualityData.qualityScore,
        qualityData.approved,
      )
    : [];

  // Combine and filter by confidence threshold
  const allSuggestions = [...intentSuggestions, ...qualitySuggestions];
  const highConfidence = allSuggestions.filter((s) => s.confidence >= 0.8);

  // Apply high-confidence tags
  const tagsToApply = highConfidence.map((s) => s.tag);

  if (tagsToApply.length > 0) {
    const success = await applyTags(
      chatwootConfig,
      conversationId,
      tagsToApply,
    );

    if (success) {
      return {
        applied: tagsToApply,
        suggested: allSuggestions,
      };
    }
  }

  return {
    applied: [],
    suggested: allSuggestions,
  };
}
