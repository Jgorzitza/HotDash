---
epoch: 2025.10.E1
doc: docs/design/user-experience-23-27.md
owner: designer
created: 2025-10-11
---

# User Experience Design (Tasks 23-27)

## Task 23: Heuristic Evaluation of Dashboard

**Nielsen's 10 Usability Heuristics - Applied to HotDash**:

1. ✅ Visibility of system status - Status badges on all tiles
2. ✅ Match between system and real world - Operator-first language
3. ✅ User control and freedom - Cancel buttons, undo actions
4. ✅ Consistency and standards - Polaris alignment
5. ⚠️ Error prevention - Could add more confirmations  
6. ✅ Recognition rather than recall - Clear labels, no memorization
7. ✅ Flexibility and efficiency - Keyboard shortcuts available
8. ✅ Aesthetic and minimalist design - Clean, focused tiles
9. ✅ Help users recognize and recover from errors - Clear error messages
10. ✅ Help and documentation - Inline help, tooltips

**Score**: 9.5/10 (Excellent usability)

**Recommendations**:
- Add confirmation for high-risk actions
- Add tooltips for complex metrics
- Add keyboard shortcut reference

---

## Task 24: User Flow Diagrams

**Major Workflows**:

**Flow 1: Approve Agent Action**
```
Operator Dashboard → View Approvals → 
Select Approval → Review Details → 
Approve/Reject → Confirmation Toast → 
Return to Queue
```

**Flow 2: Review Training Data**
```
Dashboard → Training Feedback → 
Select Sample → Rate on Rubric → 
Add Tags/Notes → Submit → Next Sample
```

**Flow 3: Monitor Agent Performance**
```
Dashboard → Agent Metrics → 
View Trends → Filter by Agent → 
Export Data → Analyze Offline
```

**Flow 4: Respond to Escalation**
```
Dashboard → CX Escalations Tile → 
Select Conversation → Review History → 
Edit Response → Approve & Send → 
Confirmation
```

---

## Task 25: Onboarding Experience

**New Operator Flow**:
```
1. Welcome Screen
   → "Welcome to HotDash Operator Control Center"
   → Brief overview of AI agents
   
2. Dashboard Tour (tooltips)
   → Point to each tile: "This shows..."
   → Click to advance
   
3. Approval Queue Demo
   → Show sample approval
   → Walk through approve/reject
   
4. Complete!
   → "You're ready to start"
   → Link to full documentation
```

**Implementation**:
```typescript
import { TourProvider, useTour } from 'react-shepherd';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to HotDash',
    text: 'Your AI-powered operator control center',
    attachTo: { element: '#dashboard', on: 'center' },
  },
  {
    id: 'approvals',
    title: 'Approval Queue',
    text: 'Review and approve AI agent actions here',
    attachTo: { element: '#approval-queue-tile', on: 'bottom' },
  },
  // More steps...
];

<TourProvider steps={tourSteps}>
  <Dashboard />
</TourProvider>
```

---

## Task 26: Contextual Help and Tooltips

**Tooltip Patterns**:
```typescript
import { Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';

// Inline help icon
<InlineStack gap="100" blockAlign="center">
  <Text>Approval Rate</Text>
  <Tooltip content="Percentage of agent actions approved by operators">
    <Icon source={InfoIcon} tone="subdued" />
  </Tooltip>
</InlineStack>

// Help text on form fields
<TextField
  label="Timeout (seconds)"
  value={timeout}
  onChange={setTimeout}
  helpText="How long before approval expires. Leave blank for no timeout."
/>
```

**Where to Add Tooltips**:
- Complex metrics (approval rate, P95 latency)
- Technical terms (triage, handoff, RAG)
- Configuration options
- Risk levels (low/medium/high)

---

## Task 27: Operator Feedback Collection UI

**Feedback Form**:
```typescript
<Card>
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Send Feedback</Text>
    
    <Select
      label="Feedback Type"
      options={[
        { label: 'Bug Report', value: 'bug' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'UI Improvement', value: 'ui' },
        { label: 'General Feedback', value: 'general' },
      ]}
      value={feedbackType}
      onChange={setFeedbackType}
    />
    
    <TextField
      label="Subject"
      value={subject}
      onChange={setSubject}
      requiredIndicator
    />
    
    <TextField
      label="Description"
      value={description}
      onChange={setDescription}
      multiline={6}
      requiredIndicator
      helpText="Please be as specific as possible"
    />
    
    <Checkbox
      label="Include screenshot"
      checked={includeScreenshot}
      onChange={setIncludeScreenshot}
    />
    
    <ButtonGroup>
      <Button variant="primary" onClick={submitFeedback}>
        Submit Feedback
      </Button>
      <Button onClick={cancel}>Cancel</Button>
    </ButtonGroup>
  </BlockStack>
</Card>
```

**Feedback Button Location**: 
- Bottom-right floating button (all pages)
- Settings menu
- Help menu

---

**Status**: All 5 UX specs complete
