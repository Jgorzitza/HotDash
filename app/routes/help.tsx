import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  InlineStack,
  Layout,
  Link,
  Page,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";

interface HelpIndexEntry {
  id: string;
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
}

const helpIndex: HelpIndexEntry[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    summary:
      "Launch-day checklist, first-time setup, daily rhythm and navigation shortcuts.",
    detail:
      "Sign-in steps, integration verification, setup guide completion, team invitations, and a recommended daily cadence covering morning triage, daytime monitoring, and end-of-day wrap-up.",
    keywords: [
      "checklist",
      "integrations",
      "setup",
      "daily cadence",
      "navigation",
      "tiles",
    ],
  },
  {
    id: "feature-tutorials",
    title: "Feature Tutorials",
    summary:
      "Step-by-step guides for Dashboard, Approvals, Notifications, Analytics, Inventory, and Settings.",
    detail:
      "Walkthroughs for reordering tiles, managing approvals, configuring notifications, working with analytics exports, auditing inventory, and managing settings & integrations.",
    keywords: [
      "tutorials",
      "approvals",
      "notifications",
      "analytics",
      "inventory",
      "settings",
    ],
  },
  {
    id: "video-scripts",
    title: "Video Tutorial Scripts",
    summary:
      "Five recording scripts for launch videos covering dashboard, approvals, notifications, inventory, and analytics.",
    detail:
      "Two-minute scripts for dashboard orientation, approvals deep dive, notifications and integrations, inventory actions, and analytics reporting.",
    keywords: ["video", "script", "recording", "demo"],
  },
  {
    id: "api-reference",
    title: "API Reference",
    summary:
      "Read-only help endpoints and feedback hook for operator automation.",
    detail:
      "REST endpoints for FAQ, tutorials, troubleshooting, and feedback submission, including payload expectations and ABAC notes.",
    keywords: ["api", "endpoint", "automation", "feedback"],
  },
  {
    id: "support-sop",
    title: "Support SOP References",
    summary:
      "Links to CX escalation workflows, Chatwoot guides, health probes, and PII validation playbooks.",
    detail:
      "Direct access to Growth Engine CX workflows, Chatwoot integration steps, multichannel testing, health dashboard probes, and PII card validation scenarios to keep launch support aligned.",
    keywords: [
      "support",
      "sop",
      "chatwoot",
      "escalation",
      "pii",
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    summary:
      "20 fast answers covering tiles, approvals, integrations, exports, and more.",
    detail:
      "Quick answers for tile customization, auto-refresh, AI grading, exports, integration health, roles, approvals history, and supported browsers.",
    keywords: ["faq", "questions", "answers", "integrations", "exports"],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    summary: "Symptoms and fixes for the most common launch issues.",
    detail:
      "Resolution playbooks for empty tiles, approvals stuck, Chatwoot health failures, GA latency, inventory mismatch, and notification delivery.",
    keywords: [
      "errors",
      "issues",
      "resolution",
      "chatwoot",
      "ga4",
      "inventory",
    ],
  },
  {
    id: "standards",
    title: "Standards & Maintenance",
    summary:
      "Documentation guardrails, evidence expectations, and update process.",
    detail:
      "Maintenance workflow aligned with Diátaxis, MCP evidence logging, and follow-up expectations for updating help content.",
    keywords: [
      "maintenance",
      "standards",
      "documentation",
      "diataxis",
      "evidence",
    ],
  },
];

const searchPlaceholder =
  "Search help center (tiles, approvals, exports, ... )";

const SNIPPET_RADIUS = 70;

function buildSnippet(text: string, query: string) {
  const lowerHaystack = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerHaystack.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return null;
  }

  const start = Math.max(0, matchIndex - SNIPPET_RADIUS);
  const end = Math.min(
    text.length,
    matchIndex + lowerQuery.length + SNIPPET_RADIUS,
  );

  let snippet = text.slice(start, end).trim();

  if (start > 0) {
    snippet = `…${snippet}`;
  }

  if (end < text.length) {
    snippet = `${snippet}…`;
  }

  return snippet;
}

interface HelpSearchResult extends HelpIndexEntry {
  snippet: string;
}

