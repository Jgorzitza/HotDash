---
epoch: 2025.10.E1
doc: docs/design/advanced-components-13-17.md
owner: designer
created: 2025-10-11
---

# Advanced UI Components (Tasks 13-17)

## Task 13: Comprehensive Data Table Component

**Polaris DataTable with Extensions**:

- Sorting (multi-column)
- Filtering (per column)
- Pagination (client-side & server-side)
- Row selection (bulk actions)
- Expandable rows
- Export to CSV

**Implementation**:

```typescript
<DataTable
  columnContentTypes={['text', 'numeric', 'text', 'numeric']}
  headings={['Order', 'Amount', 'Status', 'Items']}
  rows={data}
  sortable={[true, true, true, true]}
  pagination={{ hasNext, hasPrevious, onNext, onPrevious }}
/>
```

---

## Task 14: Advanced Form Components

**Multi-Step Forms**:

```typescript
<FormLayout>
  <Stepper activeStep={currentStep} steps={['Info', 'Review', 'Confirm']} />
  {currentStep === 0 && <StepOne />}
  {currentStep === 1 && <StepTwo />}
  {currentStep === 2 && <StepThree />}
  <ButtonGroup>
    <Button onClick={previous}>Back</Button>
    <Button variant="primary" onClick={next}>Next</Button>
  </ButtonGroup>
</FormLayout>
```

**Validation Patterns**:

- Inline validation (onChange)
- Submit validation (onSubmit)
- Async validation (API check)
- Error messages with suggestions

**Auto-Save**:

- Debounced onChange (save after 2s idle)
- Draft indicator
- Conflict resolution

---

## Task 15: Chart and Visualization Library

**Chart Types Needed**:

1. Line charts (trends over time)
2. Bar charts (comparisons)
3. Progress bars (percentages)
4. Sparklines (compact trends)

**Recommended Library**: Recharts (lightweight, accessible)

**Polaris Alternative**: Use ProgressBar + custom layouts

---

## Task 16: Modal and Dialog System

**Modal Variants**:

```typescript
// Confirmation dialog (small)
<Modal size="small" title="Confirm Action">
  <Modal.Section>
    <Text>Are you sure?</Text>
  </Modal.Section>
</Modal>

// Form dialog (medium)
<Modal size="medium" title="Edit Item">
  <Modal.Section>
    <FormLayout>{/* form */}</FormLayout>
  </Modal.Section>
</Modal>

// Detail view (large)
<Modal size="large" title="Full Details">
  <Modal.Section>{/* content */}</Modal.Section>
</Modal>

// Full screen (complex workflows)
<Modal size="fullScreen" title="Workflow">
  {/* Multi-step content */}
</Modal>
```

---

## Task 17: Toast Notification System

**Priority Levels**:

```typescript
// Success (green, 3s)
toast.show("Saved successfully");

// Error (red, persistent)
toast.show("Save failed", { isError: true, duration: 0 });

// Info (blue, 5s)
toast.show("3 new items", { duration: 5000 });

// Warning (yellow, persistent)
toast.show("Unsaved changes", { duration: 0 });
```

**Status**: All 5 component specs complete
