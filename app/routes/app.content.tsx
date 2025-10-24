/**
 * Content Management System UI
 * 
 * Provides interface for content creation, editing, and management
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigation } from "react-router";
import { Page, Card, Text, Button, Badge, InlineStack, Spinner, Banner } from "@shopify/polaris";
import { ContentService } from "~/services/content";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'all';
  const search = url.searchParams.get('search') || '';

  try {
    const entries = await ContentService.getContentEntries({ 
      status: status === 'all' ? undefined : status,
      search: search || undefined,
      limit: 20
    });
    const contentTypes = await ContentService.getContentTypes();
    const stats = await ContentService.getContentStats();

    return Response.json({ 
      entries: entries.entries,
      contentTypes,
      stats,
      filters: { status, search }
    });
  } catch (error: any) {
    console.error("Error loading content management:", error);
    return Response.json({ 
      entries: [], 
      contentTypes: [],
      stats: { total_entries: 0, published_entries: 0, draft_entries: 0, archived_entries: 0, total_content_types: 0 },
      error: error.message || "Failed to load content"
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action") as string;
  const entryId = formData.get("entryId") as string;
  const userId = "content-agent"; // Replace with actual user ID from session/auth

  try {
    let result;
    switch (actionType) {
      case "publish":
        result = await ContentService.publishContentEntry(entryId, userId);
        break;
      case "archive":
        result = await ContentService.updateContentEntry(entryId, {
          status: 'archived',
          updated_by: userId
        });
        break;
      default:
        throw new Error("Invalid action type");
    }
    return Response.json({ success: true, message: `Content ${actionType}d successfully!`, data: result });
  } catch (error: any) {
    console.error(`Error performing ${actionType} action:`, error);
    return Response.json({ success: false, error: error.message || `Failed to ${actionType} content` }, { status: 400 });
  }
}

export default function ContentManagementPage() {
  const { entries, contentTypes, stats, filters, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'attention';
      case 'archived': return 'critical';
      default: return 'info';
    }
  };

  return (
    <Page
      title="Content Management System"
      subtitle="Create, edit, and manage your content"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Status Banner */}
        {actionData?.error && (
          <Banner tone="critical">
            <Text as="p">{actionData.error}</Text>
          </Banner>
        )}
        {actionData?.success && (
          <Banner tone="success">
            <Text as="p">{actionData.message}</Text>
          </Banner>
        )}

        {/* Stats Overview */}
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Text as="h3" variant="headingMd">Content Statistics</Text>
              <InlineStack spacing="loose">
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Total Entries</Text>
                  <Text as="p" variant="headingLg">{stats.total_entries}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Published</Text>
                  <Text as="p" variant="headingLg" tone="success">{stats.published_entries}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Drafts</Text>
                  <Text as="p" variant="headingLg" tone="attention">{stats.draft_entries}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Archived</Text>
                  <Text as="p" variant="headingLg" tone="critical">{stats.archived_entries}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Content Types</Text>
                  <Text as="p" variant="headingLg">{stats.total_content_types}</Text>
                </div>
              </InlineStack>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Text as="h3" variant="headingMd">Quick Actions</Text>
              <InlineStack spacing="tight">
                <Button variant="primary">Create New Content</Button>
                <Button variant="secondary">Create Content Type</Button>
                <Button variant="tertiary">Import Content</Button>
              </InlineStack>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card>
            <div style={{ padding: '20px' }}>
              <Text as="p" tone="critical">Error: {error}</Text>
            </div>
          </Card>
        )}

        {/* Content Types */}
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Text as="h3" variant="headingMd">Content Types</Text>
              {contentTypes.length === 0 ? (
                <Text as="p" tone="subdued">No content types found. Create your first content type to get started.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {contentTypes.map((contentType) => (
                    <div key={contentType.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid #e1e3e5',
                      borderRadius: '4px'
                    }}>
                      <div>
                        <Text as="p" fontWeight="semibold">{contentType.name}</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">{contentType.description}</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">{contentType.fields.length} fields</Text>
                      </div>
                      <Button size="slim" variant="tertiary">Edit</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Content Entries */}
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Text as="h3" variant="headingMd">Content Entries</Text>
              {entries.length === 0 ? (
                <Text as="p" tone="subdued">No content entries found. Create your first content entry to get started.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {entries.map((entry) => (
                    <div key={entry.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '16px',
                      border: '1px solid #e1e3e5',
                      borderRadius: '4px'
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text as="h4" variant="headingMd" fontWeight="semibold">
                            {entry.title}
                          </Text>
                          <Text as="p" tone="subdued">/{entry.slug}</Text>
                        </div>
                        <Badge tone={getStatusColor(entry.status)}>{entry.status}</Badge>
                      </div>

                      {/* Details */}
                      <InlineStack spacing="tight">
                        <Text as="p" variant="bodyMd" tone="subdued">v{entry.version}</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">•</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">Updated {new Date(entry.updated_at).toLocaleDateString()}</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">•</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">by {entry.updated_by}</Text>
                      </InlineStack>

                      {/* Actions */}
                      <InlineStack spacing="tight">
                        <Button size="slim" variant="primary">Edit</Button>
                        {entry.status === 'draft' && (
                          <Button
                            size="slim"
                            variant="secondary"
                            onClick={() => {
                              const formData = new FormData();
                              formData.append("_action", "publish");
                              formData.append("entryId", entry.id);
                              navigation.submit(formData, { method: "post" });
                            }}
                            loading={isSubmitting && navigation.formData?.get("entryId") === entry.id && navigation.formData?.get("_action") === "publish"}
                          >
                            Publish
                          </Button>
                        )}
                        {entry.status === 'published' && (
                          <Button
                            size="slim"
                            variant="tertiary"
                            onClick={() => {
                              const formData = new FormData();
                              formData.append("_action", "archive");
                              formData.append("entryId", entry.id);
                              navigation.submit(formData, { method: "post" });
                            }}
                            loading={isSubmitting && navigation.formData?.get("entryId") === entry.id && navigation.formData?.get("_action") === "archive"}
                          >
                            Archive
                          </Button>
                        )}
                        <Button size="slim" variant="tertiary">View</Button>
                      </InlineStack>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
