/**
 * Real-Time Analytics Dashboard
 *
 * Task: DATA-022
 *
 * Comprehensive real-time analytics dashboard with live metrics, KPI tracking,
 * performance monitoring, and alert system.
 *
 * Features:
 * - Server-Sent Events (SSE) for real-time updates
 * - Live KPI tracking with trend indicators
 * - Performance monitoring integration
 * - Alert system for critical metrics
 * - Auto-refresh with connection quality indicator
 * - Multiple view modes (overview, detailed, alerts)
 */
import { useState, useEffect } from "react";
import { Card, Layout, Page, Text, Badge, Banner, SkeletonBodyText } from "@shopify/polaris";
import { useSSE } from "~/hooks/useSSE";
import { ConnectionIndicator } from "~/components/realtime/ConnectionIndicator";
import { LiveBadge } from "~/components/realtime/LiveBadge";
// ============================================================================
// Main Component
// ============================================================================
export function RealtimeAnalyticsDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [viewMode, setViewMode] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    // SSE connection for real-time updates
    const { status, lastMessage, connectionQuality, isConnected } = useSSE('/api/sse.updates', true);
    // Initial data fetch
    useEffect(() => {
        fetchMetrics();
    }, []);
    // Handle SSE messages
    useEffect(() => {
        if (lastMessage) {
            handleSSEMessage(lastMessage);
        }
    }, [lastMessage]);
    // Fetch metrics from API
    async function fetchMetrics() {
        try {
            const response = await fetch('/api/analytics/realtime-metrics');
            const data = await response.json();
            if (data.success) {
                setMetrics(data.metrics);
                setAlerts(data.alerts || []);
            }
            setIsLoading(false);
        }
        catch (error) {
            console.error('[Realtime Dashboard] Failed to fetch metrics:', error);
            setIsLoading(false);
        }
    }
    // Handle SSE message updates
    function handleSSEMessage(message) {
        switch (message.type) {
            case 'analytics-refresh':
                // Refresh metrics on analytics update
                fetchMetrics();
                break;
            case 'performance-alert':
                // Add new alert
                setAlerts(prev => [message.data, ...prev].slice(0, 10));
                break;
            case 'growth-engine-update':
                // Update growth engine metrics
                if (metrics) {
                    setMetrics({
                        ...metrics,
                        growthEngine: {
                            ...metrics.growthEngine,
                            ...message.data
                        }
                    });
                }
                break;
        }
    }
    if (isLoading) {
        return (<Page title="Real-Time Analytics">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={10}/>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>);
    }
    if (!metrics) {
        return (<Page title="Real-Time Analytics">
        <Banner tone="critical">
          Failed to load analytics data. Please refresh the page.
        </Banner>
      </Page>);
    }
    return (<Page title="Real-Time Analytics" titleMetadata={<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ConnectionIndicator status={status} quality={connectionQuality}/>
          {alerts.length > 0 && (<LiveBadge count={alerts.length} label="Alerts" showPulse={true}/>)}
        </div>}>
      <Layout>
        {/* Active Alerts Banner */}
        {alerts.length > 0 && (<Layout.Section>
            <Banner tone={alerts[0].type === 'critical' ? 'critical' : 'warning'} title={`${alerts.length} Active Alert${alerts.length > 1 ? 's' : ''}`} action={{ content: 'View All', onAction: () => setViewMode('alerts') }}>
              <p>{alerts[0].message}</p>
            </Banner>
          </Layout.Section>)}
        
        {/* View Mode Selector */}
        <Layout.Section>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => setViewMode('overview')} style={{
            padding: '8px 16px',
            background: viewMode === 'overview' ? '#008060' : '#f1f1f1',
            color: viewMode === 'overview' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }}>
              Overview
            </button>
            <button onClick={() => setViewMode('detailed')} style={{
            padding: '8px 16px',
            background: viewMode === 'detailed' ? '#008060' : '#f1f1f1',
            color: viewMode === 'detailed' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }}>
              Detailed
            </button>
            <button onClick={() => setViewMode('alerts')} style={{
            padding: '8px 16px',
            background: viewMode === 'alerts' ? '#008060' : '#f1f1f1',
            color: viewMode === 'alerts' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }}>
              Alerts ({alerts.length})
            </button>
          </div>
        </Layout.Section>
        
        {/* Content based on view mode */}
        {viewMode === 'overview' && (<OverviewView metrics={metrics}/>)}
        
        {viewMode === 'detailed' && (<DetailedView metrics={metrics}/>)}
        
        {viewMode === 'alerts' && (<AlertsView alerts={alerts}/>)}
        
        {/* Last Updated */}
        <Layout.Section>
          <Text as="p" variant="bodySm" tone="subdued">
            Last updated: {new Date(metrics.timestamp).toLocaleString()}
            {isConnected && ' • Live updates enabled'}
          </Text>
        </Layout.Section>
      </Layout>
    </Page>);
}
// ============================================================================
// View Components
// ============================================================================
function OverviewView({ metrics }) {
    return (<>
      {/* Growth Engine KPIs */}
      <Layout.Section>
        <Card>
          <div style={{ padding: '16px' }}>
            <Text as="h2" variant="headingMd">Growth Engine</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <MetricCard label="Active Actions" value={metrics.growthEngine.activeActions} trend="neutral"/>
              <MetricCard label="Pending Approvals" value={metrics.growthEngine.pendingApprovals} trend={metrics.growthEngine.pendingApprovals > 5 ? 'down' : 'neutral'}/>
              <MetricCard label="Completed Today" value={metrics.growthEngine.completedToday} trend="up"/>
              <MetricCard label="Avg ROI" value={`$${metrics.growthEngine.avgROI.toFixed(2)}`} trend={metrics.growthEngine.avgROI > 0 ? 'up' : 'down'}/>
              <MetricCard label="Success Rate" value={`${(metrics.growthEngine.successRate * 100).toFixed(1)}%`} trend={metrics.growthEngine.successRate > 0.8 ? 'up' : 'down'}/>
            </div>
          </div>
        </Card>
      </Layout.Section>

      {/* Performance Metrics */}
      <Layout.Section>
        <Card>
          <div style={{ padding: '16px' }}>
            <Text as="h2" variant="headingMd">System Performance</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <MetricCard label="Response Time (P95)" value={`${metrics.performance.responseTimeP95}ms`} trend={metrics.performance.responseTimeP95 < 3000 ? 'up' : 'down'}/>
              <MetricCard label="Error Rate" value={`${(metrics.performance.errorRate * 100).toFixed(2)}%`} trend={metrics.performance.errorRate < 0.005 ? 'up' : 'down'}/>
              <MetricCard label="Uptime" value={`${(metrics.performance.uptime * 100).toFixed(2)}%`} trend={metrics.performance.uptime > 0.999 ? 'up' : 'down'}/>
              <MetricCard label="Throughput" value={`${metrics.performance.throughput} req/s`} trend="neutral"/>
            </div>
          </div>
        </Card>
      </Layout.Section>

      {/* Business KPIs */}
      <Layout.Section>
        <Card>
          <div style={{ padding: '16px' }}>
            <Text as="h2" variant="headingMd">Business KPIs (24h)</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <MetricCard label="Revenue" value={`$${metrics.kpis.revenue24h.toFixed(2)}`} trend="up"/>
              <MetricCard label="Conversion Rate" value={`${(metrics.kpis.conversionRate * 100).toFixed(2)}%`} trend={metrics.kpis.conversionRate > 0.02 ? 'up' : 'down'}/>
              <MetricCard label="Avg Order Value" value={`$${metrics.kpis.avgOrderValue.toFixed(2)}`} trend="neutral"/>
              <MetricCard label="Sessions" value={metrics.kpis.sessions24h.toLocaleString()} trend="up"/>
            </div>
          </div>
        </Card>
      </Layout.Section>

      {/* System Health */}
      <Layout.Section>
        <Card>
          <div style={{ padding: '16px' }}>
            <Text as="h2" variant="headingMd">System Health</Text>
            <div style={{ marginTop: '16px' }}>
              <Badge tone={getHealthTone(metrics.health.status)}>
                {metrics.health.status.toUpperCase()}
              </Badge>
              <Text as="p" variant="bodyMd" tone="subdued" style={{ marginTop: '8px' }}>
                {metrics.health.activeAlerts} active alert{metrics.health.activeAlerts !== 1 ? 's' : ''}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Last check: {new Date(metrics.health.lastCheck).toLocaleString()}
              </Text>
            </div>
          </div>
        </Card>
      </Layout.Section>
    </>);
}
function DetailedView({ metrics }) {
    return (<Layout.Section>
      <Card>
        <div style={{ padding: '16px' }}>
          <Text as="h2" variant="headingMd">Detailed Metrics</Text>
          <div style={{ marginTop: '16px' }}>
            <pre style={{
            background: '#f6f6f7',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
        }}>
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </Layout.Section>);
}
function AlertsView({ alerts }) {
    if (alerts.length === 0) {
        return (<Layout.Section>
        <Card>
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Text as="p" variant="bodyMd" tone="subdued">
              No active alerts
            </Text>
          </div>
        </Card>
      </Layout.Section>);
    }
    return (<Layout.Section>
      {alerts.map(alert => (<Card key={alert.id}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <Badge tone={alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'warning' : 'info'}>
                  {alert.type.toUpperCase()}
                </Badge>
                <Text as="h3" variant="headingSm" style={{ marginTop: '8px' }}>
                  {alert.metric}
                </Text>
                <Text as="p" variant="bodyMd" style={{ marginTop: '4px' }}>
                  {alert.message}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued" style={{ marginTop: '8px' }}>
                  Value: {alert.value} | Threshold: {alert.threshold}
                </Text>
              </div>
              <Text as="p" variant="bodySm" tone="subdued">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </Text>
            </div>
          </div>
        </Card>))}
    </Layout.Section>);
}
function MetricCard({ label, value, trend }) {
    const getTrendColor = () => {
        switch (trend) {
            case 'up': return '#008060';
            case 'down': return '#d72c0d';
            default: return '#5c5f62';
        }
    };
    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return '↑';
            case 'down': return '↓';
            default: return '−';
        }
    };
    return (<div style={{
            padding: '12px',
            background: '#f6f6f7',
            borderRadius: '4px',
            border: '1px solid #e1e3e5'
        }}>
      <Text as="p" variant="bodySm" tone="subdued">
        {label}
      </Text>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
        <Text as="p" variant="headingLg">
          {value}
        </Text>
        <span style={{ color: getTrendColor(), fontSize: '18px', fontWeight: 'bold' }}>
          {getTrendIcon()}
        </span>
      </div>
    </div>);
}
// ============================================================================
// Helper Functions
// ============================================================================
function getHealthTone(status) {
    switch (status) {
        case 'healthy': return 'success';
        case 'degraded': return 'warning';
        case 'critical': return 'critical';
        default: return 'warning';
    }
}
//# sourceMappingURL=RealtimeAnalyticsDashboard.js.map