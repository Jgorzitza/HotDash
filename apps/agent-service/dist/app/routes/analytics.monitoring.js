/**
 * Production Analytics Monitoring Dashboard
 *
 * ANALYTICS-004: Real-time monitoring dashboard
 */
import { useLoaderData, useRevalidator } from 'react-router';
import { useEffect } from 'react';
import { ProductionMonitoringService } from '~/services/analytics/production-monitoring';
import { logDecision } from '~/services/decisions.server';
export async function loader({ request }) {
    try {
        const service = new ProductionMonitoringService();
        const report = await service.generateHealthReport();
        await logDecision({
            scope: 'build',
            actor: 'analytics',
            action: 'monitoring_dashboard_loaded',
            rationale: 'Production monitoring dashboard loaded',
            evidenceUrl: 'app/routes/analytics.monitoring.tsx'
        });
        return Response.json({ report, error: null });
    }
    catch (error) {
        console.error('Monitoring dashboard error:', error);
        return Response.json({
            report: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
export default function ProductionMonitoringDashboard() {
    const { report, error } = useLoaderData();
    const revalidator = useRevalidator();
    // Auto-refresh every 1 minute
    useEffect(() => {
        const interval = setInterval(() => {
            revalidator.revalidate();
        }, 60000);
        return () => clearInterval(interval);
    }, [revalidator]);
    if (error) {
        return (<div style={{ padding: 'var(--occ-space-4)' }}>
        <h1>Production Monitoring</h1>
        <div style={{
                padding: 'var(--occ-space-3)',
                background: 'var(--occ-color-error-bg)',
                color: 'var(--occ-color-error)',
                borderRadius: 'var(--occ-radius-md)'
            }}>
          Error: {error}
        </div>
      </div>);
    }
    if (!report) {
        return (<div style={{ padding: 'var(--occ-space-4)' }}>
        <h1>Production Monitoring</h1>
        <p>Loading...</p>
      </div>);
    }
    return (<div style={{
            padding: 'var(--occ-space-4)',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h1 style={{
            margin: 0,
            marginBottom: 'var(--occ-space-2)',
            fontSize: 'var(--occ-font-size-2xl)',
            fontWeight: 'var(--occ-font-weight-bold)'
        }}>
          Production Analytics Monitoring
        </h1>
        <p style={{
            margin: 0,
            color: 'var(--occ-color-text-secondary)',
            fontSize: 'var(--occ-font-size-sm)'
        }}>
          Real-time monitoring, anomaly detection, and conversion funnel tracking
        </p>
      </div>
      
      {/* Overall Health */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <HealthCard status={report.overall.status} score={report.overall.score}/>
      </div>
      
      {/* Metrics Grid */}
      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--occ-space-3)',
            marginBottom: 'var(--occ-space-4)'
        }}>
        <MetricCard title="Conversion Rate" value={`${report.metrics.analytics.conversionRate.toFixed(2)}%`} status={report.metrics.analytics.conversionRate >= 2 ? 'good' : 'warning'}/>
        <MetricCard title="Revenue" value={`$${report.metrics.analytics.revenue.toFixed(0)}`} status="good"/>
        <MetricCard title="Response Time" value={`${report.metrics.performance.avgResponseTime.toFixed(0)}ms`} status={report.metrics.performance.avgResponseTime < 500 ? 'good' : 'warning'}/>
        <MetricCard title="Error Rate" value={`${report.metrics.performance.errorRate.toFixed(2)}%`} status={report.metrics.performance.errorRate < 1 ? 'good' : 'critical'}/>
      </div>
      
      {/* Conversion Funnel */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h2 style={{ marginBottom: 'var(--occ-space-3)' }}>Conversion Funnel</h2>
        <FunnelVisualization funnel={report.metrics.funnel}/>
      </div>
      
      {/* Anomalies */}
      {report.anomalies.anomalies.length > 0 && (<div style={{ marginBottom: 'var(--occ-space-4)' }}>
          <h2 style={{ marginBottom: 'var(--occ-space-3)' }}>
            Anomalies Detected ({report.anomalies.anomalies.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--occ-space-2)' }}>
            {report.anomalies.anomalies.slice(0, 5).map((anomaly, idx) => (<AnomalyCard key={idx} anomaly={anomaly}/>))}
          </div>
        </div>)}
      
      {/* Recommendations */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h2 style={{ marginBottom: 'var(--occ-space-3)' }}>Recommendations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--occ-space-2)' }}>
          {report.recommendations.map((rec, idx) => (<RecommendationCard key={idx} recommendation={rec}/>))}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
            marginTop: 'var(--occ-space-4)',
            padding: 'var(--occ-space-3)',
            background: 'var(--occ-color-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)',
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-color-text-secondary)'
        }}>
        <div style={{ display: 'flex', gap: 'var(--occ-space-4)', flexWrap: 'wrap' }}>
          <div><strong>Last Updated:</strong> {new Date(report.overall.timestamp).toLocaleString()}</div>
          <div><strong>Auto-refresh:</strong> Every 1 minute</div>
          <div><strong>Task:</strong> ANALYTICS-004</div>
        </div>
      </div>
    </div>);
}
function HealthCard({ status, score }) {
    const colors = {
        healthy: 'var(--occ-color-success)',
        degraded: 'var(--occ-color-warning)',
        critical: 'var(--occ-color-error)'
    };
    return (<div style={{
            padding: 'var(--occ-space-4)',
            background: 'var(--occ-color-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)',
            borderLeft: `6px solid ${colors[status]}`
        }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-color-text-secondary)',
            marginBottom: 'var(--occ-space-1)'
        }}>
            Overall Health
          </div>
          <div style={{
            fontSize: 'var(--occ-font-size-xl)',
            fontWeight: 'var(--occ-font-weight-bold)',
            color: colors[status],
            textTransform: 'capitalize'
        }}>
            {status}
          </div>
        </div>
        <div style={{
            fontSize: 'var(--occ-font-size-3xl)',
            fontWeight: 'var(--occ-font-weight-bold)',
            color: colors[status]
        }}>
          {score}
        </div>
      </div>
    </div>);
}
function MetricCard({ title, value, status }) {
    const colors = {
        good: 'var(--occ-color-success)',
        warning: 'var(--occ-color-warning)',
        critical: 'var(--occ-color-error)'
    };
    return (<div style={{
            padding: 'var(--occ-space-3)',
            background: 'var(--occ-color-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)',
            borderLeft: `4px solid ${colors[status]}`
        }}>
      <div style={{
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-color-text-secondary)',
            marginBottom: 'var(--occ-space-1)'
        }}>
        {title}
      </div>
      <div style={{
            fontSize: 'var(--occ-font-size-xl)',
            fontWeight: 'var(--occ-font-weight-bold)',
            color: colors[status]
        }}>
        {value}
      </div>
    </div>);
}
function FunnelVisualization({ funnel }) {
    const stages = [
        { name: 'Landing', value: funnel.landingPageViews },
        { name: 'Product', value: funnel.productViews },
        { name: 'Cart', value: funnel.addToCarts },
        { name: 'Checkout', value: funnel.checkouts },
        { name: 'Purchase', value: funnel.purchases }
    ];
    return (<div style={{
            padding: 'var(--occ-space-3)',
            background: 'var(--occ-color-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)'
        }}>
      {stages.map((stage, idx) => (<div key={idx} style={{ marginBottom: idx < stages.length - 1 ? 'var(--occ-space-2)' : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--occ-space-1)' }}>
            <span style={{ fontSize: 'var(--occ-font-size-sm)' }}>{stage.name}</span>
            <span style={{ fontWeight: 'var(--occ-font-weight-semibold)' }}>{stage.value}</span>
          </div>
          <div style={{
                height: '8px',
                background: 'var(--occ-color-bg-tertiary)',
                borderRadius: 'var(--occ-radius-sm)',
                overflow: 'hidden'
            }}>
            <div style={{
                height: '100%',
                width: `${(stage.value / stages[0].value) * 100}%`,
                background: 'var(--occ-color-primary)',
                transition: 'width 0.3s ease'
            }}/>
          </div>
        </div>))}
    </div>);
}
function AnomalyCard({ anomaly }) {
    const severityColors = {
        critical: 'var(--occ-color-error)',
        moderate: 'var(--occ-color-warning)',
        low: 'var(--occ-color-info)'
    };
    return (<div style={{
            padding: 'var(--occ-space-3)',
            background: 'var(--occ-color-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)',
            borderLeft: `4px solid ${severityColors[anomaly.significance]}`
        }}>
      <div style={{
            fontSize: 'var(--occ-font-size-xs)',
            color: severityColors[anomaly.significance],
            fontWeight: 'var(--occ-font-weight-semibold)',
            textTransform: 'uppercase',
            marginBottom: 'var(--occ-space-1)'
        }}>
        {anomaly.significance} • {anomaly.type}
      </div>
      <div style={{ marginBottom: 'var(--occ-space-1)' }}>
        {anomaly.metric}: {anomaly.currentValue} (expected: {anomaly.expectedValue})
      </div>
      <div style={{
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-color-text-secondary)'
        }}>
        {anomaly.recommendation}
      </div>
    </div>);
}
function RecommendationCard({ recommendation }) {
    const priorityColors = {
        high: 'var(--occ-color-error)',
        medium: 'var(--occ-color-warning)',
        low: 'var(--occ-color-info)'
    };
    return (<div style={{
            padding: 'var(--occ-space-3)',
            background: 'var(--occ-color-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)',
            borderLeft: `4px solid ${priorityColors[recommendation.priority]}`
        }}>
      <div style={{
            fontSize: 'var(--occ-font-size-xs)',
            color: priorityColors[recommendation.priority],
            fontWeight: 'var(--occ-font-weight-semibold)',
            textTransform: 'uppercase',
            marginBottom: 'var(--occ-space-1)'
        }}>
        {recommendation.priority} Priority • {recommendation.category}
      </div>
      <div style={{ marginBottom: 'var(--occ-space-1)' }}>
        {recommendation.action}
      </div>
      <div style={{
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-color-text-secondary)'
        }}>
        Impact: {recommendation.impact}
      </div>
    </div>);
}
//# sourceMappingURL=analytics.monitoring.js.map