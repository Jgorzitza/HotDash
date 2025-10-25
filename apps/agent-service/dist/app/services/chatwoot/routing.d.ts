/**
 * Chatwoot Conversation Routing Service
 *
 * Implements intelligent routing rules for conversations:
 * - Auto-assign based on team/inbox rules
 * - Priority routing for urgent keywords
 * - Round-robin assignment across agents
 * - Escalation triggers for SLA breaches
 *
 * SUPPORT-003
 */
export interface RoutingRule {
    id: string;
    name: string;
    priority: number;
    conditions: RoutingCondition[];
    action: RoutingAction;
    enabled: boolean;
}
export interface RoutingCondition {
    type: "keyword" | "inbox" | "tag" | "sender" | "time" | "agent_availability";
    operator: "contains" | "equals" | "matches" | "exists" | "not_exists";
    value?: string | number | boolean;
}
export interface RoutingAction {
    type: "assign" | "tag" | "prioritize" | "escalate" | "notify";
    target?: number | string;
    metadata?: Record<string, unknown>;
}
export interface Agent {
    id: number;
    name: string;
    email: string;
    availability_status: "online" | "offline" | "busy";
    assignedCount: number;
}
export interface Conversation {
    id: number;
    inbox_id: number;
    status: "open" | "pending" | "resolved";
    assignee_id?: number | null;
    created_at: number;
    last_activity_at?: number;
    messages?: Array<{
        content: string;
        message_type: number;
    }>;
    custom_attributes?: Record<string, unknown>;
    tags?: string[];
}
export interface RoutingResult {
    conversationId: number;
    action: "assigned" | "escalated" | "tagged" | "no_action";
    assigneeId?: number;
    reason: string;
    tags?: string[];
}
/**
 * Route conversation using configured rules
 */
export declare function routeConversation(conversation: Conversation, agents: Agent[], rules?: RoutingRule[]): Promise<RoutingResult>;
/**
 * Add tags to conversation
 */
export declare function addConversationTags(conversationId: number, tags: string[]): Promise<void>;
/**
 * Fetch available agents
 */
export declare function getAvailableAgents(): Promise<Agent[]>;
export declare const DEFAULT_RULES: RoutingRule[];
/**
 * Check if conversation needs escalation based on SLA
 */
export declare function checkSLABreach(conversation: Conversation, slaMinutes: number): boolean;
/**
 * Bulk route unassigned conversations
 */
export declare function routeUnassignedConversations(): Promise<RoutingResult[]>;
//# sourceMappingURL=routing.d.ts.map