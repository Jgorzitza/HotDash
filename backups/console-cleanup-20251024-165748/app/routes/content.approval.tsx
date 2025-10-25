/**
 * Content Approval Route
 * 
 * Review and approve content before publishing
 */

import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useSubmit, useRevalidator } from "react-router";
import { Page, Card, Text, Button, Badge, InlineStack, BlockStack, Banner, EmptyState, Layout } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { ContentApprovalWorkflowService } from "~/services/content/approval-workflow.service";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  try {
    const url = new URL(request.url);
    const content_type = url.searchParams.get("content_type") || undefined;

    const { items, total } = await ContentApprovalWorkflowService.getPendingApprovals({
      content_type,
      limit: 50,
      offset: 0
    });

    const stats = await ContentApprovalWorkflowService.getApprovalStats();

    return {
      approvals: items,
      total,
      stats
    };
  } catch (error: any) {
    console.error("Error loading content approvals:", error);
    return data({
      approvals: [],
      total: 0,
      stats: {
        pending_review: 0,
        approved_today: 0,
        rejected_today: 0,
        average_review_time_minutes: 0
      },
      error: error.message || "Failed to load approvals"
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get("_action") as string;
  const id = formData.get("id") as string;

  try {
    switch (actionType) {
      case "approve":
        const schedule_for = formData.get("schedule_for") as string | null;
        const publish_immediately = formData.get("publish_immediately") === "true";
        
        await ContentApprovalWorkflowService.approveContent(
          id,
          "content-agent",
          {
            schedule_for: schedule_for || undefined,
            publish_immediately
          }
        );
        return { success: true, message: "Content approved successfully!" };

      case "reject":
        const rejection_reason = formData.get("rejection_reason") as string;
        await ContentApprovalWorkflowService.rejectContent(id, "content-agent", rejection_reason);
        return { success: true, message: "Content rejected" };

      case "request_changes":
        const requested_changes = formData.get("requested_changes") as string;
        await ContentApprovalWorkflowService.requestChanges(id, "content-agent", requested_changes);
        return { success: true, message: "Changes requested" };

      default:
        return data({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`Error performing ${actionType} action:`, error);
    return data({ success: false, error: error.message || `Failed to ${actionType}` }, { status: 400 });
  }
}

export default function ContentApprovalPage() {
  const { approvals, stats, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const revalidator = useRevalidator();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000);
    return () => clearInterval(interval);
  }, [revalidator]);

  const handleApprove = (id: string, scheduleFor?: string) => {
    const formData = new FormData();
    formData.append('_action', 'approve');
    formData.append('id', id);
    if (scheduleFor) {
      formData.append('schedule_for', scheduleFor);
    }
    submit(formData, { method: 'post' });
  };

  const handleReject = (id: string, reason: string) => {
    const formData = new FormData();
    formData.append('_action', 'reject');
    formData.append('id', id);
    formData.append('rejection_reason', reason);
    submit(formData, { method: 'post' });
  };

  const handleRequestChanges = (id: string, changes: string) => {
    const formData = new FormData();
    formData.append('_action', 'request_changes');
    formData.append('id', id);
    formData.append('requested_changes', changes);
    submit(formData, { method: 'post' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge tone="attention">Pending Review</Badge>;
      case 'approved':
        return <Badge tone="success">Approved</Badge>;
      case 'rejected':
        return <Badge tone="critical">Rejected</Badge>;
      case 'changes_requested':
        return <Badge tone="warning">Changes Requested</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'social_post': return '📱';
      case 'blog_post': return '📝';
      case 'product_description': return '🛍️';
      case 'email_campaign': return '📧';
      default: return '📄';
    }
  };

  return (
    <Page title="Content Approval Queue">
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical">
            <Text as="p">{error}</Text>
          </Banner>
        )}

        {actionData?.success && (
          <Banner tone="success">
            <Text as="p">{actionData.message}</Text>
          </Banner>
        )}

        {actionData?.error && (
          <Banner tone="critical">
            <Text as="p">{actionData.error}</Text>
          </Banner>
        )}

        {/* Stats Card */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Approval Statistics
            </Text>
            <InlineStack gap="600">
              <div>
                <Text as="p" variant="bodyMd" tone="subdued">Pending Review</Text>
                <Text as="p" variant="headingLg">{stats.pending_review}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" tone="subdued">Approved Today</Text>
                <Text as="p" variant="headingLg">{stats.approved_today}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" tone="subdued">Rejected Today</Text>
                <Text as="p" variant="headingLg">{stats.rejected_today}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" tone="subdued">Avg Review Time</Text>
                <Text as="p" variant="headingLg">{Math.round(stats.average_review_time_minutes)}m</Text>
              </div>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Approval Queue */}
        <Layout>
          {approvals.length === 0 ? (
            <Layout.Section>
              <Card>
                <EmptyState
                  heading="All caught up!"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No content pending approval. Check back later.</p>
                </EmptyState>
              </Card>
            </Layout.Section>
          ) : (
            approvals.map((approval) => (
              <Layout.Section key={approval.id}>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <InlineStack gap="200">
                        <Text as="span" variant="bodyLg">
                          {getContentTypeIcon(approval.content_type)}
                        </Text>
                        <Text as="h3" variant="headingMd">
                          {approval.title}
                        </Text>
                      </InlineStack>
                      {getStatusBadge(approval.status)}
                    </InlineStack>

                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f6f6f7',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <Text as="p" variant="bodyMd">
                        {approval.content}
                      </Text>
                    </div>

                    <InlineStack gap="200">
                      <Text as="span" variant="bodySm" tone="subdued">
                        Submitted by: {approval.submitted_by}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        •
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {new Date(approval.submitted_at).toLocaleString()}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        •
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        Version {approval.version}
                      </Text>
                    </InlineStack>

                    {approval.status === 'pending_review' && (
                      <InlineStack gap="200">
                        <Button
                          onClick={() => handleApprove(approval.id)}
                          variant="primary"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) handleReject(approval.id, reason);
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            const changes = prompt('Requested changes:');
                            if (changes) handleRequestChanges(approval.id, changes);
                          }}
                        >
                          Request Changes
                        </Button>
                      </InlineStack>
                    )}

                    {approval.rejection_reason && (
                      <Banner tone="critical">
                        <Text as="p" fontWeight="semibold">Rejection Reason:</Text>
                        <Text as="p">{approval.rejection_reason}</Text>
                      </Banner>
                    )}

                    {approval.requested_changes && (
                      <Banner tone="warning">
                        <Text as="p" fontWeight="semibold">Requested Changes:</Text>
                        <Text as="p">{approval.requested_changes}</Text>
                      </Banner>
                    )}
                  </BlockStack>
                </Card>
              </Layout.Section>
            ))
          )}
        </Layout>
      </BlockStack>
    </Page>
  );
}
