/**
 * Chatwoot Automation Rules Service
 *
 * Implements automation for conversations:
 * - Auto-assign based on keywords
 * - Auto-tag conversations
 * - Auto-reply after hours
 * - Programmatic automation (sentiment, question classification)
 *
 * SUPPORT-003
 */

import {
  getChatwootConfig,
  type ChatwootConfig,
} from "../../config/chatwoot.server";

// ============================================================================
// TYPES
// ============================================================================

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  event_name:
    | "conversation_created"
    | "conversation_updated"
    | "message_created";
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationCondition {
  attribute_key: string;
  filter_operator:
    | "equal_to"
    | "not_equal_to"
    | "contains"
    | "does_not_contain"
    | "is_present"
    | "is_not_present";
  values: string[];
  query_operator?: "and" | "or";
}

export interface AutomationAction {
  action_name:
    | "assign_agent"
    | "assign_team"
    | "add_label"
    | "send_message"
    | "send_email_to_team"
    | "mute_conversation";
  action_params?: Record<string, unknown>;
}

export interface ConversationContext {
  id: number;
  messages: Array<{ content: string; message_type: number }>;
  inbox_id: number;
  status: string;
  assignee_id?: number;
  labels?: string[];
  custom_attributes?: Record<string, unknown>;
}

// ============================================================================
// KEYWORD CLASSIFICATIONS
// ============================================================================

const KEYWORDS = {
  // Customer Support Categories
  orders: [
    "order",
    "tracking",
    "shipment",
    "delivery",
    "package",
    "tracking number",
    "order status",
  ],
  inventory: [
    "in stock",
    "availability",
    "out of stock",
    "backorder",
    "when available",
    "restock",
  ],
  cx: ["help", "support", "question", "issue", "problem", "assistance"],

  // Product Categories
  fittings: ["fitting", "an fitting", "hose end", "adapter", "fitting size"],
  fuel: ["fuel", "pump", "regulator", "filter", "fuel system"],

  // Urgency
  urgent: [
    "urgent",
    "asap",
    "emergency",
    "immediately",
    "critical",
    "help now",
  ],

  // Sentiment
  positive: ["thanks", "thank you", "great", "awesome", "perfect", "excellent"],
  negative: [
    "disappointed",
    "terrible",
    "worst",
    "bad",
    "poor",
    "angry",
    "frustrated",
  ],

  // Intent
  question: ["how", "what", "when", "where", "why", "can you", "do you", "?"],
  complaint: [
    "complaint",
    "disappointed",
    "never again",
    "terrible service",
    "worst",
  ],
  praise: ["great job", "excellent", "love it", "perfect", "highly recommend"],
};

const AFTER_HOURS_MESSAGE = `
Thank you for contacting Hot Rod AN! 

We've received your message and will respond during our business hours:
Monday - Friday: 9 AM - 5 PM EST

For urgent issues, please call us at [phone number].

Best regards,
Hot Rod AN Support Team
`.trim();

// ============================================================================
// AUTOMATION ENGINE
// ============================================================================

/**
 * Apply automation rules to a conversation
 */
export async function applyAutomations(
  conversation: ConversationContext,
): Promise<void> {
  const rules = getAutomationRules();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const shouldApply = evaluateConditions(conversation, rule.conditions);

    if (shouldApply) {
      await executeActions(conversation, rule.actions);
        `[Automation] Applied rule: ${rule.name} to conversation ${conversation.id}`,
      );
    }
  }
}

/**
 * Evaluate automation conditions
 */
function evaluateConditions(
  conversation: ConversationContext,
  conditions: AutomationCondition[],
): boolean {
  if (conditions.length === 0) return true;

  return conditions.every((condition) =>
    evaluateCondition(conversation, condition),
  );
}

/**
 * Evaluate single condition
 */
