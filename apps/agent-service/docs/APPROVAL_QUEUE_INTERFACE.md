# Approval Queue - Operator Interface Design

## Overview

The Approval Queue is the central interface where operators review and approve AI-generated response drafts. It must be fast, intuitive, and empower operators to work efficiently.

## Core Principles

1. **Speed First**: Operators should review and approve in <10 seconds for high-confidence drafts
2. **Clear Context**: All relevant information visible without scrolling
3. **One-Click Actions**: Common workflows require minimal clicks
4. **Learn from Edits**: System improves based on operator modifications
5. **Graceful Degradation**: Queue works even if AI services are down

## Interface Layout

### Main Queue View

```
┌─────────────────────────────────────────────────────────────────┐
│ HotDash Approval Queue                    [Filter ▼] [Sort ▼]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔴 URGENT  │  #1234  │  Product Q&A  │  2m ago              │ │
│ │                                                             │ │
│ │ Customer: Where can I find AN-6 hose fittings?             │ │
│ │                                                             │ │
│ │ 💬 Draft Response                        Confidence: 92%   │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Hi John,                                                │ │ │
│ │ │                                                         │ │ │
│ │ │ We have AN-6 hose fittings available in several       │ │ │
│ │ │ styles:                                                │ │ │
│ │ │ - Straight swivel (reusable)                          │ │ │
│ │ │ - 45° swivel                                          │ │ │
│ │ │ - 90° swivel                                          │ │ │
│ │ │                                                         │ │ │
│ │ │ All are compatible with PTFE braided hose...          │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ 📚 Sources: Product Catalog (95%), Fitting Guide (87%)     │ │
│ │                                                             │ │
│ │ [✓ Approve] [✎ Edit & Approve] [⚠ Escalate] [✗ Reject]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟡 HIGH  │  #1235  │  Order Support  │  5m ago             │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Review Panel

When operator clicks on an item:

```
┌─────────────────────────────────────────────────────────────────┐
│ Review Draft Response                            [← Back to Queue]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────────── Customer Context ───────────────┐              │
│ │ Conversation #1234 │ John Smith │ john@email.com│              │
│ │ Previous: 2 interactions │ Last: Order #5678    │              │
│ │                                                  │              │
│ │ Current Message:                                 │              │
│ │ "Where can I find AN-6 hose fittings?"          │              │
│ │                                                  │              │
│ │ 🎯 Agent Analysis:                               │              │
│ │ Intent: PRODUCT_QA                              │              │
│ │ Agent: Product Q&A Specialist                   │              │
│ │ Confidence: High (92%)                          │              │
│ │ Reasoning: Direct product specification question│              │
│ │                                                  │              │
│ │ ⚡ Urgency: Normal                               │              │
│ │ ⏱ Estimated Review: 30s                         │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                   │
│ ┌──────────────── Draft Response ─────────────────┐              │
│ │ [Edit inline with syntax highlighting]          │              │
│ │                                                  │              │
│ │ Hi John,                                         │              │
│ │                                                  │              │
│ │ We have AN-6 hose fittings available in several │              │
│ │ styles:                                          │              │
│ │                                                  │              │
│ │ - Straight swivel (reusable) - $X.XX           │              │
│ │ - 45° swivel - $X.XX                            │              │
│ │ - 90° swivel - $X.XX                            │              │
│ │                                                  │              │
│ │ All are compatible with our PTFE braided hose   │              │
│ │ and feature aluminum construction.               │              │
│ │                                                  │              │
│ │ View all AN-6 fittings: [link]                  │              │
│ │                                                  │              │
│ │ Best regards,                                    │              │
│ │ [Your Name]                                      │              │
│ │ HotDash Support                                  │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                   │
│ ┌──────────────── Knowledge Sources ──────────────┐              │
│ │ 1. Product Catalog - AN Fittings                │              │
│ │    Relevance: 95% │ Updated: 2 days ago         │              │
│ │    [View Source]                                 │              │
│ │                                                  │              │
│ │ 2. AN Fitting Installation Guide                │              │
│ │    Relevance: 87% │ Updated: 1 week ago         │              │
│ │    [View Source]                                 │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                   │
│ ┌──────────────── Quality Scores ─────────────────┐              │
│ │ Factuality:    ████████░░ 4.2/5                 │              │
│ │ Helpfulness:   █████████░ 4.5/5                 │              │
│ │ Tone:          █████████░ 4.7/5                 │              │
│ │ Completeness:  ████████░░ 4.1/5                 │              │
│ │ Clarity:       █████████░ 4.6/5                 │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                   │
│ ┌──────────────── Actions ────────────────────────┐              │
│ │                                                  │              │
│ │ ✓ Approve & Send              [Ctrl+Enter]      │              │
│ │   Send response as-is                           │              │
│ │                                                  │              │
│ │ ✎ Edit & Approve              [Ctrl+E]          │              │
│ │   Modify response before sending                │              │
│ │                                                  │              │
│ │ ⚠ Escalate to Senior          [Ctrl+Shift+E]   │              │
│ │   Forward to specialist or manager              │              │
│ │                                                  │              │
│ │ ✗ Reject & Write Manually     [Ctrl+R]          │              │
│ │   Discard draft, write from scratch             │              │
│ │                                                  │              │
│ │ ⏸ Pause & Come Back          [Ctrl+P]          │              │
│ │   Save state, return to queue                   │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Priority Queue
Items sorted by:
- **Urgent**: Customer flagged urgent or time-sensitive
- **High**: Low confidence, requires verification
- **Medium**: Standard confidence, routine review
- **Low**: High confidence, quick approval

