import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { Modal, TextField, BlockStack, InlineStack, Text, Banner, Select } from "@shopify/polaris";

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sales Pulse — Details"
      primaryAction={{
        content: ACTION_LABELS[selectedAction],
        onAction: () => submit(selectedAction),
        disabled: isSubmitting,
        loading: isSubmitting,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodySm" tone="subdued">
            Revenue today: {summary.currency} {summary.totalRevenue.toFixed(2)} · Orders: {summary.orderCount}
          </Text>

          {fetcher.data?.error && (
            <Banner tone="critical">
              <p>{fetcher.data.error}</p>
            </Banner>
          )}

          {/* Top SKUs */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Top SKUs</Text>
            <BlockStack gap="100">
              {summary.topSkus.map((sku) => (
                <InlineStack key={`${sku.sku}-${sku.title}`} align="space-between" blockAlign="center">
                  <Text as="span">{sku.title}</Text>
                  <Text as="span" tone="subdued" variant="bodySm">
                    {sku.quantity} units · {summary.currency} {sku.revenue.toFixed(2)}
                  </Text>
                </InlineStack>
              ))}
            </BlockStack>
          </BlockStack>

          {/* Pending Fulfillment */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Pending fulfillment</Text>
            {summary.pendingFulfillment.length === 0 ? (
              <Text as="p" tone="subdued">All clear — no blockers.</Text>
            ) : (
              <BlockStack gap="100">
                {summary.pendingFulfillment.map((order) => (
                  <InlineStack key={order.orderId} align="space-between" blockAlign="center">
                    <Text as="span">{order.name}</Text>
                    <Text as="span" tone="subdued" variant="bodySm">{order.displayStatus}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
            )}
          </BlockStack>

          {/* Action Selection */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Capture follow-up</Text>
            <Select
              label="Action"
              options={Object.entries(ACTION_LABELS).map(([value, label]) => ({ label, value }))}
              value={selectedAction}
              onChange={(value) => setSelectedAction(value as SalesAction)}
              disabled={isSubmitting}
            />
            <TextField
              label="Notes"
              value={note}
              onChange={setNote}
              multiline={3}
              placeholder="Add context for the decision log"
              disabled={isSubmitting}
              autoComplete="off"
            />
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
