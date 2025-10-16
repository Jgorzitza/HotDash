import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @openai/agents used by SDK
vi.mock('@openai/agents', () => {
  class MockAgent {
    name: string;
    constructor(opts: { name: string }) {
      this.name = opts.name;
    }
  }

  // sdkRun mock that can be configured per-test
  const state = {
    delayMs: 10,
    resolveValue: { finalOutput: 'ok' },
  };

  const run = vi.fn(async (_agent: any, _input: string) => {
    await new Promise((r) => setTimeout(r, state.delayMs));
    return state.resolveValue;
  });

  // helpers to tweak behavior in tests
  // @ts-expect-error attach for tests
  run.__setDelay = (ms: number) => (state.delayMs = ms);
  // @ts-expect-error attach for tests
  run.__setResolveValue = (val: any) => (state.resolveValue = val);

  return { Agent: MockAgent, run };
});

// Import after mocks
import { run as sdkRun, createAgent } from '../../app/agents/sdk/index';

describe('SDK run() wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs successfully within timeout', async () => {
    // Create a mock agent via SDK
    const agent = createAgent('ai-customer', {
      instructions: 'test',
      tools: [],
      model: 'gpt-4o-mini',
    });

    // @ts-expect-error test helper attached in mock
    const openai = await import('@openai/agents');
    // Ensure delay is small
    // @ts-expect-error test helper
    openai.run.__setDelay(20);

    const result = await sdkRun(agent as any, 'hello', { timeoutMs: 200 });
    expect(result).toBeTruthy();
    expect(result.finalOutput).toBeDefined();
  });

  it('times out when run exceeds timeout', async () => {
    const agent = createAgent('ai-customer', {
      instructions: 'test',
      tools: [],
    });

    const openai = await import('@openai/agents');
    // @ts-expect-error test helper
    openai.run.__setDelay(300);

    await expect(sdkRun(agent as any, 'slow', { timeoutMs: 50 })).rejects.toThrow(
      /timed out/i,
    );
  });
});

