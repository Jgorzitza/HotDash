---
epoch: 2025.10.E1
doc: docs/design/onboarding-flow-wireframes.md
owner: designer
created: 2025-10-21
last_reviewed: 2025-10-21
doc_hash: TBD
expires: 2025-11-21
---

# Onboarding Flow Wireframes — Hot Rod AN Control Center

**Status**: Ready for Implementation (Phase 9)  
**Polaris Version**: Latest  
**Target**: First-time user experience (4-step tour)  
**Brand Voice**: Hot Rodan (automotive, performance, pit crew metaphors)

---

## Overview

### Purpose

Guide new operators through Hot Rod AN Control Center with a 4-step interactive tour that:

- Introduces dashboard functionality (8 tiles)
- Explains HITL approval workflow
- Demonstrates notification system
- Shows personalization options

### Design Principles

1. **Progressive Disclosure**: One concept per step, not overwhelming
2. **Hot Rodan Voice**: Automotive metaphors ("pit stop", "control center", "dashboard")
3. **Accessibility First**: Keyboard navigation, screen reader support, WCAG 2.2 AA
4. **Mobile Responsive**: Works on all devices (320px to 1920px)
5. **Skippable**: Users can "Skip Tour" at any time

### Components Used

- **Modal** (Polaris) - Full-screen overlay for tour steps
- **Button** (Polaris) - Primary/Secondary actions
- **ProgressBar** (Polaris) - Visual tour progress (1/4, 2/4, 3/4, 4/4)
- **Text** (Polaris) - Body copy and headings
- **Icon** (Polaris) - Visual reinforcement

---

