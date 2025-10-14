/**
 * CEO Approval Queue
 * 
 * Displays pending agent actions that require CEO approval
 */

import { useEffect } from 'react';
import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator, useSubmit } from "react-router";
import { Page, Layout, Card, EmptyState, BlockStack, InlineStack, Text, Badge, Button, Banner } from "@shopify/polaris";

// Helper function for JSON responses
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

interface Action {
  id: number;
  toolName: string;
  agent: string;
  parameters: any;
  rationale?: string;
  status: string;
  conversationId?: number;
  shopDomain?: string;
  priority: string;
  requestedAt: string;
}

interface LoaderData {
  actions: Action[];
  error: string | null;
}

/**
 * Loader: Fetch pending actions from API
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Fetch pending actions from our Action API
    const response = await fetch(`${baseUrl}/api/actions?status=pending&limit=50`);
    
    if (!response.ok) {
      console.error('Failed to fetch actions:', response.status);
      return json({ actions: [], error: 'Failed to load approval queue' });
    }
    
    const data = await response.json();
    return json({ 
      actions: data.actions || [],
      error: null 
    });
  } catch (error) {
    console.error('Error fetching actions:', error);
    return json({ 
      actions: [],
      error: 'Failed to connect to approval service' 
    });
  }
}

export default function ApprovalQueueRoute() {
  const data = useLoaderData() as LoaderData;
  const { actions, error } = data;
  const revalidator = useRevalidator();
  const submit = useSubmit();
  
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 10000);
    return () => clearInterval(interval);
  }, [revalidator]);

  const handleApprove = async (actionId: number) => {
    const url = new URL(window.location.href);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    try {
      const response = await fetch(`${baseUrl}/api/actions/${actionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'CEO', // TODO: Get from session
        }),
      });
      
      if (response.ok) {
        revalidator.revalidate();
      } else {
        alert('Failed to approve action');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve action');
    }
  };

  const handleReject = async (actionId: number) => {
    const url = new URL(window.location.href);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    const reason = prompt('Reason for rejection (optional):');
    
    try {
      const response = await fetch(`${baseUrl}/api/actions/${actionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'CEO', // TODO: Get from session
          reason,
        }),
      });
      
      if (response.ok) {
        revalidator.revalidate();
      } else {
        alert('Failed to reject action');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject action');
    }
  };

  const getPriorityTone = (priority: string): "success" | "info" | "warning" | "critical" => {
    switch (priority) {
      case 'urgent': return 'critical';
      case 'high': return 'warning';
      case 'normal': return 'info';
      default: return 'success';
    }
  };

  return (
    <Page
      title="Approval Queue"
      subtitle={`${actions.length} pending ${actions.length === 1 ? 'approval' : 'approvals'}`}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner
              title="Error loading approvals"
              tone="critical"
              onDismiss={() => revalidator.revalidate()}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}
        
        {actions.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All clear!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending approvals. All agent actions have been reviewed.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          actions.map((action) => (
            <Layout.Section key={action.id}>
              <Card>
                <BlockStack gap="400">
                  {/* Header */}
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text variant="headingMd" as="h2">
                        {action.toolName}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Requested by {action.agent}
                      </Text>
                    </BlockStack>
                    <Badge tone={getPriorityTone(action.priority)}>
                      {action.priority.toUpperCase()}
                    </Badge>
                  </InlineStack>
                  
                  {/* Rationale */}
                  {action.rationale && (
                    <BlockStack gap="100">
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Rationale:
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {action.rationale}
                      </Text>
                    </BlockStack>
                  )}
                  
                  {/* Parameters */}
                  <BlockStack gap="100">
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      Parameters:
                    </Text>
                    <div style={{ 
                      background: '#f6f6f7', 
                      padding: '12px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px',
                    }}>
                      <pre>{JSON.stringify(action.parameters, null, 2)}</pre>
                    </div>
                  </BlockStack>
                  
                  {/* Context */}
                  {(action.conversationId || action.shopDomain) && (
                    <InlineStack gap="400">
                      {action.conversationId && (
                        <Text variant="bodySm" as="p" tone="subdued">
                          Conversation #{action.conversationId}
                        </Text>
                      )}
                      {action.shopDomain && (
                        <Text variant="bodySm" as="p" tone="subdued">
                          Shop: {action.shopDomain}
                        </Text>
                      )}
                    </InlineStack>
                  )}
                  
                  {/* Timestamp */}
                  <Text variant="bodySm" as="p" tone="subdued">
                    Requested {new Date(action.requestedAt).toLocaleString()}
                  </Text>
                  
                  {/* Actions */}
                  <InlineStack gap="200">
                    <Button
                      variant="primary"
                      tone="success"
                      onClick={() => handleApprove(action.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="primary"
                      tone="critical"
                      onClick={() => handleReject(action.id)}
                    >
                      Reject
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))
        )}
      </Layout>
    </Page>
  );
}

