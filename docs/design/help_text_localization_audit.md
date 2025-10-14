---
epoch: 2025.10.E1
doc: docs/design/help_text_localization_audit.md
owner: localization
created: 2025-10-13T23:10:00Z
last_reviewed: 2025-10-13T23:10:00Z
doc_hash: TBD
expires: 2025-11-13
---
# Help Text Localization Audit — Task 10

## Purpose
Audit all help text, tooltips, placeholders, instructional copy, and accessibility labels in the HotDash application for localization readiness, clarity, and consistency.

## Audit Scope
- Form field help text (`helpText` props)
- Input placeholders
- Tooltips and hints
- Aria labels and descriptions
- Instructional copy
- Guide text

## Audit Date
2025-10-13T23:10:00Z

---

## Help Text Inventory

### 1. Picker Payment System

#### AssignPickerModal (`app/components/picker-payments/AssignPickerModal.tsx`)

**Help Text Found**:
- ✅ **"Number of pieces in this order for picker payment calculation"** (Total Pieces field)
- ✅ **"Calculated based on pieces: 1-4 = $2, 5-10 = $4, 11+ = $7"** (Payout Amount field)

**Analysis**:
- Clear and specific
- Provides calculation context
- English-only compliant
- Professional tone

**Status**: GOOD - No changes needed

#### RecordPaymentModal (`app/components/picker-payments/RecordPaymentModal.tsx`)

**Help Text Found**:
- ✅ **"Amount paid to picker"** (Amount field)
- ✅ **"Payment method, check number, etc."** (Notes field)

**Analysis**:
- Clear and concise
- Provides examples ("check number, etc.")
- Professional tone

**Status**: GOOD - No changes needed

### 2. Modal Components

#### CXEscalationModal (`app/components/modals/CXEscalationModal.tsx`)

**Placeholder Found**:
- ✅ **"Add context for audit trail"** (Internal note field)

**Analysis**:
- Clear purpose
- Explains the "why" (audit trail)
- Professional tone

**Status**: GOOD - No changes needed

**Potential Improvement**:
Consider Hot Rod AN voice: "Drop a note for the crew log"

#### SalesPulseModal (`app/components/modals/SalesPulseModal.tsx`)

**Placeholder Found**:
- ✅ **"Add context for the decision log"** (Note field)

**Analysis**:
- Clear purpose
- Explains the "why" (decision log)
- Professional tone

**Status**: GOOD - No changes needed

**Potential Improvement**:
Consider Hot Rod AN voice: "Add notes for the mission log"

### 3. Accessibility Labels

#### TileCard Component (`app/components/tiles/TileCard.tsx`)

**Aria Labels Found**:
- ✅ `aria-labelledby={headingId}` - Proper semantic accessibility

**Analysis**:
- Correctly using ARIA attributes
- No hardcoded text (uses dynamic ID)
- Accessible to screen readers

**Status**: GOOD - Proper implementation

### 4. Missing Help Text Opportunities

#### Areas Lacking Help Text

1. **Approval Actions** (`app/components/ApprovalCard.tsx`)
   - ❌ No help text for approve/reject buttons
   - ❌ No explanation of what actions do
   - **Recommendation**: Add tooltips or help text explaining consequences

2. **Dashboard Tiles** (General)
   - ❌ No help icons or tooltips explaining tile data
   - ❌ No guidance on how to interpret metrics
   - **Recommendation**: Add "?" icons with helpful explanations

3. **Form Validations**
   - ❌ No proactive help text for validation requirements
   - **Recommendation**: Add help text like "Minimum 1 piece required"

---

## Help Text Categories

### Category 1: Form Field Help Text ✅
**Status**: GOOD - Clear and consistent

**Examples Found**:
- "Number of pieces in this order for picker payment calculation"
- "Calculated based on pieces: 1-4 = $2, 5-10 = $4, 11+ = $7"
- "Amount paid to picker"
- "Payment method, check number, etc."

