/**
 * Action Attribution Dashboard Component
 * 
 * ANALYTICS-002: Comprehensive action attribution and ROI measurement dashboard
 * Displays action performance, ROI tracking, and attribution analysis
 */

import { useState, useEffect } from 'react';
import type { ActionAttributionResult, AttributionSummary } from '~/services/analytics/action-attribution';

interface ActionAttributionDashboardProps {
  attributionData?: AttributionSummary[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

type ViewMode = 'overview' | 'roi-tracking' | 'attribution-analysis' | 'performance-metrics' | 'recommendations';

export function ActionAttributionDashboard({
  attributionData = [],
  loading = false,
  error,
  onRefresh
}: ActionAttributionDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '14d' | '28d'>('28d');
  const [sortBy, setSortBy] = useState<'revenue' | 'conversion' | 'roi'>('revenue');

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [onRefresh]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 'var(--occ-space-8)' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--occ-space-2)' 
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--occ-color-primary)',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Loading action attribution data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 'var(--occ-space-4)',
        border: '1px solid var(--occ-color-error)',
        borderRadius: 'var(--occ-radius-md)',
        backgroundColor: 'var(--occ-bg-error-subdued)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--occ-space-2)' }}>
          <span style={{ color: 'var(--occ-color-error)' }}>⚠️</span>
          <div>
            <h3 style={{ margin: 0, color: 'var(--occ-color-error)' }}>Error loading attribution data</h3>
            <p style={{ margin: 0, color: 'var(--occ-text-secondary)' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--occ-space-4)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--occ-space-2)' }}>
          <h2 style={{ margin: 0 }}>
            Action Attribution & ROI Dashboard
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--occ-space-2)' }}>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '14d' | '28d')}
              style={{
                padding: 'var(--occ-space-1) var(--occ-space-2)',
                border: '1px solid var(--occ-border-default)',
                borderRadius: 'var(--occ-radius-sm)',
                fontSize: 'var(--occ-font-size-sm)'
              }}
            >
              <option value="7d">7 Days</option>
              <option value="14d">14 Days</option>
              <option value="28d">28 Days</option>
            </select>
            <button
              onClick={onRefresh}
              style={{
                padding: 'var(--occ-space-1) var(--occ-space-2)',
                border: '1px solid var(--occ-border-default)',
                borderRadius: 'var(--occ-radius-sm)',
                backgroundColor: 'var(--occ-bg-surface)',
                cursor: 'pointer',
                fontSize: 'var(--occ-font-size-sm)'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <p style={{ 
          margin: 0, 
          color: 'var(--occ-text-secondary)',
          fontSize: 'var(--occ-font-size-sm)'
        }}>
          Track action performance and ROI across all attribution windows
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--occ-space-2)', 
        marginBottom: 'var(--occ-space-4)',
        borderBottom: '1px solid var(--occ-border-default)'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'roi-tracking', label: 'ROI Tracking' },
          { key: 'attribution-analysis', label: 'Attribution Analysis' },
          { key: 'performance-metrics', label: 'Performance Metrics' },
          { key: 'recommendations', label: 'Recommendations' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            style={{
              padding: 'var(--occ-space-2) var(--occ-space-3)',
              border: 'none',
              background: viewMode === key ? 'var(--occ-bg-primary)' : 'transparent',
              color: viewMode === key ? 'var(--occ-text-on-primary)' : 'var(--occ-text-primary)',
              cursor: 'pointer',
              borderRadius: 'var(--occ-radius-sm) var(--occ-radius-sm) 0 0',
              fontSize: 'var(--occ-font-size-sm)',
              fontWeight: 'var(--occ-font-weight-medium)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'overview' && <OverviewView attributionData={attributionData} timeframe={selectedTimeframe} />}
      {viewMode === 'roi-tracking' && <ROITrackingView attributionData={attributionData} timeframe={selectedTimeframe} />}
      {viewMode === 'attribution-analysis' && <AttributionAnalysisView attributionData={attributionData} timeframe={selectedTimeframe} />}
      {viewMode === 'performance-metrics' && <PerformanceMetricsView attributionData={attributionData} timeframe={selectedTimeframe} />}
      {viewMode === 'recommendations' && <RecommendationsView attributionData={attributionData} timeframe={selectedTimeframe} />}
    </div>
  );
}

function OverviewView({ 
  attributionData, 
  timeframe 
}: { 
  attributionData: AttributionSummary[]; 
  timeframe: string; 
}) {
  const getTimeframeData = (data: AttributionSummary) => {
    switch (timeframe) {
      case '7d': return data.roi7d;
      case '14d': return data.roi14d;
      case '28d': return data.roi28d;
      default: return data.roi28d;
    }
  };

  const totalRevenue = attributionData.reduce((sum, data) => {
    const timeframeData = getTimeframeData(data);
    return sum + timeframeData.revenue;
  }, 0);

  const totalSessions = attributionData.reduce((sum, data) => {
    const timeframeData = getTimeframeData(data);
    return sum + timeframeData.sessions;
  }, 0);

  const totalConversions = attributionData.reduce((sum, data) => {
    const timeframeData = getTimeframeData(data);
    return sum + timeframeData.purchases;
  }, 0);

  const averageConversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;

  return (
    <div>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--occ-space-3)',
        marginBottom: 'var(--occ-space-4)'
      }}>
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          subtitle={`${timeframe} attribution window`}
          color="var(--occ-color-success)"
        />
        <MetricCard
          title="Total Sessions"
          value={totalSessions.toLocaleString()}
          subtitle="Attributed sessions"
          color="var(--occ-color-info)"
        />
        <MetricCard
          title="Total Conversions"
          value={totalConversions.toLocaleString()}
          subtitle="Attributed purchases"
          color="var(--occ-color-warning)"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${averageConversionRate.toFixed(1)}%`}
          subtitle="Average across all actions"
          color="var(--occ-color-primary)"
        />
      </div>

      {/* Top Performing Actions */}
      <div>
        <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Top Performing Actions</h3>
        <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
          {attributionData
            .sort((a, b) => {
              const aData = getTimeframeData(a);
              const bData = getTimeframeData(b);
              return bData.revenue - aData.revenue;
            })
            .slice(0, 5)
            .map((data, index) => {
              const timeframeData = getTimeframeData(data);
              return (
                <div key={data.roi7d.actionKey} style={{
                  padding: 'var(--occ-space-3)',
                  border: '1px solid var(--occ-border-default)',
                  borderRadius: 'var(--occ-radius-md)',
                  backgroundColor: 'var(--occ-bg-surface)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                        #{index + 1} {timeframeData.actionKey}
                      </div>
                      <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                        {timeframeData.sessions} sessions • {timeframeData.purchases} conversions
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: 'var(--occ-font-size-lg)',
                        fontWeight: 'var(--occ-font-weight-semibold)',
                        color: 'var(--occ-color-success)'
                      }}>
                        ${timeframeData.revenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                        {timeframeData.conversionRate.toFixed(1)}% CVR
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function ROITrackingView({ 
  attributionData, 
  timeframe 
}: { 
  attributionData: AttributionSummary[]; 
  timeframe: string; 
}) {
  const getTimeframeData = (data: AttributionSummary) => {
    switch (timeframe) {
      case '7d': return data.roi7d;
      case '14d': return data.roi14d;
      case '28d': return data.roi28d;
      default: return data.roi28d;
    }
  };

  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>ROI Tracking by Action</h3>
      
      <div style={{ display: 'grid', gap: 'var(--occ-space-3)' }}>
        {attributionData.map((data) => {
          const timeframeData = getTimeframeData(data);
          const roi7d = data.roi7d;
          const roi14d = data.roi14d;
          const roi28d = data.roi28d;
          
          return (
            <div key={timeframeData.actionKey} style={{
              padding: 'var(--occ-space-4)',
              border: '1px solid var(--occ-border-default)',
              borderRadius: 'var(--occ-radius-md)',
              backgroundColor: 'var(--occ-bg-surface)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--occ-space-3)' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-1)' }}>
                    {timeframeData.actionKey}
                  </h4>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    Action attribution tracking
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 'var(--occ-font-size-2xl)',
                    fontWeight: 'var(--occ-font-weight-bold)',
                    color: 'var(--occ-color-success)'
                  }}>
                    ${timeframeData.revenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    {timeframe} revenue
                  </div>
                </div>
              </div>

              {/* ROI Progression */}
              <div style={{ marginBottom: 'var(--occ-space-3)' }}>
                <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)', marginBottom: 'var(--occ-space-2)' }}>
                  ROI Progression
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--occ-space-2)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      ${roi7d.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      7 days
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      ${roi14d.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      14 days
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      ${roi28d.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      28 days
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--occ-space-2)' }}>
                <MetricCard title="Sessions" value={timeframeData.sessions.toLocaleString()} />
                <MetricCard title="Conversions" value={timeframeData.purchases.toLocaleString()} />
                <MetricCard title="CVR" value={`${timeframeData.conversionRate.toFixed(1)}%`} />
                <MetricCard title="AOV" value={`$${timeframeData.averageOrderValue.toFixed(0)}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttributionAnalysisView({ 
  attributionData, 
  timeframe 
}: { 
  attributionData: AttributionSummary[]; 
  timeframe: string; 
}) {
  const getTimeframeData = (data: AttributionSummary) => {
    switch (timeframe) {
      case '7d': return data.roi7d;
      case '14d': return data.roi14d;
      case '28d': return data.roi28d;
      default: return data.roi28d;
    }
  };

  // Calculate attribution efficiency
  const calculateAttributionEfficiency = (data: AttributionSummary) => {
    const roi7d = data.roi7d;
    const roi14d = data.roi14d;
    const roi28d = data.roi28d;
    
    const efficiency7d = roi7d.sessions > 0 ? (roi7d.revenue / roi7d.sessions) : 0;
    const efficiency14d = roi14d.sessions > 0 ? (roi14d.revenue / roi14d.sessions) : 0;
    const efficiency28d = roi28d.sessions > 0 ? (roi28d.revenue / roi28d.sessions) : 0;
    
    return { efficiency7d, efficiency14d, efficiency28d };
  };

  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Attribution Analysis</h3>
      
      <div style={{ display: 'grid', gap: 'var(--occ-space-3)' }}>
        {attributionData.map((data) => {
          const timeframeData = getTimeframeData(data);
          const efficiency = calculateAttributionEfficiency(data);
          
          return (
            <div key={timeframeData.actionKey} style={{
              padding: 'var(--occ-space-4)',
              border: '1px solid var(--occ-border-default)',
              borderRadius: 'var(--occ-radius-md)',
              backgroundColor: 'var(--occ-bg-surface)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--occ-space-3)' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-1)' }}>
                    {timeframeData.actionKey}
                  </h4>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    Attribution efficiency analysis
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 'var(--occ-font-size-lg)',
                    fontWeight: 'var(--occ-font-weight-semibold)',
                    color: 'var(--occ-color-primary)'
                  }}>
                    ${timeframeData.revenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    Total revenue
                  </div>
                </div>
              </div>

              {/* Attribution Efficiency */}
              <div style={{ marginBottom: 'var(--occ-space-3)' }}>
                <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)', marginBottom: 'var(--occ-space-2)' }}>
                  Attribution Efficiency (Revenue per Session)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--occ-space-2)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      ${efficiency.efficiency7d.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      7 days
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      ${efficiency.efficiency14d.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      14 days
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      ${efficiency.efficiency28d.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      28 days
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div>
                <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)', marginBottom: 'var(--occ-space-2)' }}>
                  Conversion Funnel
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--occ-space-2)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      {timeframeData.sessions.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      Sessions
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      {timeframeData.pageviews.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      Pageviews
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      {timeframeData.addToCarts.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      Add to Cart
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      {timeframeData.purchases.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      Purchases
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerformanceMetricsView({ 
  attributionData, 
  timeframe 
}: { 
  attributionData: AttributionSummary[]; 
  timeframe: string; 
}) {
  const getTimeframeData = (data: AttributionSummary) => {
    switch (timeframe) {
      case '7d': return data.roi7d;
      case '14d': return data.roi14d;
      case '28d': return data.roi28d;
      default: return data.roi28d;
    }
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    const totalRevenue = attributionData.reduce((sum, data) => {
      const timeframeData = getTimeframeData(data);
      return sum + timeframeData.revenue;
    }, 0);

    const totalSessions = attributionData.reduce((sum, data) => {
      const timeframeData = getTimeframeData(data);
      return sum + timeframeData.sessions;
    }, 0);

    const totalConversions = attributionData.reduce((sum, data) => {
      const timeframeData = getTimeframeData(data);
      return sum + timeframeData.purchases;
    }, 0);

    const averageConversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;
    const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
    const revenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

    return {
      totalRevenue,
      totalSessions,
      totalConversions,
      averageConversionRate,
      averageOrderValue,
      revenuePerSession
    };
  };

  const metrics = calculatePerformanceMetrics();

  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Performance Metrics</h3>
      
      {/* Overall Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--occ-space-3)',
        marginBottom: 'var(--occ-space-4)'
      }}>
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          subtitle={`${timeframe} attribution window`}
          color="var(--occ-color-success)"
        />
        <MetricCard
          title="Total Sessions"
          value={metrics.totalSessions.toLocaleString()}
          subtitle="Attributed sessions"
          color="var(--occ-color-info)"
        />
        <MetricCard
          title="Total Conversions"
          value={metrics.totalConversions.toLocaleString()}
          subtitle="Attributed purchases"
          color="var(--occ-color-warning)"
        />
        <MetricCard
          title="Average CVR"
          value={`${metrics.averageConversionRate.toFixed(1)}%`}
          subtitle="Conversion rate"
          color="var(--occ-color-primary)"
        />
        <MetricCard
          title="Average AOV"
          value={`$${metrics.averageOrderValue.toFixed(0)}`}
          subtitle="Order value"
          color="var(--occ-color-secondary)"
        />
        <MetricCard
          title="Revenue/Session"
          value={`$${metrics.revenuePerSession.toFixed(2)}`}
          subtitle="Per session"
          color="var(--occ-color-accent)"
        />
      </div>

      {/* Action Performance Comparison */}
      <div>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Action Performance Comparison</h4>
        <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
          {attributionData
            .sort((a, b) => {
              const aData = getTimeframeData(a);
              const bData = getTimeframeData(b);
              return bData.revenue - aData.revenue;
            })
            .map((data, index) => {
              const timeframeData = getTimeframeData(data);
              const performanceScore = (timeframeData.conversionRate * timeframeData.averageOrderValue) / 100;
              
              return (
                <div key={timeframeData.actionKey} style={{
                  padding: 'var(--occ-space-3)',
                  border: '1px solid var(--occ-border-default)',
                  borderRadius: 'var(--occ-radius-md)',
                  backgroundColor: 'var(--occ-bg-surface)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                        #{index + 1} {timeframeData.actionKey}
                      </div>
                      <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                        Performance Score: {performanceScore.toFixed(1)}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--occ-space-3)', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)' }}>
                          ${timeframeData.revenue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                          Revenue
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)' }}>
                          {timeframeData.sessions.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                          Sessions
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)' }}>
                          {timeframeData.conversionRate.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                          CVR
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)' }}>
                          ${timeframeData.averageOrderValue.toFixed(0)}
                        </div>
                        <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                          AOV
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function RecommendationsView({ 
  attributionData, 
  timeframe 
}: { 
  attributionData: AttributionSummary[]; 
  timeframe: string; 
}) {
  const getTimeframeData = (data: AttributionSummary) => {
    switch (timeframe) {
      case '7d': return data.roi7d;
      case '14d': return data.roi14d;
      case '28d': return data.roi28d;
      default: return data.roi28d;
    }
  };

  // Generate recommendations based on performance
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Find top and bottom performers
    const sortedData = attributionData.sort((a, b) => {
      const aData = getTimeframeData(a);
      const bData = getTimeframeData(b);
      return bData.revenue - aData.revenue;
    });

    if (sortedData.length > 0) {
      const topPerformer = getTimeframeData(sortedData[0]);
      const bottomPerformer = getTimeframeData(sortedData[sortedData.length - 1]);
      
      recommendations.push({
        type: 'success',
        title: 'Scale Top Performer',
        description: `Scale up "${topPerformer.actionKey}" - generating $${topPerformer.revenue.toLocaleString()} with ${topPerformer.conversionRate.toFixed(1)}% CVR`,
        action: 'Increase budget and resources for this action'
      });

      if (sortedData.length > 1) {
        recommendations.push({
          type: 'warning',
          title: 'Optimize Low Performer',
          description: `Optimize "${bottomPerformer.actionKey}" - only generating $${bottomPerformer.revenue.toLocaleString()} with ${bottomPerformer.conversionRate.toFixed(1)}% CVR`,
          action: 'Review targeting, messaging, or consider pausing'
        });
      }
    }

    // Conversion rate recommendations
    const lowCVR = attributionData.filter(data => {
      const timeframeData = getTimeframeData(data);
      return timeframeData.conversionRate < 2.0;
    });

    if (lowCVR.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Improve Conversion Rates',
        description: `${lowCVR.length} actions have conversion rates below 2%`,
        action: 'Review landing pages, checkout flow, and user experience'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Action Recommendations</h3>
      
      <div style={{ display: 'grid', gap: 'var(--occ-space-3)' }}>
        {recommendations.map((rec, index) => (
          <div key={index} style={{
            padding: 'var(--occ-space-4)',
            border: `1px solid ${
              rec.type === 'success' ? 'var(--occ-border-success)' :
              rec.type === 'warning' ? 'var(--occ-border-warning)' :
              'var(--occ-border-info)'
            }`,
            borderRadius: 'var(--occ-radius-md)',
            backgroundColor: `${
              rec.type === 'success' ? 'var(--occ-bg-success-subdued)' :
              rec.type === 'warning' ? 'var(--occ-bg-warning-subdued)' :
              'var(--occ-bg-info-subdued)'
            }`
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--occ-space-2)' }}>
              <div style={{
                fontSize: 'var(--occ-font-size-lg)',
                color: `${
                  rec.type === 'success' ? 'var(--occ-color-success)' :
                  rec.type === 'warning' ? 'var(--occ-color-warning)' :
                  'var(--occ-color-info)'
                }`
              }}>
                {rec.type === 'success' ? '🚀' : rec.type === 'warning' ? '⚠️' : '💡'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-1)' }}>
                  {rec.title}
                </h4>
                <p style={{ margin: 0, marginBottom: 'var(--occ-space-2)', color: 'var(--occ-text-secondary)' }}>
                  {rec.description}
                </p>
                <div style={{
                  padding: 'var(--occ-space-2)',
                  backgroundColor: 'var(--occ-bg-surface)',
                  borderRadius: 'var(--occ-radius-sm)',
                  fontSize: 'var(--occ-font-size-sm)',
                  fontWeight: 'var(--occ-font-weight-medium)'
                }}>
                  💡 {rec.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  color?: string; 
}) {
  return (
    <div style={{
      padding: 'var(--occ-space-3)',
      border: '1px solid var(--occ-border-default)',
      borderRadius: 'var(--occ-radius-md)',
      backgroundColor: 'var(--occ-bg-surface)',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: 'var(--occ-font-size-sm)',
        color: 'var(--occ-text-secondary)',
        marginBottom: 'var(--occ-space-1)'
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: 'var(--occ-font-size-lg)',
        fontWeight: 'var(--occ-font-weight-semibold)',
        color: color || 'var(--occ-text-primary)',
        marginBottom: subtitle ? 'var(--occ-space-1)' : '0'
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: 'var(--occ-font-size-xs)',
          color: 'var(--occ-text-secondary)'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default ActionAttributionDashboard;
