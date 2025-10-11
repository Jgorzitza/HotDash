---
epoch: 2025.10.E1
doc: docs/design/design-system-governance-80-87.md
owner: designer
created: 2025-10-11
---

# Design System Governance (Tasks 80-87)

## Task 80: Design Token Governance Model

**Token Governance Structure**:

### Token Hierarchy
```
Base Tokens (Global)
  └─> Semantic Tokens (Context-specific)
      └─> Component Tokens (Component-specific)
```

### Example
```css
/* Base Token */
--color-blue-500: #2c6ecb;

/* Semantic Token */
--color-interactive-primary: var(--color-blue-500);

/* Component Token */
--button-primary-bg: var(--color-interactive-primary);
```

**Token Naming Convention**:
```css
--{category}-{property}-{variant}-{state}

Examples:
--color-bg-surface-hover
--spacing-block-large
--typography-heading-size-xl
--border-radius-card
```

**Token Update Process**:
1. **Propose** - Designer submits token change request
2. **Review** - Design system team reviews impact
3. **Test** - Engineer implements in staging
4. **Validate** - Designer reviews visual changes
5. **Document** - Update token documentation
6. **Release** - Deploy to production with changelog

**Token Versioning**:
```json
{
  "tokens": {
    "version": "1.2.0",
    "lastUpdated": "2025-10-11",
    "changes": [
      {
        "version": "1.2.0",
        "date": "2025-10-11",
        "changes": [
          "Added --color-status-expired tokens",
          "Updated --spacing-card-gap from 16px to 20px"
        ]
      }
    ]
  }
}
```

**Token Deprecation**:
```css
/* Deprecated token (mark for removal) */
--color-old-primary: #1a73e8; /* @deprecated v1.2.0 - Use --color-interactive-primary instead */

/* New token */
--color-interactive-primary: #2c6ecb;
```

**Status**: Token governance model documented

---

## Task 81: Component Deprecation Strategy

**Deprecation Lifecycle**:

### Phase 1: Mark as Deprecated (v1.0)
```typescript
/**
 * @deprecated Since v1.2.0. Use ApprovalCardV2 instead.
 * Will be removed in v2.0.0
 */
export function ApprovalCard(props: ApprovalCardProps) {
  console.warn('ApprovalCard is deprecated. Use ApprovalCardV2 instead.');
  return <ApprovalCardV2 {...props} />;
}
```

### Phase 2: Migration Guide
```markdown
## Migration Guide: ApprovalCard → ApprovalCardV2

**Deprecated**: `ApprovalCard` (v1.0)
**Replacement**: `ApprovalCardV2` (v1.2+)
**Removal**: v2.0.0 (estimated Q1 2026)

### What Changed
- New prop: `riskLevel` (required)
- Removed prop: `priority` (use `riskLevel` instead)
- Updated styling to match Polaris 2024

### Migration
```typescript
// Before (deprecated)
<ApprovalCard priority="high" conversationId={101} />

// After (current)
<ApprovalCardV2 riskLevel="high" conversationId={101} />
```

### Automated Migration (codemod)
```bash
npx @hotdash/codemod approval-card-v1-to-v2
```
```

### Phase 3: Grace Period (6 months)
- Component still works but logs warnings
- Migration guide prominently displayed
- Automated codemods available

### Phase 4: Removal (v2.0)
- Component removed from codebase
- Breaking change documented in changelog
- Major version bump

**Deprecation Communication**:
1. **Changelog** - Document in release notes
2. **Console warnings** - Log when deprecated component used
3. **TypeScript errors** - Mark props as deprecated
4. **Slack notification** - Notify team of deprecations
5. **Documentation** - Update docs site

**Status**: Component deprecation strategy documented

---

## Task 82: Design System Roadmap & Versioning

**Semantic Versioning** (MAJOR.MINOR.PATCH):
- **MAJOR** (v2.0.0) - Breaking changes (component removal, prop changes)
- **MINOR** (v1.2.0) - New features (new components, new tokens)
- **PATCH** (v1.1.1) - Bug fixes (visual tweaks, accessibility fixes)

**Design System Roadmap** (2025-2026):

### Q4 2025 (v1.2.0) - Current
- ✅ Approval Queue UI
- ✅ Agent Performance Metrics
- ✅ Mobile Responsive Optimization
- ✅ Dark Mode Support

