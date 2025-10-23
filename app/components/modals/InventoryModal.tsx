import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import {
  Modal,
  TextField,
  Select,
  Banner,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Divider,
  Badge,
  ProgressBar,
  TextContainer,
} from "@shopify/polaris";

import type { InventoryAlert } from "../../services/shopify/types";
import { useModalFocusTrap } from "../../hooks/useModalFocusTrap";
import { useToast } from "../../hooks/useToast";

interface InventoryModalProps {
  alert: InventoryAlert;
  open: boolean;
  onClose: () => void;
}

interface InventoryActionResponse {
  ok?: boolean;
  error?: string;
}

type InventoryAction =
  | "create_po"
  | "adjust_quantity"
  | "mark_intentional"
  | "snooze";

const ACTION_LABELS: Record<InventoryAction, string> = {
  create_po: "Create Draft PO",
  adjust_quantity: "Adjust Quantity",
  mark_intentional: "Mark as Intentional",
  snooze: "Snooze Alert",
};

export function InventoryModal({ alert, open, onClose }: InventoryModalProps) {
  const fetcher = useFetcher<InventoryActionResponse>();
  const [selectedAction, setSelectedAction] =
    useState<InventoryAction>("create_po");
  const [reorderQuantity, setReorderQuantity] = useState(30);
  const [vendor, setVendor] = useState("acme_distribution");
  const [note, setNote] = useState("");

  // Accessibility: Focus trap + Escape key + Initial focus (WCAG 2.4.3, 2.1.1)
  useModalFocusTrap(open, onClose);

  // Toast notifications for user feedback (Designer P0 requirement)
  const { showSuccess, showError } = useToast();

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
      showSuccess("Inventory action complete! 📦");
      onClose();
    } else if (fetcher.data?.error) {
      showError(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data, open, onClose, showSuccess, showError]);

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
      avgDailySales: alert.daysOfCover
        ? alert.quantityAvailable / alert.daysOfCover
        : 0,
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

  // Calculate simple velocity metrics from available data
  const avgDailySales =
    alert.daysOfCover && alert.daysOfCover > 0
      ? (alert.quantityAvailable / alert.daysOfCover).toFixed(1)
      : "N/A";

  const vendorOptions = [
    { label: "Acme Distribution", value: "acme_distribution" },
    { label: "Primary Supplier", value: "primary_supplier" },
    { label: "Backup Vendor", value: "backup_vendor" },
  ];

  const actionOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  // Calculate stock level percentage for progress bar
  const stockPercentage = alert.threshold > 0
    ? Math.min(100, (alert.quantityAvailable / alert.threshold) * 100)
    : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Inventory Alert — ${alert.title}`}
      primaryAction={{
        content: ACTION_LABELS[selectedAction],
        onAction: submit,
        disabled: isSubmitting,
        loading: isSubmitting,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <TextContainer>
            <Text as="p" variant="bodySm" tone="subdued">
              SKU: {alert.sku} · Variant ID: {alert.variantId}
            </Text>
          </TextContainer>

          {fetcher.data?.error && (
            <Banner tone="critical">
              <p>{fetcher.data.error}</p>
            </Banner>
          )}
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Current Status
            </Text>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="span" fontWeight="semibold">Current Stock:</Text>
                  <Badge tone={stockPercentage < 50 ? "critical" : stockPercentage < 80 ? "warning" : "success"}>
                    {alert.quantityAvailable} units
                  </Badge>
                </InlineStack>
                <ProgressBar progress={stockPercentage} size="small" tone={stockPercentage < 50 ? "critical" : stockPercentage < 80 ? "primary" : "success"} />
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="span" fontWeight="semibold">Threshold:</Text>
                  <Text as="span">{alert.threshold} units</Text>
                </InlineStack>
                {alert.daysOfCover != null && (
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="span" fontWeight="semibold">Days of Cover:</Text>
                    <Text as="span">{alert.daysOfCover.toFixed(1)} days</Text>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              14-Day Velocity Analysis
            </Text>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="span" fontWeight="semibold">Avg daily sales:</Text>
                  <Text as="span">{avgDailySales} units</Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  14-Day Trend (simplified visual - full charts in Phase 7-8)
                </Text>
                <Banner tone="info">
                  <p>Full interactive charts with demand-forecast integration coming in Phase 7-8 (polaris-viz)</p>
                </Banner>
              </BlockStack>
            </Card>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Reorder Recommendation
            </Text>
            <TextField
              label="Reorder Quantity"
              type="number"
              value={String(reorderQuantity)}
              onChange={(value) => setReorderQuantity(Number(value))}
              min={1}
              step={1}
              disabled={isSubmitting}
              autoComplete="off"
              helpText="Enter quantity in units"
            />
            <Select
              label="Vendor"
              options={vendorOptions}
              value={vendor}
              onChange={setVendor}
              disabled={isSubmitting}
              helpText="Select vendor for purchase order"
            />
            <Text as="p" variant="bodySm" tone="subdued">
              Lead Time: 7 days (estimated)
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Action
            </Text>
            <Select
              label="What do you want to do?"
              options={actionOptions}
              value={selectedAction}
              onChange={(value) => setSelectedAction(value as InventoryAction)}
              disabled={isSubmitting}
            />
            <TextField
              label="Notes (audit trail)"
              value={note}
              onChange={setNote}
              multiline={3}
              placeholder="Add context for the decision log"
              autoComplete="off"
              disabled={isSubmitting}
            />
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
