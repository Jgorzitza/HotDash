import { describe, it, expect, vi } from 'vitest';

// Mock global fetch
const originalFetch = global.fetch;

function mockFetchOnce(status: number, json: any) {
  // @ts-expect-error node18 typings
  global.fetch = vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => json }));
}

function resetFetch() {
  // @ts-expect-error node18 typings
  global.fetch = originalFetch;
}

import { mcpQuery, mcpContext, mcpRelatedArticles } from '../../app/agents/tools/llamaindex';

describe('LlamaIndex MCP client', () => {
  it('returns parsed JSON on 200 OK', async () => {
    mockFetchOnce(200, { data: [{ id: 1 }] });
    const r = await mcpQuery('hello');
    expect(r).toEqual({ data: [{ id: 1 }] });
    resetFetch();
  });

  it('gracefully returns error object on HTTP error', async () => {
    mockFetchOnce(500, { error: 'boom' });
    const r = await mcpContext('q');
    expect(r).toHaveProperty('error');
    resetFetch();
  });

  it('supports relatedArticles endpoint', async () => {
    mockFetchOnce(200, { related: ["a", "b"] });
    const r = await mcpRelatedArticles('q');
    expect(r).toEqual({ related: ["a", "b"] });
    resetFetch();
  });
});

