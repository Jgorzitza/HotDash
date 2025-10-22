# Designer Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T16:00Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 7-8 Analytics Validation + Phase 9 PII Card Design QA

---

## ✅ PREVIOUS WORK COMPLETE

**All Delivered** (from feedback/designer/2025-10-21.md):
- ✅ DES-005, 006, 007: Phases 3-5 QA (ALL PASSED)
- ✅ DES-009: Phase 6 Settings Validation (PASSED)
- ✅ DES-010: Onboarding Wireframes (1,100+ lines)
- ✅ DES-011: Mobile Optimization (650+ lines, 20 issues documented)
- ✅ DES-012: Accessibility Audit (1,400+ lines, 92% WCAG 2.2 AA)
- ✅ DES-013: Analytics Tile Design Specs (971 lines)
- ✅ DES-014: Analytics Modal Design Specs (1,546 lines)
- ✅ DES-016: Phase 1-8 Design Audit (661 lines)

**Pending**: DES-015 (Analytics UI Validation) — blocked until Engineer completes Phase 7-8

**Total Output**: 3,178 lines of design specs across 3 documents, ready for implementation

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Production Agent Model
- **Front-End Agents**: Customer-Front (CX), CEO-Front (business intelligence)
- **Specialist Agents**: Run in background to keep data fresh (pre-generate content)
- **Pre-Generation + HITL**: Agents work ahead → idle until operator approval
- **Example**: Customer inquiry → reply pre-generated → operator reviews PII Card + redacted reply → approves

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/designer/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/designer/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 ACTIVE TASKS (7 hours total)

### IMMEDIATE WORK (2h) — START NOW (No Dependencies)

#### DES-015: Phase 7-8 Analytics UI Validation (2h) — P1

**Can start immediately** (Engineer completed Phase 7-8)

**Prerequisites**: Engineer completed Phase 7-8 (commits: ffa0bc6, 61fe5b1) ✅

**Objective**: Validate analytics tiles + modals against DES-013/DES-014 design specs

**Validation Checklist**:

1. **Social Performance Tile** (30min)
   - ✅ Layout matches spec (icon, metrics, CTA)
   - ✅ Data displays correctly (post count, engagement rate, reach)
   - ✅ Click opens modal
   - ✅ Polaris design tokens applied
   - ✅ Accessibility: ARIA labels, keyboard nav

2. **SEO Impact Tile** (30min)
   - ✅ Layout matches spec
   - ✅ Data displays correctly (avg position, indexed pages, top movers)
   - ✅ Click opens modal
   - ✅ Color coding for position changes (green up, red down)
   - ✅ Accessibility: ARIA labels

3. **Ads ROAS Tile** (30min)
   - ✅ Layout matches spec
   - ✅ Data displays correctly (ROAS, spend, conversions)
   - ✅ Click opens modal
   - ✅ Currency formatting correct
   - ✅ Accessibility: ARIA labels

4. **Growth Metrics Tile** (30min)
   - ✅ Layout matches spec
   - ✅ Data displays correctly (total growth %, channel breakdown)
   - ✅ Click opens modal
   - ✅ Percentage formatting correct
   - ✅ Accessibility: ARIA labels

**Modal Validation** (all 4 modals):
- ✅ Chart.js charts render correctly
- ✅ Chart colors match OCC design tokens
- ✅ DataTables formatted properly
- ✅ Date range filters functional
- ✅ Mobile responsive (tablet + phone)
- ✅ Accessibility: Focus management, keyboard nav, screen reader support

**Deliverable**: `docs/design/phase-7-8-analytics-validation.md` (findings, issues, approval status)

**MCP Required**: 
- Shopify Dev MCP → Polaris DataTable patterns + accessibility
- Context7 → Chart.js accessibility best practices
- Chrome DevTools MCP → Take screenshots for documentation

**Acceptance**:
- ✅ All 4 tiles validated
- ✅ All 4 modals validated
- ✅ Issues documented with severity (P0/P1/P2)
- ✅ Accessibility score ≥90%
- ✅ Approval: PASS/CONDITIONAL PASS/FAIL
- ✅ Evidence: Screenshots in `artifacts/designer/2025-10-21/`

---

### CROSS-FUNCTIONAL WORK (2h) — While Waiting for ENG-029

