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

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  };
});

let triageAgent: any;
let customerAccountsAgent: any;
let AccountsSubAgent: any;

beforeAll(async () => {
  process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'anon-key';
  process.env.CUSTOMER_ACCOUNTS_MCP_ENABLED =
    process.env.CUSTOMER_ACCOUNTS_MCP_ENABLED ?? 'false';

  const agents = await import(new URL('../../src/agents/index.ts', import.meta.url).href);
  triageAgent = agents.triageAgent;
  customerAccountsAgent = agents.customerAccountsAgent;

  ({ AccountsSubAgent } = await import(
    new URL('../../../../app/services/ai-customer/accounts-sub-agent.service.js', import.meta.url).href
  ));
});

afterEach(() => {
  vi.restoreAllMocks();
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
    const spy = vi
      .spyOn(AccountsSubAgent.prototype, 'getCustomerOrders')
      .mockResolvedValue(orders as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      token: 'oauth-token',
      limit: 5,
    });

    expect(spy).toHaveBeenCalledWith('cust-1', 'oauth-token', 5);
    expect(response.success).toBe(true);
    expect(response.orders).toEqual(orders);
  });

  it('delegates order detail tool to AccountsSubAgent', async () => {
    const tool = customerAccountsAgent.tools.find(
      (item: any) => item.name === 'get_order_details',
    );
    expect(tool).toBeDefined();

    const order = { id: 'order-1' };
    const spy = vi
      .spyOn(AccountsSubAgent.prototype, 'getOrderDetails')
      .mockResolvedValue(order as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      orderId: 'order-1',
      token: 'oauth-token',
    });

    expect(spy).toHaveBeenCalledWith('cust-1', 'order-1', 'oauth-token');
    expect(response.success).toBe(true);
    expect(response.order).toEqual(order);
  });

  it('delegates preference updates to AccountsSubAgent with ABAC context', async () => {
    const tool = customerAccountsAgent.tools.find(
      (item: any) => item.name === 'update_preferences',
    );
    expect(tool).toBeDefined();

    const spy = vi
      .spyOn(AccountsSubAgent.prototype, 'updatePreferences')
      .mockResolvedValue(true);

    const response = await tool.execute({
      customerId: 'cust-1',
      token: 'oauth-token',
      preferences: { marketing: true },
    });

    expect(spy).toHaveBeenCalledWith('cust-1', 'oauth-token', { marketing: true });
    expect(response.success).toBe(true);
  });
});

