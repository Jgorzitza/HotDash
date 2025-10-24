import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useMemo, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  BlockStack,
  InlineStack,
  Divider,
  TextField,
  Button,
  Banner,
  InlineCode,
  Box,
} from "@shopify/polaris";
import { getMarketingApprovals, updateMarketingApprovalStatus } from "~/services/marketing/approvals.server";
import type { MarketingApprovalItem } from "~/services/marketing/types";
import type { MarketingApprovalStatus } from "~/services/marketing/types";
import { logDecision } from "~/services/decisions.server";

interface LoaderData {
  approvals: MarketingApprovalItem[];
}

export async function loader({}: LoaderFunctionArgs) {
  const approvals = getMarketingApprovals();

  return Response.json<LoaderData>({
    approvals,
  });
}

interface ActionSuccess {
  approvals: MarketingApprovalItem[];
  updatedId: string;
}

interface ActionError {
  error: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");
  const intent = formData.get("intent");
  const reviewer = (formData.get("reviewer") ?? "ceo").toString().trim();
  const notesRaw = formData.get("notes");
  const notes = typeof notesRaw === "string" ? notesRaw.trim() : undefined;

  if (typeof id !== "string" || !id) {
    return Response.json<ActionError>(
      { error: "Missing approval identifier." },
      { status: 400 },
    );
  }

  if (typeof intent !== "string") {
    return Response.json<ActionError>(
      { error: "Missing intent." },
      { status: 400 },
    );
  }

  let status: MarketingApprovalStatus;

  switch (intent) {
    case "approve":
      status = "approved";
      break;
    case "reject":
      status = "rejected";
      break;
    case "mark-applied":
      status = "applied";
      break;
    default:
      return Response.json<ActionError>(
        { error: `Unsupported intent: ${intent}` },
        { status: 400 },
      );
  }

  try {
    const updated = updateMarketingApprovalStatus(id, status, reviewer, notes);

    await logDecision({
      scope: "build",
      actor: reviewer || "ceo",
      action: "marketing_approval_updated",
      taskId: "ADS-LAUNCH-001",
      status: updated.status === "applied" ? "completed" : "in_progress",
      progressPct: updated.status === "approved" ? 90 : updated.status === "applied" ? 100 : 50,
      rationale: `Updated ${updated.title} to ${updated.status}${
        notes ? ` (${notes})` : ""
      }`,
      evidenceUrl: updated.evidence[0],
      payload: {
        approvalId: updated.id,
        category: updated.category,
        status: updated.status,
        reviewer,
        notes: notes ?? null,
      },
    });

    const approvals = getMarketingApprovals();

    return Response.json<ActionSuccess>({
      approvals,
      updatedId: updated.id,
    });
  } catch (error) {
    console.error("[marketing approvals] action error", error);
    return Response.json<ActionError>(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update approval item.",
      },
      { status: 500 },
    );
  }
}

function statusTone(status: MarketingApprovalStatus): "success" | "critical" | "attention" | "info" {
  switch (status) {
    case "approved":
    case "applied":
      return "success";
    case "rejected":
      return "critical";
    case "pending":
    default:
      return "attention";
  }
}

function statusLabel(status: MarketingApprovalStatus): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "applied":
      return "Applied";
    case "pending":
    default:
      return "Pending review";
  }
}

function categoryLabel(category: MarketingApprovalItem["category"]): string {
  switch (category) {
    case "google_ads":
      return "Google Ads";
    case "paid_social":
      return "Paid Social";
    case "email":
      return "Email";
    case "content":
      return "Content";
    case "budget":
      return "Budget";
    case "timeline":
      return "Timeline";
    case "analytics":
      return "Analytics";
    default:
      return category;
  }
}

