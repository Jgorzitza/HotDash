/**
 * Approval Queue Prioritizer — Surface high-priority conversations
 *
 * Prioritizes customer conversations based on:
 * - SLA urgency (time waiting)
 * - Customer sentiment
 * - Conversation complexity
 * - Draft confidence
 */

export interface QueueItem {
  conversationId: string;
  customerId: string;
  customerEmail?: string;
  subject?: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  status: "open" | "pending" | "snoozed";
  draftConfidence?: number; // 0-1
  estimatedComplexity: "low" | "medium" | "high";
  tags?: string[];
}

export interface PriorityScore {
  conversationId: string;
  score: number; // 0-100, higher = more urgent
  reasons: string[];
  urgencyLevel: "critical" | "high" | "medium" | "low";
}

const SLA_TARGET_MINUTES = 15;

/**
 * Calculate time waiting in minutes
 */
function calculateWaitTime(lastMessageAt: string): number {
  const now = Date.now();
  const lastMessage = new Date(lastMessageAt).getTime();
  return Math.floor((now - lastMessage) / 1000 / 60);
}

/**
 * Calculate SLA urgency score (0-40 points)
 */
function calculateSLAUrgency(waitMinutes: number): number {
  if (waitMinutes >= SLA_TARGET_MINUTES * 2) return 40; // Critical - 2x SLA
  if (waitMinutes >= SLA_TARGET_MINUTES) return 30; // High - exceeds SLA
  if (waitMinutes >= SLA_TARGET_MINUTES * 0.75) return 20; // Medium - approaching SLA
  return Math.floor((waitMinutes / SLA_TARGET_MINUTES) * 15); // Low - proportional
}

/**
 * Calculate complexity score (0-25 points)
 * Higher complexity = higher priority for human review
 */
function calculateComplexityScore(item: QueueItem): number {
  let score = 0;

  // Base complexity
  if (item.estimatedComplexity === "high") score += 15;
  else if (item.estimatedComplexity === "medium") score += 10;
  else score += 5;

  // Long conversations need more attention
  if (item.messageCount > 10) score += 5;
  else if (item.messageCount > 5) score += 3;

  // Low confidence drafts need review
  if (item.draftConfidence && item.draftConfidence < 0.6) score += 5;

  return Math.min(25, score);
}

/**
 * Calculate tag-based priority (0-20 points)
 */
function calculateTagPriority(tags: string[] = []): number {
  let score = 0;

  const urgentTags = ["vip", "escalated", "complaint", "damaged"];
  const importantTags = ["return", "refund", "technical"];

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (urgentTags.some((t) => lowerTag.includes(t))) score += 10;
    else if (importantTags.some((t) => lowerTag.includes(t))) score += 5;
  }

  return Math.min(20, score);
}

/**
 * Calculate confidence bonus (0-15 points)
 * Lower confidence = higher priority for review
 */
function calculateConfidenceBonus(confidence: number | undefined): number {
  if (confidence === undefined) return 5; // No draft = needs attention

  if (confidence < 0.5) return 15; // Very low confidence
  if (confidence < 0.7) return 10; // Low confidence
  if (confidence < 0.85) return 5; // Medium confidence
  return 0; // High confidence = less urgent
}

/**
 * Calculate priority score for conversation
 */
