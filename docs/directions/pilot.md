# Pilot Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:24Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 9-12 Smoke Testing (Reactive)

## ✅ PILOT-002 COMPLETE
- ✅ CX + Sales modals PASSED
- ⚠️ Inventory modal NOT FOUND

## 🔄 IMMEDIATE CROSS-FUNCTIONAL WORK (2 hours) — START NOW

**While waiting for Engineer**: Support QA and DevOps with testing infrastructure

### PILOT-017: QA Early Smoke Tests (1h) — P2

**Objective**: Help QA by performing early smoke tests on Phase 7-8 features

**Owner**: Pilot (smoke test expert)  
**Beneficiary**: QA

**Deliverables**:
- **Phase 7-8 Smoke Test Report** (`artifacts/pilot/2025-10-21/phase-7-8-smoke-test.md`):
  - Test analytics tiles (Social, SEO, Ads, Growth) - quick 5-min validation each
  - Test analytics modals - open/close, data display
  - Browser compatibility check (Chrome, Firefox, Safari)
  - Mobile responsiveness check (viewport resize)
  - Pass/fail with screenshots

**Dependencies**: None (Phase 7-8 already deployed to staging)

**Acceptance**: ✅ Smoke test report created, ✅ QA has early validation

---

### PILOT-018: DevOps CI Guards Testing (1h) — P1

**Objective**: Help DevOps (DEVOPS-014) by testing CI guard scripts

**Owner**: Pilot  
**Beneficiary**: DevOps

**Deliverables**:
- **CI Guards Test Report** (`artifacts/pilot/2025-10-21/ci-guards-test-report.md`):
  - Test verify-mcp-evidence.js (missing evidence, invalid JSONL, non-code change exemption)
  - Test verify-heartbeat.js (stale heartbeat, no heartbeat for long task)
  - Test dev-mcp-ban (Dev MCP in app/, Dev MCP in scripts/ - should pass)
  - Document failure messages (are they clear and actionable?)

**Dependencies**: DevOps completes DEVOPS-014 scripts

**Acceptance**: ✅ Test report created, ✅ DevOps can fix issues

---

## 🔄 WAITING ON ENGINEER: Phase 9-12 Smoke Testing (12h) — REACTIVE

**All blocked until Engineer completes Phase 9-12 work**

### PILOT-012: Phase 9 PII Card Smoke Test (2h) — ⏸️ BLOCKED

**Prerequisites**: Engineer completes Phase 9

**Test**: PII Card, CX modal split UI, redaction working

**MCP Required**: Chrome DevTools MCP (snapshots, screenshots)

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-013: Phase 10 Vendor/ALC Smoke Test (2h)

**Prerequisites**: Phase 10 complete

**Test**: Vendor dropdown, receiving workflow, ALC calculation

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-014: Phase 11 Attribution Smoke Test (2h)

**Prerequisites**: Phase 11 complete

**Test**: Action links, GA4 tracking, attribution working

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-015: Phase 12 CX Loop Smoke Test (1h)

**Prerequisites**: Phase 12 complete

**Test**: Themes detected, Actions generated

**Acceptance**: ✅ Smoke test PASSED

---

### PILOT-016: Browser/Mobile Testing (5h)

**Objective**: Test on all browsers + devices

**Acceptance**: ✅ Compatibility report complete

**START NOW**: Monitor Engineer progress, prepare Chrome DevTools MCP

---

## 🔧 MCP Tools: Chrome DevTools MCP (MANDATORY for all testing)
## 🚨 Evidence: Screenshots + snapshots required