**Quality**: All help text is:
- Clear and concise
- Provides context or examples
- Uses professional language
- English-only compliant

### Category 2: Placeholders ✅
**Status**: GOOD - Descriptive and purposeful

**Examples Found**:
- "Add context for audit trail"
- "Add context for the decision log"

**Quality**: Placeholders:
- Explain the purpose of the field
- Provide context for operators
- Use plain English

### Category 3: Accessibility Labels ✅
**Status**: GOOD - Proper semantic HTML

**Implementation**:
- Using `aria-labelledby` correctly
- Dynamic IDs for proper association
- Screen reader compatible

### Category 4: Missing Help Text ⚠️
**Status**: NEEDS IMPROVEMENT - Key areas lack guidance

**Missing Areas**:
1. **Approval Actions** - No explanation of consequences
2. **Dashboard Tiles** - No help for interpreting data
3. **Error States** - No recovery guidance
4. **Form Validations** - No proactive requirements

---

## Localization Readiness

### English-Only Compliance ✅
**Status**: PASS
- All help text is in English
- No non-English strings detected
- No locale-specific formatting

### i18n Preparation 🟡
**Status**: PARTIAL - Needs centralization

**Current State**:
- Help text is hardcoded in components
- No centralized help text repository
- No translation key system

**Recommendations for Future i18n**:
1. Centralize all help text in `app/copy/help-text.ts`
2. Create key-based lookup system
3. Prepare translation structure

**Example Structure**:
```typescript
// app/copy/help-text.ts
export const HELP_TEXT = {
  PICKER_PAYMENT: {
    TOTAL_PIECES: "Number of pieces in this order for picker payment calculation",
    PAYOUT_AMOUNT: "Calculated based on pieces: 1-4 = $2, 5-10 = $4, 11+ = $7",
    PAYMENT_AMOUNT: "Amount paid to picker",
    PAYMENT_NOTES: "Payment method, check number, etc.",
  },
  ESCALATION: {
    NOTE_PLACEHOLDER: "Add context for audit trail",
  },
  SALES_PULSE: {
    NOTE_PLACEHOLDER: "Add context for the decision log",
  },
  // Future: HELP_TEXT_FR, HELP_TEXT_ES, etc.
};
```

---

## Brand Voice Compliance

### Current Tone Analysis
**Professional/Functional**: ✅ Consistent across all help text

**Characteristics**:
- Clear and direct
- Task-oriented
- No personality or theme
- Generic business language

### Hot Rod AN Voice Opportunities

**Current vs. Themed Examples**:

| Current (Professional) | Hot Rod AN Voice |
|------------------------|------------------|
| "Number of pieces in this order for picker payment calculation" | "Count the parts for pit crew payout" |
| "Add context for audit trail" | "Drop a note for the crew log" |
| "Add context for the decision log" | "Add notes for the mission log" |
| "Amount paid to picker" | "Pit crew earnings" |
| "Payment method, check number, etc." | "How you paid (check #, cash, transfer, etc.)" |

**Recommendation**: 
- Keep professional version as default
- Create Hot Rod AN theme as optional voice
- Make voice configurable per operator preference

---

## Recommendations

### High Priority (P0)

1. **Add Missing Help Text for Approvals**
   - File: `app/components/ApprovalCard.tsx`
   - Add tooltips explaining what approve/reject do
   - Include consequences and next steps

2. **Add Dashboard Tile Help**
   - Files: `app/components/tiles/*.tsx`
   - Add "?" icons with explanations
   - Help operators interpret metrics

3. **Add Form Validation Help**
   - All form components
   - Proactive guidance on requirements
   - Example: "Must be at least 1 piece"

### Medium Priority (P1)

4. **Centralize Help Text**
   - Create `app/copy/help-text.ts`
   - Move all hardcoded help text to centralized file
   - Use constants instead of strings

5. **Expand Accessibility Labels**
   - Review all interactive elements
   - Ensure proper ARIA labels everywhere
   - Add `aria-describedby` for complex interactions

### Low Priority (P2)

