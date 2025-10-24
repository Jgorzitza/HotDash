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
export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    event_name: "conversation_created" | "conversation_updated" | "message_created";
    conditions: AutomationCondition[];
    actions: AutomationAction[];
    enabled: boolean;
}
export interface AutomationCondition {
    attribute_key: string;
    filter_operator: "equal_to" | "not_equal_to" | "contains" | "does_not_contain" | "is_present" | "is_not_present";
    values: string[];
    query_operator?: "and" | "or";
}
export interface AutomationAction {
    action_name: "assign_agent" | "assign_team" | "add_label" | "send_message" | "send_email_to_team" | "mute_conversation";
    action_params?: Record<string, unknown>;
}
export interface ConversationContext {
    id: number;
    messages: Array<{
        content: string;
        message_type: number;
    }>;
    inbox_id: number;
    status: string;
    assignee_id?: number;
    labels?: string[];
    custom_attributes?: Record<string, unknown>;
}
/**
 * Apply automation rules to a conversation
 */
export declare function applyAutomations(conversation: ConversationContext): Promise<void>;
/**
 * Analyze message content for keywords and classify
 */
export declare function analyzeConversation(conversation: ConversationContext): {
    categories: string[];
    sentiment: "positive" | "negative" | "neutral";
    intent: "question" | "complaint" | "praise" | "general";
    isUrgent: boolean;
};
export declare function getAutomationRules(): AutomationRule[];
/**
 * Check if conversation is during after hours
 */
export declare function isAfterHours(): boolean;
/**
 * Send after-hours auto-reply
 */
export declare function sendAfterHoursReply(conversationId: number): Promise<void>;
//# sourceMappingURL=automation.d.ts.map