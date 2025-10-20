---
epoch: 2025.10.E1
doc: docs/design/design-governance-18-22.md
owner: designer
created: 2025-10-11
---

# Design System Governance (Tasks 18-22)

## Task 18: Design Token Management System

**Token Categories**:

- Colors (surface, text, status, borders)
- Spacing (050-1200 scale)
- Typography (size, weight, line-height)
- Effects (shadows, radius, motion)

**Management Process**:

1. Propose new token in design file
2. Review for duplication/necessity
3. Add to tokens.css with Polaris fallback
4. Document in design-system-guide.md
5. Update Figma variables

**Status**: System documented in existing design-system-guide.md

---

## Task 18: Component Versioning and Deprecation

**Versioning Strategy**:

```typescript
// Component version in filename or export
export const ApprovalCardV2 = () => {
  /* new version */
};
export const ApprovalCardV1 = () => {
  /* deprecated */
};

// Deprecation warning
/** @deprecated Use ApprovalCardV2 instead. Will be removed in v2.0.0 */
export const ApprovalCard = ApprovalCardV1;
```

**Deprecation Process**:

1. Mark component as deprecated (TypeScript + JSDoc)
2. Create migration guide
3. Update design-system-guide.md
4. Set removal timeline (1-2 sprints)
5. Remove after migration complete

---

## Task 20: Design Review and Approval Workflow

**Process**:

1. Designer creates specs (markdown + mockups)
2. Tag @engineer in feedback file
3. Engineer reviews and asks questions
4. Designer provides clarifications
5. Engineer implements
6. Designer reviews implementation
7. Sign-off in feedback file

**Review Checklist**:

- [ ] Polaris components used
- [ ] Accessibility requirements met
- [ ] Responsive behavior correct
- [ ] All states implemented
- [ ] Design tokens used

---

## Task 21: Design QA Checklist

**Before Engineer Handoff**:

- [ ] All states designed (loading, error, empty, success)
- [ ] Responsive breakpoints specified
- [ ] Accessibility requirements documented
- [ ] Polaris components specified
- [ ] TypeScript interfaces provided
- [ ] Implementation examples included

**After Implementation**:

- [ ] Visual accuracy (matches mockups)
- [ ] Spacing correct (uses tokens)
- [ ] Colors correct (uses Polaris)
- [ ] Interactive states work (hover, focus, active)
- [ ] Keyboard navigation functional
- [ ] Screen reader announces correctly

---

## Task 22: Design System Documentation Site

**Structure** (using existing docs/design/ directory):

```
docs/design/
  ├── README.md (index of all design docs)
  ├── design-system-guide.md (component reference)
  ├── tokens/ (color, spacing, typography)
  ├── components/ (component specs)
  ├── patterns/ (common UI patterns)
  └── accessibility/ (WCAG guidelines)
```

**Already Exists**: Most documentation complete in docs/design/

**Enhancement**: Create index/README for easy navigation

**Status**: All 5 governance specs complete
