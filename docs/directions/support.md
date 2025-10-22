# Support Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:22Z  
**Version**: 7.0  
**Status**: ✅ ALL TASKS COMPLETE — MAINTENANCE MODE (No new work assigned)

## ✅ SUPPORT-001-007 COMPLETE (Phases 1-8)
- ✅ Email + Live Chat tested (85 conversations, 1,500+ lines docs)
- ⚠️ SMS blocked on Twilio credentials

## ✅ SUPPORT-008 COMPLETE (2025-10-21)

**Task**: Growth Engine CX Workflow Documentation (8h)

**Completed Deliverables**:

1. ✅ **Customer-Front Agent Workflow** (2h)
   - Triage → transfer_to_accounts OR transfer_to_storefront
   - Sub-agent execution
   - PII Broker redaction
   - HITL approval

2. ✅ **PII Card Usage Guide** (2h)
   - When to use PII Card vs public reply
   - Security best practices
   - Operator training materials

3. ✅ **Grading Best Practices** (2h)
   - How to grade (tone/accuracy/policy)
   - Examples of 1-5 scores
   - Impact of grading on AI learning

4. ✅ **CX SLA Documentation** (2h)
   - 15-minute review SLA (business hours)
   - Escalation procedures
   - Performance tracking

**Evidence**: `docs/support/growth-engine-cx-workflows.md` (1,669 lines, commits bdc9541, 08cf517)

**Completed**: 2025-10-21T17:50Z

---

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (3-4 hours) — START NOW

**Strategic Deployment**: Support Engineer, QA, and DevOps with documentation

### SUPPORT-009: PII Card Testing Documentation (2h) — P1

**Objective**: Help Engineer (ENG-029) by creating comprehensive test documentation

**Owner**: Support (documentation expert)  
**Beneficiary**: Engineer + QA

**Deliverables**:
1. **Test Scenarios Document** (`docs/support/pii-card-test-scenarios.md`):
   - Edge cases: null values, malformed data, special characters
   - Security tests: verify NO full PII in redacted output
   - Integration tests: PII Card + public reply split
   - Performance: redaction function benchmarks

2. **Operator Testing Checklist** (for QA-009):
   - Step-by-step manual testing guide
   - Expected vs actual results template
   - Accessibility testing checklist (screen reader, keyboard nav)

**Dependencies**: Engineer completes ENG-029 (PII Card component)

**Acceptance**: ✅ Test docs created (500+ lines), ✅ QA can use for testing

---

### SUPPORT-010: CI Guards Runbook (1.5h) — P1

**Objective**: Help DevOps (DEVOPS-014) by documenting CI guard setup and troubleshooting

**Owner**: Support (runbook expert)  
**Beneficiary**: DevOps + All agents

**Deliverables**:
1. **CI Guards Setup Runbook** (`docs/runbooks/ci-guards-setup.md`):
   - MCP Evidence JSONL: How to create, validate, common errors
   - Heartbeat NDJSON: When required, format, staleness check
   - Dev MCP Ban: What to check, how to fix violations
   
2. **Troubleshooting Guide**:
   - "MCP Evidence missing" → How to fix
   - "Heartbeat stale" → How to update
   - "Dev MCP detected" → How to remove from app/

**Dependencies**: DevOps completes DEVOPS-014 (scripts available)

**Acceptance**: ✅ Runbook created (300+ lines), ✅ Agents can self-serve

---

### SUPPORT-011: QA Test Documentation Support (30min) — P2

**Objective**: Help QA create standardized test documentation format

**Owner**: Support  
**Beneficiary**: QA

**Deliverables**:
- Test documentation template (pass/fail format)
- Evidence logging guidelines for QA
- Bug report template for Growth Engine features

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Templates created, ✅ QA adopts format

---

**Total Assigned**: 4 hours supporting Engineer, DevOps, QA  
**Priority**: P1 (unblock other agents)  
**Start**: SUPPORT-011 (immediate), SUPPORT-009/010 (when dependencies ready)

---

## 🔧 MCP Tools: None for docs (pure documentation work)
## 🚨 Evidence: Document paths logged in feedback

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'support',
  action: 'task_completed',
  rationale: 'Task description with evidence',
  evidenceUrl: 'artifacts/support/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
