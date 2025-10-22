import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";

import type { OrderSummary } from "../../services/shopify/types";
import type { WoWVariance } from "../../services/analytics/wow-variance";
import { useModalFocusTrap } from "../../hooks/useModalFocusTrap";
import { useToast } from "../../hooks/useToast";

interface SalesPulseModalProps {
  summary: OrderSummary;
  open: boolean;
  onClose: () => void;
}

interface SalesPulseActionResponse {
  ok?: boolean;
  error?: string;
}

type SalesAction = "acknowledge" | "escalate" | "no_action";

const ACTION_LABELS: Record<SalesAction, string> = {
  acknowledge: "Log follow-up",
  escalate: "Escalate to ops",
  no_action: "No action",
};

export function SalesPulseModal({
  summary,
  open,
  onClose,
}: SalesPulseModalProps) {
  const fetcher = useFetcher<SalesPulseActionResponse>();
  const [note, setNote] = useState("");
  const [selectedAction, setSelectedAction] =
    useState<SalesAction>("acknowledge");
  
  // WoW variance state
  const [revenueVariance, setRevenueVariance] = useState<WoWVariance | null>(null);
  const [ordersVariance, setOrdersVariance] = useState<WoWVariance | null>(null);
  const [varianceLoading, setVarianceLoading] = useState(false);

  // Accessibility: Focus trap + Escape key + Initial focus (WCAG 2.4.3, 2.1.1)
  useModalFocusTrap(open, onClose);

  // Toast notifications for user feedback (Designer P0 requirement)
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open) {
      setNote("");
      setSelectedAction("acknowledge");
      fetchWoWVariance();
    }
  }, [open]);

  // Fetch WoW variance data when modal opens
  const fetchWoWVariance = async () => {
    setVarianceLoading(true);
    try {
      // Extract shop domain from summary (assuming it's available)
      const shopDomain = summary.shopDomain || "demo-shop.myshopify.com";
      
      const [revenueResponse, ordersResponse] = await Promise.all([
        fetch(`/api/analytics/wow-variance?project=${shopDomain}&metric=revenue`),
        fetch(`/api/analytics/wow-variance?project=${shopDomain}&metric=orders`)
      ]);

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        if (revenueData.success) {
          setRevenueVariance(revenueData.data);
        }
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setOrdersVariance(ordersData.data);
        }
      }
    } catch (error) {
      console.error("Error fetching WoW variance:", error);
    } finally {
      setVarianceLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.ok) {
      showSuccess("Action logged! 📊");
      onClose();
    } else if (fetcher.data?.error) {
      showError(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data, open, onClose, showSuccess, showError]);

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
      pendingFulfillment: summary.pendingFulfillment
        .slice(0, 5)
        .map((order) => ({
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
    
    // Add WoW variance data for audit trail
    if (revenueVariance) {
      formData.set("revenueVariance", JSON.stringify(revenueVariance));
    }
    if (ordersVariance) {
      formData.set("ordersVariance", JSON.stringify(ordersVariance));
    }
    
    // Add timestamp and action metadata
    formData.set("timestamp", new Date().toISOString());
    formData.set("actionType", "sales_pulse_review");
    formData.set("operator", "system"); // TODO: Get from auth context

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
              Revenue today: {summary.currency}{" "}
              {summary.totalRevenue.toFixed(2)} · Orders: {summary.orderCount}
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
            <h3>Snapshot (Last 24h)</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Revenue:</strong> {summary.currency}{" "}
                {summary.totalRevenue.toFixed(2)}
                {revenueVariance ? (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      color: revenueVariance.trend === "up" ? "var(--occ-color-success)" : 
                             revenueVariance.trend === "down" ? "var(--occ-color-error)" : 
                             "var(--occ-text-secondary)",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    (WoW: {revenueVariance.variance > 0 ? "+" : ""}{revenueVariance.variance}% {revenueVariance.trend === "up" ? "↗" : revenueVariance.trend === "down" ? "↘" : "→"})
                  </span>
                ) : varianceLoading ? (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      color: "var(--occ-text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    (Loading variance...)
                  </span>
                ) : (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      color: "var(--occ-text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    (WoW variance: unavailable)
                  </span>
                )}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Orders:</strong> {summary.orderCount}
                {ordersVariance ? (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      color: ordersVariance.trend === "up" ? "var(--occ-color-success)" : 
                             ordersVariance.trend === "down" ? "var(--occ-color-error)" : 
                             "var(--occ-text-secondary)",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    (WoW: {ordersVariance.variance > 0 ? "+" : ""}{ordersVariance.variance}% {ordersVariance.trend === "up" ? "↗" : ordersVariance.trend === "down" ? "↘" : "→"})
                  </span>
                ) : null}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Avg order:</strong> {summary.currency}{" "}
                {summary.orderCount > 0
                  ? (summary.totalRevenue / summary.orderCount).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            {revenueVariance && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--occ-text-secondary)",
                  margin: "0.5rem 0 0 0",
                  fontStyle: "italic",
                }}
              >
                WoW variance: Current week vs previous week comparison
              </p>
            )}
          </section>

          <section className="occ-modal__section">
            <h3>Top SKUs</h3>
            <ul className="occ-modal__list">
              {summary.topSkus.map((sku) => (
                <li key={`${sku.sku}-${sku.title}`}>
                  <span>{sku.title}</span>
                  <span>
                    {sku.quantity} units · {summary.currency}{" "}
                    {sku.revenue.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="occ-modal__section">
            <h3>Open fulfillment issues</h3>
            {summary.pendingFulfillment.length === 0 ? (
              <p className="occ-text-secondary">No blockers detected.</p>
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
                onChange={(event) =>
                  setSelectedAction(event.currentTarget.value as SalesAction)
                }
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
              aria-live="polite"
              aria-atomic="true"
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