#### DES-018: CI Guards UI Review (1h) — P2

**Objective**: Help DevOps (DEVOPS-014) by reviewing CI guard error messages for clarity

**Owner**: Designer (UX copy expert)  
**Beneficiary**: DevOps + All agents

**Deliverables**:
- **Error Message Review** (`artifacts/designer/2025-10-21/ci-guards-ux-review.md`):
  - Review error messages from verify-mcp-evidence.js, verify-heartbeat.js
  - Suggest clearer wording (actionable, friendly, specific)
  - Improve error formatting for CI logs
  - Add "How to Fix" links to runbooks

**Dependencies**: DevOps completes DEVOPS-014 scripts

**Acceptance**: ✅ UX review complete, ✅ DevOps can improve messages

---

#### DES-019: Vendor Management UI Mockups (1h) — P2

**Objective**: Help Product (PRODUCT-016) by creating quick UI mockups for vendor management

**Owner**: Designer  
**Beneficiary**: Product + Engineer

**Deliverables**:
- **ASCII Mockups** (`docs/designer/vendor-management-mockups.txt`):
  - Vendor list table layout
  - Add/edit vendor modal
  - Vendor selection in PO flow
  - Mobile-responsive considerations

**Dependencies**: Product completes PRODUCT-016 UI spec

**Acceptance**: ✅ Mockups created, ✅ Engineer can visualize UI

---

### WAITING ON ENGINEER (3h) — Blocked Until ENG-029 Complete

#### DES-017: Phase 9 PII Card Design QA (3h) — P0 PRIORITY

**Prerequisites**: Engineer implements ENG-029, ENG-030, ENG-031 (PII Card components)

**Objective**: Validate PII Card component + CX Escalation Modal split UI

**Context**: Growth Engine introduces PII Broker pattern:
- **Public Reply** (sent to customer): Redacted (no full email/phone/address)
- **PII Card** (operator-only): Full customer details (NOT sent)

**Validation Checklist**:

1. **PII Redaction Utility** (30min)
   - ✅ Email masking correct: `justin@hotrodan.com` → `j***@h***.com`
   - ✅ Phone masking correct: `555-123-4567` → `***-***-4567`
   - ✅ Address masking correct: City/region/country + postal prefix only
   - ✅ Order ID masking correct: Show last 4 only
   - ✅ Tracking masking correct: Carrier + last event (no full URL)
   - ✅ Unit tests passing (100% coverage)

2. **PII Card Component** (1h)
   - **Warning Banner**:
     - ✅ Prominent yellow banner with alert icon
     - ✅ Text: "⚠️ OPERATOR ONLY — NOT SENT TO CUSTOMER"
     - ✅ ARIA role="alert" present
     - ✅ High contrast (WCAG AA)
   
   - **Order Details Section**:
     - ✅ Full order ID visible (not masked)
     - ✅ Order status + fulfillment status clear
     - ✅ Typography: Polaris Text variants
   
   - **Customer Contact Section**:
     - ✅ Full email visible with copy button
     - ✅ Full phone visible with copy button
     - ✅ Copy buttons functional
     - ✅ Copy buttons have descriptive ARIA labels
   
   - **Shipping Address Section**:
     - ✅ Full address visible (all fields)
     - ✅ Copy button for full address
     - ✅ Formatted clearly (line breaks, proper hierarchy)
   
   - **Tracking Section**:
     - ✅ Carrier, tracking number, full URL visible
     - ✅ URL opens in new tab with `rel="noopener noreferrer"`
     - ✅ Last event + date visible
     - ✅ Visual hierarchy clear
   
   - **Line Items Table**:
     - ✅ Polaris DataTable used
     - ✅ Columns: Title, SKU, Qty, Price
     - ✅ Data formatted correctly
     - ✅ Table responsive (mobile)
   
   - **Accessibility**:
     - ✅ aria-label="Customer PII - Operator Only" on container
     - ✅ Keyboard navigation works (Tab order logical)
     - ✅ Screen reader announces warning banner
     - ✅ Copy buttons accessible
     - ✅ Color contrast ≥4.5:1 (WCAG AA)

