/**
 * Growth Engine Action Queue Tile Component
 *
 * Displays the top-ranked actions from the Action Queue
 */
import { Card, Text, Button, Badge, Stack, InlineStack, Spinner } from "@shopify/polaris";
import { useState, useEffect } from "react";
export function ActionQueueTile({ limit = 5 }) {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchActions();
    }, []);
    const fetchActions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/growth-engine/action-queue?limit=${limit}&status=pending`);
            const data = await response.json();
            if (data.success) {
                setActions(data.data);
            }
            else {
                setError(data.error || 'Failed to fetch actions');
            }
        }
        catch (err) {
            setError('Failed to fetch actions');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async (actionId) => {
        try {
            const response = await fetch('/api/growth-engine/action-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    actionId,
                    operatorId: 'current-user' // This would come from auth context
                })
            });
            if (response.ok) {
                await fetchActions(); // Refresh the list
            }
        }
        catch (err) {
            console.error('Error approving action:', err);
        }
    };
    const handleReject = async (actionId) => {
        try {
            const response = await fetch('/api/growth-engine/action-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    actionId,
                    operatorId: 'current-user' // This would come from auth context
                })
            });
            if (response.ok) {
                await fetchActions(); // Refresh the list
            }
        }
        catch (err) {
            console.error('Error rejecting action:', err);
        }
    };
    const getEaseColor = (ease) => {
        switch (ease) {
            case 'simple': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'critical';
            default: return 'info';
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'none': return 'success';
            case 'perf': return 'info';
            case 'safety': return 'warning';
            case 'policy': return 'critical';
            default: return 'info';
        }
    };
    if (loading) {
        return (<Card>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spinner size="small"/>
          <Text as="p">Loading action queue...</Text>
        </div>
      </Card>);
    }
    if (error) {
        return (<Card>
        <div style={{ padding: '20px' }}>
          <Text as="p" tone="critical">Error: {error}</Text>
        </div>
      </Card>);
    }
    return (<Card>
      <div style={{ padding: '20px' }}>
        <Stack vertical spacing="loose">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Action Queue</Text>
            <Badge tone="info">{actions.length} pending</Badge>
          </InlineStack>
          
          {actions.length === 0 ? (<div style={{ textAlign: 'center', padding: '20px' }}>
              <Text as="p" tone="subdued">All clear! No pending actions.</Text>
            </div>) : (<Stack vertical spacing="tight">
              {actions.map((action) => (<div key={action.id} style={{
                    border: '1px solid #e1e3e5',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9'
                }}>
                  <Stack vertical spacing="tight">
                    <InlineStack align="space-between">
                      <Text as="p" fontWeight="semibold">{action.draft}</Text>
                      <Text as="p" tone="subdued">Score: {action.score.toFixed(1)}</Text>
                    </InlineStack>
                    
                    <InlineStack spacing="tight">
                      <Badge tone={getEaseColor(action.ease)}>{action.ease}</Badge>
                      <Badge tone={getRiskColor(action.risk_tier)}>{action.risk_tier}</Badge>
                      <Badge>{action.agent}</Badge>
                    </InlineStack>
                    
                    <Text as="p" tone="subdued">
                      Expected impact: {action.expected_impact.delta > 0 ? '+' : ''}{action.expected_impact.delta}{action.expected_impact.unit} {action.expected_impact.metric}
                    </Text>
                    
                    <Text as="p" tone="subdued">
                      Confidence: {(action.confidence * 100).toFixed(0)}%
                    </Text>
                    
                    <InlineStack spacing="tight">
                      <Button size="slim" variant="primary" onClick={() => handleApprove(action.id)}>
                        Approve
                      </Button>
                      <Button size="slim" variant="secondary" onClick={() => handleReject(action.id)}>
                        Reject
                      </Button>
                    </InlineStack>
                  </Stack>
                </div>))}
            </Stack>)}
        </Stack>
      </div>
    </Card>);
}
//# sourceMappingURL=ActionQueueTile.js.map