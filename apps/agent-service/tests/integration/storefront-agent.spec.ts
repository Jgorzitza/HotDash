/**
 * Minimal integration checks for the Storefront agent wiring.
 *
 * Confirms the triage agent advertises the storefront handoff and that
 * the storefront agent exposes the expected tool names.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

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

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));

let triageAgent: any;
let storefrontAgent: any;

beforeAll(async () => {
  process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'anon-key';

  const agents = await import(new URL('../../src/agents/index.ts', import.meta.url).href);
  triageAgent = agents.triageAgent;
  storefrontAgent = agents.storefrontAgent;
});

describe('Storefront agent wiring', () => {
  it('routes catalog questions to Storefront Support', () => {
    const handoffNames = triageAgent.handoffs.map((agent: any) => agent.name);
    expect(handoffNames).toContain('Storefront Support');
    expect(triageAgent.instructions).toContain('Catalog discovery');
    expect(triageAgent.instructions).toContain('Storefront Support');
  });

  it('exposes storefront-specific tools', () => {
    const toolNames = storefrontAgent.tools.map((tool: any) => tool.name);
    expect(toolNames).toEqual(
      expect.arrayContaining([
        'storefront_search_products',
        'storefront_check_availability',
        'storefront_query_policy',
        'storefront_browse_collections',
        'chatwoot_create_private_note',
        'chatwoot_send_public_reply',
      ]),
    );
  });
});
