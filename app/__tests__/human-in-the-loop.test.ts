/**
 * Human-in-the-Loop Approval Workflow Tests (TDD)
 * Growth Spec: CEO approval process
 */

import { describe, it, expect } from 'vitest';

// @ts-expect-error - TDD: OpenAI Agents SDK
import { run } from '@openai/agents';
// @ts-expect-error - TDD: Agent doesn't exist yet
import { growthAgent } from '../agents/growth-agent';

describe('Human-in-the-Loop Approval Workflow', () => {
  it('pauses execution when needsApproval: true', async () => {
    const result = await run(growthAgent, 'Generate SEO fix');

    expect(result.interruptions).toHaveLength(1);
    expect(result.interruptions[0].type).toBe('tool_approval_item');
  });

  it('tracks CEO edits for learning', async () => {
    const result = await run(growthAgent, 'Generate action');
    const state = result;

    state.approve(result.interruptions[0], {
      overrideWith: { proposedTitle: 'CEO Edited' },
    });

    // Should track the edit
    expect(state.editTracking).toBeDefined();
  });

  it('resumes execution after approval', async () => {
    let result = await run(growthAgent, 'Generate SEO fix');
    const state = result;

    state.approve(result.interruptions[0]);
    result = await run(growthAgent, state);

    expect(result.interruptions).toHaveLength(0);
  });
});

