/**
 * MetricTile Component
 *
 * Reusable component for displaying analytics metrics in dashboard tiles.
 * Includes loading, error, and success states with trend indicators.
 */

import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Spinner,
} from "@shopify/polaris";
import { ArrowUpIcon, ArrowDownIcon } from "@shopify/polaris-icons";

// ============================================================================
// Types
// ============================================================================

export interface MetricTileProps {
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  currency?: string;
  unit?: string;
  loading?: boolean;
  error?: string;
  format?: "number" | "currency" | "percentage";
}

// ============================================================================
// Component
// ============================================================================

export function MetricTile({
  title,
  value,
  change,
  period,
  currency = "USD",
  unit,
  loading = false,
  error,
  format = "number",
}: MetricTileProps) {
  // ========== Loading State ==========
  if (loading) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            {title}
          </Text>
          <InlineStack align="center" blockAlign="center">
            <Spinner size="small" />
            <Text as="p" variant="bodyMd" tone="subdued">
              Loading...
            </Text>
          </InlineStack>
        </BlockStack>
      </Card>
    );
  }

  // ========== Error State ==========
  if (error) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            {title}
          </Text>
          <Text as="p" variant="bodyMd" tone="critical">
            {error}
          </Text>
          {period && (
            <Text as="p" variant="bodySm" tone="subdued">
              Period: {period}
            </Text>
          )}
        </BlockStack>
      </Card>
    );
  }

  // ========== Format Value ==========
  let formattedValue = String(value);

  if (format === "currency") {
    const numValue =
      typeof value === "number" ? value : parseFloat(String(value));
    formattedValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  } else if (format === "percentage") {
    const numValue =
      typeof value === "number" ? value : parseFloat(String(value));
    formattedValue = `${numValue.toFixed(1)}%`;
  } else if (format === "number") {
    const numValue =
      typeof value === "number" ? value : parseFloat(String(value));
    formattedValue = new Intl.NumberFormat("en-US").format(numValue);
    if (unit) {
      formattedValue += ` ${unit}`;
    }
  }

  // ========== Trend Indicator ==========
  const trendBadge = change !== undefined && (
    <Badge
      tone={change > 0 ? "success" : change < 0 ? "critical" : undefined}
      icon={change > 0 ? ArrowUpIcon : change < 0 ? ArrowDownIcon : undefined}
    >
      {change > 0 ? "+" : ""}
      {change.toFixed(1)}%
    </Badge>
  );

  // ========== Success State ==========
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          {title}
        </Text>
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="heading2xl">
            {formattedValue}
          </Text>
          {trendBadge}
        </InlineStack>
        {period && (
          <Text as="p" variant="bodySm" tone="subdued">
            {period}
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}
