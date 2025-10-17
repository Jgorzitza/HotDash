---
epoch: 2025.10.E1
doc: docs/design/training-data-visualization-ui.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Agent Training Data Visualization UI

**Status**: Ready for Engineer Implementation  
**Purpose**: Operator feedback and training data quality monitoring  
**Reference**: AI agent's training infrastructure (`scripts/ai/llama-workflow/src/training/`)

---

## 1. Overview

### Purpose

Enable operators to:

1. View agent-generated responses and provide feedback
2. Rate response quality on a 5-point rubric
3. Monitor training data collection progress
4. Identify low-quality responses for improvement

### Key Features

- Response review queue (similar to approval queue)
- 5-point rubric scoring (factuality, helpfulness, tone, policy, resolution)
- Training data quality dashboard
- Export training dataset for fine-tuning

---

## 2. Response Review Queue

### Route: `/app/training-feedback`

**Visual Layout**:

```
┌───────────────────────────────────────────────────────────────┐
│ Training Feedback Queue                      12 Need Review  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ [Filter: All Agents ▾]  [Sort: Newest ▾]  [Export Queue]    │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Response Review Card                                    │ │
│ │                                                         │ │
│ │ Conversation #101 · Jamie Lee                          │ │
│ │ Agent: Order Support · 5 minutes ago                   │ │
│ │                                                         │ │
│ │ Customer Input:                                         │ │
│ │ "Where is my order #7001?"                             │ │
│ │                                                         │ │
│ │ Agent Response (Draft):                                 │ │
│ │ "Hi Jamie, I've located order #7001. It's currently    │ │
│ │  in transit and should arrive by Oct 15th."            │ │
│ │                                                         │ │
│ │ Actual Response Sent:                                   │ │
│ │ "Hi Jamie, your order #7001 is on the way! Expected    │ │
│ │  delivery: Oct 15th. Track: [link]"                    │ │
│ │                                                         │ │
│ │ Rate this response:                                     │ │
│ │ Factuality:    ★★★★★                                   │ │
│ │ Helpfulness:   ★★★★☆                                   │ │
│ │ Tone:          ★★★★★                                   │ │
│ │ Policy:        ★★★★★                                   │ │
│ │ Resolution:    ★★★★☆                                   │ │
│ │                                                         │ │
│ │ [Tags: billing, order_status, +Add Tag]                │ │
│ │                                                         │ │
│ │ Notes: _______________________________________          │ │
│ │                                                         │ │
│ │ [Submit Feedback]              [Skip]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Polaris Implementation

```typescript
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  ButtonGroup,
  TextField,
  Tag,
  Box,
  Divider,
} from '@shopify/polaris';
import { StarIcon } from '@shopify/polaris-icons';

