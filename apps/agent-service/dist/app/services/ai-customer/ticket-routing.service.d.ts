/**
 * AI Customer Service Ticket Routing System
 *
 * Implements intelligent ticket routing based on inquiry analysis,
 * agent availability, and specialization matching.
 *
 * @module app/services/ai-customer/ticket-routing.service
 */
export interface Agent {
    id: string;
    name: string;
    email: string;
    specializations: string[];
    availability: 'available' | 'busy' | 'offline';
    currentLoad: number;
    maxLoad: number;
    responseTime: number;
    customerSatisfaction: number;
    languages: string[];
    timezone: string;
}
export interface RoutingRule {
    id: string;
    name: string;
    conditions: {
        tags?: string[];
        priority?: string[];
        channel?: string[];
        customerTier?: string[];
        inquiryType?: string[];
    };
    action: {
        type: 'assign_to_agent' | 'assign_to_team' | 'escalate' | 'auto_resolve';
        target: string;
        priority: number;
    };
    enabled: boolean;
}
export interface RoutingResult {
    inquiryId: string;
    assignedTo?: string;
    team?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedResponseTime: number;
    routingReason: string;
    fallbackPlan?: string;
}
export declare class TicketRoutingService {
    private supabase;
    private agents;
    private routingRules;
    constructor();
    /**
     * Initialize routing service with agents and rules
     */
    initialize(): Promise<void>;
    /**
     * Route a customer inquiry to the appropriate agent or team
     */
    routeInquiry(inquiryId: string, inquiry: any): Promise<RoutingResult>;
    /**
     * Analyze inquiry for routing purposes
     */
    private analyzeForRouting;
    /**
     * Find matching routing rule
     */
    private findMatchingRule;
    /**
     * Execute routing action
     */
    private executeRoutingAction;
    /**
     * Assign inquiry to specific agent
     */
    private assignToAgent;
    /**
     * Assign inquiry to team
     */
    private assignToTeam;
    /**
     * Escalate inquiry
     */
    private escalateInquiry;
    /**
     * Auto-resolve inquiry
     */
    private autoResolve;
    /**
     * Default routing when no rules match
     */
    private defaultRouting;
    /**
     * Load agents from database
     */
    private loadAgents;
    /**
     * Load routing rules from database
     */
    private loadRoutingRules;
    /**
     * Get default agents when database is unavailable
     */
    private getDefaultAgents;
    /**
     * Get default routing rules when database is unavailable
     */
    private getDefaultRoutingRules;
    /**
     * Get routing statistics
     */
    getRoutingStats(): Promise<{
        totalInquiries: number;
        autoRouted: number;
        escalated: number;
        averageRoutingTime: number;
        agentUtilization: Record<string, number>;
    }>;
}
/**
 * Default ticket routing service instance
 */
export declare const ticketRoutingService: TicketRoutingService;
//# sourceMappingURL=ticket-routing.service.d.ts.map