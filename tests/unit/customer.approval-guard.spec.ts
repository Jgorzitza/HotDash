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
    isApprovalApproved: vi.fn(async (id: string) => id === 'approved_id'),
    logStructured: vi.fn(),
  };
});

import { chatwootSendPublicReplyTool } from '../../app/agents/customer/index';

describe('Chatwoot send public reply tool - approval guard', () => {
  it('throws when approval is not approved', async () => {
    await expect(
      chatwootSendPublicReplyTool.execute({ conversationId: 'c1', content: 'hi', approvalId: 'not_approved' })
    ).rejects.toThrow(/Approval not granted/i);
  });

  it('succeeds when approval is approved', async () => {
    const res = await chatwootSendPublicReplyTool.execute({ conversationId: 'c1', content: 'hi', approvalId: 'approved_id' });
    expect(res).toEqual(expect.objectContaining({ success: true }));
  });
});