6. **Create Hot Rod AN Help Text Variants**
   - Design themed help text
   - Make it configurable
   - A/B test with operators

7. **Prepare i18n Structure**
   - Create translation key system
   - Design help text lookup utilities
   - Document localization process

---

## Implementation Plan

### Phase 1: Add Critical Missing Help Text (2 hours)
- [ ] Add tooltips to ApprovalCard actions
- [ ] Add help icons to dashboard tiles
- [ ] Add form validation help text

### Phase 2: Centralize Help Text (1 hour)
- [ ] Create `app/copy/help-text.ts`
- [ ] Move existing help text to constants
- [ ] Update all components to use centralized copy

### Phase 3: Enhance Accessibility (1 hour)
- [ ] Audit all interactive elements
- [ ] Add missing ARIA labels
- [ ] Add `aria-describedby` for complex UI

### Phase 4: Hot Rod AN Voice (2 hours)
- [ ] Design themed help text variants
- [ ] Create voice toggle system
- [ ] Document themed copy guidelines

**Total Estimated Time**: 6 hours

---

## Files to Update

**High Priority**:
1. `app/components/ApprovalCard.tsx` - Add help text/tooltips
2. `app/components/tiles/TileCard.tsx` - Add help icon system
3. `app/components/tiles/*.tsx` - Add tile-specific help
4. Form validation components - Add requirement guidance

**Medium Priority**:
5. Create `app/copy/help-text.ts` - Centralized help text
6. `app/components/picker-payments/AssignPickerModal.tsx` - Use centralized copy
7. `app/components/picker-payments/RecordPaymentModal.tsx` - Use centralized copy
8. `app/components/modals/CXEscalationModal.tsx` - Use centralized copy
9. `app/components/modals/SalesPulseModal.tsx` - Use centralized copy

**Low Priority**:
10. Create `app/copy/help-text-hotrod.ts` - Themed variants
11. Create `app/components/HelpIcon.tsx` - Reusable help component
12. Create `docs/design/help_text_voice_guide.md` - Voice guidelines

---

## Evidence

**Audit Commands**:
```bash
cd ~/HotDash/hot-dash

# Find all help text
grep -r "helpText\|placeholder\|aria-label\|aria-describedby" app/ --include="*.tsx" --include="*.ts"

# Find tooltips and hints
grep -r "tooltip\|hint\|guide" app/ --include="*.tsx"

# Find instructional text
grep -r "description\|instructions" app/components/ --include="*.tsx"
```

**Audit Results**:
- Total help text instances: 6
- Placeholders: 2
- ARIA labels: 1 (proper usage)
- Missing help text areas: 3 critical (approvals, tiles, validations)

**Files Analyzed**:
- `app/components/picker-payments/AssignPickerModal.tsx` ✅ Has help text
- `app/components/picker-payments/RecordPaymentModal.tsx` ✅ Has help text
- `app/components/modals/CXEscalationModal.tsx` ✅ Has placeholder
- `app/components/modals/SalesPulseModal.tsx` ✅ Has placeholder
- `app/components/tiles/TileCard.tsx` ✅ Has aria-label
- `app/components/ApprovalCard.tsx` ❌ Missing help text

**Quality Assessment**:
- Existing help text: HIGH QUALITY (clear, concise, contextual)
- Coverage: MEDIUM (good in forms, missing in other areas)
- Consistency: GOOD (professional tone throughout)
- Accessibility: GOOD (proper ARIA usage where implemented)

---

## Next Steps

1. **Immediate**: Add missing help text to critical areas (approvals, tiles)
2. **Short-term**: Centralize all help text for maintainability
3. **Medium-term**: Enhance accessibility with comprehensive ARIA labels
4. **Long-term**: Create Hot Rod AN voice variants and i18n structure

---

**Status**: ✅ TASK 10 COMPLETE - Help Text Localization Audit  
**Evidence**: This document  
**Next**: Task 11 - Email Template Localization  
**Logged**: feedback/localization.md

