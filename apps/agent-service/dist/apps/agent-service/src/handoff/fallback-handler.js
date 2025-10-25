/**
 * Human Fallback Handler
 *
 * Handles low-confidence scenarios and escalations to human agents.
 * Implements intelligent fallback logic based on confidence, sentiment, and context.
 */
/**
 * Fallback conditions that trigger human review
 */
export const fallbackConditions = [
    {
        name: 'low_confidence',
        check: (ctx, decision) => decision.confidence < 0.5,
        priority: 100,
        escalationReason: 'Low confidence in intent classification',
    },
    {
        name: 'negative_sentiment_low_confidence',
        check: (ctx, decision) => ctx.sentiment === 'negative' && decision.confidence < 0.7,
        priority: 95,
        escalationReason: 'Negative sentiment with uncertain intent',
    },
    {
        name: 'escalation_keywords',
        check: (ctx) => {
            const keywords = ['speak to manager', 'escalate', 'supervisor', 'complaint', 'lawyer', 'sue'];
            const lastMessage = ctx.messages[ctx.messages.length - 1]?.content.toLowerCase();
            return keywords.some(kw => lastMessage?.includes(kw));
        },
        priority: 90,
        escalationReason: 'Customer requested escalation',
    },
    {
        name: 'multiple_failed_handoffs',
        check: (ctx) => (ctx.metadata.handoffCount || 0) > 2,
        priority: 85,
        escalationReason: 'Multiple handoffs without resolution',
    },
    {
        name: 'high_urgency_low_confidence',
        check: (ctx, decision) => ctx.urgency === 'high' && decision.confidence < 0.8,
        priority: 80,
        escalationReason: 'High urgency with uncertain routing',
    },
    {
        name: 'warranty_claim',
        check: (ctx) => ctx.intent === 'technical_warranty',
        priority: 75,
        escalationReason: 'Warranty claims require human approval',
    },
];
/**
 * Check if fallback to human is needed
 */
export function shouldFallbackToHuman(context, decision) {
    // Check each condition in priority order
    const sortedConditions = [...fallbackConditions].sort((a, b) => b.priority - a.priority);
    for (const condition of sortedConditions) {
        if (condition.check(context, decision)) {
            console.log(`[Fallback] Condition triggered: ${condition.name} -> ${condition.escalationReason}`);
            return {
                shouldFallback: true,
                reason: condition.escalationReason,
                priority: condition.priority,
            };
        }
    }
    return { shouldFallback: false };
}
/**
 * Execute human fallback actions
 */
export async function executeHumanFallback(context, reason) {
    try {
        console.log(`[Fallback] Executing human fallback for conversation ${context.conversationId}: ${reason}`);
        // 1. Create private note for human review
        // TODO: Implement actual Chatwoot API call
        const privateNote = {
            conversationId: context.conversationId,
            content: `🚨 HUMAN REVIEW NEEDED\n\nReason: ${reason}\n\nContext:\n${getContextSummary(context)}`,
            private: true,
        };
        console.log('[Fallback] Private note created:', privateNote);
        // 2. Tag conversation for priority
        // TODO: Implement actual Chatwoot API call
        const tags = ['needs-human-review', 'priority'];
        if (context.urgency === 'high') {
            tags.push('urgent');
        }
        console.log('[Fallback] Tags added:', tags);
        // 3. Log to metrics
        // TODO: Implement actual metrics logging
        console.log('[Fallback] Metrics logged:', {
            conversationId: context.conversationId,
            action: 'human_fallback',
            reason,
            timestamp: new Date().toISOString(),
        });
        // 4. Notify human agent (if configured)
        if (process.env.SLACK_WEBHOOK_URL) {
            await notifySlack({
                channel: '#customer-support',
                message: `🚨 Human review needed for conversation ${context.conversationId}: ${reason}`,
                context: getContextSummary(context),
            });
        }
    }
    catch (error) {
        console.error('[Fallback] Error executing fallback:', error);
    }
}
/**
 * Get context summary for human review
 */
function getContextSummary(context) {
    const parts = [];
    if (context.customer.name) {
        parts.push(`Customer: ${context.customer.name}`);
    }
    if (context.customer.email) {
        parts.push(`Email: ${context.customer.email}`);
    }
    if (context.customer.orderId) {
        parts.push(`Order ID: ${context.customer.orderId}`);
    }
    if (context.intent) {
        parts.push(`Intent: ${context.intent}`);
    }
    if (context.sentiment) {
        parts.push(`Sentiment: ${context.sentiment}`);
    }
    if (context.urgency) {
        parts.push(`Urgency: ${context.urgency}`);
    }
    const messageCount = context.messages.length;
    if (messageCount > 0) {
        parts.push(`Messages: ${messageCount}`);
        const lastMessage = context.messages[messageCount - 1];
        parts.push(`Last message: "${lastMessage.content.substring(0, 100)}..."`);
    }
    return parts.join('\n');
}
/**
 * Notify Slack channel (if configured)
 */
async function notifySlack(params) {
    try {
        const webhookUrl = process.env.SLACK_WEBHOOK_URL;
        if (!webhookUrl) {
            console.log('[Fallback] Slack webhook not configured, skipping notification');
            return;
        }
        const payload = {
            channel: params.channel,
            text: params.message,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: params.message,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `\`\`\`\n${params.context}\n\`\`\``,
                    },
                },
            ],
        };
        // TODO: Implement actual Slack API call
        console.log('[Fallback] Slack notification payload:', payload);
    }
    catch (error) {
        console.error('[Fallback] Error sending Slack notification:', error);
    }
}
/**
 * Get fallback statistics
 */
export async function getFallbackStats(timeRange = '7d') {
    // TODO: Implement actual database query
    return {
        totalFallbacks: 95,
        fallbackRate: 0.08,
        byReason: {
            'Low confidence in intent classification': 45,
            'Negative sentiment with uncertain intent': 25,
            'Customer requested escalation': 15,
            'Multiple handoffs without resolution': 5,
            'High urgency with uncertain routing': 3,
            'Warranty claims require human approval': 2,
        },
        avgResolutionTime: 12.5, // minutes
    };
}
//# sourceMappingURL=fallback-handler.js.map