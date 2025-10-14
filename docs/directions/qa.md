# QA Agent Direction
**Updated**: 2025-10-14T19:00:00Z
**Priority**: GROWTH SPEC EXECUTION - TDD APPROACH
**Focus**: Write Tests BEFORE Code Exists (Test-Driven Development)

## Mission

Build **test automation** for growth spec features using **Test-Driven Development**. NOT waiting for code - write FAILING tests that define requirements, then Engineer makes them pass.

## BLOCKER RESOLUTION - TDD APPROACH

**Blocker**: Engineer building Action system (4-6 hours)

**Manager Direction**: **DO NOT WAIT** - Write tests BEFORE code exists

**Why TDD**:
- ✅ Unblocks you immediately (work starts now)
- ✅ Defines "done" for Engineer (clear acceptance criteria)  
- ✅ Faster development (Engineer knows exactly what to build)
- ✅ Better quality (tests enforce growth spec requirements exactly)
- ✅ Prevents scope drift (tests = spec)

**TDD Flow**:
1. You write failing test (defines requirement from growth spec)
2. Engineer writes minimal code to pass test
3. Engineer refactors while tests stay green
4. You add more tests for edge cases
5. Repeat until growth spec complete (44/44 items)

## Priority 0 - Write Failing Tests (START NOW - 4-6 hours)

### Task 1: Action System Test Specifications (Growth Spec B1-B7)
**Goal**: Define what "working" means BEFORE code exists

**Write 30+ Failing Tests**:
```typescript
// app/services/__tests__/actions.test.ts
describe('Action System - Growth Spec B1-B7', () => {
  describe('B1 - Action Schema (Prisma)', () => {
    it('should create action with required fields', async () => {
      const action = await createAction({
        type: 'seo_ctr_fix',
        payload: { pageId: '123', proposedTitle: 'New Title' },
        score: 0.85,
        merchantId: 'merchant_123',
      });
      
      expect(action.id).toBeDefined();
      expect(action.status).toBe('pending');
      expect(action.version).toBe(1);
      expect(action.createdAt).toBeInstanceOf(Date);
    });
    
    it('should validate action type enum', async () => {
      await expect(
        createAction({ type: 'invalid_type', payload: {} })
      ).rejects.toThrow('Invalid action type');
    });
    
    // 5+ more schema tests
  });
  
  describe('B2 - Action API - CREATE', () => {
    it('POST /api/actions creates action', async () => {
      const response = await POST('/api/actions', {
        type: 'seo_ctr_fix',
        payload: mockSeoCtrPayload,
        merchantId: 'test_merchant',
      });
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        status: 'pending',
      });
    });
    
    it('POST /api/actions validates payload schema', async () => {
      const response = await POST('/api/actions', { invalid: 'data' });
      expect(response.status).toBe(400);
    });
    
    // 5+ more API tests
  });
  
  describe('B3 - Action API - LIST with Filters', () => {
    it('GET /api/actions returns paginated list', async () => {
      const response = await GET('/api/actions?limit=10&offset=0');
      
      expect(response.status).toBe(200);
      expect(response.body.actions).toHaveLength(10);
      expect(response.body.total).toBeGreaterThan(0);
    });
    
    it('GET /api/actions filters by status', async () => {
      const response = await GET('/api/actions?status=pending');
      
      response.body.actions.forEach(action => {
        expect(action.status).toBe('pending');
      });
    });
    
    // 5+ more filter tests
  });
  
  describe('B4-B7 - Approval, Execute, Metrics', () => {
    // 15+ more tests for remaining requirements
  });
});
```

**Expected Output**: `30 tests, 30 failing` ✅ (This is GOOD - tests are ready for Engineer)

**Deliverables**:
- [ ] Test file created with 30+ failing tests
- [ ] Each growth spec requirement (B1-B7) has tests
- [ ] Edge cases defined (validation, errors, edge conditions)
- [ ] Performance assertions specified
- [ ] GitHub commit: "feat(qa): Add failing Action system tests (TDD)"
- [ ] Test output logged in feedback showing failures (expected)

### Task 2: Test Fixtures and Mock Data (2-3 hours)
**Goal**: Prepare realistic test data for all growth features