function TrainingFeedbackCard({ sample }: { sample: TrainingSample }) {
  const [ratings, setRatings] = useState({
    factuality: 0,
    helpfulness: 0,
    tone: 0,
    policy: 0,
    resolution: 0,
  });
  const [tags, setTags] = useState<string[]>(sample.tags || []);
  const [notes, setNotes] = useState('');

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between">
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Conversation #{sample.conversationId}
            </Text>
            <Text variant="bodySm" tone="subdued">
              Agent: {sample.agentName} · {formatRelativeTime(sample.timestamp)}
            </Text>
          </BlockStack>
        </InlineStack>

        <Divider />

        {/* Customer input */}
        <BlockStack gap="200">
          <Text variant="bodyMd" fontWeight="semibold">Customer Input:</Text>
          <Box background="bg-surface-secondary" padding="300" borderRadius="200">
            <Text variant="bodyMd">{sample.customerInput}</Text>
          </Box>
        </BlockStack>

        {/* Agent response */}
        <BlockStack gap="200">
          <Text variant="bodyMd" fontWeight="semibold">Agent Response (Draft):</Text>
          <Box background="bg-info-subdued" padding="300" borderRadius="200">
            <Text variant="bodyMd">{sample.agentDraft}</Text>
          </Box>
        </BlockStack>

        {/* Actual response (if different) */}
        {sample.actualResponse && sample.actualResponse !== sample.agentDraft && (
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="semibold">Actual Response Sent:</Text>
            <Box background="bg-success-subdued" padding="300" borderRadius="200">
              <Text variant="bodyMd">{sample.actualResponse}</Text>
            </Box>
          </BlockStack>
        )}

        <Divider />

        {/* Rating rubric */}
        <BlockStack gap="300">
          <Text variant="bodyMd" fontWeight="semibold">Rate this response:</Text>

          {Object.entries(RUBRIC_LABELS).map(([key, label]) => (
            <RatingRow
              key={key}
              label={label}
              value={ratings[key as keyof typeof ratings]}
              onChange={(value) => setRatings(prev => ({ ...prev, [key]: value }))}
            />
          ))}
        </BlockStack>

        <Divider />

        {/* Tags */}
        <BlockStack gap="200">
          <Text variant="bodyMd" fontWeight="semibold">Tags:</Text>
          <InlineStack gap="200" wrap>
            {tags.map(tag => (
              <Tag key={tag} onRemove={() => removeTag(tag)}>
                {tag}
              </Tag>
            ))}
            <Button variant="plain" size="slim" onClick={openTagDialog}>
              + Add Tag
            </Button>
          </InlineStack>
        </BlockStack>

        {/* Notes */}
        <TextField
          label="Notes (optional)"
          value={notes}
          onChange={setNotes}
          multiline={3}
          placeholder="Any additional feedback or context..."
        />

        {/* Actions */}
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={() => submitFeedback({ ratings, tags, notes })}
            disabled={!allRatingsProvided(ratings)}
          >
            Submit Feedback
          </Button>
          <Button onClick={() => skipSample(sample.id)}>
            Skip
          </Button>
        </ButtonGroup>
      </BlockStack>
    </Card>
  );
}

// Rating row component
function RatingRow({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <InlineStack gap="300" blockAlign="center" align="space-between">
      <Text variant="bodyMd">{label}:</Text>
      <InlineStack gap="100">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
            aria-label={`Rate ${label} ${star} out of 5 stars`}
          >
            {star <= value ? '★' : '☆'}
          </button>
        ))}
      </InlineStack>
    </InlineStack>
  );
}

const RUBRIC_LABELS = {
  factuality: 'Factuality',
  helpfulness: 'Helpfulness',
  tone: 'Tone',
  policy: 'Policy Alignment',
  resolution: 'First-Time Resolution',
};

interface TrainingSample {
  id: string;
  conversationId: number;
  agentName: string;
  timestamp: string;
  customerInput: string;
  agentDraft: string;
  actualResponse?: string;
  tags?: string[];
}
```

---

## 3. Training Data Quality Dashboard

### Route: `/app/training-data`

**Visual Layout**:

```
┌───────────────────────────────────────────────────────────────┐
│ Training Data Quality                                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ [Stats Bar]                                                   │
│ 156 Total | 89 Rated | 67 Pending | 4.2/5.0 Avg Score       │
│                                                               │
│ ┌───────────────────┐  ┌──────────────────────────────────┐ │
│ │ Quality Score     │  │ Rubric Breakdown                 │ │
│ │ Distribution      │  │                                  │ │
│ │                   │  │ Factuality:    ████████░ 4.3    │ │
│ │ 5★  ████████  45  │  │ Helpfulness:   ███████░░ 4.1    │ │
│ │ 4★  ████      20  │  │ Tone:          ████████░ 4.4    │ │
│ │ 3★  ██        12  │  │ Policy:        █████████ 4.5    │ │
│ │ 2★  █          8  │  │ Resolution:    ██████░░░ 3.9    │ │
│ │ 1★  █          4  │  │                                  │ │
│ └───────────────────┘  └──────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Low Quality Samples (Score < 3.0)                       │ │
│ │                                                         │ │
│ │ • #156: "Refund policy" - 2.4/5.0 - Review needed      │ │
│ │ • #143: "Shipping delay" - 2.8/5.0 - Review needed     │ │
│ │                                                         │ │
│ │ [Review Low Quality Samples]                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Export Dataset CSV]    [View All Samples]                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { Page, Layout, Card, InlineGrid, DataTable } from '@shopify/polaris';