## Wireframe 1: Welcome Screen

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Hot Rod AN Control Center                            [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                        🏁 [Icon]                             │
│                                                              │
│              Welcome to Your Pit Crew Command Center         │
│                                                              │
│         Hot Rod AN helps you run your shop at full speed.   │
│         Let's take a quick tour of your new dashboard.       │
│                                                              │
│                  [Take the Tour]   [Skip Tour]               │
│                                                              │
│                      Takes 2 minutes                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Microcopy

**Title**: "Welcome to Your Pit Crew Command Center"

**Body**: 
"Hot Rod AN helps you run your shop at full speed. Let's take a quick tour of your new dashboard."

**Primary Button**: "Take the Tour"

**Secondary Button**: "Skip Tour"

**Helper Text**: "Takes 2 minutes"

### Polaris Implementation

```tsx
<Modal
  open={showOnboarding}
  onClose={handleSkipTour}
  title="Welcome to Your Pit Crew Command Center"
  size="large"
  primaryAction={{
    content: 'Take the Tour',
    onAction: handleStartTour,
  }}
  secondaryActions={[
    {
      content: 'Skip Tour',
      onAction: handleSkipTour,
    },
  ]}
>
  <Modal.Section>
    <BlockStack gap="400" align="center">
      <Icon source={FlagIcon} tone="info" />
      
      <Text variant="headingLg" as="h2" alignment="center">
        Welcome to Your Pit Crew Command Center
      </Text>
      
      <Text variant="bodyLg" as="p" alignment="center">
        Hot Rod AN helps you run your shop at full speed. 
        Let's take a quick tour of your new dashboard.
      </Text>
      
      <Text variant="bodySm" as="p" tone="subdued" alignment="center">
        Takes 2 minutes
      </Text>
    </BlockStack>
  </Modal.Section>
</Modal>
```

### Accessibility Notes

- **Focus Management**: Focus on "Take the Tour" button on open
- **Keyboard Navigation**: Tab to navigate, Enter to activate, Escape to close
- **Screen Reader**: Announces "Welcome modal, Welcome to Your Pit Crew Command Center"
- **ARIA**: `role="dialog"`, `aria-labelledby="modal-title"`, `aria-describedby="modal-description"`
- **Color Contrast**: Text meets WCAG 2.2 AA (4.5:1 minimum)

---

## Wireframe 2: Step 1 — Dashboard Overview

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Tour Step 1 of 4                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 25% │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      📊 [Dashboard Icon]                     │
│                                                              │
│                   Your Dashboard Command Center              │
│                                                              │
│    Your dashboard shows 8 live tiles with key metrics:      │
│                                                              │
│    • Revenue & Sales (track pit stop performance)           │
│    • CX Queue (customer messages waiting)                   │
│    • Inventory Alerts (stock running low)                   │
│    • Approval Queue (actions needing your review)           │
│    • SEO Status (search engine health)                      │
│    • Idea Pool (product suggestions from AI)                │
│    • CEO Agent Activity (what the AI is doing)              │
│    • Unread Messages (Chatwoot notifications)               │
│                                                              │
│    All tiles update in real-time so you're always in sync.  │
│                                                              │
│                     [Back]    [Next: Approvals]             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Microcopy

**Title**: "Your Dashboard Command Center"

**Body**:
"Your dashboard shows 8 live tiles with key metrics:

• **Revenue & Sales** (track pit stop performance)
• **CX Queue** (customer messages waiting)
• **Inventory Alerts** (stock running low)
• **Approval Queue** (actions needing your review)
• **SEO Status** (search engine health)
• **Idea Pool** (product suggestions from AI)
• **CEO Agent Activity** (what the AI is doing)
• **Unread Messages** (Chatwoot notifications)

All tiles update in real-time so you're always in sync."

**Primary Button**: "Next: Approvals"

**Secondary Button**: "Back"

**Progress**: "Step 1 of 4" + 25% progress bar

### Polaris Implementation

```tsx
<Modal
  open={currentStep === 1}
  onClose={handleSkipTour}
  title="Your Dashboard Command Center"
  size="large"
  primaryAction={{
    content: 'Next: Approvals',
    onAction: () => setCurrentStep(2),
  }}
  secondaryActions={[
    {
      content: 'Back',
      onAction: () => setCurrentStep(0),
    },
    {
      content: 'Skip Tour',
      onAction: handleSkipTour,
      plain: true,
    },
  ]}
>
  <Modal.Section>
    <BlockStack gap="300">
      <ProgressBar progress={25} tone="primary" />
      
      <Text variant="bodySm" as="p" tone="subdued">
        Step 1 of 4
      </Text>
      
      <Icon source={DashboardIcon} tone="info" />
      
      <Text variant="headingMd" as="h3">
        Your Dashboard Command Center
      </Text>
      
      <Text variant="bodyMd" as="p">
        Your dashboard shows 8 live tiles with key metrics:
      </Text>
      
      <List type="bullet">
        <List.Item><Text as="span" fontWeight="semibold">Revenue & Sales</Text> (track pit stop performance)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">CX Queue</Text> (customer messages waiting)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">Inventory Alerts</Text> (stock running low)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">Approval Queue</Text> (actions needing your review)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">SEO Status</Text> (search engine health)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">Idea Pool</Text> (product suggestions from AI)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">CEO Agent Activity</Text> (what the AI is doing)</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">Unread Messages</Text> (Chatwoot notifications)</List.Item>
      </List>
      
      <Text variant="bodyMd" as="p" tone="success">
        All tiles update in real-time so you're always in sync.
      </Text>
    </BlockStack>
  </Modal.Section>
</Modal>
```

### Accessibility Notes

- **Progress Indicator**: ProgressBar with 25% completion, announced as "Step 1 of 4, 25% complete"
- **Keyboard Navigation**: Tab through buttons, Enter to activate
- **Screen Reader**: Reads list items clearly with bullet point structure
- **Focus Trap**: Focus stays within modal, cannot tab outside
- **Semantic HTML**: Uses List component for proper `<ul><li>` structure
- **Color Independence**: Information not conveyed by color alone (text + icons)

---

## Wireframe 3: Step 2 — Approval Queue Workflow (HITL)

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Tour Step 2 of 4                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 50% │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      ✓ [Approval Icon]                       │
│                                                              │
│                  You're In Control: HITL Approvals           │
│                                                              │
│    Hot Rod AN's AI agents draft actions for you,            │
│    but YOU make the final call. Here's how it works:        │
│                                                              │
│    1. AI drafts a customer reply or inventory order         │
│    2. Action appears in your Approval Queue                 │
│    3. You review: See the draft, evidence, and impact       │
│    4. You decide: Approve, Edit, or Reject                  │
│    5. If approved: Action executes automatically            │
│                                                              │
│    Think of it like a pit crew chief:                       │
│    Your team (AI) does the prep work,                       │
│    you give the green light for execution.                  │
│                                                              │
│                [Back]    [Next: Notifications]               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Microcopy

**Title**: "You're In Control: HITL Approvals"

**Body**:
"Hot Rod AN's AI agents draft actions for you, but **YOU** make the final call. Here's how it works:

1. **AI drafts** a customer reply or inventory order
2. **Action appears** in your Approval Queue
3. **You review**: See the draft, evidence, and impact
4. **You decide**: Approve, Edit, or Reject
5. **If approved**: Action executes automatically

**Think of it like a pit crew chief**: Your team (AI) does the prep work, you give the green light for execution."

**Primary Button**: "Next: Notifications"

**Secondary Button**: "Back"

**Progress**: "Step 2 of 4" + 50% progress bar

### Polaris Implementation

```tsx
<Modal
  open={currentStep === 2}
  onClose={handleSkipTour}
  title="You're In Control: HITL Approvals"
  size="large"
  primaryAction={{
    content: 'Next: Notifications',
    onAction: () => setCurrentStep(3),
  }}
  secondaryActions={[
    {
      content: 'Back',
      onAction: () => setCurrentStep(1),
    },
    {
      content: 'Skip Tour',
      onAction: handleSkipTour,
      plain: true,
    },
  ]}
>
  <Modal.Section>
    <BlockStack gap="300">
      <ProgressBar progress={50} tone="primary" />
      
      <Text variant="bodySm" as="p" tone="subdued">
        Step 2 of 4
      </Text>
      
      <Icon source={CheckCircleIcon} tone="success" />
      
      <Text variant="headingMd" as="h3">
        You're In Control: HITL Approvals
      </Text>
      
      <Text variant="bodyMd" as="p">
        Hot Rod AN's AI agents draft actions for you, but <Text as="span" fontWeight="bold">YOU</Text> make the final call. Here's how it works:
      </Text>
      
      <List type="number">
        <List.Item><Text as="span" fontWeight="semibold">AI drafts</Text> a customer reply or inventory order</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">Action appears</Text> in your Approval Queue</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">You review</Text>: See the draft, evidence, and impact</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">You decide</Text>: Approve, Edit, or Reject</List.Item>
        <List.Item><Text as="span" fontWeight="semibold">If approved</Text>: Action executes automatically</List.Item>
      </List>
      
      <Banner tone="info">
        <Text variant="bodyMd" as="p">
          <Text as="span" fontWeight="bold">Think of it like a pit crew chief</Text>: Your team (AI) does the prep work, you give the green light for execution.
        </Text>
      </Banner>
    </BlockStack>
  </Modal.Section>
</Modal>
```

### Accessibility Notes

- **Progress Indicator**: ProgressBar at 50%, announced as "Step 2 of 4, 50% complete"
- **Ordered List**: Uses semantic `<ol>` for numbered steps, screen readers announce "List with 5 items"
- **Emphasis**: Bold text uses `<strong>` (not just CSS), properly announced
- **Banner Component**: Info tone provides visual + semantic grouping for key concept
- **Focus Management**: Focus on "Next: Notifications" button
- **Keyboard**: All interactive elements keyboard accessible
- **ARIA**: Proper list semantics, heading hierarchy (h3 within modal)

---

## Wireframe 4: Step 3 — Notification System

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Tour Step 3 of 4                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75% │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      🔔 [Notification Icon]                  │
│                                                              │
│                  Stay Updated: Notification System           │
│                                                              │
│    Never miss a beat with our 3-layer notification system:  │
│                                                              │
│    🟢 Toast Notifications (bottom-right corner)             │
│       Quick confirmations: "Action approved!"               │
│       Auto-dismiss after 5 seconds                          │
│                                                              │
│    🟡 Banner Alerts (top of page)                           │
│       Important warnings: "Queue backlog: 10+ pending"      │
│       Stay visible until you dismiss them                   │
│                                                              │
│    🔵 Notification Center (slide-out panel)                 │
│       Full history: See all past notifications              │
│       Organized by date: Today, Yesterday, Earlier          │
│                                                              │
│    Customize which notifications you want to receive        │
│    in Settings > Notifications.                             │
│                                                              │
│                 [Back]    [Next: Personalization]            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Microcopy

**Title**: "Stay Updated: Notification System"

**Body**:
"Never miss a beat with our 3-layer notification system:

**🟢 Toast Notifications** (bottom-right corner)
Quick confirmations: "Action approved!"
Auto-dismiss after 5 seconds

**🟡 Banner Alerts** (top of page)
Important warnings: "Queue backlog: 10+ pending"
Stay visible until you dismiss them

**🔵 Notification Center** (slide-out panel)
Full history: See all past notifications
Organized by date: Today, Yesterday, Earlier

Customize which notifications you want to receive in **Settings > Notifications**."

**Primary Button**: "Next: Personalization"

**Secondary Button**: "Back"

**Progress**: "Step 3 of 4" + 75% progress bar

### Polaris Implementation

```tsx
<Modal
  open={currentStep === 3}
  onClose={handleSkipTour}
  title="Stay Updated: Notification System"
  size="large"
  primaryAction={{
    content: 'Next: Personalization',
    onAction: () => setCurrentStep(4),
  }}
  secondaryActions={[
    {
      content: 'Back',
      onAction: () => setCurrentStep(2),
    },
    {
      content: 'Skip Tour',
      onAction: handleSkipTour,
      plain: true,
    },
  ]}
>
  <Modal.Section>
    <BlockStack gap="400">
      <ProgressBar progress={75} tone="primary" />
      
      <Text variant="bodySm" as="p" tone="subdued">
        Step 3 of 4
      </Text>
      
      <Icon source={BellIcon} tone="info" />
      
      <Text variant="headingMd" as="h3">
        Stay Updated: Notification System
      </Text>
      
      <Text variant="bodyMd" as="p">
        Never miss a beat with our 3-layer notification system:
      </Text>
      
      <BlockStack gap="300">
        <Card>
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#008060'}} />
              <Text variant="headingSm" as="h4" fontWeight="bold">Toast Notifications</Text>
              <Text variant="bodySm" tone="subdued">(bottom-right corner)</Text>
            </InlineStack>
            <Text variant="bodySm" as="p">
              Quick confirmations: "Action approved!"<br />
              Auto-dismiss after 5 seconds
            </Text>
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#FFBF47'}} />
              <Text variant="headingSm" as="h4" fontWeight="bold">Banner Alerts</Text>
              <Text variant="bodySm" tone="subdued">(top of page)</Text>
            </InlineStack>
            <Text variant="bodySm" as="p">
              Important warnings: "Queue backlog: 10+ pending"<br />
              Stay visible until you dismiss them
            </Text>
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#0078D4'}} />
              <Text variant="headingSm" as="h4" fontWeight="bold">Notification Center</Text>
              <Text variant="bodySm" tone="subdued">(slide-out panel)</Text>
            </InlineStack>
            <Text variant="bodySm" as="p">
              Full history: See all past notifications<br />
              Organized by date: Today, Yesterday, Earlier
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
      
      <Text variant="bodyMd" as="p">
        Customize which notifications you want to receive in <Text as="span" fontWeight="semibold">Settings > Notifications</Text>.
      </Text>
    </BlockStack>
  </Modal.Section>
</Modal>
```

### Accessibility Notes

- **Progress Indicator**: ProgressBar at 75%, announced as "Step 3 of 4, 75% complete"
- **Card Components**: Semantic grouping for each notification type
- **Color Indicators**: Color dots are supplementary (text describes notification type)
- **Heading Hierarchy**: h3 for modal title, h4 for subsections, proper nesting
- **Keyboard Navigation**: Focus on cards and buttons, Tab through all elements
- **Screen Reader**: Announces each notification type clearly with location and behavior
- **Text Alternatives**: Color not sole means of conveying information
- **Visual Hierarchy**: Clear spacing and grouping with BlockStack/InlineStack

---

## Wireframe 5: Step 4 — Settings & Personalization

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Tour Step 4 of 4                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━100% │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      ⚙️ [Settings Icon]                      │
│                                                              │
│            Make It Yours: Personalization & Settings         │
│                                                              │
│    Customize your dashboard to match your workflow:         │
│                                                              │
│    🎨 Theme Switcher                                         │
│       Choose Light, Dark, or Auto mode                      │
│       Instant apply, no page reload                         │
│                                                              │
│    📊 Tile Customization                                     │
│       Drag & drop tiles to reorder                          │
│       Show/hide tiles you don't need                        │
│       Your layout saves automatically                       │
│                                                              │
│    🔔 Notification Preferences                               │
│       Choose which alerts you want                          │
│       Enable/disable browser notifications                  │
│       Set quiet hours (optional)                            │
│                                                              │
│    Access all settings from the ⚙️ icon in the top bar.     │
│                                                              │
│                  [Back]    [Finish Tour]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Microcopy

**Title**: "Make It Yours: Personalization & Settings"

**Body**:
"Customize your dashboard to match your workflow:

**🎨 Theme Switcher**
Choose Light, Dark, or Auto mode
Instant apply, no page reload

**📊 Tile Customization**
Drag & drop tiles to reorder
Show/hide tiles you don't need
Your layout saves automatically

**🔔 Notification Preferences**
Choose which alerts you want
Enable/disable browser notifications
Set quiet hours (optional)

Access all settings from the **⚙️ icon** in the top bar."

**Primary Button**: "Finish Tour"

**Secondary Button**: "Back"

**Progress**: "Step 4 of 4" + 100% progress bar

### Polaris Implementation

```tsx
<Modal
  open={currentStep === 4}
  onClose={handleSkipTour}
  title="Make It Yours: Personalization & Settings"
  size="large"
  primaryAction={{
    content: 'Finish Tour',
    onAction: handleFinishTour,
    tone: 'success',
  }}
  secondaryActions={[
    {
      content: 'Back',
      onAction: () => setCurrentStep(3),
    },
  ]}
>
  <Modal.Section>
    <BlockStack gap="400">
      <ProgressBar progress={100} tone="success" />
      
      <Text variant="bodySm" as="p" tone="subdued">
        Step 4 of 4 — Almost done!
      </Text>
      
      <Icon source={SettingsIcon} tone="success" />
      
      <Text variant="headingMd" as="h3">
        Make It Yours: Personalization & Settings
      </Text>
      
      <Text variant="bodyMd" as="p">
        Customize your dashboard to match your workflow:
      </Text>
      
      <BlockStack gap="300">
        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h4" fontWeight="bold">
              🎨 Theme Switcher
            </Text>
            <Text variant="bodySm" as="p">
              Choose Light, Dark, or Auto mode<br />
              Instant apply, no page reload
            </Text>
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h4" fontWeight="bold">
              📊 Tile Customization
            </Text>
            <Text variant="bodySm" as="p">
              Drag & drop tiles to reorder<br />
              Show/hide tiles you don't need<br />
              Your layout saves automatically
            </Text>
          </BlockStack>
        </Card>
        
        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h4" fontWeight="bold">
              🔔 Notification Preferences
            </Text>
            <Text variant="bodySm" as="p">
              Choose which alerts you want<br />
              Enable/disable browser notifications<br />
              Set quiet hours (optional)
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
      
      <Banner tone="success">
        <Text variant="bodyMd" as="p">
          Access all settings from the <Text as="span" fontWeight="semibold">⚙️ icon</Text> in the top bar.
        </Text>
      </Banner>
    </BlockStack>
  </Modal.Section>
</Modal>
```

### Accessibility Notes

- **Progress Indicator**: ProgressBar at 100%, green tone, announced as "Step 4 of 4, Complete"
- **Success Tone**: Primary button uses "success" tone for positive completion
- **Card Components**: Semantic grouping for each settings category
- **Emoji Usage**: Supplementary (not sole indicator), text describes functionality
- **Heading Hierarchy**: h3 for modal title, h4 for subsections
- **Keyboard Navigation**: Focus on "Finish Tour" button (primary action)
- **Screen Reader**: Announces completion status and all settings options
- **Visual Closure**: Green progress bar + "success" tone signals tour completion
- **Banner**: Success tone reinforces completion and provides navigation tip

---

## State Management & Logic

### Tour State (React)

```tsx
interface OnboardingState {
  currentStep: number; // 0 (welcome) to 4 (settings)
  hasSeenTour: boolean; // localStorage persistence
  isSkipped: boolean;
}

const [onboarding, setOnboarding] = useState<OnboardingState>({
  currentStep: 0,
  hasSeenTour: false,
  isSkipped: false,
});

// Check localStorage on mount
useEffect(() => {
  const hasCompleted = localStorage.getItem('onboarding_completed') === 'true';
  if (hasCompleted) {
    setOnboarding(prev => ({ ...prev, hasSeenTour: true }));
  }
}, []);

// Handle tour completion
const handleFinishTour = () => {
  localStorage.setItem('onboarding_completed', 'true');
  setOnboarding({ currentStep: 0, hasSeenTour: true, isSkipped: false });
  showToast('Welcome to Hot Rod AN! 🏁');
};

// Handle tour skip
const handleSkipTour = () => {
  localStorage.setItem('onboarding_skipped', 'true');
  setOnboarding(prev => ({ ...prev, isSkipped: true }));
  showToast('Tour skipped. Access it anytime from Settings.');
};
```

### Trigger Conditions

**Show tour when**:
- First-time user (no `onboarding_completed` in localStorage)
- User hasn't skipped tour (no `onboarding_skipped` in localStorage)
- Dashboard route loads

**Do NOT show tour when**:
- `onboarding_completed === 'true'`
- `onboarding_skipped === 'true'`
- User is on mobile (< 768px) — offer mobile-optimized version or skip

**Restart tour**:
- Settings > Account > "Restart Onboarding Tour" button
- Clears localStorage flags and shows welcome screen

---

## Mobile Responsiveness

### Mobile Adaptations (< 768px)

**Changes for Mobile**:
1. **Modal Size**: Use `size="small"` instead of `size="large"`
2. **Font Sizes**: Reduce heading sizes slightly (headingLg → headingMd)
3. **Card Stacking**: Cards stack vertically (already default with BlockStack)
4. **Button Width**: Primary button becomes `fullWidth` on mobile
5. **Progress Bar**: Remains visible but smaller

**Mobile Wireframe Example** (Step 1):

```
┌──────────────────────────┐
│ Tour (1/4)          [×] │
│ ━━━━━━━━━━━━━━━━━━ 25%  │
├──────────────────────────┤
│       📊 [Icon]          │
│                          │
│   Your Dashboard         │
│                          │
│ 8 live tiles:            │
│ • Revenue                │
│ • CX Queue               │
│ • Inventory              │
│ • Approval Queue         │
│ • SEO Status             │
│ • Idea Pool              │
│ • CEO Agent              │
│ • Unread Messages        │
│                          │
│ All tiles update live.   │
│                          │
│ [Back]   [Next: Approvals]│
└──────────────────────────┘
```

### Touch Interactions

- **Swipe Navigation**: Swipe left/right to navigate steps (optional enhancement)
- **Tap Targets**: All buttons minimum 44x44px touch targets
- **Modal Close**: Tap outside modal to close (in addition to × button)
- **Progress Bar**: Visual-only on mobile (still announced to screen readers)

---

## Accessibility Compliance (WCAG 2.2 AA)

### ✅ Compliance Checklist

**Perceivable**:
- [x] Text alternatives for icons (accessibilityLabel props)
- [x] Color contrast 4.5:1 minimum (Polaris tokens ensure compliance)
- [x] Text resizable to 200% without loss of function
- [x] No information conveyed by color alone

**Operable**:
- [x] All functionality keyboard accessible (Tab, Enter, Escape)
- [x] No keyboard traps (focus managed within modal)
- [x] Focus indicators visible (Polaris default styles)
- [x] Skip links not needed (modal is single focus context)

**Understandable**:
- [x] Clear, consistent language (Hot Rodan brand voice)
- [x] Predictable navigation (numbered steps, progress bar)
- [x] Input assistance (buttons clearly labeled)
- [x] Error identification (not applicable - no form inputs)

**Robust**:
- [x] Valid HTML markup (Polaris components ensure validity)
- [x] ARIA roles and properties (Modal has role="dialog")
- [x] Name, role, value for all interactive elements
- [x] Status messages announced (toast notifications after completion)

### Screen Reader Testing

**NVDA (Windows)**:
- "Dialog, Welcome to Your Pit Crew Command Center. Welcome modal."
- "Button, Take the Tour, primary action"
- "Button, Skip Tour, secondary action"
- "Progress bar, 25%, Step 1 of 4"
- "List with 8 items. Revenue & Sales, track pit stop performance..."

**VoiceOver (Mac)**:
- "Welcome to Your Pit Crew Command Center, dialog"
- "Take the Tour, button, primary"
- "Skip Tour, button, secondary"
- "Progress, 25%, Step 1 of 4"
- "List, 8 items. Revenue & Sales, track pit stop performance..."

**JAWS (Windows)**:
- "Dialog, Welcome to Your Pit Crew Command Center"
- "Take the Tour button"
- "Skip Tour button"
- "Progress bar, 25 percent"
- "List of 8 items. Bullet, Revenue & Sales, track pit stop performance..."

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus forward through interactive elements |
| Shift+Tab | Move focus backward |
| Enter | Activate focused button |
| Space | Activate focused button |
| Escape | Close modal (skip tour) |
| Arrow Keys | Not used (no custom focus management needed) |

---

## Success Criteria

### User Success

- [ ] ≥ 80% of new users complete full tour (track in analytics)
- [ ] ≤ 15% skip tour (most find value in completing)
- [ ] Average completion time < 3 minutes (2 minute target)
- [ ] ≥ 90% user satisfaction (post-tour NPS survey)

### Technical Success

- [ ] All modals pass Lighthouse accessibility audit (100 score)
- [ ] All modals pass axe DevTools (0 violations)
- [ ] Keyboard navigation works flawlessly (manual testing)
- [ ] Screen reader announces all content correctly (NVDA/VoiceOver/JAWS)
- [ ] Mobile responsive (320px to 1920px tested)
- [ ] localStorage persistence works (tour doesn't repeat unwanted)

### Design Success

- [ ] Hot Rodan brand voice consistent throughout
- [ ] Visual hierarchy clear (headings, body text, buttons)
- [ ] Progress indication obvious (progress bar + step count)
- [ ] Microcopy concise and actionable
- [ ] No jargon or technical terms unexplained

---

## Implementation Notes for Engineer

### Phase 9 Tasks

**ENG-026**: Onboarding Tour Foundation (2h)
- Create `OnboardingTourProvider` context
- Implement state management (currentStep, hasSeenTour, isSkipped)
- Add localStorage persistence
- Create `OnboardingModal` component wrapper

**ENG-027**: Tour Steps Implementation (3h)
- Implement 5 modal steps (welcome + 4 steps)
- Add ProgressBar component
- Wire up navigation (Back/Next buttons)
- Add skip functionality

**ENG-028**: Accessibility & Polish (1h)
- Focus management (trap focus within modal)
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader testing (ARIA labels, announcements)
- Mobile responsive adjustments

### MCP Tools Required

**Before implementation**:
```bash
# Polaris Modal patterns
mcp_context7_get-library-docs("/shopify/polaris", "Modal ProgressBar Button accessibility focus trap")

# React Router 7 navigation
mcp_context7_get-library-docs("/react-router/react-router", "navigation state localStorage")
```

### File Structure

```
app/
├── components/
│   └── onboarding/
│       ├── OnboardingTourProvider.tsx  # Context + state
│       ├── OnboardingModal.tsx         # Modal wrapper
│       ├── steps/
│       │   ├── WelcomeStep.tsx         # Step 0
│       │   ├── DashboardStep.tsx       # Step 1
│       │   ├── ApprovalsStep.tsx       # Step 2
│       │   ├── NotificationsStep.tsx   # Step 3
│       │   └── SettingsStep.tsx        # Step 4
│       └── index.ts                    # Exports
├── hooks/
│   └── useOnboardingTour.ts            # Hook for accessing tour state
└── routes/
    └── app._index.tsx                  # Trigger tour on dashboard load
```

---

## Changelog

**2025-10-21**: Initial wireframes created (Designer)  
**Version**: 1.0  
**Status**: Ready for Phase 9 implementation

---

**EOF — Onboarding Flow Wireframes Complete** 🏁

