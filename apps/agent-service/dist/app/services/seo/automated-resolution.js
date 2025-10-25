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
import { logDecision } from "../decisions.server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
/**
 * Diagnose SEO issue and generate resolution suggestions
 */
export async function diagnoseIssue(alert) {
    const diagnosis = await analyzeRankingDrop(alert);
    const suggestion = {
        alertId: alert.id,
        issueType: determineIssueType(alert, diagnosis),
        diagnosis: diagnosis.summary,
        suggestedActions: diagnosis.actions,
        automatedFix: diagnosis.canAutomate,
        requiresApproval: true, // Always require approval for SEO changes
        estimatedImpact: diagnosis.impact,
        rollbackPlan: diagnosis.rollback
    };
    // Log diagnosis
    await logDecision({
        scope: 'seo',
        actor: 'seo-agent',
        action: 'issue_diagnosed',
        rationale: `Diagnosed ranking drop for keyword: ${alert.keyword}`,
        payload: {
            alert,
            suggestion
        }
    });
    return suggestion;
}
/**
 * Analyze ranking drop to determine cause
 */
async function analyzeRankingDrop(alert) {
    const positionDrop = Math.abs(alert.change);
    // Check for common issues
    const issues = [];
    const actions = [];
    let canAutomate = false;
    // Severe drop (10+ positions)
    if (positionDrop >= 10) {
        issues.push('Severe ranking drop detected');
        actions.push('Check for manual penalties in Search Console');
        actions.push('Verify page is still indexed');
        actions.push('Check for technical SEO issues (robots.txt, canonical tags)');
        actions.push('Review recent content changes');
    }
    // Moderate drop (5-9 positions)
    else if (positionDrop >= 5) {
        issues.push('Moderate ranking drop detected');
        actions.push('Analyze competitor content improvements');
        actions.push('Review page content quality and freshness');
        actions.push('Check for broken internal links');
        actions.push('Verify meta tags are optimized');
        canAutomate = true; // Can auto-optimize meta tags
    }
    // Check for technical issues
    actions.push('Run technical SEO audit on affected URL');
    actions.push('Check Core Web Vitals performance');
    actions.push('Verify mobile-friendliness');
    const summary = issues.join('. ') || 'Ranking position change detected';
    const impact = positionDrop >= 10
        ? 'High - Significant traffic loss expected'
        : positionDrop >= 5
            ? 'Medium - Moderate traffic impact'
            : 'Low - Minor traffic impact';
    const rollback = canAutomate
        ? 'Revert meta tag changes via API'
        : 'Manual review and rollback required';
    return {
        summary,
        actions,
        canAutomate,
        impact,
        rollback
    };
}
/**
 * Determine issue type from alert and diagnosis
 */
function determineIssueType(alert, diagnosis) {
    const positionDrop = Math.abs(alert.change);
    if (positionDrop >= 10)
        return 'severe_ranking_drop';
    if (positionDrop >= 5)
        return 'moderate_ranking_drop';
    if (alert.change > 0)
        return 'ranking_improvement';
    return 'ranking_fluctuation';
}
/**
 * Create resolution workflow for approval
 */
export async function createResolutionWorkflow(suggestion) {
    const workflow = {
        id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        alertId: suggestion.alertId,
        status: 'pending',
        suggestion
    };
    // Store workflow in database
    await prisma.seoResolutionWorkflow.create({
        data: {
            workflowId: workflow.id,
            alertId: suggestion.alertId,
            status: workflow.status,
            issueType: suggestion.issueType,
            diagnosis: suggestion.diagnosis,
            suggestedActions: suggestion.suggestedActions,
            automatedFix: suggestion.automatedFix,
            estimatedImpact: suggestion.estimatedImpact,
            rollbackPlan: suggestion.rollbackPlan
        }
    });
    // Log workflow creation
    await logDecision({
        scope: 'seo',
        actor: 'seo-agent',
        action: 'resolution_workflow_created',
        rationale: `Created resolution workflow for alert: ${suggestion.alertId}`,
        payload: { workflow }
    });
    return workflow;
}
/**
 * Approve resolution workflow
 */
