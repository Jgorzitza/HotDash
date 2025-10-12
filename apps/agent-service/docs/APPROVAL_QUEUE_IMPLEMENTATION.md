# Approval Queue Frontend - Implementation Plan

**Priority**: MEDIUM - Post-Launch Enhancement  
**Estimated Time**: 2-3 days  
**Assigned To**: Engineer  
**Coordinated By**: AI Agent

---

## Overview

Implement the operator-facing approval queue interface where operators review and approve AI-generated response drafts. This is the primary interface for human-in-the-loop AI assistance.

**Reference Design**: See `APPROVAL_QUEUE_INTERFACE.md` for detailed UI/UX specifications

---

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **State Management**: React Query + Zustand
- **Styling**: TailwindCSS + Shadcn/ui components
- **Real-time**: WebSocket (Socket.io)
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: TipTap or Lexical for draft editing
- **Testing**: Vitest + React Testing Library + Playwright

---

## Project Structure

```
apps/approval-queue-ui/
├── src/
│   ├── components/
│   │   ├── queue/
│   │   │   ├── QueueList.tsx
│   │   │   ├── QueueItem.tsx
│   │   │   ├── QueueFilters.tsx
│   │   │   └── QueueStats.tsx
│   │   ├── review/
│   │   │   ├── ReviewPanel.tsx
│   │   │   ├── CustomerContext.tsx
│   │   │   ├── DraftEditor.tsx
│   │   │   ├── SourcesList.tsx
│   │   │   ├── QualityScores.tsx
│   │   │   └── ActionButtons.tsx
│   │   ├── feedback/
│   │   │   └── FeedbackModal.tsx
│   │   └── ui/
│   │       └── [shadcn components]
│   ├── hooks/
│   │   ├── useApprovalQueue.ts
│   │   ├── useRealtimeUpdates.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useOperatorStats.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── storage.ts
│   ├── stores/
│   │   ├── queueStore.ts
│   │   └── userStore.ts
│   ├── types/
│   │   └── approval-queue.ts
│   ├── utils/
│   │   ├── formatting.ts
│   │   ├── shortcuts.ts
│   │   └── validation.ts
│   └── App.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Phase 1: Core Queue View (Day 1)

### Task 1.1: Setup Project Scaffold (2 hours)

```bash
# Create new React app with Vite
cd apps
npm create vite@latest approval-queue-ui -- --template react-ts
cd approval-queue-ui

# Install dependencies
npm install \
  @tanstack/react-query \
  zustand \
  tailwindcss \
  @radix-ui/react-* \
  socket.io-client \
  react-hook-form \
  zod \
  @hookform/resolvers \
  date-fns \
  clsx \
  tailwind-merge

# Install dev dependencies
npm install -D \
  @types/node \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test
```

### Task 1.2: Define TypeScript Types (1 hour)

**File**: `src/types/approval-queue.ts`

```typescript
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type AgentType = 'triage' | 'order-support' | 'product-qa';
export type ItemStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated';

export interface ApprovalQueueItem {
  id: string;
  conversationId: number;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  
  // Classification
  agentType: AgentType;
  intent: string;
  priority: PriorityLevel;
  
  // Content
  customerMessage: string;
  draftResponse: string;
  
  // Confidence & Quality
  confidence: {
    score: number;
    level: ConfidenceLevel;
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
    snippet?: string;
  }>;
  
  // Metadata
  createdAt: Date;
  estimatedReviewTime: number;
  requiresVerification: boolean;
  urgencyFlags: string[];
  
  // State
  status: ItemStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  editsMade?: boolean;
}

export interface OperatorStats {
  todayReviewed: number;
  todayApproved: number;
  todayEdited: number;
  avgReviewTime: number;
  qualityTrend: number;
  speedTrend: number;
}

export interface QueueFilters {
  priority?: PriorityLevel[];
  agentType?: AgentType[];
  confidence?: ConfidenceLevel[];
  status?: ItemStatus[];
}