3. **CX Escalation Modal Integration** (1h)
   - **Split UI Layout**:
     - ✅ Two sections visible: Public Reply + PII Card
     - ✅ Visual separation clear (border, spacing)
     - ✅ Hierarchy: Public Reply on left/top, PII Card on right/bottom
     - ✅ Mobile: Stacks vertically (PII Card below public reply)
   
   - **Public Reply Section**:
     - ✅ Draft reply text area present
     - ✅ Redacted data only (masked email, phone, address)
     - ✅ Preview shows what customer will see
     - ✅ Approve/Reject buttons prominent
   
   - **PII Card Section**:
     - ✅ PIICard component rendered
     - ✅ Warning banner visible
     - ✅ All full customer details visible
     - ✅ Clear label: "Full Customer Details (Not Sent)"
   
   - **Validation Logic**:
     - ✅ Warning if full PII detected in public reply
     - ✅ Approve button disabled if validation fails
     - ✅ Error message clear and actionable
   
   - **Accessibility**:
     - ✅ Focus management (modal opens → first input focused)
     - ✅ Escape key closes modal
     - ✅ Tab trapping (focus stays in modal)
     - ✅ Screen reader announces modal role
     - ✅ ARIA labels on all buttons

4. **Visual Design** (30min)
   - ✅ Polaris design tokens applied (colors, spacing, typography)
   - ✅ Warning banner stands out (yellow, not dismissible)
   - ✅ Copy buttons use Polaris Button component
   - ✅ DataTable styled consistently
   - ✅ Responsive breakpoints work (tablet + phone)
   - ✅ No visual regressions (compare to Phase 1-6 modals)

**Deliverable**: `docs/design/phase-9-pii-card-validation.md` (findings, issues, approval status)

**MCP Required**: 
- Context7 → Polaris Card, Banner, Button, DataTable patterns
- Context7 → WCAG 2.2 AA requirements for warning banners
- Chrome DevTools MCP → Take screenshots of PII Card + modal split UI

**Acceptance**:
- ✅ PII redaction utility validated
- ✅ PII Card component validated (all sections)
- ✅ CX Escalation Modal split UI validated
- ✅ Validation logic tested (detects unmasked PII)
- ✅ Accessibility score ≥95% (high priority for operator safety)
- ✅ Issues documented with severity
- ✅ Approval: PASS/CONDITIONAL PASS/FAIL
- ✅ Evidence: Screenshots in `artifacts/designer/2025-10-21/`

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 7-8 Analytics Validation (2h)
- ✅ All 4 tiles validated (Social, SEO, Ads, Growth)
- ✅ All 4 modals validated (charts, tables, filters)
- ✅ Accessibility score ≥90%
- ✅ Validation document complete with findings
- ✅ Screenshots saved to artifacts/
- ✅ Approval status provided (PASS/CONDITIONAL PASS/FAIL)

### Phase 9 PII Card Design QA (3h)
- ✅ PII redaction utility validated (all masking functions)
- ✅ PII Card component validated (warning banner, all sections, accessibility)
- ✅ CX Escalation Modal split UI validated (public reply + PII Card)
- ✅ Validation logic tested (prevents unmasked PII in public reply)
- ✅ Accessibility score ≥95%
- ✅ Validation document complete with findings
- ✅ Screenshots saved to artifacts/
- ✅ Approval status provided with detailed feedback

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Shopify Dev MCP**: FIRST for all Polaris
   - Polaris components (Card, Banner, Button, DataTable, Modal)
   - Polaris accessibility patterns
   - Polaris design tokens

2. **Context7 MCP**: For non-Shopify libraries
   - Chart.js accessibility patterns
   - WCAG 2.2 AA requirements (general web)

3. **Chrome DevTools MCP**: Required for UI testing
   - Take screenshots before claiming "tested"
   - Test responsive breakpoints (tablet, phone)
   - Verify color contrast ratios
   - Test keyboard navigation

4. **Web Search**: LAST RESORT ONLY if no MCP has the info

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/designer/<date>/mcp/phase-7-8-validation.jsonl` and `mcp/pii-card-qa.jsonl`
2. **Heartbeat NDJSON**: `artifacts/designer/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **Screenshots**: Save to `artifacts/designer/2025-10-21/screenshots/`
4. **PR Template**: Fill out all sections (MCP Evidence + Heartbeat + Dev MCP Check)

