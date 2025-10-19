import {
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Divider,
} from "@shopify/polaris";

import type { AdsAttributionSummary, AdsPacingSummary } from "~/lib/ads";

export interface AdsTileData {
  pacing: AdsPacingSummary;
  attribution: AdsAttributionSummary;
}

interface AdsTileProps {
  data: AdsTileData;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function AdsTile({ data }: AdsTileProps) {
  const fallbackReason =
    data.pacing.fallbackReason ?? data.attribution.fallbackReason;

  const totals = data.attribution.rows.reduce(
    (acc, row) => {
      acc.spend += row.spend ?? 0;
      acc.revenue += row.revenue ?? 0;
      acc.conversions += row.conversions ?? 0;
      return acc;
    },
    { spend: 0, revenue: 0, conversions: 0 },
  );

  const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

  const topRows = data.attribution.rows.slice(0, 3);

  return (
    <BlockStack gap="400">
      {fallbackReason && (
        <Badge tone="warning">Fallback data: {fallbackReason}</Badge>
      )}

      <BlockStack gap="200">
        <Text as="h3" variant="headingMd">
          7-day Performance
        </Text>
        <InlineStack gap="400" wrap>
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" tone="subdued">
              Spend
            </Text>
            <Text as="p" variant="headingLg">
              {formatCurrency(totals.spend)}
            </Text>
          </BlockStack>
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" tone="subdued">
              Revenue
            </Text>
            <Text as="p" variant="headingLg">
              {formatCurrency(totals.revenue)}
            </Text>
          </BlockStack>
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" tone="subdued">
              ROAS
            </Text>
            <Text as="p" variant="headingLg">
              {formatNumber(roas)}x
            </Text>
          </BlockStack>
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" tone="subdued">
              CAC / CPA
            </Text>
            <Text as="p" variant="headingLg">
              {formatCurrency(cpa)}
            </Text>
          </BlockStack>
        </InlineStack>
      </BlockStack>

      {topRows.length > 0 && (
        <BlockStack gap="200">
          <Divider borderColor="border-subdued" />
          <Text as="h3" variant="headingSm">
            Top Campaigns
          </Text>
          <BlockStack gap="150">
            {topRows.map((row) => (
              <InlineStack
                key={`${row.platform}-${row.campaign ?? "unknown"}`}
                gap="200"
                align="space-between"
              >
                <BlockStack gap="050">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {row.campaign ?? "Unnamed"}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {row.platform.replace(/_/g, " ")}
                  </Text>
                </BlockStack>
                <InlineStack gap="300" align="end">
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Spend
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {formatCurrency(row.spend ?? 0)}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" tone="subdued">
                      ROAS
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {row.roas != null ? `${formatNumber(row.roas)}x` : "–"}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" tone="subdued">
                      CPA
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {row.cpa != null ? formatCurrency(row.cpa) : "–"}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </InlineStack>
            ))}
          </BlockStack>
        </BlockStack>
      )}
    </BlockStack>
  );
}