export default function MarketingApprovalsRoute() {
  const { approvals } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionSuccess | ActionError>();
  const [reviewer, setReviewer] = useState("ceo");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const pending = fetcher.state !== "idle";
  const fetcherApprovals = (fetcher.data as ActionSuccess | undefined)?.approvals;
  const dataSource = fetcherApprovals ?? approvals;
  const errorMessage =
    fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined;

  const groupedApprovals = useMemo(() => {
    const groups = new Map<string, MarketingApprovalItem[]>();

    for (const item of dataSource) {
      const key = categoryLabel(item.category);
      const collection = groups.get(key) ?? [];
      collection.push(item);
      groups.set(key, collection);
    }

    return Array.from(groups.entries());
  }, [dataSource]);

  const handleSubmit = (id: string, intent: "approve" | "reject" | "mark-applied") => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("intent", intent);
    formData.append("reviewer", reviewer.trim());
    const note = notes[id]?.trim();
    if (note) {
      formData.append("notes", note);
    }

    fetcher.submit(formData, { method: "post" });
  };

  return (
    <Page
      title="Marketing Approvals"
      subtitle="Review campaign assets, budgets, and launch plans."
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                This queue tracks all launch-ready marketing materials for task{" "}
                <InlineCode>ADS-LAUNCH-001</InlineCode>. Approve or reject each
                item after reviewing evidence. Changes are logged to the shared
                decision ledger automatically.
              </Text>
              <InlineStack gap="200" wrap>
                <TextField
                  label="Reviewer"
                  value={reviewer}
                  autoComplete="off"
                  onChange={(value) => setReviewer(value)}
                  helpText="Shown in decision log when approvals are updated."
                  disabled={pending}
                />
              </InlineStack>
              {errorMessage ? (
                <Banner status="critical" title="Failed to update approval">
                  <p>{errorMessage}</p>
                </Banner>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>
        {groupedApprovals.map(([category, items]) => (
          <Layout.Section key={category}>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    {category}
                  </Text>
                  <Text as="span" tone="subdued" variant="bodySm">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </Text>
                </InlineStack>
                <Divider />
                <BlockStack gap="300">
                  {items.map((item) => {
                    const isUpdating =
                      pending &&
                      fetcher.formData?.get("id") === item.id;
                    const noteValue = notes[item.id] ?? "";

                    return (
                      <Box
                        key={item.id}
                        background="bg-surface-secondary"
                        padding="400"
                        borderRadius="base"
                        border="divider"
                      >
                        <BlockStack gap="300">
                          <InlineStack align="space-between" wrap>
                            <BlockStack gap="100">
                              <Text as="h3" variant="headingSm">
                                {item.title}
                              </Text>
                              <InlineStack gap="200" wrap>
                                <Badge tone={statusTone(item.status)}>
                                  {statusLabel(item.status)}
                                </Badge>
                                <Badge>{item.priority}</Badge>
                                <Text as="span" variant="bodySm" tone="subdued">
                                  Owner: {item.owner}
                                </Text>
                                {item.dueAt ? (
                                  <Text
                                    as="span"
                                    variant="bodySm"
                                    tone="subdued"
                                  >
                                    Due: {new Date(item.dueAt).toLocaleDateString()}
                                  </Text>
                                ) : null}
                              </InlineStack>
                            </BlockStack>
                            <Text as="span" variant="bodySm" tone="subdued">
                              Requested{" "}
                              {new Date(item.requestedAt).toLocaleDateString()}
                            </Text>
                          </InlineStack>
                          <Text as="p" variant="bodyMd">
                            {item.summary}
                          </Text>
                          <BlockStack gap="100">
                            <Text as="span" variant="bodySm" tone="subdued">
                              Evidence
                            </Text>
                            <InlineStack gap="200" wrap>
                              {item.evidence.map((path) => (
                                <Button
                                  key={path}
                                  variant="plain"
                                  url={`/${path}`}
                                  external
                                >
                                  {path}
                                </Button>
                              ))}
                            </InlineStack>
                          </BlockStack>
                          {item.relatedAssets && item.relatedAssets.length > 0 ? (
                            <BlockStack gap="100">
                              <Text as="span" variant="bodySm" tone="subdued">
                                Related assets
                              </Text>
                              <InlineStack gap="200" wrap>
                                {item.relatedAssets.map((asset) => (
                                  <Button
                                    key={asset}
                                    variant="plain"
                                    url={`/${asset}`}
                                    external
                                  >
                                    {asset}
                                  </Button>
                                ))}
                              </InlineStack>
                            </BlockStack>
                          ) : null}
                          {item.reviewNotes ? (
                            <Banner status="info" title="Previous review notes">
                              <p>{item.reviewNotes}</p>
                            </Banner>
                          ) : null}
                          <TextField
                            label="Review notes"
                            value={noteValue}
                            autoComplete="off"
                            multiline={3}
                            onChange={(value) =>
                              setNotes((current) => ({
                                ...current,
                                [item.id]: value,
                              }))
                            }
                            disabled={pending}
                          />
                          <InlineStack gap="200" wrap>
                            <Button
                              variant="primary"
                              loading={isUpdating && fetcher.formData?.get("intent") === "approve"}
                              onClick={() => handleSubmit(item.id, "approve")}
                              disabled={pending}
                            >
                              Approve
                            </Button>
                            <Button
                              tone="critical"
                              loading={isUpdating && fetcher.formData?.get("intent") === "reject"}
                              onClick={() => handleSubmit(item.id, "reject")}
                              disabled={pending}
                            >
                              Reject
                            </Button>
                            {item.type === "ad_copy" && item.status === "approved" ? (
                              <Button
                                variant="secondary"
                                loading={isUpdating && fetcher.formData?.get("intent") === "mark-applied"}
                                onClick={() => handleSubmit(item.id, "mark-applied")}
                                disabled={pending}
                              >
                                Mark Applied
                              </Button>
                            ) : null}
                          </InlineStack>
                          {item.reviewedBy ? (
                            <Text as="span" variant="bodySm" tone="subdued">
                              Last reviewed by {item.reviewedBy} on{" "}
                              {item.reviewedAt
                                ? new Date(item.reviewedAt).toLocaleString()
                                : "—"}
                            </Text>
                          ) : null}
                        </BlockStack>
                      </Box>
                    );
                  })}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}
