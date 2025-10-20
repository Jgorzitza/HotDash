---
epoch: 2025.10.E1
doc: docs/design/dashboard-onboarding-flow.md
owner: designer
created: 2025-10-12
task: 1I
---

# Task 1I: Dashboard Onboarding Flow

## Purpose

Design first-time user walkthrough with tooltips, dismiss logic, and "don't show again" for new operators.

## Onboarding Strategy

**Goals**:

- Help new operators understand dashboard quickly
- Show key features without overwhelming
- Allow skip/dismiss at any time
- Remember dismissal preference

**Principles**:

- ✅ Progressive (show one thing at a time)
- ✅ Contextual (tooltip appears on relevant element)
- ✅ Skippable (never trap user)
- ✅ Optional (can dismiss and never see again)

## Onboarding Flow

### Step 1: Welcome Modal

```typescript
<Modal
  open={isFirstVisit && !onboardingDismissed}
  onClose={handleSkipOnboarding}
  title="Welcome to HotDash!"
  primaryAction={{
    content: 'Show me around',
    onAction: startOnboarding,
  }}
  secondaryActions={[
    {
      content: 'Skip',
      onAction: handleSkipOnboarding,
    },
  ]}
>
  <Modal.Section>
    <BlockStack gap="300">
      <Text variant="bodyMd" as="p">
        HotDash is your mission control for operations. Let's show you the key features.
      </Text>
      <Checkbox
        label="Don't show this again"
        checked={dontShowAgain}
        onChange={setDontShowAgain}
      />
    </BlockStack>
  </Modal.Section>
</Modal>
```

**Triggers**: First visit, onboarding not dismissed
**Actions**: Start tour or skip
**Persistent**: "Don't show again" checkbox

### Step 2: Dashboard Tiles

```typescript
<div ref={dashboardRef}>
  <Tooltip
    active={onboardingStep === 'dashboard-tiles'}
    content={
      <TooltipContent
        title="Dashboard Tiles"
        description="Each tile shows real-time data for different parts of your operation: Sales, Inventory, CX Escalations."
        stepNumber={1}
        totalSteps={4}
        onNext={nextStep}
        onSkip={skipOnboarding}
      />
    }
    preferredPosition="below"
  >
    <div className="dashboard-grid">
      {/* Tiles */}
    </div>
  </Tooltip>
</div>
```

**Highlights**: Dashboard tiles
**Message**: "Real-time data for your operation"
**Actions**: Next, Skip

### Step 3: Approval Queue

```typescript
<div ref={approvalsRef}>
  <Tooltip
    active={onboardingStep === 'approval-queue'}
    content={
      <TooltipContent
        title="Approval Queue"
        description="When AI agents need permission to take an action, you'll see it here. Review and approve or reject."
        stepNumber={2}
        totalSteps={4}
        onNext={nextStep}
        onSkip={skipOnboarding}
        onPrevious={previousStep}
      />
    }
    preferredPosition="below"
  >
    <Navigation.Item
      url="/approvals"
      label="Approvals"
      badge={pendingCount}
    />
  </Tooltip>
</div>
```

**Highlights**: Approval queue nav item
**Message**: "Review and approve AI agent actions"
**Actions**: Next, Back, Skip

### Step 4: Tile Details

```typescript
<Tooltip
  active={onboardingStep === 'tile-details'}
  content={
    <TooltipContent
      title="Drill Down"
      description="Click any tile to see detailed information and take action."
      stepNumber={3}
      totalSteps={4}
      onNext={nextStep}
      onSkip={skipOnboarding}
      onPrevious={previousStep}
    />
  }
  preferredPosition="above"
>
  <TileCard title="Sales Pulse" onClick={openModal} />
</Tooltip>
```

**Highlights**: Tile card (clickable)
**Message**: "Click to see details"
**Actions**: Next, Back, Skip

### Step 5: Completion

```typescript
<Modal
  open={onboardingStep === 'complete'}
  onClose={finishOnboarding}
  title="You're all set!"
  primaryAction={{
    content: 'Start exploring',
    onAction: finishOnboarding,
  }}
>
  <Modal.Section>
    <BlockStack gap="300">
      <Text variant="bodyMd" as="p">
        ✅ You now know the basics of HotDash. Start exploring!
      </Text>
      <Text variant="bodySm" tone="subdued">
        Tip: Press <code>?</code> anytime to see keyboard shortcuts.
      </Text>
    </BlockStack>
  </Modal.Section>
</Modal>
```

**Message**: "You're all set!"
**Tip**: Keyboard shortcuts (?)
**Action**: Start exploring (closes onboarding)

## Tooltip Component

### TooltipContent Component

