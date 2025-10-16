# Feature Prioritization Matrix - M0-M6

**Document Type:** Feature Prioritization  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Framework:** RICE (Reach × Impact × Confidence / Effort)

---

## Prioritization Framework

### RICE Scoring

**Formula:** `RICE Score = (Reach × Impact × Confidence) / Effort`

**Reach:** Number of users/operators affected per time period (monthly)
**Impact:** 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal
**Confidence:** 100%=high, 80%=medium, 50%=low
**Effort:** Person-weeks (molecule-sized ≤0.4 weeks = 2 days)

**Priority Tiers:**
- **P0 (Critical):** RICE >100 - Build immediately, blocks launch
- **P1 (High):** RICE 50-100 - Next sprint
- **P2 (Medium):** RICE 20-50 - Backlog
- **P3 (Low):** RICE <20 - Defer or reject

---

## M0-M1: Governance + Incident Zero

| Feature | Reach | Impact | Conf | Effort | RICE | Priority | Notes |
|---------|-------|--------|------|--------|------|----------|-------|
| CI/CD Pipeline | 16 | 3 | 100% | 0.4 | 120 | P0 | Blocks all PRs |
| Push Protection | 16 | 3 | 100% | 0.2 | 240 | P0 | Security critical |
| Docs Allow-List | 16 | 2 | 100% | 0.2 | 160 | P0 | Governance |
| MCP Tools (6 servers) | 5 | 3 | 80% | 0.4 | 30 | P1 | Dev productivity |
| Chatwoot Email (read) | 1 | 2 | 100% | 0.3 | 6.7 | P2 | Foundation for M2 |
| Shopify GraphQL (read) | 1 | 2 | 100% | 0.3 | 6.7 | P2 | Foundation for M2 |
| Supabase Schema | 1 | 2 | 100% | 0.4 | 5 | P2 | Data foundation |
| Drift Sweep Automation | 1 | 1 | 100% | 0.2 | 5 | P2 | Maintenance |
| Manager Checklists | 1 | 2 | 100% | 0.2 | 10 | P1 | Process |
| Prometheus Metrics | 1 | 1 | 80% | 0.3 | 2.7 | P3 | Nice-to-have |

**M0-M1 Summary:**
- **P0 Features:** 3 (CI/CD, Push Protection, Docs Allow-List)
- **Total Effort:** 2.7 weeks
- **Critical Path:** CI/CD → All other work

---

## M2: HITL Customer Agent (Email)

| Feature | Reach | Impact | Conf | Effort | RICE | Priority | Notes |
|---------|-------|--------|------|--------|------|----------|-------|
| HITL Enforcement | 1 | 3 | 100% | 0.1 | 30 | P0 | Safety critical |
| Public Reply API | 1 | 3 | 100% | 0.2 | 15 | P0 | Core workflow |
| Approvals Drawer UI | 1 | 3 | 80% | 0.4 | 6 | P1 | UX critical |
| AI Draft Generation | 1 | 3 | 80% | 0.3 | 8 | P1 | Value driver |
| Grading System | 1 | 2 | 100% | 0.2 | 10 | P1 | Learning loop |
| /validate Endpoint | 1 | 2 | 100% | 0.2 | 10 | P1 | Safety check |
| Evidence Section | 1 | 2 | 80% | 0.3 | 5.3 | P2 | Trust building |
| Audit Logs | 1 | 1 | 100% | 0.2 | 5 | P2 | Compliance |
| SLA Dashboard | 1 | 1 | 80% | 0.3 | 2.7 | P3 | Monitoring |
| Fine-Tuning Pipeline | 1 | 2 | 50% | 0.4 | 2.5 | P3 | Future optimization |

**M2 Summary:**
- **P0 Features:** 2 (HITL, Public Reply)
- **Total Effort:** 2.4 weeks
- **Success Metric:** ≥90% AI draft rate, ≤15 min approval time

---

## M3: Inventory Actions

| Feature | Reach | Impact | Conf | Effort | RICE | Priority | Notes |
|---------|-------|--------|------|--------|------|----------|-------|
| Payout Brackets | 1 | 3 | 100% | 0.1 | 30 | P0 | Picker payroll |
| PO CSV Generation | 1 | 3 | 100% | 0.2 | 15 | P0 | Vendor orders |
| Picker Piece Count | 1 | 3 | 100% | 0.2 | 15 | P0 | Payout accuracy |
| ROP Calculation | 1 | 3 | 80% | 0.3 | 8 | P1 | Stockout prevention |
| Status Buckets | 1 | 2 | 100% | 0.2 | 10 | P1 | Visibility |
| Safety Stock Formula | 1 | 2 | 80% | 0.2 | 8 | P1 | Buffer calculation |
| Kit/Bundle Detection | 1 | 2 | 100% | 0.2 | 10 | P1 | Component tracking |
| WOS Calculation | 1 | 2 | 100% | 0.1 | 20 | P1 | Urgency indicator |
| Approvals Drawer (Inv) | 1 | 2 | 100% | 0.2 | 10 | P1 | Review workflow |
| Vendor Management | 1 | 1 | 100% | 0.3 | 3.3 | P2 | Data management |

