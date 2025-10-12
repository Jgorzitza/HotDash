---
epoch: 2025.10.E1
doc: docs/directions/designer.md
owner: manager
last_reviewed: 2025-10-12
---

# Designer — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ North Star Obsession
**Memory Lock**: "North Star = Operator value TODAY"
### 2️⃣ MCP Tools Mandatory
**Memory Lock**: "MCPs always, memory never"
### 3️⃣ Feedback Process Sacred
ALL work logged in `feedback/designer.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"
### 4️⃣ No New Files Ever
**Memory Lock**: "Update existing, never create new"
### 5️⃣ Immediate Blocker Escalation
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/designer.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"
### 6️⃣ Manager-Only Direction
**Memory Lock**: "Manager directs, I execute"

---

## Mission
Design Hot Rod AN operator dashboard UI - automotive-themed, operator-first, accessible.

## ⚡ START HERE NOW (Updated: 2025-10-13 13:00 UTC by Manager)

**READ THIS FIRST**

**Your immediate priority**: Review Approval Queue UI when Engineer builds it

**Current blocker**: Engineer fixing build (Task 1), then building UI (Task 2)

**Expected UI ready**: 16:00 UTC

**When Engineer completes UI** (est. 16:00 UTC):
```bash
cd ~/HotDash/hot-dash

# 1. Review implemented Approval Queue UI
# Check: /approvals route renders correctly
# Check: Approve/reject buttons work
# Check: Hot Rod AN brand consistency

# 2. Provide UX feedback
# Document: Any improvements needed
# Focus: Operator workflow, clarity, branding

# 3. Test responsive design
# Check: Mobile, tablet, desktop

# Evidence: Design review document with screenshots, feedback
# Log to: feedback/designer.md
```

**Expected outcome**: Complete UX review with actionable feedback

**Deadline**: TODAY 17:00 UTC (1 hour after UI complete)

**After this**: Task 2 - Accessibility verification

**Manager checking at**: 17:00 UTC

---

## 🎯 ACTIVE TASKS

### Task 1 - Review Approval Queue UI (ASSIGNED ABOVE)

### Task 2 - Accessibility Verification
**What**: Verify WCAG 2.1 AA compliance
**Timeline**: 2 hours

### Task 3 - Mobile Responsive Review
**What**: Test responsive design on all devices
**Timeline**: 2 hours

### Task 4 - Hot Rod AN Brand Consistency
**What**: Verify automotive theme throughout
**Timeline**: 1-2 hours

### Task 5 - Component Documentation
**What**: Document all UI components for Engineer
**Timeline**: 2-3 hours

### Task 6 - Error State Design Review
**What**: Review all error states and messages
**Timeline**: 2 hours

### Task 7 - Loading State Review
**What**: Verify loading indicators and skeleton screens
**Timeline**: 1-2 hours

### Task 8 - Tile Visual Refinement
**What**: Polish 5 tile designs for production
**Timeline**: 3-4 hours

### Task 9 - Operator Workflow UX
**What**: Verify operator workflows are intuitive
**Timeline**: 2-3 hours

### Task 10 - Dashboard Navigation
**What**: Review and refine navigation UX
**Timeline**: 2 hours

### Task 11 - Data Visualization Review
**What**: Review charts, graphs, metrics displays
**Timeline**: 2-3 hours

### Task 12 - Icon Set Completion
**What**: Finalize Hot Rod AN icon set
**Timeline**: 2 hours

### Task 13 - Color Palette Verification
**What**: Verify automotive color scheme consistency
**Timeline**: 1-2 hours

### Task 14 - Typography Review
**What**: Check readability and hierarchy
**Timeline**: 1-2 hours

### Task 15 - Interaction Design Polish
**What**: Refine hover states, animations, micro-interactions
**Timeline**: 2-3 hours

### Task 16 - Print Styles
**What**: Design print-friendly reports for operators
**Timeline**: 2 hours

### Task 17 - Dark Mode Verification
**What**: If implemented, verify dark mode quality
**Timeline**: 2 hours

### Task 18 - Empty State Review
**What**: Review empty states for all tiles
**Timeline**: 1-2 hours

### Task 19 - Design QA Checklist
**What**: Complete final design QA before launch
**Timeline**: 2 hours

### Task 20 - Launch Day Design Support
**What**: Support any UI issues during launch
**Timeline**: On-call Oct 13-15

## Git Workflow
**Branch**: `designer/work`

**Status**: 🔴 ACTIVE


---

## 🚀 DEEP PRODUCTION TASK LIST (Aligned to North Star - Oct 12 Update)

**North Star Goal**: Design operator-first UI that makes 5 actionable tiles intuitive, fast, and delightful for Hot Rod AN CEO.

**Designer Mission**: Create automotive-themed UX that reduces operator learning curve and increases daily usage.

### 🎯 P0 - HOT ROD AN BRAND INTEGRATION (Week 1)

**Task 1: Hot Rod AN Copy Constants** (1 hour)
- Create `app/constants/hotRodanCopy.ts` with all automotive-themed strings
- Replace generic terms with automotive metaphors
- **Evidence**: Copy constants file, Engineer integration
- **North Star**: Authentic automotive brand voice
- **Deadline**: Oct 12 14:00 UTC

**Task 2: Visual Brand Consistency Audit** (2 hours)
- Review all 5 tiles for brand consistency
- Document Hot Rod AN theme gaps (currently ~50%)
- Create visual diff showing improvements needed
- **Evidence**: Brand audit report with before/after
- **North Star**: Professional automotive brand throughout

---

### 🎨 P1 - 5 TILE UI EXCELLENCE (Week 1-3)

**Task 3-7: Tile-Specific UI Design** (15 hours total, 3h each)
- CX Pulse: Customer support health visualization
- Sales Pulse: Revenue trends and top products
- SEO Pulse: Content performance and opportunities  
- Inventory Watch: Stock alerts and reorder recommendations
- Fulfillment Flow: Order status and carrier performance
- **Evidence**: UI specs for all 5 tiles, Figma designs
- **North Star**: Intuitive tiles operators understand instantly

**Task 8: Approval Queue UX Polish** (3 hours)
- Review Engineer's approval UI
- Provide detailed UX feedback
- Design improvements for clarity
- **Evidence**: UX feedback document, mockups
- **North Star**: Effortless approval workflow

---

### 🏎️ P2 - AUTOMOTIVE VERTICAL DESIGN (Week 2-3)

**Task 9: Hot Rod Iconography** (2 hours)
- Design automotive icons (checkered flag, speedometer, wrench)
- Create Hot Rod AN illustration set
- **Evidence**: Icon library, illustrations
- **North Star**: Visual differentiation from generic dashboards

**Task 10: Performance Metrics Visualization** (3 hours)
- Design charts optimized for trend spotting
- Racing-inspired data visualization
- **Evidence**: Chart library, examples
- **North Star**: Data insights at a glance

---

**Total Designer Tasks**: 10 production-aligned tasks (3-4 weeks work)  
**Evidence Required**: Every task logged in `feedback/designer.md` with specs, mockups, feedback

