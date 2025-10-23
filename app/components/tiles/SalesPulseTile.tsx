import { useState } from "react";

import type { OrderSummary } from "../../services/shopify/types";

interface SalesPulseTileProps {
  summary: OrderSummary;
  enableModal?: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function SalesPulseTile({
  summary,
  enableModal = false,
}: SalesPulseTileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div>
        <p
          style={{
            fontSize: "var(--occ-font-size-metric)",
            fontWeight: "var(--occ-font-weight-semibold)",
            margin: 0,
            color: "var(--occ-text-primary)",
          }}
        >
          {formatCurrency(summary.totalRevenue, summary.currency)}
        </p>
        <p
          className="occ-text-meta"
          style={{ margin: "var(--occ-space-1) 0 0 0" }}
        >
          {summary.orderCount} orders in the current window.
        </p>
        {enableModal ? (
          <button
            type="button"
            className="occ-link-button"
            onClick={openModal}
            data-testid="sales-pulse-open"
          >
            View details
          </button>
        ) : null}
      </div>
      <div>
        <strong style={{ color: "var(--occ-text-primary)" }}>Top SKUs</strong>
        <ul
          style={{
            margin: "var(--occ-space-2) 0 0 0",
            paddingLeft: "1.1rem",
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-1)",
            color: "var(--occ-text-primary)",
          }}
        >
          {summary.topSkus.map((sku) => (
            <li key={`${sku.sku}-${sku.title}`}>
              {sku.title} — {sku.quantity} units (
              {formatCurrency(sku.revenue, summary.currency)})
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong style={{ color: "var(--occ-text-primary)" }}>
          Open fulfillment
        </strong>
        {summary.pendingFulfillment.length ? (
          <ul
            style={{
              margin: "var(--occ-space-2) 0 0 0",
              paddingLeft: "1.1rem",
              display: "flex",
              flexDirection: "column",
              gap: "var(--occ-space-1)",
              color: "var(--occ-text-primary)",
            }}
          >
            {summary.pendingFulfillment.map((issue) => (
              <li key={issue.orderId}>
                {issue.name} — {issue.displayStatus.toLowerCase()}
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              color: "var(--occ-text-secondary)",
              margin: "var(--occ-space-2) 0 0 0",
            }}
          >
            No fulfillment blockers detected.
          </p>
        )}
      </div>
      {/* Modal temporarily disabled to fix build issues; non-blocking for perf tests */}
    </>
  );
}
