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
import { getChatwootConfig, } from "../../config/chatwoot.server";
// ============================================================================
// PRIORITY KEYWORDS
// ============================================================================
const URGENT_KEYWORDS = [
    "urgent",
    "emergency",
    "critical",
    "asap",
    "immediately",
    "help",
    "broken",
    "not working",
    "refund",
    "cancel",
    "complaint",
    "disappointed",
    "terrible",
    "worst",
];
const VIP_KEYWORDS = [
    "bulk order",
    "corporate",
    "wholesale",
    "distributor",
    "dealer",
];
const ESCALATION_KEYWORDS = [
    "chargeback",
    "lawyer",
    "attorney",
    "legal",
    "sue",
    "fraud",
    "stolen",
    "police",
];
// ============================================================================
// ROUTING ENGINE
// ============================================================================
/**
 * Route conversation using configured rules
 */
export async function routeConversation(conversation, agents, rules = DEFAULT_RULES) {
    // Skip if already assigned
    if (conversation.assignee_id) {
        return {
            conversationId: conversation.id,
            action: "no_action",
            reason: "Already assigned",
            assigneeId: conversation.assignee_id,
        };
    }
    // Sort rules by priority (highest first)
    const sortedRules = [...rules]
        .filter((r) => r.enabled)
        .sort((a, b) => b.priority - a.priority);
    // Apply rules in priority order
    for (const rule of sortedRules) {
        const matches = evaluateConditions(conversation, rule.conditions, agents);
        if (matches) {
            return await executeAction(conversation, rule.action, agents);
        }
    }
    // Fallback: Round-robin assignment
    return await assignRoundRobin(conversation, agents);
}
/**
 * Evaluate all conditions for a rule
 */
function evaluateConditions(conversation, conditions, agents) {
    return conditions.every((condition) => evaluateCondition(conversation, condition, agents));
}
/**
 * Evaluate single condition
 */
function evaluateCondition(conversation, condition, agents) {
    const messages = conversation.messages || [];
    const allContent = messages
        .map((m) => m.content)
        .join(" ")
        .toLowerCase();
    switch (condition.type) {
        case "keyword": {
            if (typeof condition.value !== "string")
                return false;
            const keyword = condition.value.toLowerCase();
            if (condition.operator === "contains") {
                return allContent.includes(keyword);
            }
            if (condition.operator === "matches") {
                const regex = new RegExp(keyword, "i");
                return regex.test(allContent);
            }
            return false;
        }
        case "inbox": {
            if (condition.operator === "equals") {
                return conversation.inbox_id === condition.value;
            }
            return false;
        }
        case "tag": {
            const tags = conversation.tags || [];
            if (typeof condition.value !== "string")
                return false;
            if (condition.operator === "contains") {
                return tags.includes(condition.value);
            }
            if (condition.operator === "exists") {
                return tags.length > 0;
            }
            if (condition.operator === "not_exists") {
                return tags.length === 0;
            }
            return false;
        }
        case "agent_availability": {
            const onlineAgents = agents.filter((a) => a.availability_status === "online");
            if (condition.operator === "exists") {
                return onlineAgents.length > 0;
            }
            return false;
        }
        case "time": {
            const now = new Date();
            const hour = now.getUTCHours();
            // Business hours: 9am-5pm UTC (example)
            if (condition.value === "business_hours") {
                return hour >= 9 && hour < 17;
            }
            if (condition.value === "after_hours") {
                return hour < 9 || hour >= 17;
            }
            return false;
        }
        default:
            return false;
    }
}
/**
 * Execute routing action
 */
async function executeAction(conversation, action, agents) {
    switch (action.type) {
        case "assign": {
            // Assign to specific agent if target provided
            if (typeof action.target === "number") {
                return await assignToAgent(conversation, action.target);
            }
            // Otherwise assign using round-robin
            return await assignRoundRobin(conversation, agents);
        }
        case "prioritize": {
            const tags = ["priority", ...(action.metadata?.tags || [])];
            return {
                conversationId: conversation.id,
                action: "tagged",
                reason: "Prioritized due to rule match",
                tags,
            };
        }
        case "escalate": {
            return {
                conversationId: conversation.id,
                action: "escalated",
                reason: action.metadata?.reason ||
                    "Auto-escalated by routing rule",
                tags: ["escalated", "needs_attention"],
            };
        }
        default:
            return {
                conversationId: conversation.id,
                action: "no_action",
                reason: "Unknown action type",
            };
    }
}
/**
 * Assign conversation to specific agent
 */