export function calculatePriority(item: QueueItem): PriorityScore {
  const waitMinutes = calculateWaitTime(item.lastMessageAt);
  const reasons: string[] = [];

  // SLA urgency (0-40 points)
  const slaScore = calculateSLAUrgency(waitMinutes);
  if (slaScore >= 30) {
    reasons.push(
      `SLA breach: ${waitMinutes}min waiting (target: ${SLA_TARGET_MINUTES}min)`,
    );
  } else if (slaScore >= 20) {
    reasons.push(`Approaching SLA: ${waitMinutes}min waiting`);
  }

  // Complexity (0-25 points)
  const complexityScore = calculateComplexityScore(item);
  if (item.estimatedComplexity === "high") {
    reasons.push(`High complexity (${item.messageCount} messages)`);
  }

  // Tags (0-20 points)
  const tagScore = calculateTagPriority(item.tags);
  if (tagScore > 0) {
    reasons.push(`Priority tags: ${item.tags?.join(", ")}`);
  }

  // Confidence (0-15 points)
  const confidenceScore = calculateConfidenceBonus(item.draftConfidence);
  if (item.draftConfidence && item.draftConfidence < 0.7) {
    reasons.push(
      `Low draft confidence: ${(item.draftConfidence * 100).toFixed(0)}%`,
    );
  }

  // Total score
  const totalScore = slaScore + complexityScore + tagScore + confidenceScore;

  // Determine urgency level
  let urgencyLevel: PriorityScore["urgencyLevel"] = "low";
  if (totalScore >= 70) urgencyLevel = "critical";
  else if (totalScore >= 50) urgencyLevel = "high";
  else if (totalScore >= 30) urgencyLevel = "medium";

  return {
    conversationId: item.conversationId,
    score: Math.min(100, totalScore),
    reasons,
    urgencyLevel,
  };
}

/**
 * Prioritize queue items
 */
export function prioritizeQueue(
  items: QueueItem[],
): Array<QueueItem & { priority: PriorityScore }> {
  return items
    .map((item) => ({
      ...item,
      priority: calculatePriority(item),
    }))
    .sort((a, b) => b.priority.score - a.priority.score);
}

/**
 * Filter queue by urgency level
 */
export function filterByUrgency(
  queue: Array<QueueItem & { priority: PriorityScore }>,
  level: PriorityScore["urgencyLevel"],
): Array<QueueItem & { priority: PriorityScore }> {
  return queue.filter((item) => item.priority.urgencyLevel === level);
}

/**
 * Get SLA breach items (critical priority)
 */
export function getSLABreaches(items: QueueItem[]): QueueItem[] {
  return items.filter((item) => {
    const waitMinutes = calculateWaitTime(item.lastMessageAt);
    return waitMinutes >= SLA_TARGET_MINUTES;
  });
}

/**
 * Format priority score for display
 */
export function formatPriorityDisplay(priority: PriorityScore): {
  label: string;
  badge: { text: string; tone: "critical" | "attention" | "info" | "success" };
  icon: string;
} {
  switch (priority.urgencyLevel) {
    case "critical":
      return {
        label: "Critical",
        badge: { text: `${priority.score} pts`, tone: "critical" },
        icon: "🔴",
      };
    case "high":
      return {
        label: "High",
        badge: { text: `${priority.score} pts`, tone: "attention" },
        icon: "🟡",
      };
    case "medium":
      return {
        label: "Medium",
        badge: { text: `${priority.score} pts`, tone: "info" },
        icon: "🔵",
      };
    case "low":
      return {
        label: "Low",
        badge: { text: `${priority.score} pts`, tone: "success" },
        icon: "🟢",
      };
  }
}

/**
 * Get next conversation to review (highest priority)
 */
export function getNextToReview(
  items: QueueItem[],
): (QueueItem & { priority: PriorityScore }) | null {
  const prioritized = prioritizeQueue(items);
  return prioritized.length > 0 ? prioritized[0] : null;
}

/**
 * Group queue by urgency level
 */
export function groupByUrgency(items: QueueItem[]): {
  critical: QueueItem[];
  high: QueueItem[];
  medium: QueueItem[];
  low: QueueItem[];
} {
  const prioritized = prioritizeQueue(items);

  return {
    critical: prioritized
      .filter((i) => i.priority.urgencyLevel === "critical")
      .map(({ priority, ...item }) => item),
    high: prioritized
      .filter((i) => i.priority.urgencyLevel === "high")
      .map(({ priority, ...item }) => item),
    medium: prioritized
      .filter((i) => i.priority.urgencyLevel === "medium")
      .map(({ priority, ...item }) => item),
    low: prioritized
      .filter((i) => i.priority.urgencyLevel === "low")
      .map(({ priority, ...item }) => item),
  };
}
