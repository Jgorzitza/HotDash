import { describe, it, expect } from 'vitest';
import { captureEditDiff } from '../../app/agents/learning/index';

describe('Learning captureEditDiff', () => {
  it('computes edit distance and type', async () => {
    const draft = 'Hello there, thanks for reaching out.';
    const final = 'Hi there, thanks for reaching out!';
    const diff = await captureEditDiff('1', 'conv1', 'ai-customer', draft, final);
    expect(diff.editDistance).toBeGreaterThanOrEqual(1);
    expect(['minor','moderate','major','complete_rewrite']).toContain(diff.editType);
  });
});

