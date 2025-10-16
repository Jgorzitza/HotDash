import { describe, it, expect, vi } from 'vitest';

// Mock @openai/agents to avoid zod responses/tool parsing at import time
vi.mock('@openai/agents', () => ({
  tool: vi.fn(() => ({ name: 'mock_tool' })),
  Agent: class MockAgent {},
  run: vi.fn(async () => ({ finalOutput: 'ok' })),
}));

// Mock SDK createApprovalRequest to avoid real Supabase
vi.mock('../../app/agents/sdk/index', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    createApprovalRequest: vi.fn(async (req: any) => ({
      ...req,
      id: 'approval_test_1',
      createdAt: new Date().toISOString(),
      status: 'pending',
    })),
  };
});

import { requestApprovalForDraft } from '../../app/agents/customer/index';

describe('Customer workflow helper', () => {
  it('requests approval for draft and returns approval object', async () => {
    const approval = await requestApprovalForDraft('conv_123', 'Draft reply text');
    expect(approval).toBeTruthy();
    expect(approval.id).toBe('approval_test_1');
    expect(approval.agentId).toBe('ai-customer');
    expect(approval.conversationId).toBe('conv_123');
    expect(approval.draftContent).toBe('Draft reply text');
  });
});

