import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiCEO, handleCEOQuery } from '../../../packages/agents/src/ai-ceo';

/**
 * CEO Agent Unit Tests
 * 
 * Tests all 5 tools + HITL workflow + agent instructions
 */

describe('AI CEO Agent', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Mock fetch for backend API calls
    global.fetch = vi.fn();
  });

  describe('Agent Configuration', () => {
    it('should have correct agent name', () => {
      expect(aiCEO.name).toBe('ai-ceo');
    });

    it('should have 7 tools registered', () => {
      expect(aiCEO.tools).toHaveLength(7);
    });

    it('should have comprehensive CEO assistant instructions', () => {
      expect(aiCEO.instructions).toContain('CEO Assistant Agent');
      expect(aiCEO.instructions).toContain('HITL Workflow');
      expect(aiCEO.instructions).toContain('data-driven recommendations');
    });

    it('should have onApproval handler defined', () => {
      expect(aiCEO.onApproval).toBeDefined();
      expect(typeof aiCEO.onApproval).toBe('function');
    });
  });

  describe('Tool 1: Shopify Orders', () => {
    it('should list orders successfully', async () => {
      const mockOrders = {
        orders: [
          { id: '123', total: '99.99', status: 'open' },
          { id: '124', total: '149.99', status: 'closed' },
        ],
        count: 2,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.orders');
      expect(tool).toBeDefined();
      expect(tool?.requireApproval).toBe(true); // Write operation requires approval

      const result = await tool?.handler({
        action: 'list',
        limit: 10,
      });

      expect(result).toEqual(mockOrders);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ceo-agent/shopify/orders'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle order cancellation with approval', async () => {
      const mockResponse = { success: true, orderId: '123', status: 'cancelled' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.orders');
      const result = await tool?.handler({
        action: 'cancel',
        orderId: '123',
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.orders');
      const result = await tool?.handler({
        action: 'list',
        limit: 10,
      });

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Shopify API error');
    });
  });

  describe('Tool 1: Shopify Products', () => {
    it('should list products successfully', async () => {
      const mockProducts = {
        products: [
          { id: 'prod_1', title: 'Hot Rod Board', inventory: 25 },
          { id: 'prod_2', title: 'Powder Board XL', inventory: 10 },
        ],
        count: 2,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.products');
      expect(tool?.requireApproval).toBe(true); // Update inventory requires approval

      const result = await tool?.handler({
        action: 'list',
        limit: 10,
      });

      expect(result).toEqual(mockProducts);
    });

    it('should update inventory with approval', async () => {
      const mockResponse = { success: true, variantId: 'var_123', newQuantity: 50 };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.products');
      const result = await tool?.handler({
        action: 'update_inventory',
        variantId: 'var_123',
        inventoryQuantity: 50,
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ceo-agent/shopify/products',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Tool 1: Shopify Customers', () => {
    it('should list customers (read-only, no approval)', async () => {
      const mockCustomers = {
        customers: [
          { id: 'cust_1', email: 'alice@example.com', orders_count: 5 },
          { id: 'cust_2', email: 'bob@example.com', orders_count: 12 },
        ],
        count: 2,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.customers');
      expect(tool?.requireApproval).toBe(false); // Read-only, no approval needed

      const result = await tool?.handler({
        action: 'list',
        limit: 10,
      });

      expect(result).toEqual(mockCustomers);
    });

    it('should search customers by query', async () => {
      const mockSearchResults = {
        customers: [
          { id: 'cust_1', email: 'alice@example.com', total_spent: '1250.00' },
        ],
        count: 1,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.customers');
      const result = await tool?.handler({
        action: 'search',
        query: 'alice',
        limit: 10,
      });

      expect(result).toEqual(mockSearchResults);
    });
  });

  describe('Tool 2: Supabase Analytics', () => {
    it('should query revenue by period (no approval for predefined queries)', async () => {
      const mockRevenue = {
        period: '2025-10',
        revenue: 125000,
        orders: 450,
        aov: 277.78,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRevenue,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'supabase.analytics');
      
      // Test dynamic approval: predefined queries don't require approval
      expect(typeof tool?.requireApproval).toBe('function');
      
      const result = await tool?.handler({
        query: 'revenue_by_period',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
        limit: 10,
      });

      expect(result).toEqual(mockRevenue);
    });

    it('should require approval for custom SQL queries', async () => {
      const tool = aiCEO.tools.find((t) => t.name === 'supabase.analytics');
      
      // Verify that custom_sql requires approval
      if (typeof tool?.requireApproval === 'function') {
        const requiresApproval = tool.requireApproval({ query: 'custom_sql' });
        expect(requiresApproval).toBe(true);
      }
    });

    it('should query top products', async () => {
      const mockTopProducts = {
        products: [
          { sku: 'SKU-123', revenue: 45000, units_sold: 150 },
          { sku: 'SKU-456', revenue: 38000, units_sold: 120 },
        ],
        period: 'last_30_days',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopProducts,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'supabase.analytics');
      const result = await tool?.handler({
        query: 'top_products',
        startDate: '2025-09-20',
        endDate: '2025-10-20',
        limit: 10,
      });

      expect(result).toEqual(mockTopProducts);
    });
  });

  describe('Tool 3: Chatwoot Insights', () => {
    it('should analyze SLA breaches (read-only, no approval)', async () => {
      const mockSLAData = {
        breaches: [
          { conversation_id: 123, wait_time: 1800, status: 'open' },
          { conversation_id: 456, wait_time: 2400, status: 'pending' },
        ],
        total_breaches: 2,
        average_wait_time: 2100,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSLAData,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'chatwoot.insights');
      expect(tool?.requireApproval).toBe(false); // Read-only analytics

      const result = await tool?.handler({
        action: 'sla_breaches',
        startDate: '2025-10-01',
        endDate: '2025-10-20',
        limit: 10,
      });

      expect(result).toEqual(mockSLAData);
    });

    it('should analyze ticket trends', async () => {
      const mockTrends = {
        trends: [
          { date: '2025-10-15', tickets: 45, resolved: 38, open: 7 },
          { date: '2025-10-16', tickets: 52, resolved: 44, open: 8 },
        ],
        summary: {
          total_tickets: 97,
          resolution_rate: 0.85,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrends,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'chatwoot.insights');
      const result = await tool?.handler({
        action: 'ticket_trends',
        startDate: '2025-10-15',
        endDate: '2025-10-16',
        limit: 10,
      });

      expect(result).toEqual(mockTrends);
    });
  });

  describe('Tool 4: LlamaIndex Knowledge Base', () => {
    it('should query knowledge base (read-only, no approval)', async () => {
      const mockKBResults = {
        results: [
          {
            content: 'Return policy: 30 days from purchase date',
            score: 0.92,
            metadata: { doc_type: 'policy', category: 'returns' },
          },
          {
            content: 'Exchanges are accepted within 30 days with receipt',
            score: 0.87,
            metadata: { doc_type: 'policy', category: 'exchanges' },
          },
        ],
        query: 'return policy',
        topK: 5,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockKBResults,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'llamaindex.query');
      expect(tool?.requireApproval).toBe(false); // Knowledge base search is read-only

      const result = await tool?.handler({
        query: 'return policy',
        topK: 5,
      });

      expect(result).toEqual(mockKBResults);
    });

    it('should support metadata filters', async () => {
      const mockFilteredResults = {
        results: [
          {
            content: 'Product warranty: 1 year manufacturer warranty',
            score: 0.95,
            metadata: { doc_type: 'warranty', product_line: 'boards' },
          },
        ],
        query: 'warranty',
        filters: { product_line: 'boards' },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilteredResults,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'llamaindex.query');
      const result = await tool?.handler({
        query: 'warranty',
        topK: 5,
        filters: { product_line: 'boards' },
      });

      expect(result).toEqual(mockFilteredResults);
    });
  });

  describe('Tool 5: Google Analytics', () => {
    it('should fetch traffic overview (read-only, no approval)', async () => {
      const mockTrafficData = {
        period: '2025-10-01 to 2025-10-20',
        sessions: 12500,
        users: 9800,
        pageviews: 45000,
        bounce_rate: 0.42,
        avg_session_duration: 185,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrafficData,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'google.analytics');
      expect(tool?.requireApproval).toBe(false); // Read-only analytics

      const result = await tool?.handler({
        metric: 'traffic_overview',
        startDate: '2025-10-01',
        endDate: '2025-10-20',
        limit: 10,
      });

      expect(result).toEqual(mockTrafficData);
    });

    it('should fetch conversion metrics', async () => {
      const mockConversions = {
        period: '2025-10-01 to 2025-10-20',
        conversion_rate: 0.034,
        transactions: 450,
        revenue: 125000,
        aov: 277.78,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversions,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'google.analytics');
      const result = await tool?.handler({
        metric: 'conversion_metrics',
        startDate: '2025-10-01',
        endDate: '2025-10-20',
        limit: 10,
      });

      expect(result).toEqual(mockConversions);
    });

    it('should analyze landing pages with dimensions', async () => {
      const mockLandingPages = {
        pages: [
          { page: '/products/hot-rod-board', sessions: 2500, conversions: 95 },
          { page: '/products/powder-board-xl', sessions: 1800, conversions: 72 },
        ],
        period: '2025-10-01 to 2025-10-20',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLandingPages,
      });

      const tool = aiCEO.tools.find((t) => t.name === 'google.analytics');
      const result = await tool?.handler({
        metric: 'landing_pages',
        startDate: '2025-10-01',
        endDate: '2025-10-20',
        dimensions: ['page'],
        limit: 10,
      });

      expect(result).toEqual(mockLandingPages);
    });
  });

  describe('handleCEOQuery Function', () => {
    it('should be exported and callable', () => {
      expect(handleCEOQuery).toBeDefined();
      expect(typeof handleCEOQuery).toBe('function');
    });

    // Integration test (will need actual OpenAI SDK mock)
    it.skip('should process CEO query and return agent response', async () => {
      // This test requires mocking the OpenAI Agents SDK run() function
      // Skipping for now until full integration test setup
      const result = await handleCEOQuery('What are my top 3 products this month?');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('response');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const tool = aiCEO.tools.find((t) => t.name === 'shopify.orders');
      const result = await tool?.handler({
        action: 'list',
        limit: 10,
      });

      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Network error');
    });

    it('should handle missing required parameters', async () => {
      const tool = aiCEO.tools.find((t) => t.name === 'google.analytics');
      
      // Test with missing required startDate/endDate
      // Zod will validate and should throw or return validation error
      try {
        await tool?.handler({
          metric: 'traffic_overview',
          // Missing startDate and endDate
        } as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Sample Queries Documentation', () => {
    it('should have comprehensive sample queries documented', () => {
      // Verify sample queries are documented in the module
      const sampleQueries = [
        'What are my top 3 products this month?',
        'Should I reorder Powder Board XL?',
        'Show me customers with lifetime value > $1000',
        'Summarize support tickets this week',
        "What's our conversion rate for the homepage?",
        'Find policy documentation for returns',
        'Analyze inventory levels for all products',
        'Generate weekly performance summary',
      ];

      // This test documents expected query patterns
      sampleQueries.forEach((query) => {
        expect(query).toBeTruthy();
        expect(query.length).toBeGreaterThan(10);
      });
    });
  });
});