function evaluateCondition(
  conversation: ConversationContext,
  condition: AutomationCondition,
): boolean {
  const { attribute_key, filter_operator, values } = condition;

  // Get attribute value
  let attributeValue: string | string[] | undefined;

  switch (attribute_key) {
    case "status":
      attributeValue = conversation.status;
      break;
    case "inbox_id":
      attributeValue = String(conversation.inbox_id);
      break;
    case "assignee_id":
      attributeValue = conversation.assignee_id
        ? String(conversation.assignee_id)
        : undefined;
      break;
    case "labels":
      attributeValue = conversation.labels || [];
      break;
    case "message_content": {
      const messages = conversation.messages || [];
      attributeValue = messages.map((m) => m.content).join(" ");
      break;
    }
    default:
      attributeValue = undefined;
  }

  // Apply operator
  switch (filter_operator) {
    case "equal_to":
      return values.some((v) => attributeValue === v);

    case "not_equal_to":
      return !values.some((v) => attributeValue === v);

    case "contains":
      if (Array.isArray(attributeValue)) {
        return values.some((v) => attributeValue.includes(v));
      }
      if (typeof attributeValue === "string") {
        return values.some((v) =>
          attributeValue.toLowerCase().includes(v.toLowerCase()),
        );
      }
      return false;

    case "does_not_contain":
      if (Array.isArray(attributeValue)) {
        return !values.some((v) => attributeValue.includes(v));
      }
      if (typeof attributeValue === "string") {
        return !values.some((v) =>
          attributeValue.toLowerCase().includes(v.toLowerCase()),
        );
      }
      return true;

    case "is_present":
      return attributeValue !== undefined && attributeValue !== null;

    case "is_not_present":
      return attributeValue === undefined || attributeValue === null;

    default:
      return false;
  }
}

/**
 * Execute automation actions
 */
async function executeActions(
  conversation: ConversationContext,
  actions: AutomationAction[],
): Promise<void> {
  const config = getChatwootConfig();

  for (const action of actions) {
    try {
      await executeAction(config, conversation, action);
    } catch (error) {
      console.error(
        `[Automation] Failed to execute action: ${action.action_name}`,
        error,
      );
    }
  }
}

/**
 * Execute single action
 */
async function executeAction(
  config: ChatwootConfig,
  conversation: ConversationContext,
  action: AutomationAction,
): Promise<void> {
  const { action_name, action_params } = action;

  switch (action_name) {
    case "assign_agent": {
      const agentId = action_params?.agent_id as number;
      if (agentId) {
        await assignConversation(config, conversation.id, agentId);
      }
      break;
    }

    case "add_label": {
      const labels = action_params?.labels as string[];
      if (labels && labels.length > 0) {
        await addLabels(config, conversation.id, labels);
      }
      break;
    }

    case "send_message": {
      const message = action_params?.message as string;
      if (message) {
        await sendPrivateNote(config, conversation.id, message);
      }
      break;
    }

    case "mute_conversation": {
      await muteConversation(config, conversation.id);
      break;
    }

    default:
      console.warn(`[Automation] Unknown action: ${action_name}`);
  }
}

// ============================================================================
// CHATWOOT API CALLS
// ============================================================================

async function assignConversation(
  config: ChatwootConfig,
  conversationId: number,
  agentId: number,
): Promise<void> {
  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/assignments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_access_token: config.token,
    },
    body: JSON.stringify({ assignee_id: agentId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to assign conversation: ${response.status}`);
  }
}

async function addLabels(
  config: ChatwootConfig,
  conversationId: number,
  labels: string[],
): Promise<void> {
  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/labels`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_access_token: config.token,
    },
    body: JSON.stringify({ labels }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add labels: ${response.status}`);
  }
}

async function sendPrivateNote(
  config: ChatwootConfig,
  conversationId: number,
  message: string,
): Promise<void> {
  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_access_token: config.token,
    },
    body: JSON.stringify({
      content: message,
      message_type: "outgoing",
      private: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send private note: ${response.status}`);
  }
}

async function muteConversation(
  config: ChatwootConfig,
  conversationId: number,
): Promise<void> {
  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/mute`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_access_token: config.token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to mute conversation: ${response.status}`);
  }
}

// ============================================================================
// KEYWORD ANALYSIS
// ============================================================================

/**
 * Analyze message content for keywords and classify
 */
export function analyzeConversation(conversation: ConversationContext): {
  categories: string[];
  sentiment: "positive" | "negative" | "neutral";
  intent: "question" | "complaint" | "praise" | "general";
  isUrgent: boolean;
} {
  const messages = conversation.messages || [];
  const allContent = messages
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  // Detect categories
  const categories: string[] = [];
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (
      [
        "positive",
        "negative",
        "urgent",
        "question",
        "complaint",
        "praise",
      ].includes(category)
    ) {
      continue; // Skip sentiment/intent keywords
    }

    if (keywords.some((kw) => allContent.includes(kw.toLowerCase()))) {
      categories.push(category);
    }
  }

  // Detect sentiment
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  const hasPositive = KEYWORDS.positive.some((kw) =>
    allContent.includes(kw.toLowerCase()),
  );
  const hasNegative = KEYWORDS.negative.some((kw) =>
    allContent.includes(kw.toLowerCase()),
  );

  if (hasNegative && !hasPositive) {
    sentiment = "negative";
  } else if (hasPositive && !hasNegative) {
    sentiment = "positive";
  }

  // Detect intent
  let intent: "question" | "complaint" | "praise" | "general" = "general";
  const hasQuestion = KEYWORDS.question.some((kw) =>
    allContent.includes(kw.toLowerCase()),
  );
  const hasComplaint = KEYWORDS.complaint.some((kw) =>
    allContent.includes(kw.toLowerCase()),
  );
  const hasPraise = KEYWORDS.praise.some((kw) =>
    allContent.includes(kw.toLowerCase()),
  );

  if (hasComplaint) {
    intent = "complaint";
  } else if (hasPraise) {
    intent = "praise";
  } else if (hasQuestion) {
    intent = "question";
  }

  // Detect urgency
  const isUrgent = KEYWORDS.urgent.some((kw) =>
    allContent.includes(kw.toLowerCase()),
  );

  return { categories, sentiment, intent, isUrgent };
}