export type SortOption = 'priority' | 'time' | 'confidence';
export type SortDirection = 'asc' | 'desc';
```

### Task 1.3: Create API Service (2 hours)

**File**: `src/services/api.ts`

```typescript
import { ApprovalQueueItem, QueueFilters, OperatorStats } from '../types/approval-queue';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApprovalQueueAPI {
  // List queue items
  static async listItems(filters?: QueueFilters): Promise<ApprovalQueueItem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else if (value) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(`${API_BASE}/approval-queue?${params}`);
    if (!response.ok) throw new Error('Failed to fetch queue items');
    return response.json();
  }
  
  // Get single item
  static async getItem(id: string): Promise<ApprovalQueueItem> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  }
  
  // Approve item
  static async approve(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}/approve`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve item');
  }
  
  // Edit and approve
  static async editAndApprove(id: string, editedResponse: string): Promise<void> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editedResponse }),
    });
    if (!response.ok) throw new Error('Failed to edit and approve');
  }
  
  // Escalate
  static async escalate(id: string, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to escalate');
  }
  
  // Reject
  static async reject(id: string, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to reject');
  }
  
  // Pause (save for later)
  static async pause(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}/pause`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to pause');
  }
  
  // Submit feedback
  static async submitFeedback(id: string, feedback: {
    helpful: boolean;
    comment?: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE}/approval-queue/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
  }
  
  // Get operator stats
  static async getOperatorStats(): Promise<OperatorStats> {
    const response = await fetch(`${API_BASE}/approval-queue/operator-stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
}
```

### Task 1.4: Create Queue Store (1 hour)

**File**: `src/stores/queueStore.ts`

```typescript
import { create } from 'zustand';
import { ApprovalQueueItem, QueueFilters, SortOption, SortDirection } from '../types/approval-queue';

interface QueueStore {
  items: ApprovalQueueItem[];
  selectedItem: ApprovalQueueItem | null;
  filters: QueueFilters;
  sortBy: SortOption;
  sortDirection: SortDirection;
  
  setItems: (items: ApprovalQueueItem[]) => void;
  addItem: (item: ApprovalQueueItem) => void;
  updateItem: (id: string, updates: Partial<ApprovalQueueItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (item: ApprovalQueueItem | null) => void;
  setFilters: (filters: QueueFilters) => void;
  setSorting: (sortBy: SortOption, direction: SortDirection) => void;
}

export const useQueueStore = create<QueueStore>((set) => ({
  items: [],
  selectedItem: null,
  filters: {},
  sortBy: 'priority',
  sortDirection: 'desc',
  
  setItems: (items) => set({ items }),
  
  addItem: (item) => set((state) => ({
    items: [item, ...state.items]
  })),
  
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  selectItem: (item) => set({ selectedItem: item }),
  
  setFilters: (filters) => set({ filters }),
  
  setSorting: (sortBy, direction) => set({ sortBy, sortDirection: direction }),
}));
```

### Task 1.5: Create Queue List Component (2 hours)

**File**: `src/components/queue/QueueList.tsx`

```typescript
import { ApprovalQueueItem, PriorityLevel } from '../../types/approval-queue';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../utils/formatting';

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  urgent: 'bg-red-100 border-red-500 text-red-900',
  high: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  medium: 'bg-blue-100 border-blue-500 text-blue-900',
  low: 'bg-gray-100 border-gray-500 text-gray-900',
};

const PRIORITY_ICONS: Record<PriorityLevel, string> = {
  urgent: '🔴',
  high: '🟡',
  medium: '🔵',
  low: '⚪',
};

interface QueueListProps {
  items: ApprovalQueueItem[];
  onSelect: (item: ApprovalQueueItem) => void;
  selectedId?: string;
}

export function QueueList({ items, onSelect, selectedId }: QueueListProps) {
  return (
    <div className="space-y-2 p-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={cn(
            'w-full p-4 rounded-lg border-l-4 text-left transition-all',
            'hover:shadow-md hover:scale-[1.01]',
            PRIORITY_COLORS[item.priority],
            selectedId === item.id && 'ring-2 ring-blue-500'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{PRIORITY_ICONS[item.priority]}</span>
              <span className="font-semibold">
                {item.priority.toUpperCase()}
              </span>
              <span className="text-sm opacity-70">
                #{item.conversationId}
              </span>
              <span className="text-sm opacity-70">
                {item.agentType}
              </span>
            </div>
            <span className="text-sm opacity-70">
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </span>
          </div>
          
          {/* Customer message preview */}
          <div className="text-sm mb-2">
            <span className="font-medium">Customer: </span>
            <span className="opacity-80">
              {item.customerMessage.substring(0, 100)}
              {item.customerMessage.length > 100 && '...'}
            </span>
          </div>
          
          {/* Draft preview */}
          <div className="text-sm">
            <span className="font-medium">💬 Draft: </span>
            <span className="opacity-70">
              {item.draftResponse.substring(0, 150)}
              {item.draftResponse.length > 150 && '...'}
            </span>
          </div>
          
          {/* Confidence badge */}
          <div className="mt-2 flex items-center gap-2">
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              item.confidence.level === 'High' && 'bg-green-200 text-green-900',
              item.confidence.level === 'Medium' && 'bg-yellow-200 text-yellow-900',
              item.confidence.level === 'Low' && 'bg-red-200 text-red-900'
            )}>
              Confidence: {item.confidence.score}%
            </span>
            {item.urgencyFlags.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-900">
                ⚠️ Urgent
              </span>
            )}
          </div>
        </button>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">🎉 Queue is empty!</p>
          <p className="text-sm">No items need review right now.</p>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 2: Review Panel (Day 2)

### Task 2.1: Create Review Panel Component (3 hours)
### Task 2.2: Create Draft Editor Component (2 hours)
### Task 2.3: Create Action Buttons Component (1 hour)
### Task 2.4: Implement Keyboard Shortcuts (2 hours)

---

## Phase 3: Real-time & Polish (Day 3)

### Task 3.1: WebSocket Integration (2 hours)
### Task 3.2: Feedback Modal (1 hour)
### Task 3.3: Operator Stats Dashboard (2 hours)
### Task 3.4: Accessibility & Testing (3 hours)

---

## Testing Requirements

### Unit Tests (Vitest)
- Queue store state management
- API service methods
- Utility functions
- Custom hooks

### Integration Tests (React Testing Library)
- Queue list filtering and sorting
- Item selection and navigation
- Draft editing workflow
- Action button behaviors

### E2E Tests (Playwright)
- Complete approve workflow
- Complete edit & approve workflow
- Escalation workflow
- Keyboard shortcuts

---

## Deployment

```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to Fly.io
fly deploy
```

---

## Success Criteria

✅ **Queue View**: Displays items with correct priority and confidence  
✅ **Review Panel**: Shows all relevant context in one view  
✅ **Actions**: All 5 actions work correctly  
✅ **Keyboard**: Shortcuts work for all common actions  
✅ **Real-time**: New items appear automatically  
✅ **Performance**: Handles 100+ items without lag  
✅ **Responsive**: Works on desktop, tablet, mobile  
✅ **Accessible**: Keyboard navigation and screen reader support

---

**Full Implementation**: See detailed code in `apps/approval-queue-ui/` once project is scaffolded