### Testing Environments
- **Staging**: Access via staging URL (provided by DevOps)
- **Chrome DevTools**: Use for responsive testing, accessibility audit
- **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows)

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **DES-015**: Phase 7-8 Analytics UI Validation (2h) → START IMMEDIATELY
   - Pull Context7: Chart.js + Polaris DataTable
   - Access staging environment
   - Validate all 4 tiles + modals
   - Screenshot evidence
   - Write validation document

2. **DES-017**: Phase 9 PII Card Design QA (3h) → After Engineer completes ENG-029, 030, 031
   - Pull Context7: Polaris Card, Banner, WCAG requirements
   - Test PII redaction utility
   - Validate PII Card component
   - Validate CX Escalation Modal split UI
   - Screenshot evidence
   - Write validation document with detailed feedback

**Total**: 5 hours

**Expected Output**:
- 2 validation documents (~1,500-2,000 lines total)
- 20-30 screenshots (organized by feature)
- Issues documented with severity + recommendations
- Approval status for both phases

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start DES-015 immediately after reading this direction
2. **MCP FIRST**: Pull Context7 + Chrome DevTools docs BEFORE validation
3. **Evidence JSONL**: Create `artifacts/designer/2025-10-21/mcp/` and log every MCP call
4. **Screenshots**: Required for all validation (before claiming "tested")
5. **Accessibility**: High priority - use Chrome DevTools Lighthouse + manual keyboard testing
6. **Feedback**: Update `feedback/designer/2025-10-21.md` every 2 hours with progress
7. **Blockers**: If Engineer hasn't completed Phase 9 PII Card → escalate immediately

**Questions or blockers?** → Escalate immediately in feedback with details

**Let's validate! 🎨**

---

## ✅ PHASE 7-8 COMPLETE + UNBLOCKED (2025-10-21)

Engineer completed Phase 9 → DES-017 (PII Card QA) NOW UNBLOCKED

---


## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: 'designer',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/designer.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'designer',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/designer/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'designer',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/designer/2025-10-22/{task}-complete.md',
  durationEstimate: 4.0,
  durationActual: 3.5,              // Compare estimate vs actual
  nextAction: 'Starting {NEXT-TASK-ID}'
});
```

### When Blocked (CRITICAL)

**Manager queries blocked tasks FIRST during consolidation**:

```typescript
await logDecision({
  scope: 'build',
  actor: 'designer',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/designer/2025-10-22.md'
});
```

### Manager Visibility

Manager runs these scripts to see your work instantly:
- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress  
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.


### Daily Shutdown (with Self-Grading)

**At end of day, log shutdown with self-assessment**:

```typescript
import { calculateSelfGradeAverage } from '~/services/decisions.server';

const grades = {
  progress: 5,        // 1-5: Progress vs DoD
  evidence: 4,        // 1-5: Evidence quality
  alignment: 5,       // 1-5: Followed North Star/Rules
  toolDiscipline: 5,  // 1-5: MCP-first, no guessing
  communication: 4    // 1-5: Clear updates, timely blockers
};

await logDecision({
  scope: 'build',
  actor: 'designer',
  action: 'shutdown',
  status: 'in_progress',  // or 'completed' if all tasks done
  progressPct: 75,        // Overall daily progress
  rationale: 'Daily shutdown - {X} tasks completed, {Y} in progress',
  durationActual: 6.5,    // Total hours today
  payload: {
    dailySummary: '{TASK-A} complete, {TASK-B} at 75%',
    selfGrade: {
      ...grades,
      average: calculateSelfGradeAverage(grades)
    },
    retrospective: {
      didWell: ['Used MCP first', 'Good test coverage'],
      toChange: ['Ask questions earlier'],
      toStop: 'Making assumptions'
    },
    tasksCompleted: ['{TASK-ID-A}', '{TASK-ID-B}'],
    hoursWorked: 6.5
  }
});
```

### Markdown Backup (Optional)

You can still write to `feedback/designer/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'designer',
  action: 'validation_complete',
  rationale: 'DES-017: PII Card design QA passed with recommendations',
  evidenceUrl: 'artifacts/designer/2025-10-21/pii-card-qa.md'
});
```

Call at EVERY validation completion.
