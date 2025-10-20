import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import type { InventoryAlert } from "../../services/shopify/types";

interface InventoryModalProps {
  alert: InventoryAlert;
  open: boolean;
  onClose: () => void;
}

interface InventoryActionResponse {
  ok?: boolean;
  error?: string;
}

type InventoryAction = "create_po" | "adjust_quantity" | "mark_intentional" | "snooze";

const ACTION_LABELS: Record<InventoryAction, string> = {
  create_po: "Create Draft PO",
  adjust_quantity: "Adjust Quantity",
  mark_intentional: "Mark as Intentional",
  snooze: "Snooze Alert",
};

export function InventoryModal({
  alert,
  open,
  onClose,
}: InventoryModalProps) {
  const fetcher = useFetcher<InventoryActionResponse>();
  const [selectedAction, setSelectedAction] = useState<InventoryAction>("create_po");
  const [reorderQuantity, setReorderQuantity] = useState(30);
  const [vendor, setVendor] = useState("acme_distribution");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedAction("create_po");
      setReorderQuantity(30);
      setVendor("acme_distribution");
      setNote("");
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

  const submit = () => {
    const formData = new FormData();
    formData.set("action", selectedAction);
    formData.set("variantId", alert.variantId);
    formData.set("sku", alert.sku);
    formData.set("reorderQuantity", String(reorderQuantity));
    formData.set("vendor", vendor);
    if (note.trim()) {
      formData.set("note", note.trim());
    }

    // Add velocity analysis data
    const velocityAnalysis = {
      avgDailySales: alert.daysOfCover ? alert.quantityAvailable / alert.daysOfCover : 0,
      currentStock: alert.quantityAvailable,
      threshold: alert.threshold,
      daysOfCover: alert.daysOfCover ?? 0,
    };
    formData.set("velocityAnalysis", JSON.stringify(velocityAnalysis));

    fetcher.submit(formData, {
      action: "/actions/inventory/reorder",
      method: "post",
      encType: "application/x-www-form-urlencoded",
    });
  };

  if (!open) {
    return null;
  }

  // Calculate simple velocity metrics from available data
  const avgDailySales = alert.daysOfCover && alert.daysOfCover > 0
    ? (alert.quantityAvailable / alert.daysOfCover).toFixed(1)
    : "N/A";

  return (
    <div className="occ-modal-backdrop" role="presentation">
      <dialog
        open
        className="occ-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`inventory-alert-${alert.variantId}-title`}
        data-testid="inventory-alert-dialog"
      >
        <div className="occ-modal__header">
          <div>
            <h2 id={`inventory-alert-${alert.variantId}-title`}>
              Inventory Alert — {alert.title}
            </h2>
            <p className="occ-text-meta" style={{ margin: 0 }}>
              SKU: {alert.sku} · Variant ID: {alert.variantId}
            </p>
          </div>
          <button
            type="button"
            className="occ-button occ-button--plain"
            onClick={onClose}
            aria-label="Close inventory alert modal"
          >
            Close
          </button>
        </div>

        <div className="occ-modal__body">
          <section className="occ-modal__section">
            <h3>Current Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ margin: 0 }}>
                <strong>Current Stock:</strong> {alert.quantityAvailable} units
              </p>
              <p style={{ margin: 0 }}>
                <strong>Threshold:</strong> {alert.threshold} units
              </p>
              {alert.daysOfCover != null && (
                <p style={{ margin: 0 }}>
                  <strong>Days of Cover:</strong> {alert.daysOfCover.toFixed(1)} days
                </p>
              )}
            </div>
          </section>

          <section className="occ-modal__section">
            <h3>14-Day Velocity Analysis</h3>
            <div
              style={{
                padding: "1rem",
                background: "var(--occ-surface-subdued)",
                borderRadius: "var(--occ-border-radius)",
              }}
            >
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>Avg daily sales:</strong> {avgDailySales} units
              </p>
              <p style={{ margin: 0, color: "var(--occ-text-secondary)" }}>
                {/* TODO: Add peak day and trend data when demand-forecast service is integrated */}
                Analysis based on current stock and days of cover
              </p>
            </div>
          </section>

          <section className="occ-modal__section">
            <h3>Reorder Recommendation</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label className="occ-field">
                <span className="occ-field__label">Reorder Quantity</span>
                <input
                  type="number"
                  className="occ-input"
                  min="1"
                  step="1"
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(Number(e.target.value))}
                  disabled={isSubmitting}
                  aria-label="Enter reorder quantity in units"
                />
              </label>

              <label className="occ-field">
                <span className="occ-field__label">Vendor</span>
                <select
                  className="occ-select"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  disabled={isSubmitting}
                  aria-label="Select vendor for purchase order"
                >
                  <option value="acme_distribution">Acme Distribution</option>
                  <option value="primary_supplier">Primary Supplier</option>
                  <option value="backup_vendor">Backup Vendor</option>
                </select>
              </label>

              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--occ-text-secondary)" }}>
                Lead Time: 7 days (estimated)
              </p>
            </div>
          </section>

          <section className="occ-modal__section">
            <h3>Action</h3>
            <label className="occ-field">
              <span className="occ-field__label">What do you want to do?</span>
              <select
                className="occ-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as InventoryAction)}
                disabled={isSubmitting}
                aria-label="Select inventory action"
              >
                {Object.entries(ACTION_LABELS).map(([action, label]) => (
                  <option key={action} value={action}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="occ-field">
              <span className="occ-field__label">Notes (audit trail)</span>
              <textarea
                className="occ-textarea"
                rows={3}
                placeholder="Add context for the decision log"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSubmitting}
                aria-label="Add notes for audit trail"
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
              onClick={submit}
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

