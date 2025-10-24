import {
  Badge,
  Button,
  Card,
  InlineStack,
  Layout,
  Link,
  Page,
  Text
} from "@shopify/polaris";

const quickLinks = [
  {
    id: "getting-started",
    title: "Getting Started",
    summary: "Launch-day checklist, first-time setup, daily rhythm and navigation shortcuts."
  },
  {
    id: "feature-tutorials",
    title: "Feature Tutorials",
    summary: "Step-by-step guides for Dashboard, Approvals, Notifications, Analytics, Inventory, and Settings."
  },
  {
    id: "faq",
    title: "FAQ",
    summary: "20 fast answers covering tiles, approvals, integrations, exports, and more."
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    summary: "Symptoms and fixes for the most common launch issues."
  },
  {
    id: "standards",
    title: "Standards & Maintenance",
    summary: "Documentation guardrails, evidence expectations, and update process."
  }
];

export default function HelpPage() {
  return (
    <Page
      title="Help Center"
      subtitle="Launch edition for HotDash operators"
      primaryAction={{
        content: "Open full guide",
        url: "https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/help/README.md",
        external: true
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <Text as="h2" variant="headingLg">
                Help overview
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                The help center mirrors the launch documentation. Jump to a section below or open the full markdown guide in a new tab.
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {quickLinks.map((link) => (
                  <li key={link.id}>
                    <Link url={`#${link.id}`}>{link.title}</Link>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {` — ${link.summary}`}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div id="getting-started" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <InlineStack gap="400" align="center">
                <Text as="h3" variant="headingMd">
                  Getting Started
                </Text>
                <Badge tone="success">Launch ready</Badge>
              </InlineStack>
              <Text as="p" variant="bodyMd">
                Walk through the launch-day checklist, integration setup, and daily cadence in order. Highlight:
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>Confirm Shopify, Chatwoot, Google Analytics, and Publer connections.</li>
                <li>Finish the dashboard Setup Guide checklist and arrange tiles for your workflow.</li>
                <li>Adopt the morning / throughout day / end-of-day rhythm so approvals and alerts stay within SLA.</li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 1 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div id="feature-tutorials" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Text as="h3" variant="headingMd">
                Feature Tutorials
              </Text>
              <Text as="p" variant="bodyMd">
                Six how-to guides cover the entire surface area—from dashboard customization to approvals, notifications, analytics, inventory, and settings.
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>Dashboard & Tiles: reorder, adjust refresh cadence, inspect drawers, hide tiles temporarily.</li>
                <li>Approvals Queue: triage by risk, review evidence, approve with grading, request changes.</li>
                <li>Notifications & Alerts: configure channels, quiet hours, and run health checks.</li>
                <li>Analytics & Reports: filter GA4 metrics, compare windows, export CSV safely.</li>
                <li>Inventory Management: action alerts, generate PO drafts, audit bundle logic.</li>
                <li>Settings & Integrations: manage roles, feature flags, and integrations end-to-end.</li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 2 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div id="faq" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Text as="h3" variant="headingMd">
                FAQ Snapshot
              </Text>
              <Text as="p" variant="bodyMd">
                Twenty launch questions are answered verbatim in the help doc. Highlights include tile visibility, export rules, risk levels, integrations, and bulk approvals.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 3 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div id="troubleshooting" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Text as="h3" variant="headingMd">
                Troubleshooting Essentials
              </Text>
              <Text as="p" variant="bodyMd">
                The table in Section 4 covers tiles, approvals, Chatwoot health, inventory math, GA latency, notifications, idea pool refresh, and the `/help` route itself.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Use it before logging a blocker—the resolution steps reference existing scripts and health checks.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div id="standards" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Text as="h3" variant="headingMd">
                Standards & Maintenance
              </Text>
              <Text as="p" variant="bodyMd">
                Section 5 confirms the documentation guardrails: Diátaxis structure, Polaris compliance, alignment with `docs/specs/help-documentation.md`, and the MCP evidence workflow.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Need to update the help center? Follow the four-step process and log evidence before submitting changes.
              </Text>
              <Button
                url="https://diataxis.fr/complex-hierarchies"
                external
                variant="tertiary"
              >
                Review Diátaxis guidance
              </Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