### 2. Quick Actions
**Keyboard Shortcuts**:
- `Ctrl+Enter`: Approve & Send
- `Ctrl+E`: Edit & Approve
- `Ctrl+Shift+E`: Escalate
- `Ctrl+R`: Reject
- `Ctrl+P`: Pause
- `↑/↓`: Navigate queue
- `Enter`: Open detailed view

### 3. Context at a Glance
Each queue item shows:
- Priority indicator (color-coded)
- Conversation ID
- Agent type
- Time in queue
- Customer name (if available)
- Brief preview of question and answer

### 4. Confidence Visualization
- **High (90-100%)**: Green badge, minimal review needed
- **Medium (70-89%)**: Yellow badge, standard review
- **Low (<70%)**: Red badge, careful verification required

### 5. Edit Tracking
When operator edits:
- Track what was changed (diff)
- Log common edit patterns
- Use edits to improve future prompts
- Calculate "edit distance" metric

### 6. Source Verification
- Click to view full source document
- See relevance score and freshness
- Quick fact-checking without leaving interface

### 7. Feedback Collection
After sending, quick survey:
```
┌─────────────────────────────────────┐
│ Response sent! Quick feedback?       │
├─────────────────────────────────────┤
│ Was the draft helpful?               │
│ [😊 Yes] [😐 Okay] [😞 No]          │
│                                      │
│ What would improve it? (optional)    │
│ [ Text area                        ] │
│                                      │
│ [Skip] [Submit]                      │
└─────────────────────────────────────┘
```

## Technical Implementation

### State Management
```typescript
interface ApprovalQueueItem {
  id: string;
  conversationId: number;
  customerId?: string;
  
  // Classification
  agentType: 'triage' | 'order-support' | 'product-qa';
  intent: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  
  // Content
  customerMessage: string;
  draftResponse: string;
  
  // Confidence & Quality
  confidence: {
    score: number;
    level: 'High' | 'Medium' | 'Low';
    reasoning: string;
  };
  quality: {
    factuality: number;
    helpfulness: number;
    tone: number;
    completeness: number;
    clarity: number;
  };
  
  // Sources
  citations: Array<{
    title: string;
    url?: string;
    relevance: number;
  }>;
  
  // Metadata
  createdAt: Date;
  estimatedReviewTime: number;
  requiresVerification: boolean;
  urgencyFlags: string[];
  
  // State
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: string;
  reviewedAt?: Date;
  editsMade?: boolean;
}
```

### API Endpoints
```typescript
// Queue operations
GET    /api/approval-queue         // List items
GET    /api/approval-queue/:id     // Get item details
POST   /api/approval-queue/:id/approve
POST   /api/approval-queue/:id/edit
POST   /api/approval-queue/:id/escalate
POST   /api/approval-queue/:id/reject
POST   /api/approval-queue/:id/pause

// Feedback
POST   /api/approval-queue/:id/feedback

// Metrics
GET    /api/approval-queue/metrics
GET    /api/approval-queue/operator-stats
```

### Real-time Updates
- WebSocket connection for live queue updates
- New items appear automatically
- Queue reorders based on priority changes
- Notification for urgent items

## Metrics Dashboard

Operators see their performance:
```
┌─────────────────────────────────────────────────┐
│ Your Performance Today                          │
├─────────────────────────────────────────────────┤
│ Reviewed: 47 items                              │
│ Approved: 41 (87%)                              │
│ Edited: 6 (13%)                                 │
│ Avg Review Time: 18s                            │
│                                                 │
│ Quality Trend: ↗ +3% this week                 │
│ Speed Trend: ↗ -2s avg time                    │
└─────────────────────────────────────────────────┘
```

## Mobile Responsive

Simplified mobile view:
- Swipe actions (left: approve, right: reject)
- Tap to view full details
- Voice-to-text for edits
- Push notifications for urgent items

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels on all interactive elements
- **High Contrast**: Support for high contrast themes
- **Font Scaling**: Respects user font size preferences

## Success Criteria

1. **Speed**: 90% of high-confidence items reviewed in <15s
2. **Accuracy**: <5% of approved messages need follow-up
3. **Adoption**: 80% approval rate for medium+ confidence
4. **Satisfaction**: 8/10+ operator satisfaction score
5. **Learning**: 10%+ improvement in approval rate month-over-month

---

**Status**: Design Complete - Ready for Implementation  
**Next Steps**: Frontend development with React + TypeScript  
**Timeline**: 2-3 days for MVP, 1 week for polish  
**Launch Target**: October 13-15, 2025

