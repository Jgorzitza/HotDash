# Component Snippets — CX Escalations & Sales Pulse Modals

## CX Escalations Modal header + footer (React Router 2025-10-10)

```tsx
<dialog
  open
  className="occ-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby={`cx-escalation-${conversation.id}-title`}
  data-testid="cx-escalation-dialog"
>
  <div className="occ-modal__header">
    <div>
      <h2 id={`cx-escalation-${conversation.id}-title`}>
        CX Escalation — {conversation.customerName}
      </h2>
      <p className="occ-text-meta" style={{ margin: 0 }}>
        Conversation #{conversation.id} · Status: {conversation.status}
      </p>
    </div>
    <button
      type="button"
      className="occ-button occ-button--plain"
      onClick={onClose}
      aria-label="Close escalation modal"
    >
      Close
    </button>
  </div>

  {/* …body omitted for brevity… */}

  <div className="occ-modal__footer">
    <div className="occ-modal__footer-actions">
      <button
        type="button"
        className="occ-button occ-button--primary"
        onClick={handleApprove}
        disabled={!hasSuggestion || !reply.trim() || isSubmitting}
        data-testid="cx-approve"
      >
        Approve &amp; send
      </button>
      <button
        type="button"
        className="occ-button occ-button--secondary"
        onClick={handleEscalate}
        disabled={isSubmitting}
        data-testid="cx-escalate"
      >
        Escalate
      </button>
      <button
        type="button"
        className="occ-button occ-button--secondary"
        onClick={handleResolve}
        disabled={isSubmitting}
        data-testid="cx-resolve"
      >
        Mark resolved
      </button>
    </div>
    <button
      type="button"
      className="occ-button occ-button--plain"
      onClick={onClose}
      disabled={isSubmitting}
      data-testid="cx-cancel"
    >
      Cancel
    </button>
  </div>
</dialog>
```

## CX Escalations Modal note field (support inbox helper)

```tsx
<label className="occ-field">
  <span className="occ-field__label">Internal note</span>
  <textarea
    className="occ-textarea"
    rows={3}
    value={note}
    onChange={(event) => setNote(event.currentTarget.value)}
    placeholder="Add context for audit trail"
    disabled={isSubmitting}
  />
  <p className="occ-text-helper">
    Log decision to customer.support@hotrodan.com within 5 minutes if follow-up is required.
  </p>
</label>
```

## Sales Pulse Modal action cluster (React Router 2025-10-10)

```tsx
<label className="occ-field">
  <span className="occ-field__label">Action</span>
  <select
    className="occ-select"
    value={selectedAction}
    onChange={(event) => setSelectedAction(event.currentTarget.value as SalesAction)}
    disabled={isSubmitting}
    data-testid="sales-action"
  >
    <option value="acknowledge">Log follow-up</option>
    <option value="escalate">Escalate to ops</option>
  </select>
</label>
<label className="occ-field">
  <span className="occ-field__label">Notes</span>
  <textarea
    className="occ-textarea"
    rows={3}
    placeholder="Add context for the decision log"
    value={note}
    onChange={(event) => setNote(event.currentTarget.value)}
    disabled={isSubmitting}
  />
</label>
<div className="occ-modal__footer">
  <div className="occ-modal__footer-actions">
    <button
      type="button"
      className="occ-button occ-button--primary"
      onClick={() => submit(selectedAction)}
      disabled={isSubmitting}
      data-testid="sales-submit"
    >
      {ACTION_LABELS[selectedAction]}
    </button>
  </div>
  <button
    type="button"
    className="occ-button occ-button--plain"
    onClick={onClose}
    disabled={isSubmitting}
    data-testid="sales-cancel"
  >
    Cancel
  </button>
</div>
```

## Sales Pulse helper text (support inbox reminder)

```tsx
<p className="occ-text-helper" style={{ marginTop: "var(--occ-space-2)" }}>
  Variance alerts notify customer.support@hotrodan.com when they exceed 15%.
</p>
```
