/**
 * Action Queue Route
 * 
 * Displays the Action Queue interface for operators to review and approve actions
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigation } from "react-router";
import { Page, Card, Text, Button, Badge, InlineStack, Spinner, Banner } from "@shopify/polaris";
import { ActionQueueService } from "~/services/action-queue";
import { ActionQueueTile } from "~/components/growth-engine/ActionQueueTile";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || 'pending';
    
    const [actions, stats] = await Promise.all([
      ActionQueueService.getActions({ limit, status }),
      ActionQueueService.getStats()
    ]);
    
    return Response.json({
      actions,
      stats,
      filters: {
        limit,
        status
      }
    });
  } catch (error) {
    console.error('Error loading action queue:', error);
    return Response.json({
      actions: [],
      stats: { total: 0, pending: 0, approved: 0, executed: 0, rejected: 0 },
      filters: { limit: 10, status: 'pending' },
      error: 'Failed to load action queue'
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const actionId = formData.get('actionId') as string;
    const operatorId = formData.get('operatorId') as string || 'current-user';
    
    switch (action) {
      case 'approve':
        await ActionQueueService.approveAction(actionId, operatorId);
        return Response.json({ success: true, message: 'Action approved successfully' });
      case 'reject':
        await ActionQueueService.rejectAction(actionId, operatorId);
        return Response.json({ success: true, message: 'Action rejected successfully' });
      case 'execute':
        await ActionQueueService.executeAction(actionId, operatorId);
        return Response.json({ success: true, message: 'Action executed successfully' });
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return Response.json({
      error: error instanceof Error ? error.message : 'Failed to process action'
    }, { status: 500 });
  }
}

export default function ActionsPage() {
  const { actions, stats, filters, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === 'submitting';
  
  const handleAction = async (action: string, actionId: string) => {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('actionId', actionId);
    formData.append('operatorId', 'current-user');
    
    // Submit the form
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    
    for (const [key, value] of formData.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'info';
      case 'approved': return 'success';
      case 'executed': return 'success';
      case 'rejected': return 'critical';
      default: return 'info';
    }
  };

  const getEaseColor = (ease: string) => {
    switch (ease) {
      case 'simple': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'critical';
      default: return 'info';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'none': return 'success';
      case 'perf': return 'info';
      case 'safety': return 'warning';
      case 'policy': return 'critical';
      default: return 'info';
    }
  };

  return (
    <Page
      title="Action Queue"
      subtitle="Review and approve actions from the Growth Engine"
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
              <Text as="h3" variant="headingMd">Queue Statistics</Text>
              <InlineStack spacing="loose">
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Total Actions</Text>
                  <Text as="p" variant="headingLg">{stats.total}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Pending</Text>
                  <Text as="p" variant="headingLg" tone="info">{stats.pending}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Approved</Text>
                  <Text as="p" variant="headingLg" tone="success">{stats.approved}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Executed</Text>
                  <Text as="p" variant="headingLg" tone="success">{stats.executed}</Text>
                </div>
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Rejected</Text>
                  <Text as="p" variant="headingLg" tone="critical">{stats.rejected}</Text>
                </div>
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

        {/* Actions List */}
        {actions.length === 0 ? (
          <Card>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Text as="p" tone="subdued">
                {filters.status === 'pending' 
                  ? 'No pending actions in the queue.'
                  : `No ${filters.status} actions found.`
                }
              </Text>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {actions.map((action) => (
              <Card key={action.id}>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Header */}
                    <InlineStack align="space-between">
                      <Text as="h4" variant="headingMd" fontWeight="semibold">
                        {action.draft}
                      </Text>
                      <InlineStack spacing="tight">
                        <Badge tone={getStatusColor(action.status)}>
                          {action.status}
                        </Badge>
                        <Text as="p" tone="subdued">
                          Score: {action.score.toFixed(1)}
                        </Text>
                      </InlineStack>
                    </InlineStack>

                    {/* Metadata */}
                    <InlineStack spacing="tight">
                      <Badge>{action.type}</Badge>
                      <Badge tone={getEaseColor(action.ease)}>{action.ease}</Badge>
                      <Badge tone={getRiskColor(action.risk_tier)}>{action.risk_tier}</Badge>
                      <Badge>{action.agent}</Badge>
                    </InlineStack>

                    {/* Impact */}
                    <Text as="p" tone="subdued">
                      Expected impact: {action.expected_impact.delta > 0 ? '+' : ''}
                      {action.expected_impact.delta}{action.expected_impact.unit} {action.expected_impact.metric}
                    </Text>

                    <Text as="p" tone="subdued">
                      Confidence: {(action.confidence * 100).toFixed(0)}%
                    </Text>

                    {/* Target */}
                    <Text as="p" tone="subdued">
                      Target: {action.target}
                    </Text>

                    {/* Rollback Plan */}
                    {action.rollback_plan && (
                      <Text as="p" tone="subdued">
                        Rollback: {action.rollback_plan}
                      </Text>
                    )}

                    {/* Actions */}
                    {action.status === 'pending' && (
                      <InlineStack spacing="tight">
                        <Button
                          size="slim"
                          variant="primary"
                          onClick={() => handleAction('approve', action.id)}
                          loading={isSubmitting}
                        >
                          Approve
                        </Button>
                        <Button
                          size="slim"
                          variant="secondary"
                          onClick={() => handleAction('reject', action.id)}
                          loading={isSubmitting}
                        >
                          Reject
                        </Button>
                      </InlineStack>
                    )}

                    {action.status === 'approved' && (
                      <Button
                        size="slim"
                        variant="primary"
                        onClick={() => handleAction('execute', action.id)}
                        loading={isSubmitting}
                      >
                        Execute
                      </Button>
                    )}

                    {/* Execution Result */}
                    {action.status === 'executed' && action.execution_result && (
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f0f8f0', 
                        borderRadius: '4px',
                        border: '1px solid #d4edda'
                      }}>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          Execution Result:
                        </Text>
                        <Text as="p" tone="subdued">
                          {typeof action.execution_result === 'string' 
                            ? action.execution_result 
                            : action.execution_result.message || 'Action executed successfully'
                          }
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
