/**
 * Growth Engine Specialist Agents Tile Component
 * 
 * Displays the status and performance of specialist agents
 */

import { Card, Text, Button, Badge, Stack, InlineStack, Spinner, ProgressBar } from "@shopify/polaris";
import { useState, useEffect } from "react";

interface SpecialistAgentRun {
  id: string;
  agent_name: string;
  run_type: string;
  status: 'running' | 'completed' | 'failed';
  actions_emitted: number;
  start_time: string;
  end_time?: string;
  error_message?: string;
}

interface SpecialistAgentsTileProps {
  showHistory?: boolean;
}

export function SpecialistAgentsTile({ showHistory = false }: SpecialistAgentsTileProps) {
  const [runs, setRuns] = useState<SpecialistAgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/growth-engine/specialist-agents');
      const data = await response.json();
      
      if (data.success) {
        setRuns(data.data);
      } else {
        setError(data.error || 'Failed to fetch agent runs');
      }
    } catch (err) {
      setError('Failed to fetch agent runs');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgent = async (agentName: string) => {
    try {
      setRunning(true);
      const response = await fetch('/api/growth-engine/specialist-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run',
          agent: agentName,
          runType: 'manual'
        })
      });
      
      if (response.ok) {
        await fetchRuns(); // Refresh the list
      }
    } catch (err) {
      console.error('Error running agent:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleRunAll = async () => {
    try {
      setRunning(true);
      const response = await fetch('/api/growth-engine/specialist-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_all'
        })
      });
      
      if (response.ok) {
        await fetchRuns(); // Refresh the list
      }
    } catch (err) {
      console.error('Error running all agents:', err);
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'critical';
      default: return 'info';
    }
  };

  const getAgentDisplayName = (agentName: string) => {
    switch (agentName) {
      case 'analytics': return 'Analytics Agent';
      case 'inventory': return 'Inventory Agent';
      case 'content-seo-perf': return 'Content/SEO/Perf Agent';
      case 'risk': return 'Risk Agent';
      default: return agentName;
    }
  };

  const getRunTypeDisplay = (runType: string) => {
    switch (runType) {
      case 'daily': return 'Daily';
      case 'hourly': return 'Hourly';
      case 'continuous': return 'Continuous';
      case 'manual': return 'Manual';
      default: return runType;
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spinner size="small" />
          <Text as="p">Loading specialist agents...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <Text as="p" tone="critical">Error: {error}</Text>
        </div>
      </Card>
    );
  }

  const recentRuns = runs.slice(0, showHistory ? 10 : 5);
  const runningRuns = runs.filter(run => run.status === 'running');

  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <Stack vertical spacing="loose">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Specialist Agents</Text>
            <div>
              <Button 
                size="slim" 
                variant="primary"
                onClick={handleRunAll}
                loading={running}
                disabled={runningRuns.length > 0}
              >
                Run All
              </Button>
            </div>
          </InlineStack>
          
          {runningRuns.length > 0 && (
            <div style={{ 
              backgroundColor: '#f0f8ff', 
              padding: '12px', 
              borderRadius: '8px',
              border: '1px solid #b3d9ff'
            }}>
              <Text as="p" tone="info">
                {runningRuns.length} agent(s) currently running...
              </Text>
            </div>
          )}
          
          <Stack vertical spacing="tight">
            {recentRuns.map((run) => (
              <div key={run.id} style={{ 
                border: '1px solid #e1e3e5', 
                borderRadius: '8px', 
                padding: '16px',
                backgroundColor: run.status === 'running' ? '#f0f8ff' : '#f9f9f9'
              }}>
                <Stack vertical spacing="tight">
                  <InlineStack align="space-between">
                    <Text as="p" fontWeight="semibold">
                      {getAgentDisplayName(run.agent_name)}
                    </Text>
                    <Badge tone={getStatusColor(run.status)}>
                      {run.status}
                    </Badge>
                  </InlineStack>
                  
                  <InlineStack spacing="tight">
                    <Badge>{getRunTypeDisplay(run.run_type)}</Badge>
                    <Text as="p" tone="subdued">
                      Actions: {run.actions_emitted}
                    </Text>
                  </InlineStack>
                  
                  <Text as="p" tone="subdued">
                    Started: {new Date(run.start_time).toLocaleString()}
                  </Text>
                  
                  {run.end_time && (
                    <Text as="p" tone="subdued">
                      Completed: {new Date(run.end_time).toLocaleString()}
                    </Text>
                  )}
                  
                  {run.error_message && (
                    <Text as="p" tone="critical">
                      Error: {run.error_message}
                    </Text>
                  )}
                  
                  {run.status === 'running' && (
                    <div style={{ marginTop: '8px' }}>
                      <ProgressBar progress={75} size="small" />
                    </div>
                  )}
                  
                  {run.status === 'completed' && (
                    <Button 
                      size="slim" 
                      variant="secondary"
                      onClick={() => handleRunAgent(run.agent_name)}
                      disabled={running}
                    >
                      Run Again
                    </Button>
                  )}
                </Stack>
              </div>
            ))}
          </Stack>
          
          {runs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text as="p" tone="subdued">No agent runs found.</Text>
            </div>
          )}
        </Stack>
      </div>
    </Card>
  );
}
