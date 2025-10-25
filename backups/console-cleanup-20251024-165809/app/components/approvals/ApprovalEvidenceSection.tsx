import { Card, BlockStack, Text, Tabs } from "@shopify/polaris";
import { useState } from "react";

type Evidence = {
  what_changes?: string;
  why_now?: string;
  impact_forecast?: string;
  diffs?: Array<{ path: string; before: string; after: string }>;
  samples?: Array<{ label: string; content: string }>;
  queries?: Array<{ label: string; query: string; result?: string }>;
  screenshots?: Array<{ label: string; url: string }>;
};

export function ApprovalEvidenceSection({ evidence }: { evidence: Evidence }) {
  const [selectedTab, setSelectedTab] = useState(0);

  if (!evidence) return null;

  // Summary section (always visible)
  const summaryCard = (evidence.what_changes ||
    evidence.why_now ||
    evidence.impact_forecast) && (
    <Card>
      <BlockStack gap="200">
        {evidence.what_changes && (
          <Text as="p">What changes: {evidence.what_changes}</Text>
        )}
        {evidence.why_now && <Text as="p">Why now: {evidence.why_now}</Text>}
        {evidence.impact_forecast && (
          <Text as="p">Impact forecast: {evidence.impact_forecast}</Text>
        )}
      </BlockStack>
    </Card>
  );

  // Build tabs based on available evidence
  const tabs = [];
  const tabContents = [];

  if (Array.isArray(evidence.diffs) && evidence.diffs.length > 0) {
    tabs.push({ id: "diffs", content: "Diffs", panelID: "diffs-panel" });
    tabContents.push(
      <Card key="diffs">
        <BlockStack gap="200">
          {evidence.diffs.map((d, i) => (
            <BlockStack key={i} gap="100">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                {d.path}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Before:
              </Text>
              <pre
                style={{
                  fontSize: 12,
                  overflow: "auto",
                  background: "#f6f6f7",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {d.before}
              </pre>
              <Text as="p" variant="bodySm" tone="subdued">
                After:
              </Text>
              <pre
                style={{
                  fontSize: 12,
                  overflow: "auto",
                  background: "#f6f6f7",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {d.after}
              </pre>
            </BlockStack>
          ))}
        </BlockStack>
      </Card>,
    );
  }

  if (Array.isArray(evidence.samples) && evidence.samples.length > 0) {
    tabs.push({ id: "samples", content: "Samples", panelID: "samples-panel" });
    tabContents.push(
      <Card key="samples">
        <BlockStack gap="200">
          {evidence.samples.map((s, i) => (
            <BlockStack key={i} gap="100">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                {s.label}
              </Text>
              <pre
                style={{
                  fontSize: 12,
                  overflow: "auto",
                  background: "#f6f6f7",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {s.content}
              </pre>
            </BlockStack>
          ))}
        </BlockStack>
      </Card>,
    );
  }

  if (Array.isArray(evidence.queries) && evidence.queries.length > 0) {
    tabs.push({ id: "queries", content: "Queries", panelID: "queries-panel" });
    tabContents.push(
      <Card key="queries">
        <BlockStack gap="200">
          {evidence.queries.map((q, i) => (
            <BlockStack key={i} gap="100">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                {q.label}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Query:
              </Text>
              <pre
                style={{
                  fontSize: 12,
                  overflow: "auto",
                  background: "#f6f6f7",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {q.query}
              </pre>
              {q.result && (
                <>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Result:
                  </Text>
                  <pre
                    style={{
                      fontSize: 12,
                      overflow: "auto",
                      background: "#f6f6f7",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    {q.result}
                  </pre>
                </>
              )}
            </BlockStack>
          ))}
        </BlockStack>
      </Card>,
    );
  }

  if (Array.isArray(evidence.screenshots) && evidence.screenshots.length > 0) {
    tabs.push({
      id: "screenshots",
      content: "Screenshots",
      panelID: "screenshots-panel",
    });
    tabContents.push(
      <Card key="screenshots">
        <BlockStack gap="200">
          {evidence.screenshots.map((s, i) => (
            <BlockStack key={i} gap="100">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                {s.label}
              </Text>
              <Text as="p" variant="bodySm">
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.url}
                </a>
              </Text>
            </BlockStack>
          ))}
        </BlockStack>
      </Card>,
    );
  }

  // If no tabs, just show summary
  if (tabs.length === 0) {
    return <BlockStack gap="300">{summaryCard}</BlockStack>;
  }

  return (
    <BlockStack gap="300">
      {summaryCard}
      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        {tabContents[selectedTab]}
      </Tabs>
    </BlockStack>
  );
}