export default function HelpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null,
  );

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo<HelpSearchResult[]>(() => {
    if (!normalizedQuery) {
      return [];
    }

    return helpIndex
      .map((entry) => {
        const haystack =
          `${entry.title} ${entry.summary} ${entry.detail} ${entry.keywords.join(" ")}`.toLowerCase();

        if (!haystack.includes(normalizedQuery)) {
          return null;
        }

        const snippet =
          buildSnippet(`${entry.summary} ${entry.detail}`, normalizedQuery) ??
          entry.summary;

        return {
          ...entry,
          snippet,
        };
      })
      .filter(Boolean) as HelpSearchResult[];
  }, [normalizedQuery]);

  useEffect(() => {
    const topic = searchParams.get("topic");

    if (!topic) {
      return;
    }

    const sectionElement = document.getElementById(topic);

    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedSection(topic);

      const timeoutId = window.setTimeout(() => {
        setHighlightedSection((current) =>
          current === topic ? null : current,
        );
      }, 4500);

      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams]);

  const handleSectionFocus = (sectionId: string) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set("topic", sectionId);
      return next;
    });
  };

  return (
    <Page
      title="Help Center"
      subtitle="Launch edition for HotDash operators"
      primaryAction={{
        content: "Open full guide",
        url: "https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/help/README.md",
        external: true,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Text as="h2" variant="headingMd">
                Search help center
              </Text>
              <TextField
                autoComplete="off"
                label="Search"
                labelHidden
                placeholder={searchPlaceholder}
                value={query}
                onChange={(value) => setQuery(value)}
                type="search"
              />
              {normalizedQuery ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div key={result.id}>
                        <Link
                          url={`?topic=${result.id}`}
                          onClick={() => {
                            handleSectionFocus(result.id);
                            setQuery("");
                          }}
                        >
                          {result.title}
                        </Link>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {result.snippet}
                        </Text>
                      </div>
                    ))
                  ) : (
                    <Text as="p" variant="bodySm" tone="subdued">
                      No help topics match “{query}”. Try a different keyword
                      (for example, "approvals" or "notifications").
                    </Text>
                  )}
                </div>
              ) : (
                <Text as="p" variant="bodySm" tone="subdued">
                  Search across tutorials, troubleshooting steps, FAQ answers,
                  and API references. Results deep-link into the sections below.
                </Text>
              )}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Text as="h2" variant="headingLg">
                Help overview
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                The help center mirrors the launch documentation. Jump to a
                section below or open the full markdown guide in a new tab.
              </Text>
              <ul
                style={{
                  margin: 0,
                  paddingInlineStart: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {helpIndex.map((link) => (
                  <li key={link.id}>
                    <Tooltip content={link.summary} dismissOnMouseOut>
                      <Link
                        url={`?topic=${link.id}`}
                        onClick={() => handleSectionFocus(link.id)}
                      >
                        {link.title}
                      </Link>
                    </Tooltip>
                    <Text
                      as="span"
                      variant="bodySm"
                      tone="subdued"
                      style={{ marginLeft: "4px" }}
                    >
                      — {link.summary}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="getting-started"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "getting-started"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "getting-started" ? "12px" : undefined,
              }}
            >
              <InlineStack gap="400" align="center">
                <Text as="h3" variant="headingMd">
                  Getting Started
                </Text>
                <Badge tone="success">Launch ready</Badge>
              </InlineStack>
              <Text as="p" variant="bodyMd">
                Walk through the launch-day checklist, integration setup, and
                daily cadence in order. Highlight:
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>
                  Confirm Shopify, Chatwoot, Google Analytics, and Publer
                  connections.
                </li>
                <li>
                  Finish the dashboard{" "}
                  <Tooltip content="The Setup Guide ensures tiles stream data before you launch.">
                    <span style={{ textDecoration: "underline dotted" }}>
                      Setup Guide checklist
                    </span>
                  </Tooltip>{" "}
                  and arrange tiles for your workflow.
                </li>
                <li>
                  Adopt the morning / throughout day / end-of-day rhythm so
                  approvals and alerts stay within SLA.
                </li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 1 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="feature-tutorials"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "feature-tutorials"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "feature-tutorials"
                    ? "12px"
                    : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                Feature Tutorials
              </Text>
              <Text as="p" variant="bodyMd">
                Six how-to guides cover the entire surface area—from dashboard
                customization to approvals, notifications, analytics, inventory,
                and settings.
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>
                  Dashboard & Tiles: reorder, adjust refresh cadence, inspect
                  drawers, hide tiles temporarily.
                </li>
                <li>
                  Approvals Queue: triage by risk, review evidence, approve with
                  grading, request changes.
                </li>
                <li>
                  Notifications & Alerts: configure channels, quiet hours, and
                  run health checks.
                </li>
                <li>
                  Analytics & Reports: filter GA4 metrics, compare windows,
                  export CSV safely.
                </li>
                <li>
                  Inventory Management: action alerts, generate PO drafts, audit
                  bundle logic.
                </li>
                <li>
                  Settings & Integrations: manage roles, feature flags, and
                  integrations end-to-end.
                </li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 2 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="video-scripts"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "video-scripts"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "video-scripts" ? "12px" : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                Video Tutorial Scripts
              </Text>
              <Text as="p" variant="bodyMd">
                Five launch-week recordings walk through dashboard setup,
                approvals, notifications, inventory, and analytics. Each script
                fits a two-minute demo so content and marketing stay aligned.
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>
                  Dashboard Overview: highlight tile reorder, drawers, keyboard
                  shortcuts.
                </li>
                <li>
                  Approvals Deep Dive: evidence review, grading, bulk approvals.
                </li>
                <li>
                  Notifications & Integrations: quiet hours, send test,
                  reconnect flows.
                </li>
                <li>
                  Inventory Actions: urgent reorder flow, PO draft, bundle
                  settings.
                </li>
                <li>
                  Analytics & ROI: GA4 comparisons, exports, action impact.
                </li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                Script details live in Section 3 and `docs/help/video-scripts/`
                for future updates.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="api-reference"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "api-reference"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "api-reference" ? "12px" : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                API Reference
              </Text>
              <Text as="p" variant="bodyMd">
                Operators can query read-only help center endpoints or submit
                feedback via POST. Tokens are managed in Shopify environment
                secrets and respect ABAC roles.
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>
                  <code>GET /api/help/faq</code> → returns all FAQ entries with
                  metadata.
                </li>
                <li>
                  <code>GET /api/help/tutorials</code> → surfaces tutorial
                  summaries and script links.
                </li>
                <li>
                  <code>GET /api/help/troubleshooting</code> → exposes
                  resolution table for automation.
                </li>
                <li>
                  <code>POST /api/help/feedback</code> → logs operator
                  suggestions into DecisionLog.
                </li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                See Section 4 of the help document for payload samples and ABAC
                notes.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="support-sop"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "support-sop"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "support-sop" ? "12px" : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                Support SOP References
              </Text>
              <Text as="p" variant="bodyMd">
                Keep launch-week support aligned with the latest CX workflows,
                Chatwoot procedures, and PII validation rules.
              </Text>
              <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
                <li>
                  <Link
                    external
                    url="https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/support/growth-engine-cx-workflows.md"
                  >
                    Growth Engine CX Workflows
                  </Link>{" "}
                  — escalation matrix, SLA targets, and transfer rules.
                </li>
                <li>
                  <Link
                    external
                    url="https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/support/chatwoot-integration-guide.md"
                  >
                    Chatwoot Integration Guide
                  </Link>{" "}
                  — channel configuration, token rotation, failover path.
                </li>
                <li>
                  <Link
                    external
                    url="https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/support/chatwoot-health-dashboard-spec.md"
                  >
                    Chatwoot Health Dashboard Spec
                  </Link>{" "}
                  — probe definitions surfaced in Support Health.
                </li>
                <li>
                  <Link
                    external
                    url="https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/support/chatwoot-multichannel-testing-guide.md"
                  >
                    Chatwoot Multichannel Testing Guide
                  </Link>{" "}
                  — QA checklist for email, SMS, and widget channels.
                </li>
                <li>
                  <Link
                    external
                    url="https://github.com/Jgorzitza/HotDash/blob/agent-launch-20251024/docs/support/pii-card-test-scenarios.md"
                  >
                    PII Card Test Scenarios
                  </Link>{" "}
                  — validation steps for redaction rules and operator-only views.
                </li>
              </ul>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 5 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="faq"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "faq"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius: highlightedSection === "faq" ? "12px" : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                FAQ Snapshot
              </Text>
              <Text as="p" variant="bodyMd">
                Twenty launch questions are answered verbatim in the help doc.
                Highlights include tile visibility, export rules, risk levels,
                integrations, and bulk approvals.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Full detail: Section 6 of the help document.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="troubleshooting"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "troubleshooting"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "troubleshooting" ? "12px" : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                Troubleshooting Essentials
              </Text>
              <Text as="p" variant="bodyMd">
                The table in Section 7 covers tiles, approvals, Chatwoot
                health, inventory math, GA latency, notifications, idea pool
                refresh, and the `/help` route itself.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Use it before logging a blocker—the resolution steps reference
                existing scripts and health checks.
              </Text>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div
              id="standards"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow:
                  highlightedSection === "standards"
                    ? "0 0 0 3px rgba(0, 143, 255, 0.35)"
                    : undefined,
                borderRadius:
                  highlightedSection === "standards" ? "12px" : undefined,
              }}
            >
              <Text as="h3" variant="headingMd">
                Standards & Maintenance
              </Text>
              <Text as="p" variant="bodyMd">
                Section 8 confirms the documentation guardrails: Diátaxis
                structure, Polaris compliance, alignment with
                `docs/specs/help-documentation.md`, and the MCP evidence
                workflow.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Need to update the help center? Follow the four-step process and
                log evidence before submitting changes.
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