### Q1 2026 (v1.3.0) - Planned
- Advanced Data Tables
- Multi-step Forms
- Chart Library (Recharts integration)
- Command Palette (Cmd+K)

### Q2 2026 (v1.4.0) - Planned
- Dashboard Customization (drag-drop)
- Operator Workspace Personalization
- Multi-view Layouts (list/grid/kanban)
- Bulk Operations UI

### Q3 2026 (v2.0.0) - Major Release
- **Breaking Changes**:
  - Remove deprecated ApprovalCard (use V2)
  - Update to Polaris 2026 (new tokens)
  - React 19 requirement
- **New Features**:
  - Voice Interface
  - AI-Powered Design Tools
  - Adaptive Interfaces

**Versioning Process**:
1. **Plan** - Design system team plans upcoming features
2. **Design** - Designer creates specs
3. **Develop** - Engineer implements
4. **Test** - QA validates
5. **Document** - Update docs
6. **Release** - Publish new version with changelog

**Changelog Example**:
```markdown
## [1.2.0] - 2025-10-11

### Added
- New ApprovalCardV2 component with improved accessibility
- Dark mode support for all components
- Mobile-responsive layouts for approval queue
- 20 new design tokens for status states

### Changed
- Updated Button component styling to match Polaris 2024
- Improved keyboard navigation in modals

### Deprecated
- ApprovalCard (use ApprovalCardV2 instead)

### Fixed
- Color contrast issues in Badge component
- Focus indicator visibility in dark mode
```

**Status**: Design system roadmap and versioning documented

---

## Task 83: Contribution Guidelines for Designers

**How to Contribute to HotDash Design System**:

### 1. Before You Start
- Review existing components (docs/design/)
- Check if component already exists
- Search for similar patterns
- Consult with Design System Owner (Designer agent)

### 2. Component Proposal
```markdown
## Component Proposal: [Component Name]

**Problem**: What user need does this solve?
**Use Cases**: Where will this be used? (3+ examples)
**Existing Alternatives**: Why don't existing components work?
**Accessibility**: How will this meet WCAG 2.2 AA?
**Polaris Alignment**: Which Polaris components will be used?

**Design**:
- [Attach mockup/screenshot]
- [Define states: default, hover, focus, disabled, error]

**Props** (TypeScript interface):
```typescript
interface NewComponentProps {
  // ...
}
```

**Questions**:
- [ ] Responsive? (mobile, tablet, desktop)
- [ ] Dark mode? (light + dark variants)
- [ ] RTL support? (if text-heavy)
```

### 3. Design Review Process
1. **Submit** - Create proposal in feedback/designer.md
2. **Review** - Designer agent reviews within 24 hours
3. **Iterate** - Address feedback, update proposal
4. **Approve** - Designer agent approves for implementation
5. **Implement** - Engineer builds component
6. **Validate** - Designer reviews implementation
7. **Document** - Add to design system docs
8. **Release** - Component available in next version

### 4. Design System Contribution Checklist
- [ ] Component solves a real user need
- [ ] No existing component can be adapted
- [ ] Aligns with Polaris design principles
- [ ] Meets WCAG 2.2 AA accessibility
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Dark mode variant designed
- [ ] All states defined (default, hover, focus, disabled, error)
- [ ] TypeScript props interface provided
- [ ] Usage examples provided (3+)
- [ ] Edge cases considered (empty, loading, error)

### 5. Design File Structure
```
docs/design/
  components/
    [component-name]-spec.md
  tokens/
    [token-category].md
  patterns/
    [pattern-name].md
```

**Status**: Contribution guidelines documented

---

## Task 84: Design Review & Approval Process

**Review Process** (already documented in Task 20):

### Step-by-Step Review
```
1. Designer creates spec → Tag @engineer
   ↓
2. Engineer reviews spec → Ask questions
   ↓
3. Designer clarifies → Update spec
   ↓
4. Engineer implements → Tag @designer
   ↓
5. Designer reviews implementation → Provide feedback
   ↓
6. Engineer revises → Tag @designer
   ↓
7. Designer approves → Sign-off in feedback
   ↓
8. Ready for production
```

