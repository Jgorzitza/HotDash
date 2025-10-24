/**
 * AI-Customer Escalation Triggers Service
 *
 * Automatically detects conversations that require CEO/human escalation
 * based on sentiment analysis, complexity indicators, policy violations,
 * and specific request types (refunds, returns, complaints).
 *
 * @module app/services/ai-customer/escalation
 * @see docs/directions/ai-customer.md AI-CUSTOMER-003
 */
/**
 * Detect conversations requiring escalation
 *
 * Strategy:
 * 1. Query open/pending Chatwoot conversations
 * 2. Analyze message content for triggers
 * 3. Classify sentiment
 * 4. Determine escalation severity
 * 5. Generate recommendations
 *
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @param chatwootUrl - Chatwoot API URL (optional for testing)
 * @param chatwootKey - Chatwoot API key (optional for testing)
 * @returns Escalation detection results
 */
export async function detectEscalations(supabaseUrl, supabaseKey, chatwootUrl, chatwootKey) {
    try {
        // For now, return mock data as Chatwoot integration is separate
        // In production, this would fetch actual conversations from Chatwoot API
        const conversations = await fetchMockConversations();
        const escalations = [];
        const triggerCounts = {};
        const severityCounts = {};
        // Analyze each conversation
        for (const conversation of conversations) {
            const analysis = analyzeConversation(conversation);
            if (analysis.shouldEscalate) {
                const escalationCase = createEscalationCase(conversation, analysis);
                escalations.push(escalationCase);
                // Count triggers
                for (const trigger of escalationCase.triggers) {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                }
                // Count severity
                severityCounts[escalationCase.severity] =
                    (severityCounts[escalationCase.severity] || 0) + 1;
            }
        }
        return {
            escalations: escalations.sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            }),
            summary: {
                totalConversations: conversations.length,
                escalationsDetected: escalations.length,
                byTrigger: triggerCounts,
                bySeverity: severityCounts,
            },
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error("[Escalation] Error detecting escalations:", error);
        return {
            escalations: [],
            summary: {
                totalConversations: 0,
                escalationsDetected: 0,
                byTrigger: {},
                bySeverity: {},
            },
            timestamp: new Date().toISOString(),
        };
    }
}
/**
 * Analyze conversation for escalation triggers
 */
function analyzeConversation(conversation) {
    const allText = conversation.messages.join(" ").toLowerCase();
    const triggers = [];
    const keywords = [];
    // Detect refund requests
    if (detectRefundRequest(allText)) {
        triggers.push("refund_request");
        keywords.push("refund");
    }
    // Detect return requests
    if (detectReturnRequest(allText)) {
        triggers.push("return_request");
        keywords.push("return");
    }
    // Detect policy violations
    if (detectPolicyViolation(allText)) {
        triggers.push("policy_violation");
        keywords.push("policy");
    }
    // Detect legal threats
    if (detectLegalThreat(allText)) {
        triggers.push("legal_threat");
        keywords.push("lawyer", "legal");
    }
    // Detect sentiment
    const sentiment = detectSentiment(allText);
    if (["angry", "frustrated"].includes(sentiment)) {
        triggers.push("negative_sentiment");
        keywords.push("complaint", "upset");
    }
    // Detect complex issues
    if (conversation.messages.length > 5) {
        triggers.push("complex_issue");
        keywords.push("multiple exchanges");
    }
    // Detect multiple contacts
    if (conversation.metadata?.previousContactCount > 2) {
        triggers.push("multiple_contacts");
        keywords.push("repeat customer");
    }
    // Determine if escalation is needed
    const shouldEscalate = triggers.length > 0;
    // Determine severity
    const severity = determineSeverity(triggers, sentiment, conversation);
    // Generate reason
    const reason = generateReason(triggers, sentiment);
    // Calculate confidence
    const confidence = calculateConfidence(triggers, keywords);
    return {
        shouldEscalate,
        triggers,
        sentiment,
        severity,
        reason,
        keywords,
        confidence,
    };
}
/**
 * Detect refund requests in text
 */
function detectRefundRequest(text) {
    const refundKeywords = [
        "refund",
        "money back",
        "want my money",
        "charge back",
        "chargeback",
        "return payment",
    ];
    return refundKeywords.some((keyword) => text.includes(keyword));
}
/**
 * Detect return requests in text
 */
function detectReturnRequest(text) {
    const returnKeywords = [
        "return",
        "send back",
        "return label",
        "return policy",
        "ship back",
    ];
    return returnKeywords.some((keyword) => text.includes(keyword));
}
/**
 * Detect policy violations in text
 */
function detectPolicyViolation(text) {
    const policyKeywords = [
        "false advertising",
        "misleading",
        "scam",
        "fraud",
        "illegal",
        "violation",
        "breach of contract",
    ];
    return policyKeywords.some((keyword) => text.includes(keyword));
}
/**
 * Detect legal threats in text
 */
function detectLegalThreat(text) {
    const legalKeywords = [
        "lawyer",
        "attorney",
        "sue",
        "legal action",
        "court",
        "lawsuit",
        "better business bureau",
        "bbb",
        "consumer protection",
    ];
    return legalKeywords.some((keyword) => text.includes(keyword));
}
/**
 * Detect sentiment from text
 */
