/**
 * Integration tests for Storefront agent wiring.
 *
 * Validates that the triage agent hands off Storefront queries to the
 * Storefront sub-agent and that Storefront tools delegate to
 * StorefrontSubAgent service methods.
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
let storefrontAgent: any;
let StorefrontSubAgent: any;

beforeAll(async () => {
  process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'anon-key';
  process.env.STOREFRONT_MCP_ENABLED = process.env.STOREFRONT_MCP_ENABLED ?? 'false';

  const agents = await import(new URL('../../src/agents/index.ts', import.meta.url).href);
  triageAgent = agents.triageAgent;
  storefrontAgent = agents.storefrontAgent;

  ({ StorefrontSubAgent } = await import(
    new URL('../../../../app/services/ai-customer/storefront-sub-agent.service.js', import.meta.url).href
  ));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Storefront agent integration', () => {
  it('includes Storefront Support in the triage handoff chain', () => {
    const handoffNames = triageAgent.handoffs.map((agent: any) => agent.name);
    expect(handoffNames).toContain('Storefront Support');

    const routingCopy = triageAgent.instructions;
    expect(routingCopy).toContain('Catalog discovery');
    expect(routingCopy).toContain('Storefront Support');
  });

  it('delegates product search tool to StorefrontSubAgent', async () => {
    const tool = storefrontAgent.tools.find((item: any) => item.name === 'storefront_search_products');
    expect(tool).toBeDefined();

    const mockResults = {
      products: [{ id: 'prod-1', title: 'Brake Pads', available: true }],
      collections: [],
      filters: [],
    };

    const spy = vi
      .spyOn(StorefrontSubAgent.prototype, 'searchProducts')
      .mockResolvedValue(mockResults as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      query: 'brake pads',
      limit: 5,
    });

    expect(spy).toHaveBeenCalledWith('cust-1', 'brake pads', undefined, undefined, 5);
    expect(response.success).toBe(true);
    expect(response.results).toEqual(mockResults);
  });

  it('delegates availability tool to StorefrontSubAgent', async () => {
    const tool = storefrontAgent.tools.find((item: any) => item.name === 'storefront_check_availability');
    expect(tool).toBeDefined();

    const availability = {
      productId: 'prod-1',
      variantId: 'var-1',
      available: true,
      quantity: 8,
    };

    const spy = vi
      .spyOn(StorefrontSubAgent.prototype, 'checkAvailability')
      .mockResolvedValue(availability as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      productId: 'prod-1',
      variantId: 'var-1',
      location: 'warehouse-1',
    });

    expect(spy).toHaveBeenCalledWith('cust-1', 'prod-1', 'var-1', 'warehouse-1');
    expect(response.success).toBe(true);
    expect(response.availability).toEqual(availability);
  });

  it('delegates policy query tool to StorefrontSubAgent', async () => {
    const tool = storefrontAgent.tools.find((item: any) => item.name === 'storefront_query_policy');
    expect(tool).toBeDefined();

    const policy = {
      policyType: 'return',
      content: 'Returns accepted within 30 days.',
      lastUpdated: '2025-01-01',
      applicable: true,
    };

    const spy = vi.spyOn(StorefrontSubAgent.prototype, 'queryPolicy').mockResolvedValue(policy as any);

    const response = await tool.execute({
      customerId: 'cust-1',
      policyType: 'return',
    });

    expect(spy).toHaveBeenCalledWith('cust-1', 'return');
    expect(response.success).toBe(true);
    expect(response.policy).toEqual(policy);
  });
});
