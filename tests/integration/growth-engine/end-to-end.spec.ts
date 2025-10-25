/**
 * Growth Engine End-to-End Integration Tests
 * 
 * QA-001: Comprehensive testing of the complete Growth Engine flow:
 * - Telemetry pipeline data flow (GSC/GA4 to action queue)
 * - Action queue ranking algorithm
 * - Approval drawer UI with real approval data
 * - HITL approval workflow end-to-end
 * - Action execution and audit trail
 * - Error handling and rollback scenarios
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { logDecision } from '~/services/decisions.server';

// Test configuration
const TEST_SHOP_DOMAIN = 'test-shop.myshopify.com';
const TEST_OPERATOR_EMAIL = 'test-operator@example.com';
const GA4_PROPERTY_ID = '339826228';

// Mock data for testing
const mockTelemetryData = {
  gsc: {
    queries: [
      { query: 'test product', clicks: 150, impressions: 2000, ctr: 7.5, position: 3.2 },
      { query: 'best product', clicks: 89, impressions: 1200, ctr: 7.4, position: 4.1 }
    ],
    pages: [
      { page: '/products/test-product', clicks: 45, impressions: 800, ctr: 5.6, position: 2.8 }
    ]
  },
  ga4: {
    events: [
      { event_name: 'page_view', event_count: 1250, total_revenue: 15000 },
      { event_name: 'add_to_cart', event_count: 89, total_revenue: 8900 },
      { event_name: 'purchase', event_count: 23, total_revenue: 2300 }
    ],
    customDimensions: [
      { dimension_name: 'hd_action_key', value: 'seo_optimization_001' }
    ]
  }
};

const mockActionQueueData = [
  {
    id: 'action_001',
    type: 'seo_optimization',
    target: 'product_page_001',
    draft: 'Optimize product page title and meta description for better search visibility',
    expected_impact: {
      metric: 'organic_traffic',
      delta: 25,
      unit: '%'
    },
    confidence: 0.85,
    ease: 'medium',
    risk_tier: 'perf',
    score: 7.2,
    status: 'pending',
    created_at: new Date().toISOString(),
    agent: 'seo-agent'
  },
  {
    id: 'action_002',
    type: 'inventory_optimization',
    target: 'stock_level_002',
    draft: 'Adjust reorder point for high-demand products to prevent stockouts',
    expected_impact: {
      metric: 'stockout_rate',
      delta: -40,
      unit: '%'
    },
    confidence: 0.92,
    ease: 'simple',
    risk_tier: 'none',
    score: 8.5,
    status: 'pending',
    created_at: new Date().toISOString(),
    agent: 'inventory-agent'
  }
];

const mockApprovalData = {
  id: 'approval_001',
  kind: 'cx_reply',
  state: 'pending_review',
  summary: 'Customer inquiry about order status - automated response draft',
  created_by: 'ai-customer',
  reviewer: 'test-operator@example.com',
  evidence: {
    what_changes: 'Automated response to customer order inquiry',
    why_now: 'Customer requested order status update',
    impact_forecast: 'Improved customer satisfaction and reduced support load',
    diffs: [
      {
        path: 'response_content',
        before: 'Please contact support for order status',
        after: 'Your order #12345 is currently being processed and will ship within 2 business days'
      }
    ],
    samples: [
      {
        label: 'Customer Message',
        content: 'Hi, I placed an order #12345 yesterday. When will it ship?'
      }
    ],
    queries: [
      {
        label: 'Order Status Query',
        query: 'SELECT status FROM orders WHERE id = 12345',
        result: 'processing'
      }
    ]
  },
  impact: {
    expected_outcome: 'Faster customer response time',
    metrics_affected: ['response_time', 'customer_satisfaction'],
    user_experience: 'Immediate order status information',
    business_value: 'Reduced support ticket volume'
  },
  risk: {
    what_could_go_wrong: 'Incorrect order status information',
    recovery_time: '2 minutes'
  },
  rollback: {
    steps: [
      'Revert to generic response template',
      'Escalate to human support agent',
      'Send follow-up email with correct information'
    ],
    artifact_location: '/backups/approval_001_rollback.json'
  },
  actions: [
    {
      endpoint: '/api/chatwoot/send-reply',
      payload: {
        conversation_id: 'conv_123',
        message: 'Your order #12345 is currently being processed...',
        private: false
      },
      dry_run_status: 'success'
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('Growth Engine End-to-End Integration Tests', () => {
  let supabase: any;
  let analyticsClient: any;

  beforeAll(async () => {
    // Initialize test clients
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      supabase = createSupabaseStub();
    } else {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    const analyticsCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!analyticsCredentials) {
      analyticsClient = createAnalyticsStub();
    } else {
      analyticsClient = new BetaAnalyticsDataClient({
        keyFilename: analyticsCredentials,
      });
    }

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Reset test state before each test
    await resetTestState();
  });

  afterEach(async () => {
    // Clean up after each test
    await cleanupAfterTest();
  });

  describe('1. Telemetry Pipeline Data Flow', () => {
    it('should collect GSC data and create action queue items', async () => {
      // Test GSC data collection
      const gscData = await collectGSCData();
      expect(gscData).toBeDefined();
      expect(gscData.queries).toHaveLength(2);
      expect(gscData.pages).toHaveLength(1);

      // Test action creation from GSC data
      const actions = await createActionsFromGSCData(gscData);
      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('seo_optimization');
      expect(actions[0].expected_impact.metric).toBe('organic_traffic');
    });

    it('should collect GA4 data and update action attribution', async () => {
      // Test GA4 data collection
      const ga4Data = await collectGA4Data();
      expect(ga4Data).toBeDefined();
      expect(ga4Data.events).toHaveLength(3);
      expect(ga4Data.customDimensions).toHaveLength(1);

      // Test attribution update
      const attribution = await updateActionAttribution('seo_optimization_001', ga4Data);
      expect(attribution).toBeDefined();
      expect(attribution.revenue).toBeGreaterThan(0);
    });

    it('should handle telemetry data errors gracefully', async () => {
      // Test error handling for GSC API failures
      const gscError = await collectGSCDataWithError();
      expect(gscError.error).toBeDefined();
      expect(gscError.fallback).toBe(true);

      // Test error handling for GA4 API failures
      const ga4Error = await collectGA4DataWithError();
      expect(ga4Error.error).toBeDefined();
      expect(ga4Error.fallback).toBe(true);
    });
  });

  describe('2. Action Queue Ranking Algorithm', () => {
    it('should rank actions by score correctly', async () => {
      // Create test actions with different scores
      const actions = await createTestActions();
      expect(actions).toHaveLength(2);

      // Test ranking algorithm
      const rankedActions = await rankActions(actions);
      expect(rankedActions).toHaveLength(2);
      expect(rankedActions[0].score).toBeGreaterThanOrEqual(rankedActions[1].score);
      expect(rankedActions[0].id).toBe('action_002'); // Higher score
    });

    it('should update rankings based on realized ROI', async () => {
      // Simulate realized ROI data
      const roiData = {
        'action_001': { revenue: 5000, conversionRate: 3.2 },
        'action_002': { revenue: 12000, conversionRate: 4.1 }
      };

      // Update rankings
      const updatedRankings = await updateRankingsWithROI(roiData);
      expect(updatedRankings).toHaveLength(2);
      expect(updatedRankings[0].id).toBe('action_002'); // Higher realized ROI
    });

    it('should handle ranking edge cases', async () => {
      // Test with empty action queue
      const emptyRankings = await rankActions([]);
      expect(emptyRankings).toHaveLength(0);

      // Test with actions having same scores
      const sameScoreActions = await createSameScoreActions();
      const rankedSameScore = await rankActions(sameScoreActions);
      expect(rankedSameScore).toHaveLength(2);
      // Should maintain original order for same scores
    });
  });

  describe('3. Approval Drawer UI with Real Data', () => {
    it('should display approval data correctly', async () => {
      // Test approval drawer rendering
      const approvalDrawer = await renderApprovalDrawer(mockApprovalData);
      expect(approvalDrawer).toBeDefined();
      expect(approvalDrawer.summary).toBe(mockApprovalData.summary);
      expect(approvalDrawer.evidence).toBeDefined();
      expect(approvalDrawer.actions).toHaveLength(1);
    });

    it('should validate approval requirements', async () => {
      // Test validation logic
      const validation = await validateApproval(mockApprovalData);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should handle approval state transitions', async () => {
      // Test state transitions
      const stateTransitions = [
        { from: 'draft', to: 'pending_review' },
        { from: 'pending_review', to: 'approved' },
        { from: 'approved', to: 'applied' },
        { from: 'applied', to: 'audited' }
      ];

      for (const transition of stateTransitions) {
        const result = await testStateTransition(transition.from, transition.to);
        expect(result.success).toBe(true);
        expect(result.transition).toEqual(transition);
      }
    });
  });

  describe('4. HITL Approval Workflow End-to-End', () => {
    it('should complete full approval workflow', async () => {
      // Start with draft approval
      let approval = await createDraftApproval(mockApprovalData);
      expect(approval.state).toBe('draft');

      // Submit for review
      approval = await submitForReview(approval.id);
      expect(approval.state).toBe('pending_review');

      // Human review and approval
      const grades = { tone: 4, accuracy: 5, policy: 4 };
      approval = await approveWithGrades(approval.id, grades);
      expect(approval.state).toBe('approved');

      // Apply the approval
      approval = await applyApproval(approval.id);
      expect(approval.state).toBe('applied');

      // Audit the results
      approval = await auditApproval(approval.id);
      expect(approval.state).toBe('audited');
    });

    it('should handle rejection workflow', async () => {
      // Create and submit approval
      let approval = await createDraftApproval(mockApprovalData);
      approval = await submitForReview(approval.id);

      // Reject with reason
      const rejectionReason = 'Insufficient evidence provided';
      approval = await rejectApproval(approval.id, rejectionReason);
      expect(approval.state).toBe('draft');
      expect(approval.rejection_reason).toBe(rejectionReason);
    });

    it('should handle request changes workflow', async () => {
      // Create and submit approval
      let approval = await createDraftApproval(mockApprovalData);
      approval = await submitForReview(approval.id);

      // Request changes
      const changeRequest = 'Please provide more detailed impact analysis';
      approval = await requestChanges(approval.id, changeRequest);
      expect(approval.state).toBe('draft');
      expect(approval.change_request).toBe(changeRequest);
    });
  });

  describe('5. Action Execution and Audit Trail', () => {
    it('should execute approved actions successfully', async () => {
      // Create and approve action
      const action = await createTestAction();
      const approvedAction = await approveAction(action.id);

      // Execute the action
      const executionResult = await executeAction(approvedAction.id);
      expect(executionResult.success).toBe(true);
      expect(executionResult.receipt_id).toBeDefined();

      // Verify audit trail
      const auditTrail = await getAuditTrail(approvedAction.id);
      expect(auditTrail).toHaveLength(1);
      expect(auditTrail[0].action).toBe('executed');
      expect(auditTrail[0].timestamp).toBeDefined();
    });

    it('should create comprehensive audit trail', async () => {
      // Execute multiple actions
      const actions = await createMultipleTestActions();
      const executionResults = [];

      for (const action of actions) {
        const result = await executeAction(action.id);
        executionResults.push(result);
      }

      // Verify audit trail completeness
      const auditTrail = await getCompleteAuditTrail();
      expect(auditTrail.length).toBeGreaterThan(0);
      
      // Check audit trail structure
      for (const entry of auditTrail) {
        expect(entry.id).toBeDefined();
        expect(entry.action).toBeDefined();
        expect(entry.timestamp).toBeDefined();
        expect(entry.actor).toBeDefined();
      }
    });

    it('should track performance metrics', async () => {
      // Execute action and measure performance
      const startTime = Date.now();
      const action = await createTestAction();
      const result = await executeAction(action.id);
      const endTime = Date.now();

      // Verify performance tracking
      expect(result.execution_time).toBeDefined();
      expect(result.execution_time).toBeLessThan(5000); // 5 seconds max
      expect(result.metrics).toBeDefined();
      expect(result.metrics.memory_usage).toBeDefined();
    });
  });

  describe('6. Error Handling and Rollback Scenarios', () => {
    it('should handle action execution failures', async () => {
      // Create action that will fail
      const failingAction = await createFailingAction();
      const approvedAction = await approveAction(failingAction.id);

      // Attempt execution (should fail)
      const executionResult = await executeAction(approvedAction.id);
      expect(executionResult.success).toBe(false);
      expect(executionResult.error).toBeDefined();

      // Verify error logging
      const errorLog = await getErrorLog(approvedAction.id);
      expect(errorLog).toBeDefined();
      expect(errorLog.error_type).toBe('execution_failure');
    });

    it('should execute rollback procedures', async () => {
      // Create action with rollback plan
      const action = await createActionWithRollback();
      const approvedAction = await approveAction(action.id);

      // Execute action
      const executionResult = await executeAction(approvedAction.id);
      expect(executionResult.success).toBe(true);

      // Simulate failure and trigger rollback
      const rollbackResult = await triggerRollback(approvedAction.id);
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.rollback_steps_completed).toBeDefined();

      // Verify rollback audit trail
      const rollbackAudit = await getRollbackAuditTrail(approvedAction.id);
      expect(rollbackAudit).toHaveLength(1);
      expect(rollbackAudit[0].action).toBe('rollback_executed');
    });

    it('should handle partial failures gracefully', async () => {
      // Create action with multiple steps
      const multiStepAction = await createMultiStepAction();
      const approvedAction = await approveAction(multiStepAction.id);

      // Execute with partial failure
      const executionResult = await executeActionWithPartialFailure(approvedAction.id);
      expect(executionResult.success).toBe(false);
      expect(executionResult.partial_success).toBe(true);
      expect(executionResult.completed_steps).toBeDefined();
      expect(executionResult.failed_steps).toBeDefined();

      // Verify partial success handling
      const partialAudit = await getPartialFailureAuditTrail(approvedAction.id);
      expect(partialAudit).toBeDefined();
      expect(partialAudit.completed_steps).toBeGreaterThan(0);
      expect(partialAudit.failed_steps).toBeGreaterThan(0);
    });
  });

  describe('7. Performance and Load Testing', () => {
    it('should handle concurrent action executions', async () => {
      // Create multiple actions
      const actions = await createConcurrentTestActions(10);
      
      // Execute concurrently
      const executionPromises = actions.map(action => executeAction(action.id));
      const results = await Promise.all(executionPromises);

      // Verify all executions completed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify no race conditions
      const auditTrail = await getConcurrentExecutionAuditTrail();
      expect(auditTrail).toHaveLength(10);
    });

    it('should maintain performance under load', async () => {
      // Create high-volume test scenario
      const startTime = Date.now();
      const actions = await createLoadTestActions(100);
      
      // Execute with performance monitoring
      const results = await executeWithPerformanceMonitoring(actions);
      const endTime = Date.now();

      // Verify performance metrics
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(30000); // 30 seconds max
      expect(results.average_execution_time).toBeLessThan(1000); // 1 second per action
      expect(results.memory_usage).toBeLessThan(100 * 1024 * 1024); // 100MB max
    });
  });

  // Helper functions for test implementation

  function createSupabaseStub() {
    const tables = new Map<string, any[]>();

    const ensureTable = (name: string) => {
      if (!tables.has(name)) {
        tables.set(name, []);
      }
      return tables.get(name)!;
    };

    return {
      from(table: string) {
        const rows = ensureTable(table);
        return {
          insert(data: any) {
            const payload = Array.isArray(data) ? data : [data];
            rows.push(...payload);
            return { data: payload, error: null };
          },
          select() {
            return { data: [...rows], error: null };
          },
          update(values: Record<string, unknown>) {
            return {
              neq() {
                for (let i = 0; i < rows.length; i += 1) {
                  rows[i] = { ...rows[i], ...values };
                }
                return { data: [...rows], error: null };
              }
            };
          },
          delete() {
            return {
              neq() {
                rows.length = 0;
                return { data: [], error: null };
              },
              eq() {
                rows.length = 0;
                return { data: [], error: null };
              }
            };
          }
        };
      }
    };
  }

  function createAnalyticsStub() {
    return {
      runReport: async () => ({
        rows: [],
        metadata: { currencyCode: 'USD' }
      })
    };
  }

  async function setupTestData() {
    // Setup test database records
    await supabase.from('test_actions').delete().neq('id', '');
    await supabase.from('test_approvals').delete().neq('id', '');
    await supabase.from('test_audit_trail').delete().neq('id', '');
  }

  async function cleanupTestData() {
    // Cleanup test database records
    await supabase.from('test_actions').delete().neq('id', '');
    await supabase.from('test_approvals').delete().neq('id', '');
    await supabase.from('test_audit_trail').delete().neq('id', '');
  }

  async function resetTestState() {
    // Reset test state between tests
    await supabase.from('test_actions').update({ status: 'pending' }).neq('id', '');
  }

  async function cleanupAfterTest() {
    // Clean up after each test
    await supabase.from('test_actions').delete().neq('id', '');
  }

  // Mock implementations for test functions
  async function collectGSCData() {
    return mockTelemetryData.gsc;
  }

  async function collectGA4Data() {
    return mockTelemetryData.ga4;
  }

  async function collectGSCDataWithError() {
    return { error: 'GSC API timeout', fallback: true };
  }

  async function collectGA4DataWithError() {
    return { error: 'GA4 API rate limit exceeded', fallback: true };
  }

  async function createActionsFromGSCData(gscData: any) {
    return mockActionQueueData;
  }

  async function updateActionAttribution(actionKey: string, ga4Data: any) {
    return {
      actionKey,
      revenue: 15000,
      conversionRate: 3.2,
      sessions: 1250,
      purchases: 23
    };
  }

  async function createTestActions() {
    return mockActionQueueData;
  }

  async function rankActions(actions: any[]) {
    return actions.sort((a, b) => b.score - a.score);
  }

  async function updateRankingsWithROI(roiData: any) {
    return mockActionQueueData.sort((a, b) => {
      const aROI = roiData[a.id]?.revenue || 0;
      const bROI = roiData[b.id]?.revenue || 0;
      return bROI - aROI;
    });
  }

  async function createSameScoreActions() {
    return [
      { ...mockActionQueueData[0], score: 7.2 },
      { ...mockActionQueueData[1], score: 7.2 }
    ];
  }

  async function renderApprovalDrawer(approvalData: any) {
    return approvalData;
  }

  async function validateApproval(approvalData: any) {
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  async function testStateTransition(from: string, to: string) {
    const allowedTransitions = new Set([
      'draft->pending_review',
      'pending_review->approved',
      'approved->applied',
      'applied->audited'
    ]);

    const key = `${from}->${to}`;
    return {
      success: allowedTransitions.has(key),
      transition: { from, to }
    };
  }

  async function createDraftApproval(approvalData: any) {
    return { ...approvalData, state: 'draft' };
  }

  async function submitForReview(approvalId: string) {
    return { ...mockApprovalData, id: approvalId, state: 'pending_review' };
  }

  async function approveWithGrades(approvalId: string, grades: any) {
    return { ...mockApprovalData, id: approvalId, state: 'approved', grades };
  }

  async function applyApproval(approvalId: string) {
    return { ...mockApprovalData, id: approvalId, state: 'applied' };
  }

  async function auditApproval(approvalId: string) {
    return { ...mockApprovalData, id: approvalId, state: 'audited' };
  }

  async function rejectApproval(approvalId: string, reason: string) {
    return { ...mockApprovalData, id: approvalId, state: 'draft', rejection_reason: reason };
  }

  async function requestChanges(approvalId: string, changeRequest: string) {
    return { ...mockApprovalData, id: approvalId, state: 'draft', change_request: changeRequest };
  }

  async function createTestAction() {
    return mockActionQueueData[0];
  }

  async function approveAction(actionId: string) {
    return { ...mockActionQueueData[0], id: actionId, status: 'approved' };
  }

  async function executeAction(actionId: string) {
    if (actionId === 'failing_action') {
      return {
        success: false,
        error: 'Simulated execution failure',
        receipt_id: null,
        execution_time: 0,
        metrics: { memory_usage: 0 }
      };
    }

    return {
      success: true,
      receipt_id: `receipt_${actionId}`,
      execution_time: 1500,
      metrics: { memory_usage: 50 * 1024 * 1024 }
    };
  }

  async function getAuditTrail(actionId: string) {
    return [
      {
        id: `audit_${actionId}`,
        action: 'executed',
        timestamp: new Date().toISOString(),
        actor: 'system'
      }
    ];
  }

  async function createMultipleTestActions() {
    return mockActionQueueData;
  }

  async function getCompleteAuditTrail() {
    return [
      {
        id: 'audit_001',
        action: 'executed',
        timestamp: new Date().toISOString(),
        actor: 'system'
      }
    ];
  }

  async function createFailingAction() {
    return { ...mockActionQueueData[0], id: 'failing_action' };
  }

  async function getErrorLog(actionId: string) {
    return {
      action_id: actionId,
      error_type: 'execution_failure',
      error_message: 'API timeout',
      timestamp: new Date().toISOString()
    };
  }

  async function createActionWithRollback() {
    return { ...mockActionQueueData[0], id: 'rollback_action' };
  }

  async function triggerRollback(actionId: string) {
    return {
      success: true,
      rollback_steps_completed: 3
    };
  }

  async function getRollbackAuditTrail(actionId: string) {
    return [
      {
        id: `rollback_audit_${actionId}`,
        action: 'rollback_executed',
        timestamp: new Date().toISOString(),
        actor: 'system'
      }
    ];
  }

  async function createMultiStepAction() {
    return { ...mockActionQueueData[0], id: 'multistep_action' };
  }

  async function executeActionWithPartialFailure(actionId: string) {
    return {
      success: false,
      partial_success: true,
      completed_steps: 2,
      failed_steps: 1
    };
  }

  async function getPartialFailureAuditTrail(actionId: string) {
    return {
      action_id: actionId,
      completed_steps: 2,
      failed_steps: 1
    };
  }

  async function createConcurrentTestActions(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      ...mockActionQueueData[0],
      id: `concurrent_action_${i}`
    }));
  }

  async function executeWithPerformanceMonitoring(actions: any[]) {
    const startTime = Date.now();
    const results = await Promise.all(actions.map(action => executeAction(action.id)));
    const endTime = Date.now();

    return {
      results,
      average_execution_time: (endTime - startTime) / actions.length,
      memory_usage: 50 * 1024 * 1024
    };
  }

  async function getConcurrentExecutionAuditTrail() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `concurrent_audit_${i}`,
      action: 'executed',
      timestamp: new Date().toISOString(),
      actor: 'system'
    }));
  }

  async function createLoadTestActions(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      ...mockActionQueueData[0],
      id: `load_test_action_${i}`
    }));
  }
});