### Review Criteria
**Design Spec Review** (before implementation):
- [ ] Aligns with Polaris design system
- [ ] Meets WCAG 2.2 AA accessibility
- [ ] Responsive breakpoints defined
- [ ] All states documented (default, hover, focus, disabled, error, loading)
- [ ] Edge cases covered (empty, error, success)
- [ ] TypeScript props interface provided
- [ ] Usage examples clear

**Implementation Review** (after engineering):
- [ ] Matches design spec visually
- [ ] Uses correct Polaris components
- [ ] Uses design tokens (not hardcoded values)
- [ ] Responsive as designed
- [ ] Accessible (keyboard, screen reader)
- [ ] Dark mode works
- [ ] Edge cases handled

### Approval Sign-off
```markdown
## Design Approval: ApprovalCardV2

**Designer**: @designer-agent
**Date**: 2025-10-11
**Status**: ✅ APPROVED

**Review Notes**:
- Visual implementation matches spec
- Accessibility validated (keyboard, screen reader)
- Responsive breakpoints work correctly
- Dark mode tested and approved

**Minor Tweaks Requested**:
- Increase padding on mobile to 16px
- Adjust badge color contrast (+0.5 ratio)

**Approved for Production**: Yes, pending minor tweaks
```

**Status**: Design review and approval process documented

---

## Task 85: Design System Metrics Dashboard

**Design System Health Metrics**:

### Adoption Metrics
```typescript
interface AdoptionMetrics {
  componentsUsed: number;        // 15 of 20 components in use
  componentCoverage: number;     // 75% of UI uses design system
  tokenUsage: number;            // 90% use tokens (vs hardcoded)
  pagesCompliant: number;        // 8 of 10 pages fully compliant
}
```

**Dashboard UI**:
```typescript
<Page title="Design System Metrics">
  <Layout>
    <Layout.Section>
      <InlineGrid columns={4} gap="400">
        <MetricCard
          label="Component Usage"
          value="15/20"
          percentage={75}
          trend="+3 this month"
        />
        <MetricCard
          label="Token Adoption"
          value="90%"
          percentage={90}
          trend="+5%"
        />
        <MetricCard
          label="Accessibility Score"
          value="98%"
          percentage={98}
          trend="Stable"
        />
        <MetricCard
          label="Design Debt"
          value="5 issues"
          percentage={90}
          trend="-2 resolved"
        />
      </InlineGrid>
    </Layout.Section>
    
    <Layout.Section>
      <Card>
        <Text variant="headingMd" as="h2">Component Adoption</Text>
        <DataTable
          columnContentTypes={['text', 'numeric', 'numeric', 'text']}
          headings={['Component', 'Usage Count', 'Pages', 'Status']}
          rows={[
            ['ApprovalCard', 42, 3, <Badge tone="success">Active</Badge>],
            ['TileCard', 28, 5, <Badge tone="success">Active</Badge>],
            ['MetricCard', 15, 2, <Badge tone="warning">Low Usage</Badge>],
            // ...
          ]}
        />
      </Card>
    </Layout.Section>
    
    <Layout.Section>
      <Card>
        <Text variant="headingMd" as="h2">Design Debt</Text>
        <List type="bullet">
          <List.Item>3 components using hardcoded colors (migrate to tokens)</List.Item>
          <List.Item>2 pages missing dark mode support</List.Item>
          <List.Item>1 component below WCAG AA contrast (Badge)</List.Item>
        </List>
      </Card>
    </Layout.Section>
  </Layout>
</Page>
```

**Tracking Implementation**:
```typescript
// Track component usage
export function trackComponentUsage(componentName: string) {
  analytics.track('component_rendered', { component: componentName });
}

// Track token vs hardcoded
export function auditTokenUsage() {
  const stylesheets = document.styleSheets;
  let tokenCount = 0;
  let hardcodedCount = 0;
  
  // Scan for var(--*) vs hardcoded values
  // ...
  
  return { tokenCount, hardcodedCount, percentage: tokenCount / (tokenCount + hardcodedCount) };
}
```

**Status**: Design system metrics dashboard designed

---

## Task 86: Designer-Developer Handoff Automation

**Handoff Workflow**:

### 1. Figma → Code Export
```bash
# Figma plugin exports design tokens
npx figma-export --file-id ABC123 --output tokens.json

# Convert to CSS variables
npx token-transformer tokens.json --format css --output app/styles/tokens.css
```

