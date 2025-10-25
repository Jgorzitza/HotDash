/**
 * SEO Anomalies Tile Component
 *
 * Displays SEO alerts with severity filtering
 * Default to critical alerts, toggle mediums (auto-show medium if no criticals)
 */
import { Text, BlockStack, InlineStack, Badge, Button, Select, } from "@shopify/polaris";
import { useState } from "react";
export function SEOTile({ data }) {
    const [severityFilter, setSeverityFilter] = useState("critical");
    // Auto-show medium if no criticals
    const criticalCount = data.anomalies.filter((a) => a.severity === "critical").length;
    const effectiveFilter = criticalCount === 0 && severityFilter === "critical"
        ? "warning"
        : severityFilter;
    const filteredAnomalies = data.anomalies.filter((anomaly) => {
        if (effectiveFilter === "all")
            return true;
        return anomaly.severity === effectiveFilter;
    });
    const getSeverityBadge = (severity) => {
        const badges = {
            critical: { tone: "critical", label: "Critical" },
            warning: { tone: "warning", label: "Warning" },
            info: { tone: "info", label: "Info" },
        };
        return badges[severity];
    };
    const severityOptions = [
        { label: "Critical Only", value: "critical" },
        { label: "Warnings", value: "warning" },
        { label: "All Alerts", value: "all" },
    ];
    return (<BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="200">
          <Text as="p" variant="heading2xl" fontWeight="bold">
            {filteredAnomalies.length}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            SEO anomalies
          </Text>
        </BlockStack>

        <Select label="" options={severityOptions} value={severityFilter} onChange={(value) => setSeverityFilter(value)}/>
      </InlineStack>

      {criticalCount === 0 && severityFilter === "critical" && (<Text as="p" variant="bodySm" tone="subdued">
          No critical alerts. Showing warnings.
        </Text>)}

      <BlockStack gap="200">
        {filteredAnomalies.slice(0, 3).map((anomaly, idx) => (<InlineStack key={idx} align="space-between" blockAlign="center">
            <Text as="p" variant="bodySm">
              {anomaly.page}
            </Text>
            <InlineStack gap="200">
              <Text as="p" variant="bodySm" tone={anomaly.change < 0 ? "critical" : "subdued"}>
                {anomaly.change > 0 ? "+" : ""}
                {anomaly.change.toFixed(1)}%
              </Text>
              <Badge {...getSeverityBadge(anomaly.severity)}/>
            </InlineStack>
          </InlineStack>))}
      </BlockStack>

      {filteredAnomalies.length > 3 && (<Text as="p" variant="bodySm" tone="subdued">
          +{filteredAnomalies.length - 3} more
        </Text>)}

      <Button url="/seo/anomalies" variant="primary">
        View All Anomalies
      </Button>
    </BlockStack>);
}
//# sourceMappingURL=SEOTile.js.map