function detectSentiment(text) {
    // Angry indicators
    const angryKeywords = [
        "furious",
        "outraged",
        "unacceptable",
        "disgusting",
        "terrible",
        "worst",
    ];
    if (angryKeywords.some((keyword) => text.includes(keyword))) {
        return "angry";
    }
    // Frustrated indicators
    const frustratedKeywords = [
        "frustrated",
        "annoying",
        "disappointed",
        "upset",
        "unhappy",
    ];
    if (frustratedKeywords.some((keyword) => text.includes(keyword))) {
        return "frustrated";
    }
    // Disappointed indicators
    const disappointedKeywords = [
        "expected better",
        "let down",
        "not what i expected",
    ];
    if (disappointedKeywords.some((keyword) => text.includes(keyword))) {
        return "disappointed";
    }
    // Satisfied indicators
    const satisfiedKeywords = [
        "satisfied",
        "good",
        "thank",
        "appreciate",
        "great",
    ];
    if (satisfiedKeywords.some((keyword) => text.includes(keyword))) {
        return "satisfied";
    }
    // Happy indicators
    const happyKeywords = [
        "excellent",
        "amazing",
        "love",
        "perfect",
        "wonderful",
    ];
    if (happyKeywords.some((keyword) => text.includes(keyword))) {
        return "happy";
    }
    return "neutral";
}
/**
 * Determine escalation severity
 */
function determineSeverity(triggers, sentiment, conversation) {
    // Critical: Legal threat or multiple high-priority triggers
    if (triggers.includes("legal_threat") ||
        (triggers.includes("policy_violation") && sentiment === "angry")) {
        return "critical";
    }
    // High: Negative sentiment + refund/return, or VIP customer
    if ((sentiment === "angry" &&
        (triggers.includes("refund_request") ||
            triggers.includes("return_request"))) ||
        triggers.includes("vip_customer")) {
        return "high";
    }
    // Medium: Multiple triggers or frustrated sentiment
    if (triggers.length >= 3 || sentiment === "frustrated") {
        return "medium";
    }
    // Low: Single trigger, neutral sentiment
    return "low";
}
/**
 * Generate human-readable escalation reason
 */
function generateReason(triggers, sentiment) {
    const reasons = [];
    if (triggers.includes("legal_threat")) {
        reasons.push("Customer mentioned legal action");
    }
    if (triggers.includes("policy_violation")) {
        reasons.push("Alleged policy violation or fraud claim");
    }
    if (triggers.includes("refund_request")) {
        reasons.push("Customer requesting refund");
    }
    if (triggers.includes("return_request")) {
        reasons.push("Customer requesting return");
    }
    if (triggers.includes("negative_sentiment")) {
        reasons.push(`Customer sentiment: ${sentiment}`);
    }
    if (triggers.includes("complex_issue")) {
        reasons.push("Complex issue requiring multiple exchanges");
    }
    if (triggers.includes("multiple_contacts")) {
        reasons.push("Customer has contacted support multiple times");
    }
    return reasons.join("; ");
}
/**
 * Calculate confidence score
 */
function calculateConfidence(triggers, keywords) {
    // Base confidence on number of triggers and keywords
    const triggerScore = Math.min(triggers.length * 0.25, 0.75);
    const keywordScore = Math.min(keywords.length * 0.05, 0.25);
    return Number(Math.min(triggerScore + keywordScore, 1.0).toFixed(2));
}
/**
 * Create escalation case from conversation and analysis
 */
function createEscalationCase(conversation, analysis) {
    return {
        conversationId: conversation.id,
        customerId: conversation.customerId,
        customerName: conversation.customerName,
        triggers: analysis.triggers,
        sentiment: analysis.sentiment,
        severity: analysis.severity,
        reason: analysis.reason,
        recommendedAction: generateRecommendedAction(analysis.severity, analysis.triggers),
        context: {
            messageCount: conversation.messages.length,
            lastMessageAt: conversation.lastMessageAt,
            previousEscalations: conversation.metadata?.previousEscalations || 0,
            orderValue: conversation.metadata?.orderValue,
            hasOpenOrders: conversation.metadata?.hasOpenOrders || false,
        },
        metadata: {
            detectedAt: new Date().toISOString(),
            keywords: analysis.keywords,
            confidence: analysis.confidence,
        },
    };
}
/**
 * Generate recommended action based on severity and triggers
 */
function generateRecommendedAction(severity, triggers) {
    if (severity === "critical") {
        return "Immediate CEO escalation required. Review legal implications before responding.";
    }
    if (severity === "high") {
        return "Escalate to CEO within 1 hour. Prepare detailed context and proposed resolution.";
    }
    if (triggers.includes("refund_request") ||
        triggers.includes("return_request")) {
        return "Review order details and process request per policy. Escalate if value exceeds threshold.";
    }
    if (severity === "medium") {
        return "Senior support review recommended. Provide detailed response with evidence.";
    }
    return "Monitor conversation. Escalate if situation deteriorates or customer requests.";
}
/**
 * Fetch mock conversations for testing
 * In production, this would call Chatwoot API
 */
async function fetchMockConversations() {
    // Return empty array - in production this would fetch from Chatwoot
    return [];
}
//# sourceMappingURL=escalation.js.map