**M3 Summary:**
- **P0 Features:** 3 (Payouts, PO, Piece Count)
- **Total Effort:** 2.0 weeks
- **Success Metric:** Stockouts -40%, overstocks -20%, 100% payout accuracy

---

## M4: Live Chat + SMS

| Feature | Reach | Impact | Conf | Effort | RICE | Priority | Notes |
|---------|-------|--------|------|--------|------|----------|-------|
| Live Chat Integration | 1 | 3 | 100% | 0.3 | 10 | P1 | Channel expansion |
| AI Drafts (Chat) | 1 | 3 | 80% | 0.2 | 12 | P1 | Value driver |
| AI Drafts (SMS) | 1 | 2 | 80% | 0.2 | 8 | P1 | Value driver |
| SMS Char Limit | 1 | 1 | 100% | 0.1 | 10 | P1 | Validation |
| Unified Drawer | 1 | 2 | 100% | 0.2 | 10 | P1 | Consistency |
| Twilio SMS Integration | 1 | 2 | 80% | 0.3 | 5.3 | P2 | External dependency |
| Auto-Escalation | 1 | 2 | 80% | 0.2 | 8 | P2 | SLA enforcement |
| SLA Dashboard (FRT) | 1 | 1 | 80% | 0.3 | 2.7 | P3 | Monitoring |
| Channel Rollback | 1 | 1 | 100% | 0.2 | 5 | P2 | Safety |

**M4 Summary:**
- **P0 Features:** 0
- **P1 Features:** 5
- **Total Effort:** 2.0 weeks
- **Success Metric:** Chat FRT <2 min, SMS FRT <5 min, ≥85% AI draft rate

---

## M5: Growth v1 (Read-Only Analytics)

| Feature | Reach | Impact | Conf | Effort | RICE | Priority | Notes |
|---------|-------|--------|------|--------|------|----------|-------|
| SEO Anomaly Detection | 1 | 3 | 80% | 0.3 | 8 | P1 | Traffic protection |
| Evidence-First Suggestions | 1 | 2 | 100% | 0.2 | 10 | P1 | Trust building |
| GA MCP Integration | 1 | 2 | 80% | 0.3 | 5.3 | P2 | Data source |
| Content Recommendations | 1 | 2 | 80% | 0.3 | 5.3 | P2 | Value driver |
| Ad Performance Dashboard | 1 | 2 | 80% | 0.3 | 5.3 | P2 | Visibility |
| Weekly Growth Report | 1 | 1 | 100% | 0.2 | 5 | P2 | Summary |
| Historical Trend Storage | 1 | 1 | 100% | 0.2 | 5 | P2 | Data foundation |
| Ranking Change Detection | 1 | 2 | 50% | 0.4 | 2.5 | P3 | Requires external tool |

**M5 Summary:**
- **P0 Features:** 0
- **P1 Features:** 2
- **Total Effort:** 2.2 weeks
- **Success Metric:** SEO critical resolution <48h, ≥60% recommendation acceptance

---

## M6: HITL Posting

| Feature | Reach | Impact | Conf | Effort | RICE | Priority | Notes |
|---------|-------|--------|------|--------|------|----------|-------|
| HITL Posting Workflow | 1 | 3 | 100% | 0.2 | 15 | P0 | Safety critical |
| Ayrshare Adapter | 1 | 3 | 80% | 0.3 | 8 | P1 | External integration |
| AI-Drafted Posts | 1 | 3 | 80% | 0.3 | 8 | P1 | Value driver |
| Post Preview | 1 | 2 | 100% | 0.2 | 10 | P1 | Review UX |
| Grading System (Posts) | 1 | 2 | 100% | 0.2 | 10 | P1 | Learning loop |
| Impact Tracking | 1 | 2 | 80% | 0.3 | 5.3 | P2 | ROI measurement |
| Post Scheduling UI | 1 | 2 | 80% | 0.3 | 5.3 | P2 | Batch workflow |
| Weekly Growth Report | 1 | 1 | 100% | 0.2 | 5 | P2 | Summary |
| Post Rollback | 1 | 1 | 100% | 0.2 | 5 | P2 | Safety |
| Projected Engagement | 1 | 1 | 50% | 0.4 | 1.25 | P3 | Requires ML model |

**M6 Summary:**
- **P0 Features:** 1 (HITL Posting)
- **P1 Features:** 4
- **Total Effort:** 2.4 weeks
- **Success Metric:** ≥10 posts/week, ≥70% approval rate, measurable CTR/ROAS lift

---

## Cross-Milestone Summary

### Total Features by Priority
- **P0 (Critical):** 10 features
- **P1 (High):** 22 features
- **P2 (Medium):** 21 features
- **P3 (Low):** 6 features
- **Total:** 59 features