### 2. Component Spec Generation
```markdown
## Auto-Generated Spec: ApprovalCard

**Source**: Figma frame "Approval Card / Default"
**Last Updated**: 2025-10-11 15:30 UTC

**Dimensions**:
- Width: 400px (desktop), 100% (mobile)
- Height: Auto
- Padding: 20px

**Colors**:
- Background: var(--p-color-bg-surface)
- Border: var(--p-color-border-subdued)
- Text: var(--p-color-text)

**Typography**:
- Heading: --p-font-size-300 (16px), --p-font-weight-semibold
- Body: --p-font-size-200 (14px), --p-font-weight-regular

**Spacing**:
- Gap: var(--p-space-400) (16px)

**States**:
- Default: [exported]
- Hover: [exported]
- Focus: [exported]
```

### 3. Design Review Automation
```typescript
// Automated visual regression testing
import { test, expect } from '@playwright/test';

test('ApprovalCard matches design', async ({ page }) => {
  await page.goto('/storybook?path=/story/approvalcard--default');
  
  // Screenshot current implementation
  const screenshot = await page.screenshot();
  
  // Compare to design reference
  expect(screenshot).toMatchSnapshot('approval-card-default.png', {
    threshold: 0.1, // 10% tolerance
  });
});
```

### 4. Design Handoff Checklist (Automated)
```yaml
# .github/workflows/design-handoff-check.yml
name: Design Handoff Check
on: [pull_request]

jobs:
  design-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Polaris component usage
        run: npm run lint:polaris
        
      - name: Check design token usage
        run: npm run lint:tokens
        
      - name: Check accessibility
        run: npm run test:a11y
        
      - name: Visual regression
        run: npm run test:visual
        
      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: '✅ Design handoff checks passed!'
            })
```

**Status**: Designer-developer handoff automation documented

---

## Task 87: Design System Documentation Site

**Documentation Site Structure**:

```
docs/design/
├── index.md (Overview)
├── getting-started.md
├── principles.md
├── components/
│   ├── approval-card.md
│   ├── tile-card.md
│   └── ...
├── tokens/
│   ├── colors.md
│   ├── spacing.md
│   ├── typography.md
│   └── ...
├── patterns/
│   ├── responsive.md
│   ├── accessibility.md
│   └── ...
├── guidelines/
│   ├── contribution.md
│   ├── deprecation.md
│   └── ...
└── changelog.md
```

**Documentation Format** (per component):
```markdown
# ApprovalCard Component

## Overview
Displays a pending agent action that requires operator approval.

## Usage
```typescript
import { ApprovalCard } from '~/components/ApprovalCard';

<ApprovalCard
  conversationId={101}
  riskLevel="high"
  toolName="send_email"
  toolArgs={{ to: "customer@example.com", subject: "Billing" }}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| conversationId | number | Yes | - | Chatwoot conversation ID |
| riskLevel | 'low' \| 'medium' \| 'high' | Yes | - | Risk assessment |
| toolName | string | Yes | - | Name of agent tool |
| toolArgs | object | Yes | - | Tool arguments |
| onApprove | () => void | Yes | - | Approve callback |
| onReject | () => void | Yes | - | Reject callback |

## Examples
### High Risk Approval
[Screenshot]

### Low Risk Approval
[Screenshot]

### Mobile View
[Screenshot]

## Accessibility
- ✅ WCAG 2.2 AA compliant
- ✅ Keyboard navigable (Tab, Enter)
- ✅ Screen reader optimized
- ✅ Focus indicators visible
- ✅ Color contrast ≥4.5:1

## Design Tokens Used
- `--p-color-bg-surface` - Card background
- `--p-color-border-subdued` - Card border
- `--p-space-400` - Internal spacing
- `--p-font-size-300` - Heading size

## Related Components
- TileCard (for dashboard tiles)
- Badge (for risk indicators)

## Changelog
- **v1.2.0** (2025-10-11) - Initial release
```

**Documentation Site** (using static site generator):
```bash
# Generate docs site
npx @shopify/polaris-docs build

# Preview locally
npx @shopify/polaris-docs dev
```

**Status**: Design system documentation site structure documented

---

**All 8 Design System Governance tasks complete**