async function assignToAgent(conversation, agentId) {
    const config = getChatwootConfig();
    try {
        await assignConversationAPI(config, conversation.id, agentId);
        return {
            conversationId: conversation.id,
            action: "assigned",
            assigneeId: agentId,
            reason: "Assigned by routing rule",
        };
    }
    catch (error) {
        console.error(`[Routing] Failed to assign conversation ${conversation.id}:`, error);
        return {
            conversationId: conversation.id,
            action: "no_action",
            reason: `Assignment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
/**
 * Assign using round-robin algorithm
 */
async function assignRoundRobin(conversation, agents) {
    // Filter to online agents only
    const availableAgents = agents.filter((a) => a.availability_status === "online");
    if (availableAgents.length === 0) {
        return {
            conversationId: conversation.id,
            action: "no_action",
            reason: "No agents available",
        };
    }
    // Find agent with lowest assignment count
    const agent = availableAgents.reduce((prev, curr) => prev.assignedCount < curr.assignedCount ? prev : curr);
    return await assignToAgent(conversation, agent.id);
}
// ============================================================================
// API CALLS
// ============================================================================
/**
 * Assign conversation to agent via Chatwoot API
 */
async function assignConversationAPI(config, conversationId, agentId) {
    const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/assignments`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            api_access_token: config.token,
        },
        body: JSON.stringify({
            assignee_id: agentId,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chatwoot API error: ${response.status} ${errorText}`);
    }
}
/**
 * Add tags to conversation
 */
export async function addConversationTags(conversationId, tags) {
    const config = getChatwootConfig();
    const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/labels`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            api_access_token: config.token,
        },
        body: JSON.stringify({
            labels: tags,
        }),
    });
    if (!response.ok) {
        throw new Error(`Failed to add tags: ${response.status}`);
    }
}
/**
 * Fetch available agents
 */
export async function getAvailableAgents() {
    const config = getChatwootConfig();
    const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/agents`;
    try {
        const response = await fetch(url, {
            headers: {
                api_access_token: config.token,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch agents: ${response.status}`);
        }
        const data = await response.json();
        // Transform to our Agent type
        return data.map((agent) => ({
            id: agent.id,
            name: agent.name,
            email: agent.email,
            availability_status: agent.availability_status || "offline",
            assignedCount: 0, // Would need separate API call to get actual count
        }));
    }
    catch (error) {
        console.error("[Routing] Failed to fetch agents:", error);
        return [];
    }
}
// ============================================================================
// DEFAULT ROUTING RULES
// ============================================================================
export const DEFAULT_RULES = [
    // Rule 1: Escalate conversations with escalation keywords
    {
        id: "escalate-legal",
        name: "Escalate Legal Threats",
        priority: 100,
        enabled: true,
        conditions: [
            {
                type: "keyword",
                operator: "contains",
                value: ESCALATION_KEYWORDS.join("|"),
            },
        ],
        action: {
            type: "escalate",
            metadata: {
                reason: "Legal or fraud keywords detected",
                notifyCEO: true,
            },
        },
    },
    // Rule 2: Prioritize urgent conversations
    {
        id: "prioritize-urgent",
        name: "Prioritize Urgent Messages",
        priority: 90,
        enabled: true,
        conditions: [
            {
                type: "keyword",
                operator: "contains",
                value: URGENT_KEYWORDS.join("|"),
            },
        ],
        action: {
            type: "prioritize",
            metadata: {
                tags: ["urgent"],
            },
        },
    },
    // Rule 3: Prioritize VIP conversations
    {
        id: "prioritize-vip",
        name: "Prioritize VIP Customers",
        priority: 85,
        enabled: true,
        conditions: [
            {
                type: "keyword",
                operator: "contains",
                value: VIP_KEYWORDS.join("|"),
            },
        ],
        action: {
            type: "prioritize",
            metadata: {
                tags: ["vip", "high_value"],
            },
        },
    },
    // Rule 4: Auto-assign during business hours
    {
        id: "auto-assign-business-hours",
        name: "Auto-assign During Business Hours",
        priority: 50,
        enabled: true,
        conditions: [
            {
                type: "time",
                operator: "equals",
                value: "business_hours",
            },
            {
                type: "agent_availability",
                operator: "exists",
            },
        ],
        action: {
            type: "assign",
        },
    },
    // Rule 5: Tag after-hours conversations
    {
        id: "tag-after-hours",
        name: "Tag After Hours Messages",
        priority: 40,
        enabled: true,
        conditions: [
            {
                type: "time",
                operator: "equals",
                value: "after_hours",
            },
        ],
        action: {
            type: "prioritize",
            metadata: {
                tags: ["after_hours"],
            },
        },
    },
];
/**
 * Check if conversation needs escalation based on SLA
 */
export function checkSLABreach(conversation, slaMinutes) {
    const createdAt = conversation.created_at * 1000; // Convert to ms
    const now = Date.now();
    const ageMinutes = (now - createdAt) / (1000 * 60);
    return (ageMinutes > slaMinutes &&
        conversation.status === "open" &&
        !conversation.assignee_id);
}
/**
 * Bulk route unassigned conversations
 */
export async function routeUnassignedConversations() {
    const config = getChatwootConfig();
    const agents = await getAvailableAgents();
    // Fetch unassigned conversations
    const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations?status=open&assignee_type=all`;
    try {
        const response = await fetch(url, {
            headers: {
                api_access_token: config.token,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch conversations: ${response.status}`);
        }
        const data = await response.json();
        const conversations = data.data.payload;
        // Filter to unassigned only
        const unassigned = conversations.filter((c) => !c.assignee_id);
        // Route each conversation
        const results = await Promise.all(unassigned.map((conv) => routeConversation(conv, agents)));
        return results;
    }
    catch (error) {
        console.error("[Routing] Bulk routing failed:", error);
        return [];
    }
}
//# sourceMappingURL=routing.js.map