// ============================================================================
// DEFAULT AUTOMATION RULES
// ============================================================================

export function getAutomationRules(): AutomationRule[] {
  return [
    // Rule 1: Auto-tag order-related conversations
    {
      id: "auto-tag-orders",
      name: "Auto-tag Order Conversations",
      description:
        "Automatically tag conversations containing order-related keywords",
      event_name: "message_created",
      enabled: true,
      conditions: [
        {
          attribute_key: "message_content",
          filter_operator: "contains",
          values: KEYWORDS.orders,
        },
      ],
      actions: [
        {
          action_name: "add_label",
          action_params: { labels: ["orders"] },
        },
      ],
    },

    // Rule 2: Auto-tag inventory questions
    {
      id: "auto-tag-inventory",
      name: "Auto-tag Inventory Questions",
      description: "Automatically tag conversations about product availability",
      event_name: "message_created",
      enabled: true,
      conditions: [
        {
          attribute_key: "message_content",
          filter_operator: "contains",
          values: KEYWORDS.inventory,
        },
      ],
      actions: [
        {
          action_name: "add_label",
          action_params: { labels: ["inventory"] },
        },
      ],
    },

    // Rule 3: Auto-tag customer support
    {
      id: "auto-tag-cx",
      name: "Auto-tag Customer Support",
      description: "Automatically tag general support questions",
      event_name: "message_created",
      enabled: true,
      conditions: [
        {
          attribute_key: "message_content",
          filter_operator: "contains",
          values: KEYWORDS.cx,
        },
      ],
      actions: [
        {
          action_name: "add_label",
          action_params: { labels: ["customer_support"] },
        },
      ],
    },

    // Rule 4: Flag urgent conversations
    {
      id: "flag-urgent",
      name: "Flag Urgent Conversations",
      description: "Automatically tag urgent conversations",
      event_name: "message_created",
      enabled: true,
      conditions: [
        {
          attribute_key: "message_content",
          filter_operator: "contains",
          values: KEYWORDS.urgent,
        },
      ],
      actions: [
        {
          action_name: "add_label",
          action_params: { labels: ["urgent", "priority"] },
        },
      ],
    },

    // Rule 5: Flag negative sentiment
    {
      id: "flag-negative-sentiment",
      name: "Flag Negative Sentiment",
      description: "Automatically tag conversations with negative sentiment",
      event_name: "message_created",
      enabled: true,
      conditions: [
        {
          attribute_key: "message_content",
          filter_operator: "contains",
          values: KEYWORDS.negative,
        },
      ],
      actions: [
        {
          action_name: "add_label",
          action_params: { labels: ["negative_sentiment"] },
        },
      ],
    },
  ];
}

/**
 * Check if conversation is during after hours
 */
export function isAfterHours(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();

  // Weekend (Saturday = 6, Sunday = 0)
  if (day === 0 || day === 6) {
    return true;
  }

  // Weekday after hours (before 9 AM or after 5 PM EST)
  // EST = UTC-5, so 9 AM EST = 14:00 UTC, 5 PM EST = 22:00 UTC
  return hour < 14 || hour >= 22;
}

/**
 * Send after-hours auto-reply
 */
export async function sendAfterHoursReply(
  conversationId: number,
): Promise<void> {
  if (!isAfterHours()) {
    return; // Not after hours, skip
  }

  const config = getChatwootConfig();

  try {
    await sendPrivateNote(config, conversationId, AFTER_HOURS_MESSAGE);
      `[Automation] Sent after-hours reply to conversation ${conversationId}`,
    );
  } catch (error) {
    console.error(`[Automation] Failed to send after-hours reply:`, error);
  }
}
