import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import {
  Page,
  Layout,
  Card,
  EmptyState,
  InlineStack,
  Badge,
  Button,
} from "@shopify/polaris";
import { ApprovalCard } from "../components/ApprovalCard";
import { ApprovalsDrawer } from "../components/approvals/ApprovalsDrawer";
import type { Approval } from "../components/approvals/ApprovalsDrawer";
import { getApprovals, getApprovalCounts } from "../services/approvals";
import { useNotifications } from "../hooks/useNotifications";

/**
 * Loader: Fetch approvals from Supabase
 *
 * Supports filtering by state and kind via URL params
 * Tabs handle filtering on the client side
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get("state") as Approval["state"] | null;
    const kind = url.searchParams.get("kind") as Approval["kind"] | null;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = 50;

    // Fetch approvals with filters
    const filters: any = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    if (state) filters.state = state;
    if (kind) filters.kind = kind;

    const { approvals, total, error } = await getApprovals(filters);

    // Fetch counts for all states (for tab badges)
    const counts = await getApprovalCounts();

    return Response.json({
      approvals,
      total,
      counts,
      error: error || null,
    });
  } catch (error) {
    console.error("Error in approvals loader:", error);
    return Response.json({
      approvals: [],
      total: 0,
      counts: {},
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export default function ApprovalsRoute() {
  const { approvals, total, counts, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const notifications = useNotifications();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<Approval | null>(null);
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(new Set());
  const [previousApprovalCount, setPreviousApprovalCount] = useState(approvals.length);

  const stateFilter = searchParams.get("state") || undefined;
  const kindFilter = searchParams.get("kind") || undefined;
  const page = Number(searchParams.get("page") || "1");

  // Filter is now handled by the loader, but we still filter out suppressed items
  const visible = useMemo(
    () => (approvals as Approval[]).filter((a) => !suppressedIds.has(a.id)),
    [approvals, suppressedIds],
  );

  function openDetails(approval: Approval) {
    setSelected(approval);
  }

  async function handleApprove(grades?: {
    tone: number;
    accuracy: number;
    policy: number;
  }) {
    if (!selected) return;

    // Optimistic hide
    setSuppressedIds((prev) => new Set(prev).add(selected.id));
    setSelected(null);

    try {
      // TODO: Implement approve action (Task 3)
      await fetch(`/api/approvals/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades }),
      });
    } catch (error) {
      console.error("Error approving:", error);
    } finally {
      revalidator.revalidate();
    }
  }

  async function handleReject(reason: string) {
    if (!selected) return;

    // Optimistic hide
    setSuppressedIds((prev) => new Set(prev).add(selected.id));
    setSelected(null);

    try {
      // TODO: Implement reject action (Task 3)
      await fetch(`/api/approvals/${selected.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      revalidator.revalidate();
    }
  }

  async function handleRequestChanges(note: string) {
    if (!selected) return;

    // Don't hide - just close drawer
    setSelected(null);

    try {
      await fetch(`/api/approvals/${selected.id}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
    } catch (error) {
      console.error("Error requesting changes:", error);
    } finally {
      revalidator.revalidate();
    }
  }

  async function handleApply() {
    if (!selected) return;

    // Optimistic hide
    setSuppressedIds((prev) => new Set(prev).add(selected.id));
    setSelected(null);

    try {
      await fetch(`/api/approvals/${selected.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error applying:", error);
    } finally {
      revalidator.revalidate();
    }
  }

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidator]);

  // Detect new approvals and show notifications
  useEffect(() => {
    const currentCount = approvals.length;
    const newCount = currentCount - previousApprovalCount;
    
    if (newCount > 0 && previousApprovalCount > 0) {
      // New approvals detected
      notifications.addNotification({
        type: "approval",
        title: "New Approvals",
        message: `${newCount} new approval${newCount > 1 ? 's' : ''} need your review`,
        url: "/approvals",
      });
      
      // Show browser notification if permission granted
      if (notifications.browserNotifications.permission === "granted") {
        // Check if sound is enabled (from settings or localStorage)
        const soundEnabled = localStorage.getItem('notification-sound-enabled') === 'true';
        notifications.browserNotifications.showApprovalNotification(newCount, soundEnabled);
      }
    }
    
    setPreviousApprovalCount(currentCount);
  }, [approvals.length, previousApprovalCount, notifications]);

  return (
    <Page
      title="Approval Queue"
      subtitle={`${total} ${total === 1 ? "approval" : "approvals"}`}
    >
      <Layout>
        {/* Active filters */}
        {(stateFilter || kindFilter) && (
          <Layout.Section>
            <InlineStack gap="200">
              {stateFilter && <Badge>{`state: ${stateFilter}`}</Badge>}
              {kindFilter && <Badge>{`kind: ${kindFilter}`}</Badge>}
              <Button
                onClick={() =>
                  setSearchParams((prev) => {
                    const p = new URLSearchParams(prev);
                    p.delete("state");
                    p.delete("kind");
                    p.set("page", "1");
                    return p;
                  })
                }
              >
                Clear filters
              </Button>
            </InlineStack>
          </Layout.Section>
        )}

        {error && (
          <Layout.Section>
            <Card>
              <div style={{ padding: "16px", color: "#bf0711" }}>
                <strong>Error:</strong> {error}
              </div>
            </Card>
          </Layout.Section>
        )}

        {visible.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All clear!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending approvals. Check back later.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          visible.map((approval) => (
            <Layout.Section key={approval.id}>
              <ApprovalCard
                approval={approval}
                onDetails={() => openDetails(approval)}
              />
            </Layout.Section>
          ))
        )}

        {/* Pagination controls */}
        {total > 0 && (
          <Layout.Section>
            <InlineStack gap="200" align="space-between" blockAlign="center">
              <Badge>{`Total: ${total}`}</Badge>
              <InlineStack gap="200">
                <Button
                  disabled={page <= 1}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.set("page", String(Math.max(1, page - 1)));
                      return p;
                    })
                  }
                >
                  Prev
                </Button>
                <Button
                  disabled={Array.isArray(approvals) ? approvals.length < 50 : true}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.set("page", String(page + 1));
                      return p;
                    })
                  }
                >
                  Next
                </Button>
              </InlineStack>
            </InlineStack>
          </Layout.Section>
        )}

        {/* Drawer */}
        {selected && (
          <ApprovalsDrawer
            open={true}
            approval={selected}
            onClose={() => setSelected(null)}
            onApprove={(grades) => handleApprove(grades)}
            onReject={(reason) => handleReject(reason)}
            onRequestChanges={(note) => handleRequestChanges(note)}
            onApply={() => handleApply()}
          />
        )}
      </Layout>
    </Page>
  );
}