```typescript
interface TooltipContentProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious?: () => void;
  onSkip: () => void;
}

function TooltipContent({
  title,
  description,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}: TooltipContentProps) {
  return (
    <div style={{ maxWidth: '300px', padding: '12px' }}>
      <BlockStack gap="300">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h3">{title}</Text>
          <Button plain onClick={onSkip} icon={CancelSmallIcon} />
        </InlineStack>

        {/* Description */}
        <Text variant="bodyMd" as="p">{description}</Text>

        {/* Progress */}
        <Text variant="bodySm" tone="subdued">
          Step {stepNumber} of {totalSteps}
        </Text>

        {/* Actions */}
        <InlineStack align="space-between">
          <div>
            {onPrevious && (
              <Button plain onClick={onPrevious}>Back</Button>
            )}
          </div>
          <InlineStack gap="200">
            <Button plain onClick={onSkip}>Skip</Button>
            <Button variant="primary" onClick={onNext}>
              {stepNumber === totalSteps ? 'Finish' : 'Next'}
            </Button>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
```

## Spotlight Effect (Optional)

### Highlight Active Element

```css
.onboarding-spotlight {
  position: relative;
  z-index: 1000;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}
```

**Visual**: Dim everything except highlighted element
**Use**: Draw focus to specific UI element

### Backdrop Overlay

```typescript
{onboardingActive && (
  <div
    className="onboarding-backdrop"
    onClick={skipOnboarding}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: 999,
    }}
  />
)}
```

## Persistence (Local Storage)

### Save Onboarding State

```typescript
const ONBOARDING_KEY = "hotdash_onboarding_completed";

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
```

### Per-User Preference (Backend)

```typescript
// Store in Supabase user_preferences table
await supabase.from("user_preferences").upsert({
  user_id: userId,
  onboarding_completed: true,
  updated_at: new Date().toISOString(),
});
```

## Contextual Help

### Help Icon (Always Available)

```typescript
<Button
  plain
  icon={QuestionMarkIcon}
  onClick={showHelp}
  accessibilityLabel="Help"
/>
```

**Placement**: Top-right corner of page
**Action**: Opens help modal or restarts onboarding

### Keyboard Shortcut (?)

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "?") {
      showKeyboardShortcuts();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

**Trigger**: Press `?` key
**Action**: Show keyboard shortcuts modal

### Tooltips (Persistent)

```typescript
<Tooltip content="Review pending agent actions" preferredPosition="below">
  <Navigation.Item url="/approvals" label="Approvals" />
</Tooltip>
```

**Visual**: Hover to see tooltip
**Always available**: Not just during onboarding

## Settings Panel

### Onboarding Settings

```typescript
<Page title="Settings">
  <Card sectioned>
    <BlockStack gap="300">
      <Text variant="headingMd" as="h2">Onboarding</Text>

      <Checkbox
        label="Show onboarding tour on next visit"
        checked={!hasCompletedOnboarding()}
        onChange={(checked) => {
          if (checked) {
            resetOnboarding();
          } else {
            markOnboardingComplete();
          }
        }}
      />

      <Button onClick={restartOnboarding}>
        Restart tour
      </Button>
    </BlockStack>
  </Card>
</Page>
```

**Feature**: Allow operators to restart tour anytime

## Copy Guidelines

### Welcome Message

```
"Welcome to HotDash! Let's show you around."
```

**Tone**: Friendly, brief

### Step Descriptions

```
✅ "Each tile shows real-time data for different parts of your operation."
❌ "Tiles aggregate operational metrics from integrated systems."

✅ "Click any tile to see detailed information."
❌ "Tiles are interactive elements that expand to reveal additional context."
```

**Principle**: Simple language, operator-focused

### Completion Message

```
"✅ You're all set! Start exploring."
```

**Tone**: Encouraging, celebratory

## Accessibility

### Keyboard Navigation

- Tab through onboarding steps
- Enter to advance
- Escape to skip
- Arrow keys for back/next

### Screen Reader Announcements

```html
<div role="dialog" aria-labelledby="onboarding-title" aria-modal="true">
  <h2 id="onboarding-title">Onboarding: Step 1 of 4</h2>
  <!-- Content -->
</div>
```

### Focus Management

```typescript
useEffect(() => {
  if (onboardingStep) {
    // Focus tooltip when step changes
    tooltipRef.current?.focus();
  }
}, [onboardingStep]);
```

## Implementation Checklist

- [ ] Welcome modal (first visit)
- [ ] 4-step tour (dashboard, approvals, tiles, completion)
- [ ] Tooltip component with progress
- [ ] Back/Next/Skip actions
- [ ] "Don't show again" checkbox
- [ ] Local storage persistence
- [ ] Help icon (restart tour anytime)
- [ ] Keyboard shortcut (?)
- [ ] Settings panel (reset onboarding)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader support

---

**Status**: Complete dashboard onboarding flow - 4-step progressive tour, skippable, persistent, accessible