### Total Effort by Milestone
- M0-M1: 2.7 weeks
- M2: 2.4 weeks
- M3: 2.0 weeks
- M4: 2.0 weeks
- M5: 2.2 weeks
- M6: 2.4 weeks
- **Total:** 13.7 weeks (~3.5 months)

### Dependency Graph
```
M0-M1 (Foundation)
  ├─> CI/CD → All PRs
  ├─> MCP Tools → M2, M3, M5
  ├─> Supabase → M2, M3, M5
  └─> Chatwoot → M2, M4

M2 (HITL Email)
  ├─> Approvals Drawer → M3, M4, M5, M6
  ├─> HITL Enforcement → M4, M6
  ├─> Grading System → M4, M6
  └─> AI Drafts → M4, M6

M3 (Inventory) - Standalone

M4 (Chat/SMS) - Extends M2

M5 (Growth Analytics)
  └─> Evidence-First → M6

M6 (HITL Posting) - Extends M2 + M5
```

### Critical Path
**Longest:** M0 → M2 → M6 (3 milestones, ~7.5 weeks)

### Parallel Execution Opportunities
- **Track 1:** M0 → M2 → M4 (CX expansion)
- **Track 2:** M0 → M3 (Inventory standalone)
- **Track 3:** M0 → M5 → M6 (Growth pipeline)

**Recommendation:** Execute M0-M1 first, then parallelize M2/M3, then M4/M5, then M6

---

## Risk-Adjusted Prioritization

### High-Risk Features (Require Extra Attention)
- MCP Tools Setup (M0): External dependencies
- AI Draft Generation (M2): Quality depends on training
- Approvals Drawer UI (M2): Complex UX
- ROP Calculation (M3): Accuracy critical
- Twilio SMS (M4): External API
- SEO Anomaly Detection (M5): Threshold tuning
- Ayrshare Adapter (M6): External API
- Fine-Tuning Pipeline (M2): Requires ML expertise (P3)
- Projected Engagement (M6): Requires ML model (P3)

**Strategy:**
1. Prototype high-risk features early (spike stories)
2. Add buffer time (1.5x effort estimate)
3. Plan fallback options (manual workflows)
4. Defer P3 high-risk features to future

---

## Milestone Sequencing Recommendation

### Phase 1: Foundation (Weeks 1-3)
**Execute:** M0-M1 (all P0 features)
**Goal:** Production-safe infrastructure, zero incidents
**Blockers Removed:** CI/CD, MCP tools, secrets management

### Phase 2: Core HITL (Weeks 4-5)
**Execute:** M2 (P0 + P1 features)
**Goal:** AI-drafted email replies with approval workflow
**Blockers Removed:** Approvals Drawer, HITL enforcement

### Phase 3: Parallel Expansion (Weeks 6-9)
**Execute:** M3 + M4 (P0 + P1 features in parallel)
**Goal:** Inventory actions + multi-channel CX
**Blockers Removed:** ROP system, Live Chat/SMS

### Phase 4: Growth Pipeline (Weeks 10-12)
**Execute:** M5 + M6 (P0 + P1 features)
**Goal:** Read-only analytics + HITL posting
**Blockers Removed:** SEO anomalies, social posting

### Phase 5: Enhancements (Weeks 13-14)
**Execute:** P2 features across all milestones
**Goal:** Polish, optimizations, nice-to-haves
**Defer:** P3 features to future roadmap

---

## Success Criteria by Milestone

### M0-M1
- [ ] CI checks 100% passing
- [ ] 0 secret incidents
- [ ] All 6 MCP servers operational
- [ ] Daily drift sweep automated

### M2
- [ ] ≥90% AI draft rate
- [ ] ≤15 min median approval time
- [ ] Grades: tone ≥4.5, accuracy ≥4.7, policy ≥4.8
- [ ] 0 unapproved sends

### M3
- [ ] Stockouts -40% vs baseline
- [ ] Overstocks -20% vs baseline
- [ ] 100% picker payout accuracy
- [ ] 100% ROP coverage

### M4
- [ ] Chat FRT <2 min
- [ ] SMS FRT <5 min
- [ ] ≥85% AI draft rate (Chat)
- [ ] ≥80% AI draft rate (SMS)

### M5
- [ ] SEO critical resolution <48h
- [ ] ≥60% recommendation acceptance
- [ ] 100% traffic anomaly detection
- [ ] 100% evidence quality

### M6
- [ ] ≥10 HITL-approved posts/week
- [ ] ≥70% post approval rate
- [ ] Measurable CTR/ROAS lift
- [ ] 0 unapproved posts

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial prioritization matrix by Product Agent

**Review Schedule:**
- Engineer: Validate effort estimates
- QA: Confirm testability
- Manager: Approve milestone sequencing

**Related Documents:**
- `docs/specs/dashboard_launch_readiness.md` - Launch criteria
- `docs/NORTH_STAR.md` - Success metrics source
- `docs/manager/PROJECT_PLAN.md` - Execution framework