```typescript
// app/__tests__/fixtures/growth-spec-fixtures.ts
export const mockActions = {
  seoCtrFix: {
    type: 'seo_ctr_fix',
    payload: {
      pageId: 'page_123',
      currentTitle: 'Old Product Title',
      proposedTitle: 'Optimized Product Title with Keywords',
      currentDescription: 'Basic description',
      proposedDescription: 'Compelling description with value props',
      reasoning: 'CTR 2.5% is below 4.1% benchmark',
      expectedLift: 0.64, // 64% improvement expected
    },
    score: 0.85,
    merchantId: 'merchant_123',
  },
  
  metaobjectGeneration: {
    type: 'metaobject_gen',
    payload: {
      pageId: 'page_456',
      metaobjectType: 'faq',
      definition: { /* schema */ },
      entries: [
        { question: 'Q1?', answer: 'A1' },
        { question: 'Q2?', answer: 'A2' },
      ],
    },
    score: 0.78,
  },
  
  // All action types from growth spec
};

export const mockGSCData = {
  pages: [
    {
      url: '/products/widget',
      queries: ['buy widget', 'widget price', 'best widget'],
      impressions: 10000,
      clicks: 250,
      ctr: 0.025, // 2.5% - below benchmark
      position: 3.2,
    },
    // 20+ realistic pages
  ],
};

export const mockApprovals = {
  approved: { /* CEO approved without edit */ },
  edited: { /* CEO edited before approving */ },
  rejected: { /* CEO rejected */ },
};
```

**Deliverables**:
- [ ] Fixtures for all action types (C1-C5)
- [ ] Mock GSC data (realistic)
- [ ] Mock approval scenarios
- [ ] Mock Shopify data
- [ ] GitHub commit

### Task 3: Executor Test Harness (2-3 hours)
**Goal**: Framework to test all action executors

```typescript
// app/services/__tests__/executor-test-harness.ts
export class ExecutorTestHarness {
  async testExecutor(
    executor: ActionExecutor, 
    testCases: ExecutorTestCase[]
  ) {
    for (const testCase of testCases) {
      describe(`${executor.name} - ${testCase.name}`, () => {
        it('executes successfully with valid input', async () => {
          const result = await executor.execute(testCase.action);
          expect(result).toMatchObject(testCase.expectedOutcome);
        });
        
        it('handles errors gracefully', async () => {
          await expect(
            executor.execute(testCase.invalidAction)
          ).rejects.toThrow(testCase.expectedError);
        });
        
        it('supports rollback', async () => {
          await executor.execute(testCase.action);
          await executor.rollback(testCase.action);
          // Verify rollback succeeded
          const state = await checkState();
          expect(state).toEqual(testCase.preExecutionState);
        });
        
        it('is idempotent', async () => {
          const result1 = await executor.execute(testCase.action);
          const result2 = await executor.execute(testCase.action);
          expect(result1).toEqual(result2);
          // Should not duplicate
        });
      });
    }
  }
}

// Usage - tests will fail until Engineer builds executors
describe('SEO CTR Executor', () => {
  const harness = new ExecutorTestHarness();
  const testCases = [ /* define expected behavior */ ];
  
  harness.testExecutor(seoCtrExecutor, testCases);
});
```

**Deliverables**:
- [ ] Test harness framework
- [ ] Test cases for each executor type
- [ ] Rollback validation
- [ ] Idempotency checks
- [ ] GitHub commit

### Task 4: Human-in-the-Loop Test Scenarios (3-4 hours)
**Goal**: Test CEO approval workflow

```typescript
// app/__tests__/human-in-the-loop.test.ts
import { run, RunState, tool } from '@openai/agents';

describe('Human-in-the-Loop Approval Workflow', () => {
  it('pauses execution when needsApproval: true', async () => {
    const testTool = tool({
      name: 'testAction',
      needsApproval: true,
      execute: async () => 'executed',
    });
    
    const result = await run(agent, 'Do test action');
    
    expect(result.interruptions).toHaveLength(1);
    expect(result.interruptions[0].type).toBe('tool_approval_item');
  });
  
  it('tracks CEO edits for learning', async () => {
    const result = await run(agent, state);
    const interruption = result.interruptions[0];
    
    // CEO edits proposed content
    state.approve(interruption, {
      overrideWith: { proposedTitle: 'CEO Edited Title' }
    });
    
    // Should track the edit
    const tracked = await getApprovalFeedback(interruption.id);
    expect(tracked.wasEdited).toBe(true);
    expect(tracked.editDiff.proposedTitle).toEqual({
      original: 'AI Generated Title',
      edited: 'CEO Edited Title',
    });
  });
  
  it('resumes execution after approval', async () => {
    let result = await run(agent, 'Generate SEO fix');
    state.approve(result.interruptions[0]);
    
    result = await run(agent, state);
    expect(result.interruptions).toHaveLength(0);
    expect(result.finalOutput).toBeDefined();
  });
  
  // 10+ more approval scenarios
});
```

