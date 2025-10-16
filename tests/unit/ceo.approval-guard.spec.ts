import { describe, it, expect, vi } from 'vitest';

// Mock @openai/agents: tool returns input object so we can call .execute
vi.mock('@openai/agents', () => ({
  tool: (def: any) => def,
  Agent: class MockAgent {},
  run: vi.fn(async () => ({})),
}));

// Mock SDK verification
vi.mock('../../app/agents/sdk/index', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    isApprovalApproved: vi.fn(async (id: string) => id === 'approved_ceo'),
    logStructured: vi.fn(),
  };
});

import { generatePurchaseOrderTool } from '../../app/agents/ceo/index';

describe('CEO generate purchase order tool - approval guard', () => {
  it('throws when approval is not approved', async () => {
    await expect(
      generatePurchaseOrderTool.execute({ products: [{ productId: 'p1', quantity: 10 }], approvalId: 'nope' })
    ).rejects.toThrow(/Approval not granted/i);
  });

  it('succeeds when approval is approved', async () => {
    const res = await generatePurchaseOrderTool.execute({ products: [{ productId: 'p1', quantity: 10 }], approvalId: 'approved_ceo' });
    expect(res).toEqual(expect.objectContaining({ success: true }));
  });
});

