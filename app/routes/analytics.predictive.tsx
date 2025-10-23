/**
 * Predictive Analytics Dashboard Route
 * 
 * ANALYTICS-003: Dashboard for predictive analytics insights
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';
import { generatePredictiveInsights } from '~/services/analytics/predictive-analytics';
import { logDecision } from '~/services/decisions.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const insights = await generatePredictiveInsights();
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'predictive_dashboard_loaded',
      rationale: 'Predictive analytics dashboard loaded successfully',
      evidenceUrl: 'app/routes/analytics.predictive.tsx'
    });
    
    return json({ insights, error: null });
  } catch (error) {
    console.error('Predictive dashboard error:', error);
    return json({
      insights: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export default function PredictiveAnalyticsDashboard() {
  const { insights, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [revalidator]);
  
  if (error) {
    return (
      <div style={{ padding: 'var(--occ-space-4)' }}>
        <h1>Predictive Analytics</h1>
        <div style={{ 
          padding: 'var(--occ-space-3)', 
          background: 'var(--occ-color-error-bg)',
          color: 'var(--occ-color-error)',
          borderRadius: 'var(--occ-radius-md)'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }
  
  if (!insights) {
    return (
      <div style={{ padding: 'var(--occ-space-4)' }}>
        <h1>Predictive Analytics</h1>
        <p>Loading insights...</p>
      </div>
    );
  }
  
  return (
    <div style={{ 
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
          Predictive Analytics
        </h1>
        <p style={{ 
          margin: 0,
          color: 'var(--occ-color-text-secondary)',
          fontSize: 'var(--occ-font-size-sm)'
        }}>
          AI-powered predictions for customer behavior and sales forecasting
        </p>
      </div>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--occ-space-3)',
        marginBottom: 'var(--occ-space-4)'
      }}>
        <SummaryCard
          title="Total Customers"
          value={insights.customerBehavior.totalCustomers}
          subtitle="Analyzed"
        />
        <SummaryCard
          title="At Risk"
          value={insights.customerBehavior.atRiskCount}
          subtitle="Customers"
          variant="warning"
        />
        <SummaryCard
          title="High Value"
          value={insights.customerBehavior.highValueCount}
          subtitle="Customers"
          variant="success"
        />
        <SummaryCard
          title="Recommendations"
          value={insights.actionRecommendations.length}
          subtitle="Actions"
        />
      </div>
      
      {/* Sales Forecasts */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h2 style={{ marginBottom: 'var(--occ-space-3)' }}>Sales Forecasts</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--occ-space-3)'
        }}>
          <ForecastCard title="Next 7 Days" forecast={insights.salesForecasts.next7Days} />
          <ForecastCard title="Next 14 Days" forecast={insights.salesForecasts.next14Days} />
          <ForecastCard title="Next 30 Days" forecast={insights.salesForecasts.next30Days} />
        </div>
      </div>
      
      {/* Action Recommendations */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h2 style={{ marginBottom: 'var(--occ-space-3)' }}>Recommended Actions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--occ-space-2)' }}>
          {insights.actionRecommendations.map((rec, idx) => (
            <ActionCard key={idx} recommendation={rec} />
          ))}
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
          <div><strong>Generated:</strong> {new Date(insights.generatedAt).toLocaleString()}</div>
          <div><strong>Auto-refresh:</strong> Every 5 minutes</div>
          <div><strong>Task:</strong> ANALYTICS-003</div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  variant = 'default' 
}: { 
  title: string; 
  value: number; 
  subtitle: string;
  variant?: 'default' | 'success' | 'warning';
}) {
  const colors = {
    default: 'var(--occ-color-primary)',
    success: 'var(--occ-color-success)',
    warning: 'var(--occ-color-warning)'
  };
  
  return (
    <div style={{
      padding: 'var(--occ-space-3)',
      background: 'var(--occ-color-bg-secondary)',
      borderRadius: 'var(--occ-radius-md)',
      borderLeft: `4px solid ${colors[variant]}`
    }}>
      <div style={{ 
        fontSize: 'var(--occ-font-size-sm)',
        color: 'var(--occ-color-text-secondary)',
        marginBottom: 'var(--occ-space-1)'
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: 'var(--occ-font-size-2xl)',
        fontWeight: 'var(--occ-font-weight-bold)',
        color: colors[variant]
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: 'var(--occ-font-size-xs)',
        color: 'var(--occ-color-text-secondary)'
      }}>
        {subtitle}
      </div>
    </div>
  );
}

function ForecastCard({ title, forecast }: { title: string; forecast: any }) {
  return (
    <div style={{
      padding: 'var(--occ-space-3)',
      background: 'var(--occ-color-bg-secondary)',
      borderRadius: 'var(--occ-radius-md)'
    }}>
      <h3 style={{ marginBottom: 'var(--occ-space-2)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--occ-space-2)' }}>
        <MetricRow 
          label="Revenue" 
          value={`$${forecast.predictions.revenue.currentValue.toFixed(2)}`}
          trend={forecast.predictions.revenue.trend}
        />
        <MetricRow 
          label="Conversions" 
          value={forecast.predictions.conversions.currentValue.toFixed(0)}
          trend={forecast.predictions.conversions.trend}
        />
        <MetricRow 
          label="Confidence" 
          value={`${(forecast.overallConfidence * 100).toFixed(0)}%`}
          trend="stable"
        />
      </div>
    </div>
  );
}

function MetricRow({ label, value, trend }: { label: string; value: string; trend: string }) {
  const trendColors = {
    up: 'var(--occ-color-success)',
    down: 'var(--occ-color-error)',
    stable: 'var(--occ-color-text-secondary)'
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 'var(--occ-font-size-sm)' }}>{label}</span>
      <span style={{ 
        fontWeight: 'var(--occ-font-weight-semibold)',
        color: trendColors[trend as keyof typeof trendColors]
      }}>
        {value}
      </span>
    </div>
  );
}

function ActionCard({ recommendation }: { recommendation: any }) {
  const priorityColors = {
    high: 'var(--occ-color-error)',
    medium: 'var(--occ-color-warning)',
    low: 'var(--occ-color-info)'
  };
  
  return (
    <div style={{
      padding: 'var(--occ-space-3)',
      background: 'var(--occ-color-bg-secondary)',
      borderRadius: 'var(--occ-radius-md)',
      borderLeft: `4px solid ${priorityColors[recommendation.priority]}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: 'var(--occ-font-size-xs)',
            color: priorityColors[recommendation.priority],
            fontWeight: 'var(--occ-font-weight-semibold)',
            textTransform: 'uppercase',
            marginBottom: 'var(--occ-space-1)'
          }}>
            {recommendation.priority} Priority • {recommendation.category.replace('_', ' ')}
          </div>
          <div style={{ marginBottom: 'var(--occ-space-2)' }}>
            {recommendation.action}
          </div>
          <div style={{ 
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-color-text-secondary)'
          }}>
            Expected Impact: ${recommendation.expectedImpact.toFixed(0)} • 
            Confidence: {(recommendation.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