**Deliverables**:
- [ ] Approval workflow tests (10+ scenarios)
- [ ] CEO edit tracking tests
- [ ] State serialization tests
- [ ] Learning loop validation
- [ ] GitHub commit

### Task 5: Performance Test Specifications (2-3 hours)
**Goal**: Define SLAs for growth automation

```typescript
// app/__tests__/performance/growth-spec-slas.test.ts
describe('Growth Spec Performance SLAs', () => {
  it('handles 1000 actions without degradation', async () => {
    const actions = generateMockActions(1000);
    
    const start = Date.now();
    await Promise.all(actions.map(a => createAction(a)));
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 seconds for 1000 actions
  });
  
  it('approval queue loads in <500ms p95', async () => {
    const measurements = [];
    
    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await GET('/api/actions?status=pending');
      measurements.push(Date.now() - start);
    }
    
    const p95 = percentile(measurements, 95);
    expect(p95).toBeLessThan(500); // p95 < 500ms
  });
  
  it('recommender processes 100 pages in <60s', async () => {
    const start = Date.now();
    await seoCtrRecommender.run(mockGSCData);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(60000); // 1 minute for 100 pages
  });
});
```

**Deliverables**:
- [ ] Performance tests with SLA assertions
- [ ] Load testing scenarios
- [ ] Benchmark baselines
- [ ] GitHub commit

## Priority 1 - Run Tests When Engineer Delivers

### Task 6: Execute Test Suites (2-3 hours)
**Goal**: Verify Engineer's implementation

**After Engineer delivers Action system**:
- [ ] Run all test suites (most should pass if TDD worked)
- [ ] Identify failures (bugs or missed requirements)
- [ ] Report failures to Engineer with reproduction steps
- [ ] Verify fixes
- [ ] Generate coverage report (target: 90%+)

## Build Test Automation, Not Manual Testing

**✅ RIGHT**:
- Write failing tests BEFORE code exists (TDD)
- Build test harnesses (automated validation)
- Create mock fixtures (repeatable data)
- Define SLAs (performance requirements)

**❌ WRONG**:
- Wait for Engineer to finish
- Manually test features one by one
- Write test plans without executable tests
- Test without automation

## Evidence Required

- Git commits for all test code
- Test output showing failures (expected during TDD)
- Coverage reports (even for non-existent code shows structure)
- Test execution logs

## Success Criteria

**End of Day (While Blocked)**:
- [ ] 30+ failing tests for Action system (B1-B7)
- [ ] Test fixtures for all growth features
- [ ] Executor test harness ready
- [ ] Human-in-the-loop tests defined
- [ ] Performance SLAs specified
- [ ] All test code committed to GitHub

**When Engineer Delivers**:
- [ ] 90%+ tests passing (TDD success)
- [ ] Bugs identified and reported
- [ ] Coverage >90%
- [ ] Integration tests passing
- [ ] E2E tests for growth workflows

## Report Every 2 Hours

Update `feedback/qa.md`:
- Tests written (count)
- Fixtures created
- Test harnesses built
- Expected failures documented
- Evidence (commits, test output)

---

**Remember**: Write FAILING tests that define requirements. Engineer makes them pass. This is TDD - it unblocks you and accelerates development.

## 🚨 UPDATE: ENGINEER COMPLETE - START TESTING

**Engineer Status**: ✅ ALL TASKS COMPLETE

**Your Action**: Run your TDD test suites NOW

**Execute**:
1. Run all failing tests (they should mostly pass now)
2. Report failures to Engineer
3. Generate coverage reports
4. Continue with integration tests

**ENGLISH ONLY** - All test content, docs, reports in English

---
