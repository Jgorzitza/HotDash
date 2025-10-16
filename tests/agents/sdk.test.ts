/**
 * SDK Tests
 * 
 * Tests for OpenAI Agents SDK initialization and HITL enforcement.
 */

import { describe, it, expect } from 'vitest';
import { getAgentConfig, verifyHITLEnforcement, createAgent } from '../../app/agents/sdk/index';

describe('Agent Configuration', () => {
  it('should load ai-customer config', () => {
    const config = getAgentConfig('ai-customer');
    
    expect(config).toBeDefined();
    expect(config.id).toBe('ai-customer');
    expect(config.human_review).toBe(true);
    expect(config.reviewers).toBeDefined();
    expect(config.reviewers!.length).toBeGreaterThan(0);
  });

  it('should throw error for nonexistent agent', () => {
    expect(() => getAgentConfig('nonexistent')).toThrow();
  });
});

describe('HITL Enforcement', () => {
  it('should verify HITL for ai-customer', () => {
    expect(() => verifyHITLEnforcement('ai-customer')).not.toThrow();
  });

  it('should verify HITL for engineer (no review required)', () => {
    expect(() => verifyHITLEnforcement('engineer')).not.toThrow();
  });

  it('should throw for nonexistent agent', () => {
    expect(() => verifyHITLEnforcement('nonexistent')).toThrow();
  });
});

describe('Agent Creation', () => {
  it('should create ai-customer agent', () => {
    const agent = createAgent('ai-customer', {
      instructions: 'You are a test agent.',
      tools: [],
    });
    
    expect(agent).toBeDefined();
    expect(agent.name).toBeTruthy();
  });

  it('should create engineer agent', () => {
    const agent = createAgent('engineer', {
      instructions: 'You are a test agent.',
      tools: [],
    });
    
    expect(agent).toBeDefined();
  });
});

