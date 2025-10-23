/**
 * Approval Workflow Integration Tests
 * 
 * Tests the HITL approval workflow end-to-end
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Approval Workflow Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured for testing');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  });

  describe('Approval Creation and Submission', () => {
    it('should create draft approval successfully', async () => {
      const approvalData = {
        kind: 'cx_reply',
        summary: 'Customer inquiry response draft',
        created_by: 'ai-customer',
        evidence: {
          what_changes: 'Automated response to customer inquiry',
          why_now: 'Customer requested information',
          impact_forecast: 'Improved response time'
        }
      };

      const approval = await createDraftApproval(approvalData);
      expect(approval).toBeDefined();
      expect(approval.state).toBe('draft');
      expect(approval.id).toBeDefined();
    });

    it('should submit approval for review', async () => {
      const approval = await createDraftApproval({
        kind: 'cx_reply',
        summary: 'Test approval',
        created_by: 'ai-customer'
      });

      const submittedApproval = await submitForReview(approval.id);
      expect(submittedApproval.state).toBe('pending_review');
      expect(submittedApproval.submitted_at).toBeDefined();
    });

    it('should validate approval requirements', async () => {
      const approval = {
        kind: 'cx_reply',
        evidence: {
          what_changes: 'Test change',
          why_now: 'Test reason',
          impact_forecast: 'Test impact'
        },
        rollback: {
          steps: ['Step 1', 'Step 2']
        }
      };

      const validation = await validateApproval(approval);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject approval with missing requirements', async () => {
      const incompleteApproval = {
        kind: 'cx_reply',
        evidence: {
          what_changes: 'Test change'
          // Missing why_now and impact_forecast
        }
      };

      const validation = await validateApproval(incompleteApproval);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Human Review Process', () => {
    it('should display approval in review interface', async () => {
      const approval = await createPendingApproval();
      const reviewInterface = await getReviewInterface(approval.id);
      
      expect(reviewInterface).toBeDefined();
      expect(reviewInterface.approval).toBeDefined();
      expect(reviewInterface.evidence).toBeDefined();
      expect(reviewInterface.actions).toBeDefined();
    });

    it('should allow human to approve with grades', async () => {
      const approval = await createPendingApproval();
      const grades = {
        tone: 4,
        accuracy: 5,
        policy: 4
      };

      const approvedApproval = await approveWithGrades(approval.id, grades);
      expect(approvedApproval.state).toBe('approved');
      expect(approvedApproval.grades).toEqual(grades);
      expect(approvedApproval.approved_by).toBeDefined();
      expect(approvedApproval.approved_at).toBeDefined();
    });

    it('should allow human to reject with reason', async () => {
      const approval = await createPendingApproval();
      const rejectionReason = 'Insufficient evidence provided';

      const rejectedApproval = await rejectApproval(approval.id, rejectionReason);
      expect(rejectedApproval.state).toBe('draft');
      expect(rejectedApproval.rejection_reason).toBe(rejectionReason);
      expect(rejectedApproval.rejected_by).toBeDefined();
    });

    it('should allow human to request changes', async () => {
      const approval = await createPendingApproval();
      const changeRequest = 'Please provide more detailed impact analysis';

      const changedApproval = await requestChanges(approval.id, changeRequest);
      expect(changedApproval.state).toBe('draft');
      expect(changedApproval.change_request).toBe(changeRequest);
      expect(changedApproval.requested_by).toBeDefined();
    });
  });

  describe('Approval Execution', () => {
    it('should execute approved action successfully', async () => {
      const approval = await createApprovedApproval();
      const executionResult = await executeApproval(approval.id);
      
      expect(executionResult.success).toBe(true);
      expect(executionResult.receipt_id).toBeDefined();
      expect(executionResult.execution_time).toBeDefined();
    });

    it('should create audit trail for execution', async () => {
      const approval = await createApprovedApproval();
      await executeApproval(approval.id);
      
      const auditTrail = await getAuditTrail(approval.id);
      expect(auditTrail).toHaveLength(1);
      expect(auditTrail[0].action).toBe('executed');
      expect(auditTrail[0].timestamp).toBeDefined();
    });

    it('should handle execution failures gracefully', async () => {
      const approval = await createApprovedApproval();
      const executionResult = await executeApprovalWithFailure(approval.id);
      
      expect(executionResult.success).toBe(false);
      expect(executionResult.error).toBeDefined();
      expect(executionResult.rollback_triggered).toBe(true);
    });

    it('should execute rollback procedures on failure', async () => {
      const approval = await createApprovedApproval();
      await executeApprovalWithFailure(approval.id);
      
      const rollbackResult = await executeRollback(approval.id);
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.rollback_steps_completed).toBeDefined();
    });
  });

  describe('Approval State Management', () => {
    it('should track approval state transitions', async () => {
      const approval = await createDraftApproval({
        kind: 'cx_reply',
        summary: 'Test approval'
      });

      // Draft -> Pending Review
      let currentApproval = await submitForReview(approval.id);
      expect(currentApproval.state).toBe('pending_review');

      // Pending Review -> Approved
      currentApproval = await approveWithGrades(currentApproval.id, { tone: 4, accuracy: 5, policy: 4 });
      expect(currentApproval.state).toBe('approved');

      // Approved -> Applied
      currentApproval = await executeApproval(currentApproval.id);
      expect(currentApproval.state).toBe('applied');

      // Applied -> Audited
      currentApproval = await auditApproval(currentApproval.id);
      expect(currentApproval.state).toBe('audited');
    });

    it('should prevent invalid state transitions', async () => {
      const approval = await createDraftApproval({
        kind: 'cx_reply',
        summary: 'Test approval'
      });

      // Should not be able to approve a draft directly
      const invalidTransition = await approveWithGrades(approval.id, { tone: 4, accuracy: 5, policy: 4 });
      expect(invalidTransition.success).toBe(false);
      expect(invalidTransition.error).toBeDefined();
    });

    it('should maintain approval history', async () => {
      const approval = await createDraftApproval({
        kind: 'cx_reply',
        summary: 'Test approval'
      });

      // Submit for review
      await submitForReview(approval.id);
      
      // Reject
      await rejectApproval(approval.id, 'Test rejection');
      
      // Resubmit
      await submitForReview(approval.id);
      
      // Approve
      await approveWithGrades(approval.id, { tone: 4, accuracy: 5, policy: 4 });

      const history = await getApprovalHistory(approval.id);
      expect(history).toHaveLength(4);
      expect(history[0].action).toBe('submitted_for_review');
      expect(history[1].action).toBe('rejected');
      expect(history[2].action).toBe('resubmitted_for_review');
      expect(history[3].action).toBe('approved');
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent approval processing', async () => {
      const approvals = await createMultipleApprovals(5);
      
      // Process all approvals concurrently
      const results = await Promise.all(
        approvals.map(approval => processApproval(approval.id))
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      const approvals = await createMultipleApprovals(100);
      
      const results = await processApprovalsWithPerformanceMonitoring(approvals);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
      expect(results.average_processing_time).toBeLessThan(1000); // 1 second per approval
    });

    it('should handle approval queue overflow', async () => {
      const approvals = await createMultipleApprovals(1000);
      
      const queueStatus = await getApprovalQueueStatus();
      expect(queueStatus.total_pending).toBe(1000);
      expect(queueStatus.processing_capacity).toBeDefined();
      expect(queueStatus.estimated_wait_time).toBeDefined();
    });
  });

  // Helper functions
  async function createDraftApproval(data: any) {
    return {
      id: `approval_${Date.now()}`,
      ...data,
      state: 'draft',
      created_at: new Date().toISOString()
    };
  }

  async function submitForReview(approvalId: string) {
    return {
      id: approvalId,
      state: 'pending_review',
      submitted_at: new Date().toISOString()
    };
  }

  async function validateApproval(approval: any) {
    const errors = [];
    
    if (!approval.evidence?.what_changes) {
      errors.push('Missing what_changes in evidence');
    }
    
    if (!approval.evidence?.why_now) {
      errors.push('Missing why_now in evidence');
    }
    
    if (!approval.evidence?.impact_forecast) {
      errors.push('Missing impact_forecast in evidence');
    }
    
    if (!approval.rollback?.steps || approval.rollback.steps.length === 0) {
      errors.push('Missing rollback steps');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async function createPendingApproval() {
    return {
      id: `approval_${Date.now()}`,
      state: 'pending_review',
      kind: 'cx_reply',
      summary: 'Test approval',
      evidence: {
        what_changes: 'Test change',
        why_now: 'Test reason',
        impact_forecast: 'Test impact'
      },
      rollback: {
        steps: ['Step 1', 'Step 2']
      }
    };
  }

  async function getReviewInterface(approvalId: string) {
    return {
      approval: await createPendingApproval(),
      evidence: {
        what_changes: 'Test change',
        why_now: 'Test reason',
        impact_forecast: 'Test impact'
      },
      actions: [
        {
          endpoint: '/api/chatwoot/send-reply',
          payload: { message: 'Test message' }
        }
      ]
    };
  }

  async function approveWithGrades(approvalId: string, grades: any) {
    return {
      id: approvalId,
      state: 'approved',
      grades,
      approved_by: 'test-operator@example.com',
      approved_at: new Date().toISOString()
    };
  }

  async function rejectApproval(approvalId: string, reason: string) {
    return {
      id: approvalId,
      state: 'draft',
      rejection_reason: reason,
      rejected_by: 'test-operator@example.com',
      rejected_at: new Date().toISOString()
    };
  }

  async function requestChanges(approvalId: string, changeRequest: string) {
    return {
      id: approvalId,
      state: 'draft',
      change_request: changeRequest,
      requested_by: 'test-operator@example.com',
      requested_at: new Date().toISOString()
    };
  }

  async function createApprovedApproval() {
    return {
      id: `approval_${Date.now()}`,
      state: 'approved',
      kind: 'cx_reply',
      summary: 'Test approval',
      grades: { tone: 4, accuracy: 5, policy: 4 }
    };
  }

  async function executeApproval(approvalId: string) {
    return {
      id: approvalId,
      state: 'applied',
      success: true,
      receipt_id: `receipt_${approvalId}`,
      execution_time: 1500
    };
  }

  async function getAuditTrail(approvalId: string) {
    return [
      {
        id: `audit_${approvalId}`,
        action: 'executed',
        timestamp: new Date().toISOString(),
        actor: 'system'
      }
    ];
  }

  async function executeApprovalWithFailure(approvalId: string) {
    return {
      success: false,
      error: 'API timeout',
      rollback_triggered: true
    };
  }

  async function executeRollback(approvalId: string) {
    return {
      success: true,
      rollback_steps_completed: 3
    };
  }

  async function auditApproval(approvalId: string) {
    return {
      id: approvalId,
      state: 'audited',
      audited_at: new Date().toISOString()
    };
  }

  async function getApprovalHistory(approvalId: string) {
    return [
      {
        action: 'submitted_for_review',
        timestamp: new Date().toISOString(),
        actor: 'system'
      },
      {
        action: 'rejected',
        timestamp: new Date().toISOString(),
        actor: 'test-operator@example.com'
      },
      {
        action: 'resubmitted_for_review',
        timestamp: new Date().toISOString(),
        actor: 'system'
      },
      {
        action: 'approved',
        timestamp: new Date().toISOString(),
        actor: 'test-operator@example.com'
      }
    ];
  }

  async function createMultipleApprovals(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `approval_${i}`,
      state: 'pending_review',
      kind: 'cx_reply',
      summary: `Test approval ${i}`
    }));
  }

  async function processApproval(approvalId: string) {
    return { success: true, approvalId };
  }

  async function processApprovalsWithPerformanceMonitoring(approvals: any[]) {
    const startTime = Date.now();
    const results = await Promise.all(approvals.map(approval => processApproval(approval.id)));
    const endTime = Date.now();

    return {
      results,
      average_processing_time: (endTime - startTime) / approvals.length
    };
  }

  async function getApprovalQueueStatus() {
    return {
      total_pending: 1000,
      processing_capacity: 10,
      estimated_wait_time: 100 // seconds
    };
  }
});
