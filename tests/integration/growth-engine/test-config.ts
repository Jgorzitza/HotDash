/**
 * Growth Engine Integration Test Configuration
 * 
 * Configuration and utilities for Growth Engine integration tests
 */

export const TEST_CONFIG = {
  // Test database configuration
  database: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    testSchema: 'test_growth_engine'
  },

  // GA4 configuration
  ga4: {
    propertyId: '339826228',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },

  // Test data configuration
  testData: {
    shopDomain: 'test-shop.myshopify.com',
    operatorEmail: 'test-operator@example.com',
    testUserId: 'test-user-001'
  },

  // Performance thresholds
  performance: {
    maxExecutionTime: 5000, // 5 seconds
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxConcurrentExecutions: 10
  },

  // Test timeouts
  timeouts: {
    short: 5000,    // 5 seconds
    medium: 15000,  // 15 seconds
    long: 30000     // 30 seconds
  }
};

export const MOCK_DATA = {
  // Mock GSC data
  gsc: {
    queries: [
      {
        query: 'test product',
        clicks: 150,
        impressions: 2000,
        ctr: 7.5,
        position: 3.2
      },
      {
        query: 'best product',
        clicks: 89,
        impressions: 1200,
        ctr: 7.4,
        position: 4.1
      }
    ],
    pages: [
      {
        page: '/products/test-product',
        clicks: 45,
        impressions: 800,
        ctr: 5.6,
        position: 2.8
      }
    ]
  },

  // Mock GA4 data
  ga4: {
    events: [
      {
        event_name: 'page_view',
        event_count: 1250,
        total_revenue: 15000
      },
      {
        event_name: 'add_to_cart',
        event_count: 89,
        total_revenue: 8900
      },
      {
        event_name: 'purchase',
        event_count: 23,
        total_revenue: 2300
      }
    ],
    customDimensions: [
      {
        dimension_name: 'hd_action_key',
        value: 'seo_optimization_001'
      }
    ]
  },

  // Mock action queue data
  actionQueue: [
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
  ],

  // Mock approval data
  approval: {
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
  }
};

export const TEST_UTILITIES = {
  // Create test database connection
  async createTestConnection() {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(TEST_CONFIG.database.url!, TEST_CONFIG.database.anonKey!);
  },

  // Setup test data
  async setupTestData(supabase: any) {
    // Clear existing test data
    await supabase.from('test_actions').delete().neq('id', '');
    await supabase.from('test_approvals').delete().neq('id', '');
    await supabase.from('test_audit_trail').delete().neq('id', '');

    // Insert mock data
    await supabase.from('test_actions').insert(MOCK_DATA.actionQueue);
    await supabase.from('test_approvals').insert([MOCK_DATA.approval]);
  },

  // Cleanup test data
  async cleanupTestData(supabase: any) {
    await supabase.from('test_actions').delete().neq('id', '');
    await supabase.from('test_approvals').delete().neq('id', '');
    await supabase.from('test_audit_trail').delete().neq('id', '');
  },

  // Generate test ID
  generateTestId(prefix: string = 'test'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Wait for async operation
  async waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Measure execution time
  async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now();
    const result = await fn();
    const executionTime = Date.now() - startTime;
    return { result, executionTime };
  },

  // Create mock API responses
  createMockResponse(data: any, status: number = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data
    };
  },

  // Create mock error response
  createMockErrorResponse(message: string, status: number = 500) {
    return {
      ok: false,
      status,
      json: async () => ({ error: message })
    };
  }
};

export const TEST_ASSERTIONS = {
  // Assert performance metrics
  assertPerformance(metrics: any) {
    expect(metrics.executionTime).toBeLessThan(TEST_CONFIG.performance.maxExecutionTime);
    expect(metrics.memoryUsage).toBeLessThan(TEST_CONFIG.performance.maxMemoryUsage);
  },

  // Assert data consistency
  assertDataConsistency(data: any) {
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.created_at).toBeDefined();
    expect(data.updated_at).toBeDefined();
  },

  // Assert approval state
  assertApprovalState(approval: any, expectedState: string) {
    expect(approval.state).toBe(expectedState);
    expect(approval.id).toBeDefined();
    expect(approval.updated_at).toBeDefined();
  },

  // Assert action execution
  assertActionExecution(result: any) {
    expect(result.success).toBe(true);
    expect(result.receipt_id).toBeDefined();
    expect(result.execution_time).toBeGreaterThan(0);
  }
};
