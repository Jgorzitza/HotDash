/**
 * Automated SEO Issue Resolution Workflow
 *
 * Automatically diagnoses and suggests resolutions for SEO issues.
 * Implements HITL (Human-in-the-Loop) for approval before applying fixes.
 *
 * Features:
 * - Automated issue diagnosis
 * - Resolution suggestions
 * - HITL approval workflow
 * - Automated fix application
 * - Rollback capability
 */
import { type RankingAlert } from "./ranking-tracker";
export interface ResolutionSuggestion {
    alertId: string;
    issueType: string;
    diagnosis: string;
    suggestedActions: string[];
    automatedFix: boolean;
    requiresApproval: boolean;
    estimatedImpact: string;
    rollbackPlan: string;
}
export interface ResolutionWorkflow {
    id: string;
    alertId: string;
    status: 'pending' | 'approved' | 'rejected' | 'applied' | 'rolled_back';
    suggestion: ResolutionSuggestion;
    approvedBy?: string;
    appliedAt?: string;
    result?: string;
}
/**
 * Diagnose SEO issue and generate resolution suggestions
 */
export declare function diagnoseIssue(alert: RankingAlert): Promise<ResolutionSuggestion>;
/**
 * Create resolution workflow for approval
 */
export declare function createResolutionWorkflow(suggestion: ResolutionSuggestion): Promise<ResolutionWorkflow>;
/**
 * Approve resolution workflow
 */
export declare function approveResolution(workflowId: string, approvedBy: string): Promise<ResolutionWorkflow>;
/**
 * Apply automated resolution
 */
export declare function applyResolution(workflowId: string): Promise<{
    success: boolean;
    result: string;
}>;
/**
 * Rollback applied resolution
 */
export declare function rollbackResolution(workflowId: string, reason: string): Promise<{
    success: boolean;
    result: string;
}>;
//# sourceMappingURL=automated-resolution.d.ts.map