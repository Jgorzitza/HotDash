/**
 * Conversation Summarizer — Reduce token usage for long threads
 *
 * Summarizes long conversation histories to reduce context size
 * while preserving key information for draft generation.
 */

export interface ConversationSummary {
  conversationId: string;
  messageCount: number;
  summary: string;
  keyPoints: string[];
  customerIntent: string;
  recentMessages: string[]; // Last N messages kept verbatim
  tokensSaved: number; // Estimated tokens saved
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Extract key points from conversation
 */
function extractKeyPoints(messages: string[]): string[] {
  const keyPoints: string[] = [];

  // Look for order numbers
  const orderPattern = /#?\d{5,}/g;
  const orderMatches = messages.join(" ").match(orderPattern);
  if (orderMatches) {
    keyPoints.push(`Order number: ${orderMatches[0]}`);
  }

  // Look for shipping mentions
  if (messages.some((m) => /ship|shipping|deliver/i.test(m))) {
    keyPoints.push("Customer asking about shipping");
  }

  // Look for return/refund mentions
  if (messages.some((m) => /return|refund|exchange/i.test(m))) {
    keyPoints.push("Return/refund inquiry");
  }

  // Look for product compatibility
  if (messages.some((m) => /compatible|fit|work with/i.test(m))) {
    keyPoints.push("Product compatibility question");
  }

  // Look for pricing
  if (messages.some((m) => /price|cost|discount/i.test(m))) {
    keyPoints.push("Pricing inquiry");
  }

  return keyPoints;
}

/**
 * Identify customer intent from conversation
 */
function identifyIntent(messages: string[]): string {
  const customerMessages = messages.filter((m) => m.startsWith("[customer]"));

  if (customerMessages.length === 0) {
    return "Unknown - no customer messages";
  }

  const lastMessage =
    customerMessages[customerMessages.length - 1].toLowerCase();

  // Intent classification
  if (/where.*order|track|shipped/i.test(lastMessage)) {
    return "Order tracking / shipping status";
  }
  if (/return|refund|exchange/i.test(lastMessage)) {
    return "Return / refund request";
  }
  if (/compatible|fit|work/i.test(lastMessage)) {
    return "Product compatibility question";
  }
  if (/install|how to|instructions/i.test(lastMessage)) {
    return "Installation / usage help";
  }
  if (/price|cost|discount/i.test(lastMessage)) {
    return "Pricing inquiry";
  }
  if (/cancel|change.*order/i.test(lastMessage)) {
    return "Order modification request";
  }

  return "General inquiry";
}

/**
 * Summarize long conversation
 *
 * Strategy:
 * - Keep last 5 messages verbatim (most recent context)
 * - Summarize earlier messages
 * - Extract key points
 * - Identify customer intent
 */
export function summarizeConversation(
  conversationId: string,
  messages: string[],
  options: {
    keepRecentCount?: number; // Default: 5
    maxSummaryLength?: number; // Default: 200
  } = {},
): ConversationSummary {
  const keepRecentCount = options.keepRecentCount || 5;
  const maxSummaryLength = options.maxSummaryLength || 200;

  // If conversation is short, no summarization needed
  if (messages.length <= keepRecentCount) {
    return {
      conversationId,
      messageCount: messages.length,
      summary: "Short conversation - no summarization needed",
      keyPoints: extractKeyPoints(messages),
      customerIntent: identifyIntent(messages),
      recentMessages: messages,
      tokensSaved: 0,
    };
  }

  // Split into old (to summarize) and recent (keep verbatim)
  const oldMessages = messages.slice(0, -keepRecentCount);
  const recentMessages = messages.slice(-keepRecentCount);

  // Extract key points from old messages
  const keyPoints = extractKeyPoints(oldMessages);

  // Create summary
  const customerIntent = identifyIntent(messages);
  const summaryParts: string[] = [];

  summaryParts.push(`Customer ${customerIntent.toLowerCase()}.`);

  if (keyPoints.length > 0) {
    summaryParts.push(`Key details: ${keyPoints.join(", ")}.`);
  }

  const summary = summaryParts.join(" ").substring(0, maxSummaryLength);

  // Calculate tokens saved
  const originalTokens = estimateTokens(oldMessages.join("\n"));
  const summaryTokens = estimateTokens(summary);
  const tokensSaved = originalTokens - summaryTokens;

  return {
    conversationId,
    messageCount: messages.length,
    summary,
    keyPoints,
    customerIntent,
    recentMessages,
    tokensSaved: Math.max(0, tokensSaved),
  };
}

/**
 * Format summarized conversation for draft generation
 */
export function formatSummarizedContext(
  summary: ConversationSummary,
): string[] {
  const context: string[] = [];

  // Add summary of old messages
  if (summary.summary !== "Short conversation - no summarization needed") {
    context.push(`[SUMMARY] Earlier in conversation: ${summary.summary}`);
  }

  // Add recent messages verbatim
  context.push(...summary.recentMessages);

  return context;
}

/**
 * Check if conversation should be summarized
 */
export function shouldSummarize(
  messageCount: number,
  threshold: number = 10,
): boolean {
  return messageCount > threshold;
}

/**
 * Batch summarize multiple conversations
 */
export function batchSummarize(
  conversations: Array<{ id: string; messages: string[] }>,
): ConversationSummary[] {
  return conversations
    .filter((conv) => shouldSummarize(conv.messages.length))
    .map((conv) => summarizeConversation(conv.id, conv.messages));
}

/**
 * Get summarization stats
 */
export function getSummarizationStats(summaries: ConversationSummary[]): {
  totalConversations: number;
  totalMessages: number;
  totalTokensSaved: number;
  avgTokensSavedPerConversation: number;
} {
  const totalTokensSaved = summaries.reduce((sum, s) => sum + s.tokensSaved, 0);
  const totalMessages = summaries.reduce((sum, s) => sum + s.messageCount, 0);

  return {
    totalConversations: summaries.length,
    totalMessages,
    totalTokensSaved,
    avgTokensSavedPerConversation:
      summaries.length > 0
        ? Math.round(totalTokensSaved / summaries.length)
        : 0,
  };
}