export default function TrainingDataRoute() {
  const { stats, qualityDist, rubricScores, lowQuality } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Training Data Quality"
      primaryAction={{ content: 'Export Dataset', onAction: handleExport }}
    >
      <Layout>
        {/* Stats bar */}
        <Layout.Section>
          <Card>
            <InlineGrid columns={4} gap="400">
              <StatCard label="Total Samples" value={stats.total} />
              <StatCard label="Rated" value={stats.rated} />
              <StatCard label="Pending Review" value={stats.pending} />
              <StatCard
                label="Avg Score"
                value={`${stats.avgScore.toFixed(1)}/5.0`}
                tone={stats.avgScore >= 4 ? 'success' : 'warning'}
              />
            </InlineGrid>
          </Card>
        </Layout.Section>

        {/* Charts */}
        <Layout.Section variant="oneThird">
          <QualityDistributionChart data={qualityDist} />
        </Layout.Section>

        <Layout.Section variant="twoThirds">
          <RubricBreakdownChart scores={rubricScores} />
        </Layout.Section>

        {/* Low quality samples */}
        {lowQuality.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Low Quality Samples (Score &lt; 3.0)
                </Text>
                <List>
                  {lowQuality.map(sample => (
                    <List.Item key={sample.id}>
                      #{sample.id}: "{sample.topic}" - {sample.score}/5.0 - Review needed
                    </List.Item>
                  ))}
                </List>
                <Button url="/app/training-feedback?filter=low-quality">
                  Review Low Quality Samples
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}

// Quality distribution chart
function QualityDistributionChart({ data }: { data: QualityDist[] }) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Quality Score Distribution</Text>

        <BlockStack gap="200">
          {data.map(item => (
            <InlineStack key={item.stars} gap="200" blockAlign="center">
              <Box minWidth="40px">
                <Text variant="bodySm">{item.stars}★</Text>
              </Box>
              <Box width="100%">
                <ProgressBar
                  progress={(item.count / maxCount) * 100}
                  size="small"
                />
              </Box>
              <Box minWidth="40px">
                <Text variant="bodySm">{item.count}</Text>
              </Box>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

// Rubric breakdown chart
function RubricBreakdownChart({ scores }: { scores: RubricScores }) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Rubric Breakdown</Text>

        <BlockStack gap="300">
          {Object.entries(scores).map(([key, score]) => (
            <BlockStack key={key} gap="100">
              <InlineStack align="space-between">
                <Text variant="bodyMd">{RUBRIC_LABELS[key]}:</Text>
                <Text variant="bodyMd" fontWeight="semibold">
                  {score.toFixed(1)}/5.0
                </Text>
              </InlineStack>
              <ProgressBar
                progress={(score / 5) * 100}
                tone={score >= 4 ? 'success' : score >= 3 ? 'warning' : 'critical'}
                size="small"
              />
            </BlockStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
```

---

## 3. Training Data Filtering & Sorting

### Filter Options

```typescript
import { Filters, ChoiceList } from '@shopify/polaris';

function TrainingDataFilters() {
  const [selected Agents, setSelectedAgents] = useState<string[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filters = [
    {
      key: 'agent',
      label: 'Agent',
      filter: (
        <ChoiceList
          title="Agent"
          choices={[
            { label: 'Order Support', value: 'order_support' },
            { label: 'Product Q&A', value: 'product_qa' },
            { label: 'Triage', value: 'triage' },
          ]}
          selected={selectedAgents}
          onChange={setSelectedAgents}
          allowMultiple
        />
      ),
    },
    {
      key: 'quality',
      label: 'Quality',
      filter: (
        <ChoiceList
          title="Quality Score"
          choices={[
            { label: 'Excellent (5★)', value: '5' },
            { label: 'Good (4★)', value: '4' },
            { label: 'Fair (3★)', value: '3' },
            { label: 'Poor (2★)', value: '2' },
            { label: 'Very Poor (1★)', value: '1' },
          ]}
          selected={selectedQuality}
          onChange={setSelectedQuality}
          allowMultiple
        />
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      filter: (
        <ChoiceList
          title="Tags"
          choices={availableTags.map(tag => ({
            label: tag,
            value: tag,
          }))}
          selected={selectedTags}
          onChange={setSelectedTags}
          allowMultiple
        />
      ),
    },
  ];

  return (
    <Filters
      filters={filters}
      appliedFilters={getAppliedFilters()}
      onClearAll={handleClearAll}
    />
  );
}
```

---

## 4. Bulk Operations

### Bulk Rating UI

**Purpose**: Rate multiple samples quickly

```
┌───────────────────────────────────────────────────────────────┐
│ Quick Rating Mode                                             │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Sample 1 of 12                                [Exit Mode]    │
│                                                               │
│ Input: "Where's my order?"                                    │
│ Response: "Tracking shows delivery tomorrow."                 │
│                                                               │
│ [★ Poor] [★★ Fair] [★★★ Good] [★★★★ Excellent] [Skip]      │
│                                                               │
│ ████████████░░░░░░░░░░░░░░░░  8/12 rated                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function QuickRatingMode({ samples }: { samples: TrainingSample[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = samples[currentIndex];

  const handleQuickRate = async (stars: number) => {
    await submitQuickRating(current.id, stars);

    if (currentIndex < samples.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Done
      showToast('All samples rated!');
      onExit();
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        {/* Progress */}
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Quick Rating Mode
          </Text>
          <Button onClick={onExit} variant="plain">Exit Mode</Button>
        </InlineStack>

        <Text variant="bodySm" tone="subdued">
          Sample {currentIndex + 1} of {samples.length}
        </Text>

        {/* Current sample */}
        <BlockStack gap="300">
          <Box background="bg-surface-secondary" padding="300" borderRadius="200">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="semibold">Input:</Text>
              <Text variant="bodyMd">{current.customerInput}</Text>
            </BlockStack>
          </Box>

          <Box background="bg-info-subdued" padding="300" borderRadius="200">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="semibold">Response:</Text>
              <Text variant="bodyMd">{current.agentDraft}</Text>
            </BlockStack>
          </Box>
        </BlockStack>

        {/* Quick rating buttons */}
        <InlineStack gap="200">
          <Button onClick={() => handleQuickRate(1)} size="slim">
            ★ Poor
          </Button>
          <Button onClick={() => handleQuickRate(2)} size="slim">
            ★★ Fair
          </Button>
          <Button onClick={() => handleQuickRate(3)} size="slim">
            ★★★ Good
          </Button>
          <Button onClick={() => handleQuickRate(4)} size="slim">
            ★★★★ Very Good
          </Button>
          <Button onClick={() => handleQuickRate(5)} size="slim" variant="primary">
            ★★★★★ Excellent
          </Button>
          <Button onClick={() => setCurrentIndex(currentIndex + 1)} variant="plain">
            Skip
          </Button>
        </InlineStack>

        {/* Progress bar */}
        <ProgressBar
          progress={(currentIndex / samples.length) * 100}
          tone="info"
        />
        <Text variant="bodySm" tone="subdued" alignment="center">
          {currentIndex} of {samples.length} rated
        </Text>
      </BlockStack>
    </Card>
  );
}
```

---

## 5. Dataset Export UI

### Export Options Modal

```typescript
<Modal
  open={showExportModal}
  onClose={() => setShowExportModal(false)}
  title="Export Training Dataset"
  primaryAction={{
    content: 'Export',
    onAction: handleExport,
  }}
  secondaryActions={[
    { content: 'Cancel', onAction: () => setShowExportModal(false) },
  ]}
>
  <Modal.Section>
    <BlockStack gap="400">
      {/* Format selection */}
      <Select
        label="Export Format"
        options={[
          { label: 'CSV (Spreadsheet)', value: 'csv' },
          { label: 'JSONL (Training)', value: 'jsonl' },
          { label: 'JSON (API)', value: 'json' },
        ]}
        value={exportFormat}
        onChange={setExportFormat}
      />

      {/* Date range */}
      <InlineStack gap="200">
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={setEndDate}
        />
      </InlineStack>

      {/* Quality filter */}
      <Select
        label="Quality Filter"
        options={[
          { label: 'All samples', value: 'all' },
          { label: 'High quality only (4★+)', value: 'high' },
          { label: 'Rated only', value: 'rated' },
        ]}
        value={qualityFilter}
        onChange={setQualityFilter}
      />

      {/* Preview */}
      <Banner tone="info">
        <Text variant="bodyMd">
          Export will include {estimatedCount} samples based on your filters.
        </Text>
      </Banner>
    </BlockStack>
  </Modal.Section>
</Modal>
```

---

## 6. Notification Patterns

### New Sample Available Toast

```typescript
import { useToast } from "@shopify/app-bridge-react";

function TrainingDataNotifications() {
  const toast = useToast();

  useEffect(() => {
    // Poll for new samples needing review
    const interval = setInterval(async () => {
      const count = await fetchPendingCount();

      if (count > previousCount) {
        toast.show(`${count - previousCount} new samples need review`, {
          duration: 5000,
        });
      }

      setPreviousCount(count);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}
```

---

## 7. Mobile Optimization

### Mobile Training Feedback

**Simplified for mobile**:

```typescript
// On mobile: Show one rubric item at a time with swipe
// On desktop: Show all rubric items at once

<Box display={{ xs: 'block', md: 'none' }}>
  {/* Mobile: One rubric at a time */}
  <Card>
    <BlockStack gap="400">
      <Text variant="headingMd" as="h2">
        {RUBRIC_LABELS[currentRubric]}
      </Text>
      <StarRating
        value={ratings[currentRubric]}
        onChange={(v) => updateRating(currentRubric, v)}
      />
      <ButtonGroup fullWidth>
        <Button onClick={previousRubric}>Previous</Button>
        <Button variant="primary" onClick={nextRubric}>Next</Button>
      </ButtonGroup>
    </BlockStack>
  </Card>
</Box>

<Box display={{ xs: 'none', md: 'block' }}>
  {/* Desktop: All rubrics visible */}
  {Object.entries(RUBRIC_LABELS).map(...)}
</Box>
```

---

## 8. TypeScript Interfaces

```typescript
// Training sample
interface TrainingSample {
  id: string;
  conversationId: number;
  agentName: string;
  timestamp: string;
  customerInput: string;
  agentDraft: string;
  actualResponse?: string;
  tags?: string[];
  rubric?: RubricRatings;
  notes?: string;
  annotator?: string;
  createdAt: string;
}

// Rubric ratings
interface RubricRatings {
  factuality?: number; // 1-5
  helpfulness?: number; // 1-5
  tone?: number; // 1-5
  policy?: number; // 1-5
  resolution?: number; // 1-5
}

// Quality statistics
interface QualityStats {
  total: number;
  rated: number;
  pending: number;
  avgScore: number;
}

// Quality distribution
interface QualityDist {
  stars: number; // 1-5
  count: number;
}

// Rubric scores
interface RubricScores {
  factuality: number;
  helpfulness: number;
  tone: number;
  policy: number;
  resolution: number;
}

// Low quality sample
interface LowQualitySample {
  id: string;
  topic: string;
  score: number;
}
```

---

## 9. Implementation Checklist

### Phase 1: Review Queue (Day 1)

- [ ] Create `/app/training-feedback` route
- [ ] Implement `TrainingFeedbackCard` component
- [ ] Add star rating component
- [ ] Add tag management
- [ ] Test feedback submission

### Phase 2: Quality Dashboard (Day 2)

- [ ] Create `/app/training-data` route
- [ ] Implement stats cards
- [ ] Add quality distribution chart
- [ ] Add rubric breakdown chart
- [ ] Add low quality samples list

### Phase 3: Filtering & Export (Day 3)

- [ ] Implement filters (agent, quality, tags)
- [ ] Add export modal with options
- [ ] Implement CSV/JSONL export
- [ ] Test export with large datasets

### Phase 4: Polish (Day 4)

- [ ] Add quick rating mode
- [ ] Implement notifications
- [ ] Mobile optimization
- [ ] Accessibility testing

---

## 10. Success Criteria

- [ ] Operators can rate responses in < 30 seconds each
- [ ] Quality metrics visible at a glance
- [ ] Low-quality samples easily identified
- [ ] Export works for datasets of 1000+ samples
- [ ] Mobile-friendly for on-the-go reviews
- [ ] Accessible (WCAG 2.2 AA)

---

**Status**: Training Data Visualization UI Complete  
**Created**: 2025-10-11  
**Owner**: Designer Agent  
**Ready For**: Engineer Implementation (parallelize with agent metrics)
