/**
 * Growth Engine Agent Orchestration Infrastructure
 *
 * Implements the agent handoff pattern and security model for Growth Engine phases 9-12
 * Provides the foundation for Customer-Front, CEO-Front, and Specialist agents
 */
import { Agent } from "@openai/agents";
export type AgentRole = 'customer-front' | 'ceo-front' | 'accounts-sub' | 'storefront-sub' | 'analytics' | 'inventory' | 'content-seo-perf' | 'risk';
export interface AgentConfig {
    role: AgentRole;
    name: string;
    instructions: string;
    allowedTools: string[];
    mcpAccess: 'storefront' | 'customer-accounts' | 'none';
    requiresApproval: boolean;
}
export interface HandoffRequest {
    id: string;
    fromAgent: AgentRole;
    toAgent: AgentRole;
    context: {
        customerId?: string;
        sessionId?: string;
        requestType: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    payload: any;
    timestamp: string;
}
export interface HandoffResponse {
    id: string;
    success: boolean;
    result?: any;
    error?: string;
    mcpRequestIds: string[];
    evidence: {
        dataSource: string;
        confidence: number;
        freshness: string;
    };
}
/**
 * Execute handoff between agents
 */
export declare function executeHandoff(request: HandoffRequest, targetAgent: Agent): Promise<HandoffResponse>;
export interface PIIBrokerConfig {
    redactionRules: {
        email: boolean;
        phone: boolean;
        address: boolean;
        paymentInfo: boolean;
    };
    auditLogging: boolean;
}
export interface ABACPolicy {
    agent: AgentRole;
    resource: string;
    action: string;
    conditions: {
        sessionMatch?: boolean;
        customerMatch?: boolean;
        timeWindow?: number;
    };
}
/**
 * PII Broker for redaction and audit
 */
export declare class PIIBroker {
    private config;
    constructor(config: PIIBrokerConfig);
    /**
     * Redact PII from public reply
     */
    redactPublicReply(text: string): string;
    /**
     * Create PII card for operator-only view
     */
    createPIICard(originalText: string, customerData: any): string;
    /**
     * Log audit trail
     */
    logAuditTrail(agent: AgentRole, action: string, mcpRequestId: string, timestamp: string): void;
}
/**
 * ABAC Policy Engine
 */
export declare class ABACEngine {
    private policies;
    constructor(policies: ABACPolicy[]);
    /**
     * Check if agent can perform action on resource
     */
    canAccess(agent: AgentRole, resource: string, action: string, context: any): boolean;
}
export declare function createAgentConfig(role: AgentRole): AgentConfig;
export declare function createAgent(config: AgentConfig): Agent;
//# sourceMappingURL=agent-orchestration.d.ts.map