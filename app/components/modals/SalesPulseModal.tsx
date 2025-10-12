import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";

import type { OrderSummary } from "../../services/shopify/types";

interface SalesPulseModalProps {
  summary: OrderSummary;
  open: boolean;
  onClose: () => void;
}

interface SalesPulseActionResponse {
  ok?: boolean;
  error?: string;
}

type SalesAction = "acknowledge" | "escalate";

const ACTION_LABELS: Record<SalesAction, string> = {
  acknowledge: "Log follow-up",
  escalate: "Escalate to ops",
};

export function SalesPulseModal({ summary, open, onClose }: SalesPulseModalProps) {
  const fetcher = useFetcher<SalesPulseActionResponse>();
  const [note, setNote] = useState("");
  const [selectedAction, setSelectedAction] = useState<SalesAction>("acknowledge");

  useEffect(() => {
    if (open) {
      setNote("");
      setSelectedAction("acknowledge");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.ok) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, open, onClose]);

  const isSubmitting = fetcher.state !== "idle";

  const summaryContext = useMemo(() => {
    return {
      totalRevenue: summary.totalRevenue,
      currency: summary.currency,
      orderCount: summary.orderCount,
      topSkus: summary.topSkus.slice(0, 5).map((sku) => ({
        sku: sku.sku,
        title: sku.title,
        quantity: sku.quantity,
        revenue: sku.revenue,
      })),
      pendingFulfillment: summary.pendingFulfillment.slice(0, 5).map((order) => ({
        orderId: order.orderId,
        name: order.name,
        displayStatus: order.displayStatus,
      })),
    };
  }, [summary]);

  const submit = (action: SalesAction) => {
    const formData = new FormData();
    formData.set("action", action);
    if (note.trim()) {
      formData.set("note", note.trim());
    }
    formData.set("context", JSON.stringify(summaryContext));
    formData.set("currency", summary.currency);
    formData.set("totalRevenue", String(summary.totalRevenue));
    formData.set("orderCount", String(summary.orderCount));

    fetcher.submit(formData, {
      method: "post",
      action: "/actions/sales-pulse/decide",
      encType: "application/x-www-form-urlencoded",
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="occ-modal-backdrop" role="presentation">
      <dialog
        open
        className="occ-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sales-pulse-modal-title"
        data-testid="sales-pulse-dialog"
      >
        <div className="occ-modal__header">
          <div>
            <h2 id="sales-pulse-modal-title">Sales Pulse — Details</h2>
            <p className="occ-text-meta" style={{ margin: 0 }}>
              Revenue today: {summary.currency} {summary.totalRevenue.toFixed(2)} · Orders: {summary.orderCount}
            </p>
          </div>
          <button
            type="button"
            className="occ-button occ-button--plain"
            onClick={onClose}
            aria-label="Close sales pulse modal"
          >
            Close
          </button>
        </div>

        <div className="occ-modal__body">
          <section className="occ-modal__section">
            <h3>Top SKUs</h3>
            <ul className="occ-modal__list">
              {summary.topSkus.map((sku) => (
                <li key={`${sku.sku}-${sku.title}`}>
                  <span>{sku.title}</span>
                  <span>
                    {sku.quantity} units · {summary.currency} {sku.revenue.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="occ-modal__section">
            <h3>Pending fulfillment</h3>
            {summary.pendingFulfillment.length === 0 ? (
              <p className="occ-text-secondary">All clear — no blockers.</p>
            ) : (
              <ul className="occ-modal__list">
                {summary.pendingFulfillment.map((order) => (
                  <li key={order.orderId}>
                    <span>{order.name}</span>
                    <span>{order.displayStatus}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="occ-modal__section">
            <h3>Capture follow-up</h3>
            <label className="occ-field">
              <span className="occ-field__label">Action</span>
              <select
                className="occ-select"
                value={selectedAction}
                onChange={(event) => setSelectedAction(event.currentTarget.value as SalesAction)}
                disabled={isSubmitting}
              >
                {Object.entries(ACTION_LABELS).map(([action, label]) => (
                  <option key={action} value={action}>
                    {label}
                  </option>
                ))}
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
            {fetcher.data?.error ? (
              <p className="occ-feedback occ-feedback--error" role="alert">
                {fetcher.data.error}
              </p>
            ) : null}
          </section>
        </div>

        <div className="occ-modal__footer">
          <div className="occ-modal__footer-actions">
            <button
              type="button"
              className="occ-button occ-button--primary"
              onClick={() => submit(selectedAction)}
              disabled={isSubmitting}
            >
              {ACTION_LABELS[selectedAction]}
            </button>
          </div>
          <button
            type="button"
            className="occ-button occ-button--plain"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </dialog>
    </div>
  );
}
