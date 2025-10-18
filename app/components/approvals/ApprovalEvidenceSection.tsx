import { Card, BlockStack, Text } from "@shopify/polaris";

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
  if (!evidence) return null;

  return (
    <BlockStack gap="300">
      {(evidence.what_changes || evidence.why_now || evidence.impact_forecast) && (
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
      )}

      {Array.isArray(evidence.diffs) && evidence.diffs.length > 0 && (
        <Card>
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Diffs
            </Text>
            {evidence.diffs.map((d, i) => (
              <BlockStack key={i} gap="100">
                <Text as="p" variant="bodySm">
                  {d.path}
                </Text>
                <pre style={{ fontSize: 12, overflow: "auto" }}>{d.before}</pre>
                <pre style={{ fontSize: 12, overflow: "auto" }}>{d.after}</pre>
              </BlockStack>
            ))}
          </BlockStack>
        </Card>
      )}

      {Array.isArray(evidence.samples) && evidence.samples.length > 0 && (
        <Card>
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Samples
            </Text>
            {evidence.samples.map((s, i) => (
              <BlockStack key={i} gap="100">
                <Text as="p" variant="bodySm">
                  {s.label}
                </Text>
                <pre style={{ fontSize: 12, overflow: "auto" }}>{s.content}</pre>
              </BlockStack>
            ))}
          </BlockStack>
        </Card>
      )}

      {Array.isArray(evidence.queries) && evidence.queries.length > 0 && (
        <Card>
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Queries
            </Text>
            {evidence.queries.map((q, i) => (
              <BlockStack key={i} gap="100">
                <Text as="p" variant="bodySm">
                  {q.label}
                </Text>
                <pre style={{ fontSize: 12, overflow: "auto" }}>{q.query}</pre>
                {q.result && (
                  <pre style={{ fontSize: 12, overflow: "auto" }}>{q.result}</pre>
                )}
              </BlockStack>
            ))}
          </BlockStack>
        </Card>
      )}

      {Array.isArray(evidence.screenshots) && evidence.screenshots.length > 0 && (
        <Card>
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Screenshots
            </Text>
            {evidence.screenshots.map((s, i) => (
              <Text as="p" key={i}>
                {s.label}: {s.url}
              </Text>
            ))}
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}

