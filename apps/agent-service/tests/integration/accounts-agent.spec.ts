/**
 * Integration tests for Customer Accounts agent wiring.
 *
 * Ensures the triage agent hands off account-related requests to the
 * customer accounts specialist and that tools delegate into the
 * AccountsSubAgent service.
 */

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';

vi.mock('@openai/agents', () => {
  return {
    Agent: class {
      name: string;
      instructions: string;
      tools: any[];
      handoffs?: any[];
      constructor(config: any) {
        Object.assign(this, config);
      }
    },
    tool: (config: any) => config,
    setDefaultOpenAIKey: vi.fn(),
    run: vi.fn(),
  };
});

const mockAccountsService = {
  getCustomerOrders: vi.fn(),
  getOrderDetails: vi.fn(),
  getAccountInfo: vi.fn(),
  updatePreferences: vi.fn(),
  getMetrics: vi.fn(),
};
const AccountsSubAgentMock = vi.fn(function AccountsSubAgentMock() {
  return mockAccountsService;
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));

vi.mock('../../../../app/services/ai-customer/accounts-sub-agent.service.js', () => ({
  AccountsSubAgent: AccountsSubAgentMock,
}));

let triageAgent: any;
let customerAccountsAgent: any;

beforeAll(async () => {
  process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'anon-key';
  process.env.CUSTOMER_ACCOUNTS_MCP_ENABLED =
    process.env.CUSTOMER_ACCOUNTS_MCP_ENABLED ?? 'false';

  const agents = await import(new URL('../../src/agents/index.ts', import.meta.url).href);
  triageAgent = agents.triageAgent;
  customerAccountsAgent = agents.customerAccountsAgent;
});

afterEach(() => {
  vi.clearAllMocks();
  mockAccountsService.getCustomerOrders.mockReset();
  mockAccountsService.getOrderDetails.mockReset();
  mockAccountsService.updatePreferences.mockReset();
  AccountsSubAgentMock.mockClear();
});

describe('Customer Accounts agent integration', () => {
  it('routes account management requests to Customer Accounts agent', () => {
    const handoffNames = triageAgent.handoffs.map((agent: any) => agent.name);
    expect(handoffNames).toContain('Customer Accounts');

    const routingCopy = triageAgent.instructions;
    expect(routingCopy).toContain('Account management (authenticated customers)');
    expect(routingCopy).toContain('Customer Accounts');
  });

  it('delegates order history tool to AccountsSubAgent', async () => {
    const tool = customerAccountsAgent.tools.find(
      (item: any) => item.name === 'get_customer_orders',
    );
    expect(tool).toBeDefined();

    const orders = [{ id: 'order-1' }];
    mockAccountsService.getCustomerOrders.mockResolvedValue(orders as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      token: 'oauth-token',
      limit: 5,
    });

    expect(mockAccountsService.getCustomerOrders).toHaveBeenCalledWith('cust-1', 'oauth-token', 5);
    expect(response.success).toBe(true);
    expect(response.orders).toEqual(orders);
  });

  it('delegates order detail tool to AccountsSubAgent', async () => {
    const tool = customerAccountsAgent.tools.find(
      (item: any) => item.name === 'get_order_details',
    );
    expect(tool).toBeDefined();

    const order = { id: 'order-1' };
    mockAccountsService.getOrderDetails.mockResolvedValue(order as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      orderId: 'order-1',
      token: 'oauth-token',
    });

    expect(mockAccountsService.getOrderDetails).toHaveBeenCalledWith(
      'cust-1',
      'order-1',
      'oauth-token',
    );
    expect(response.success).toBe(true);
    expect(response.order).toEqual(order);
  });

  it('delegates preference updates to AccountsSubAgent with ABAC context', async () => {
    const tool = customerAccountsAgent.tools.find(
      (item: any) => item.name === 'update_preferences',
    );
    expect(tool).toBeDefined();

    mockAccountsService.updatePreferences.mockResolvedValue(true);

    const response = await tool.execute({
      customerId: 'cust-1',
      token: 'oauth-token',
      preferences: { marketing: true },
    });

    expect(mockAccountsService.updatePreferences).toHaveBeenCalledWith(
      'cust-1',
      'oauth-token',
      { marketing: true },
    );
    expect(response.success).toBe(true);
  });
});