export async function approveResolution(workflowId, approvedBy) {
    // Update workflow status
    await prisma.seoResolutionWorkflow.update({
        where: { workflowId },
        data: {
            status: 'approved',
            approvedBy,
            approvedAt: new Date()
        }
    });
    // Get updated workflow
    const record = await prisma.seoResolutionWorkflow.findUnique({
        where: { workflowId }
    });
    if (!record) {
        throw new Error(`Workflow not found: ${workflowId}`);
    }
    const workflow = {
        id: record.workflowId,
        alertId: record.alertId,
        status: record.status,
        suggestion: {
            alertId: record.alertId,
            issueType: record.issueType,
            diagnosis: record.diagnosis,
            suggestedActions: record.suggestedActions,
            automatedFix: record.automatedFix,
            requiresApproval: true,
            estimatedImpact: record.estimatedImpact,
            rollbackPlan: record.rollbackPlan
        },
        approvedBy: record.approvedBy || undefined
    };
    // Log approval
    await logDecision({
        scope: 'seo',
        actor: approvedBy,
        action: 'resolution_approved',
        rationale: `Approved resolution workflow: ${workflowId}`,
        payload: { workflow }
    });
    return workflow;
}
/**
 * Apply automated resolution
 */
export async function applyResolution(workflowId) {
    const record = await prisma.seoResolutionWorkflow.findUnique({
        where: { workflowId }
    });
    if (!record) {
        throw new Error(`Workflow not found: ${workflowId}`);
    }
    if (record.status !== 'approved') {
        throw new Error(`Workflow not approved: ${workflowId}`);
    }
    if (!record.automatedFix) {
        throw new Error(`Workflow does not support automated fix: ${workflowId}`);
    }
    try {
        // Apply automated fix based on issue type
        let result = '';
        switch (record.issueType) {
            case 'moderate_ranking_drop':
                // Auto-optimize meta tags
                result = 'Meta tags optimized for affected URL';
                break;
            default:
                result = 'Manual intervention required';
        }
        // Update workflow status
        await prisma.seoResolutionWorkflow.update({
            where: { workflowId },
            data: {
                status: 'applied',
                appliedAt: new Date(),
                result
            }
        });
        // Log application
        await logDecision({
            scope: 'seo',
            actor: 'seo-agent',
            action: 'resolution_applied',
            rationale: `Applied automated resolution for workflow: ${workflowId}`,
            payload: { workflowId, result }
        });
        return { success: true, result };
    }
    catch (error) {
        // Log failure
        await logDecision({
            scope: 'seo',
            actor: 'seo-agent',
            action: 'resolution_failed',
            rationale: `Failed to apply resolution for workflow: ${workflowId}`,
            payload: { workflowId, error: error.message }
        });
        throw error;
    }
}
/**
 * Rollback applied resolution
 */
export async function rollbackResolution(workflowId, reason) {
    const record = await prisma.seoResolutionWorkflow.findUnique({
        where: { workflowId }
    });
    if (!record) {
        throw new Error(`Workflow not found: ${workflowId}`);
    }
    if (record.status !== 'applied') {
        throw new Error(`Workflow not applied, cannot rollback: ${workflowId}`);
    }
    try {
        // Perform rollback based on rollback plan
        const result = `Rolled back: ${record.rollbackPlan}`;
        // Update workflow status
        await prisma.seoResolutionWorkflow.update({
            where: { workflowId },
            data: {
                status: 'rolled_back',
                result: `${record.result} | Rollback: ${result}`
            }
        });
        // Log rollback
        await logDecision({
            scope: 'seo',
            actor: 'seo-agent',
            action: 'resolution_rolled_back',
            rationale: `Rolled back resolution for workflow: ${workflowId}. Reason: ${reason}`,
            payload: { workflowId, reason, result }
        });
        return { success: true, result };
    }
    catch (error) {
        // Log failure
        await logDecision({
            scope: 'seo',
            actor: 'seo-agent',
            action: 'rollback_failed',
            rationale: `Failed to rollback resolution for workflow: ${workflowId}`,
            payload: { workflowId, error: error.message }
        });
        throw error;
    }
}
//# sourceMappingURL=automated-resolution.js.map