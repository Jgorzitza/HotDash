/**
 * Auto-Escalation System
 *
 * Intelligently escalates conversations to human agents based on:
 * - Customer explicit requests
 * - Negative sentiment
 * - Low AI confidence
 * - Legal/threat language
 * - VIP customer status
 *
 * Direction Reference: docs/directions/chatwoot.md Task 5
 */
/**
 * Determines when to escalate to human agents
 */
export class AutoEscalation {
    /**
     * Evaluate if conversation should be escalated
     */
    evaluate(params) {
        const triggers = [];
        const { message, sentiment, confidence, intent, customerTier } = params;
        // Trigger 1: Explicit request for human
        if (this.hasExplicitHumanRequest(message)) {
            triggers.push({
                type: 'explicit_request',
                severity: 'high',
                reason: 'Customer explicitly requested to speak with a human',
            });
        }
        // Trigger 2: Very negative sentiment
        if (sentiment.sentiment === 'negative' && sentiment.score < -0.5) {
            triggers.push({
                type: 'negative_sentiment',
                severity: sentiment.score < -0.7 ? 'critical' : 'high',
                reason: `Very negative sentiment detected (score: ${sentiment.score.toFixed(2)})`,
                metadata: {
                    emotions: sentiment.emotions,
                    triggers: sentiment.triggers,
                },
            });
        }
        // Trigger 3: Low AI confidence
        if (confidence < 0.5) {
            triggers.push({
                type: 'low_confidence',
                severity: confidence < 0.3 ? 'high' : 'medium',
                reason: `Low AI confidence (${(confidence * 100).toFixed(0)}%)`,
                metadata: { confidence },
            });
        }
        // Trigger 4: Legal threat language
        if (this.hasLegalThreat(message)) {
            triggers.push({
                type: 'legal_threat',
                severity: 'critical',
                reason: 'Legal threat or mention of attorney/lawsuit detected',
            });
        }
        // Trigger 5: VIP customer
        if (customerTier === 'VIP' || customerTier === 'vip') {
            triggers.push({
                type: 'vip_customer',
                severity: 'high',
                reason: 'VIP customer - requires senior agent attention',
                metadata: { tier: customerTier },
            });
        }
        // Trigger 6: Complex multi-issue query
        if (this.isComplexQuery(message)) {
            triggers.push({
                type: 'complex_query',
                severity: 'medium',
                reason: 'Complex query with multiple issues/questions',
            });
        }
        // Determine if escalation is needed
        const shouldEscalate = triggers.length > 0 && this.meetsEscalationThreshold(triggers);
        // Determine recommended agent level
        let recommendedAgent = 'standard';
        const hasCritical = triggers.some(t => t.severity === 'critical');
        const hasHigh = triggers.some(t => t.severity === 'high');
        if (hasCritical || triggers.some(t => t.type === 'legal_threat')) {
            recommendedAgent = 'manager';
        }
        else if (hasHigh || triggers.some(t => t.type === 'vip_customer')) {
            recommendedAgent = 'senior';
        }
        // Determine priority
        let priority = 'medium';
        if (hasCritical) {
            priority = 'urgent';
        }
        else if (hasHigh) {
            priority = 'high';
        }
        else if (triggers.length === 0) {
            priority = 'low';
        }
        // Determine alert channels
        const alertChannels = [];
        if (hasCritical) {
            alertChannels.push('slack', 'email');
        }
        else if (shouldEscalate) {
            alertChannels.push('slack');
        }
        // Generate draft message for human agent
        const draftMessage = this.generateEscalationMessage(triggers, message);
        return {
            shouldEscalate,
            triggers,
            recommendedAgent,
            priority,
            alertChannels,
            draftMessage,
        };
    }
    /**
     * Check if message explicitly requests human agent
     */
    hasExplicitHumanRequest(message) {
        const patterns = [
            /speak (to|with) (a |an )?human/i,
            /talk to (a |an )?(real )?person/i,
            /connect me (to|with) (a |an )?(real )?agent/i,
            /(real|actual) person/i,
            /not (a )?bot/i,
            /human agent/i,
            /speak (to|with) manager/i,
            /escalate/i,
        ];
        return patterns.some(pattern => pattern.test(message));
    }
    /**
     * Check for legal threat language
     */
    hasLegalThreat(message) {
        const legalKeywords = [
            'lawyer', 'attorney', 'legal action', 'sue', 'lawsuit',
            'court', 'bbb', 'better business bureau', 'consumer protection',
            'legal counsel', 'solicitor', 'litigation',
        ];
        const lower = message.toLowerCase();
        return legalKeywords.some(keyword => lower.includes(keyword));
    }
    /**
     * Check if query is complex (multiple issues)
     */
    isComplexQuery(message) {
        // Count question marks
        const questionCount = (message.match(/\?/g) || []).length;
        // Count sentence separators
        const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
        // Complex if:
        // - Multiple questions (> 2)
        // - Very long message (> 500 chars)
        // - Many sentences (> 10)
        return questionCount > 2 || message.length > 500 || sentences.length > 10;
    }
    /**
     * Check if triggers meet escalation threshold
     */
    meetsEscalationThreshold(triggers) {
        // Any critical trigger = escalate
        if (triggers.some(t => t.severity === 'critical')) {
            return true;
        }
        // Multiple high severity = escalate
        const highCount = triggers.filter(t => t.severity === 'high').length;
        if (highCount >= 2) {
            return true;
        }
        // Single high + medium = escalate
        if (highCount >= 1 && triggers.some(t => t.severity === 'medium')) {
            return true;
        }
        return false;
    }
    /**
     * Generate escalation message for human agent
     */
    generateEscalationMessage(triggers, originalMessage) {
        const lines = [
            '🚨 AUTO-ESCALATION TRIGGERED',
            '',
            '**Escalation Reasons:**',
        ];
        for (const trigger of triggers) {
            const icon = trigger.severity === 'critical' ? '🔴' :
                trigger.severity === 'high' ? '🟠' :
                    trigger.severity === 'medium' ? '🟡' : '⚪';
            lines.push(`${icon} [${trigger.severity.toUpperCase()}] ${trigger.reason}`);
        }
        lines.push('');
        lines.push('**Original Message Preview:**');
        lines.push(originalMessage.substring(0, 200) + (originalMessage.length > 200 ? '...' : ''));
        lines.push('');
        lines.push('**Recommended Action:**');
        const hasCritical = triggers.some(t => t.severity === 'critical');
        const hasLegal = triggers.some(t => t.type === 'legal_threat');
        if (hasLegal) {
            lines.push('⚠️ LEGAL THREAT - Escalate to manager immediately');
            lines.push('Do NOT respond without legal review');
        }
        else if (hasCritical) {
            lines.push('Immediate response required (within 1 hour)');
            lines.push('Assign to senior agent');
        }
        else {
            lines.push('Review and respond with empathy');
            lines.push('Consider offering compensation or escalation to manager');
        }
        return lines.join('\n');
    }
    /**
     * Get escalation statistics
     */
    escalations = [];
    trackEscalation(conversationId, decision) {
        this.escalations.push({
            conversationId,
            decision,
            timestamp: new Date(),
        });
        // Keep only last 1000
        if (this.escalations.length > 1000) {
            this.escalations = this.escalations.slice(-1000);
        }
    }
    getStats() {
        const total = this.escalations.length;
        if (total === 0) {
            return {
                total: 0,
                escalationRate: '0%',
                byType: {},
                byPriority: {},
            };
        }
        // Count by trigger type
        const byType = {};
        const byPriority = {};
        for (const entry of this.escalations) {
            if (entry.decision.shouldEscalate) {
                entry.decision.triggers.forEach(trigger => {
                    byType[trigger.type] = (byType[trigger.type] || 0) + 1;
                });
                byPriority[entry.decision.priority] = (byPriority[entry.decision.priority] || 0) + 1;
            }
        }
        const escalatedCount = this.escalations.filter(e => e.decision.shouldEscalate).length;
        const escalationRate = ((escalatedCount / total) * 100).toFixed(1) + '%';
        return {
            total,
            escalated: escalatedCount,
            escalationRate,
            byType,
            byPriority,
        };
    }
}
// Export singleton
export const autoEscalation = new AutoEscalation();
//# sourceMappingURL=auto-escalation.js.map