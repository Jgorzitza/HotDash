/**
 * AI Customer Service Response Automation with HITL Approval
 *
 * Implements automated response generation with human-in-the-loop approval,
 * response templates, and approval workflows.
 *
 * @module app/services/ai-customer/response-automation.service
 */
export interface ResponseTemplate {
    id: string;
    name: string;
    category: string;
    triggerKeywords: string[];
    template: string;
    variables: string[];
    autoApprove: boolean;
    approvalThreshold: number;
    usageCount: number;
    successRate: number;
    lastUsed?: string;
}
export interface ApprovalWorkflow {
    id: string;
    name: string;
    conditions: {
        confidence?: number;
        priority?: string[];
        inquiryType?: string[];
        customerTier?: string[];
        responseLength?: number;
    };
    approvers: string[];
    escalationTime: number;
    autoApproveAfter?: number;
}
export interface AutomatedResponse {
    id: string;
    inquiryId: string;
    templateId?: string;
    draftResponse: string;
    confidence: number;
    requiresApproval: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'auto_approved';
    approvalReason?: string;
    approverId?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    finalResponse?: string;
    sentAt?: string;
    customerFeedback?: {
        rating: number;
        comment?: string;
        timestamp: string;
    };
    createdAt: string;
    updatedAt: string;
}
export interface AutomationMetrics {
    totalResponses: number;
    autoApproved: number;
    humanApproved: number;
    rejected: number;
    averageApprovalTime: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    templateUsage: Record<string, number>;
}
export declare class ResponseAutomationService {
    private supabase;
    private templates;
    private workflows;
    constructor();
    /**
     * Initialize automation service
     */
    initialize(): Promise<void>;
    /**
     * Generate automated response for an inquiry
     */
    generateAutomatedResponse(inquiry: any, analysis: any): Promise<AutomatedResponse>;
    /**
     * Find matching response template
     */
    private findMatchingTemplate;
    /**
     * Generate response from template
     */
    private generateFromTemplate;
    /**
     * Generate custom response using AI
     */
    private generateCustomResponse;
    /**
     * Calculate confidence for template-based response
     */
    private calculateTemplateConfidence;
    /**
     * Get variable value for template substitution
     */
    private getVariableValue;
    /**
     * Personalize response
     */
    private personalizeResponse;
    /**
     * Determine if response requires approval
     */
    private requiresApproval;
    /**
     * Get approval reason
     */
    private getApprovalReason;
    /**
     * Approve a response
     */
    approveResponse(responseId: string, approverId: string, finalResponse?: string): Promise<void>;
    /**
     * Reject a response
     */
    rejectResponse(responseId: string, approverId: string, rejectionReason: string): Promise<void>;
    /**
     * Get pending responses for approval
     */
    getPendingApprovals(): Promise<AutomatedResponse[]>;
    /**
     * Send approved response
     */
    sendResponse(responseId: string): Promise<void>;
    /**
     * Update template usage count
     */
    private updateTemplateUsage;
    /**
     * Update template success rate
     */
    private updateTemplateSuccess;
    /**
     * Load response templates
     */
    private loadTemplates;
    /**
     * Load approval workflows
     */
    private loadWorkflows;
    /**
     * Get default templates when database is unavailable
     */
    private getDefaultTemplates;
    /**
     * Get default workflows when database is unavailable
     */
    private getDefaultWorkflows;
    /**
     * Get automation metrics
     */
    getAutomationMetrics(): Promise<AutomationMetrics>;
}
/**
 * Default response automation service instance
 */
export declare const responseAutomationService: ResponseAutomationService;
//# sourceMappingURL=response-automation.service.d.ts.map