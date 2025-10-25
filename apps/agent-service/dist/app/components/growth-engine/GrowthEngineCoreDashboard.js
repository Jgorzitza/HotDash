/**
 * Growth Engine Core Dashboard
 *
 * ENG-026: Main dashboard component using advanced infrastructure
 * Provides comprehensive Growth Engine management with optimized performance
 */
import React, { useState, useEffect, useCallback } from 'react';
import { GrowthEngineRouter, RouteGuard, PerformanceMonitor, RouteNavigation, useGrowthEngineRoute } from './GrowthEngineRouter';
import { growthEngineCacheManager, growthEngineStateOptimizer, growthEnginePerformanceMonitor } from '~/services/growth-engine/performance-optimizer';
export function GrowthEngineCoreDashboard({ userPermissions, currentPhase, shopDomain, operatorEmail }) {
    const [metrics, setMetrics] = useState({
        totalActions: 0,
        activeActions: 0,
        completedActions: 0,
        blockedActions: 0,
        averageROI: 0,
        totalRevenue: 0,
        phaseProgress: 0,
        performanceScore: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
    // Load dashboard metrics
    const loadMetrics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Check cache first
            const cacheKey = `dashboard_metrics_${shopDomain}_${currentPhase}`;
            const cached = growthEngineCacheManager.get(cacheKey);
            if (cached) {
                setMetrics(cached);
                setIsLoading(false);
                return;
            }
            // Load fresh data
            const freshMetrics = await fetchDashboardMetrics(shopDomain, currentPhase);
            setMetrics(freshMetrics);
            // Cache the results
            growthEngineCacheManager.set(cacheKey, freshMetrics, 'medium');
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics';
            setError(errorMessage);
            console.error('Dashboard metrics error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [shopDomain, currentPhase]);
    // Load metrics on mount and phase change
    useEffect(() => {
        loadMetrics();
    }, [loadMetrics]);
    // Performance monitoring
    useEffect(() => {
        const recordPerformance = () => {
            growthEnginePerformanceMonitor.recordMetrics({
                route: 'dashboard',
                loadTime: performance.now(),
                memoryUsage: typeof window !== 'undefined' && 'memory' in performance
                    ? performance.memory.usedJSHeapSize
                    : 0
            });
        };
        recordPerformance();
        const interval = setInterval(recordPerformance, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);
    // State management integration
    useEffect(() => {
        const unsubscribe = growthEngineStateOptimizer.subscribe('phaseChange', (data) => {
            if (data.newPhase !== currentPhase) {
                loadMetrics();
            }
        });
        return unsubscribe;
    }, [currentPhase, loadMetrics]);
    const handleRefresh = useCallback(() => {
        // Clear cache and reload
        growthEngineCacheManager.clear(`dashboard_metrics_${shopDomain}_${currentPhase}`);
        loadMetrics();
    }, [loadMetrics, shopDomain, currentPhase]);
    const handlePhaseChange = useCallback((newPhase) => {
        growthEngineStateOptimizer.setState('currentPhase', newPhase, {
            persist: true,
            validate: (phase) => phase >= 9 && phase <= 12
        });
    }, []);
    if (isLoading) {
        return (<div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: 'var(--occ-font-size-lg)'
            }}>
        Loading Growth Engine Dashboard...
      </div>);
    }
    if (error) {
        return (<div style={{
                padding: 'var(--occ-space-4)',
                background: 'var(--occ-bg-error)',
                color: 'var(--occ-text-on-error)',
                borderRadius: 'var(--occ-radius-md)',
                margin: 'var(--occ-space-4) 0'
            }}>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={handleRefresh} style={{
                padding: 'var(--occ-space-2) var(--occ-space-3)',
                background: 'var(--occ-bg-primary)',
                color: 'var(--occ-text-on-primary)',
                border: 'none',
                borderRadius: 'var(--occ-radius-sm)',
                cursor: 'pointer',
                marginTop: 'var(--occ-space-2)'
            }}>
          Retry
        </button>
      </div>);
    }
    return (<GrowthEngineRouter userPermissions={userPermissions} currentPhase={currentPhase}>
      <div style={{ padding: 'var(--occ-space-4)' }}>
        {/* Header */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--occ-space-4)',
            paddingBottom: 'var(--occ-space-3)',
            borderBottom: '1px solid var(--occ-border-default)'
        }}>
          <div>
            <h1 style={{
            margin: 0,
            fontSize: 'var(--occ-font-size-2xl)',
            fontWeight: 'var(--occ-font-weight-bold)'
        }}>
              Growth Engine Dashboard
            </h1>
            <p style={{
            margin: 'var(--occ-space-1) 0 0 0',
            color: 'var(--occ-text-secondary)',
            fontSize: 'var(--occ-font-size-sm)'
        }}>
              Phase {currentPhase} • Advanced Infrastructure
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--occ-space-2)' }}>
            <button onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)} style={{
            padding: 'var(--occ-space-2) var(--occ-space-3)',
            background: 'var(--occ-bg-secondary)',
            color: 'var(--occ-text-on-secondary)',
            border: '1px solid var(--occ-border-default)',
            borderRadius: 'var(--occ-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--occ-font-size-sm)'
        }}>
              {showPerformanceMonitor ? 'Hide' : 'Show'} Performance
            </button>
            
            <button onClick={handleRefresh} style={{
            padding: 'var(--occ-space-2) var(--occ-space-3)',
            background: 'var(--occ-bg-primary)',
            color: 'var(--occ-text-on-primary)',
            border: 'none',
            borderRadius: 'var(--occ-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--occ-font-size-sm)'
        }}>
              Refresh
            </button>
          </div>
        </div>

        {/* Performance Monitor */}
        {showPerformanceMonitor && <PerformanceMonitor />}

        {/* Navigation */}
        <RouteNavigation />

        {/* Metrics Overview */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--occ-space-3)',
            marginBottom: 'var(--occ-space-4)'
        }}>
          <MetricCard title="Total Actions" value={metrics.totalActions} color="var(--occ-text-default)"/>
          <MetricCard title="Active Actions" value={metrics.activeActions} color="var(--occ-text-success)"/>
          <MetricCard title="Completed Actions" value={metrics.completedActions} color="var(--occ-text-primary)"/>
          <MetricCard title="Blocked Actions" value={metrics.blockedActions} color="var(--occ-text-error)"/>
          <MetricCard title="Average ROI" value={`${metrics.averageROI.toFixed(1)}x`} color="var(--occ-text-success)"/>
          <MetricCard title="Total Revenue" value={`$${metrics.totalRevenue.toLocaleString()}`} color="var(--occ-text-primary)"/>
          <MetricCard title="Phase Progress" value={`${metrics.phaseProgress.toFixed(1)}%`} color="var(--occ-text-info)"/>
          <MetricCard title="Performance Score" value={`${metrics.performanceScore.toFixed(0)}/100`} color="var(--occ-text-success)"/>
        </div>

        {/* Phase Selector */}
        <div style={{
            background: 'var(--occ-bg-secondary)',
            padding: 'var(--occ-space-3)',
            borderRadius: 'var(--occ-radius-md)',
            marginBottom: 'var(--occ-space-4)'
        }}>
          <h3 style={{ margin: '0 0 var(--occ-space-2) 0' }}>Current Phase</h3>
          <div style={{ display: 'flex', gap: 'var(--occ-space-2)' }}>
            {[9, 10, 11, 12].map(phase => (<button key={phase} onClick={() => handlePhaseChange(phase)} style={{
                padding: 'var(--occ-space-2) var(--occ-space-3)',
                background: currentPhase === phase
                    ? 'var(--occ-bg-primary)'
                    : 'var(--occ-bg-default)',
                color: currentPhase === phase
                    ? 'var(--occ-text-on-primary)'
                    : 'var(--occ-text-default)',
                border: '1px solid var(--occ-border-default)',
                borderRadius: 'var(--occ-radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--occ-font-size-sm)'
            }}>
                Phase {phase}
              </button>))}
          </div>
        </div>

        {/* Route Content */}
        <div style={{
            background: 'var(--occ-bg-default)',
            border: '1px solid var(--occ-border-default)',
            borderRadius: 'var(--occ-radius-md)',
            padding: 'var(--occ-space-4)',
            minHeight: '400px'
        }}>
          <RouteGuard routeId="growth-dashboard">
            <GrowthEngineContent metrics={metrics} currentPhase={currentPhase} shopDomain={shopDomain} operatorEmail={operatorEmail}/>
          </RouteGuard>
        </div>
      </div>
    </GrowthEngineRouter>);
}
/**
 * Metric Card Component
 */
function MetricCard({ title, value, color }) {
    return (<div style={{
            background: 'var(--occ-bg-default)',
            border: '1px solid var(--occ-border-default)',
            borderRadius: 'var(--occ-radius-md)',
            padding: 'var(--occ-space-3)',
            textAlign: 'center'
        }}>
      <div style={{
            fontSize: 'var(--occ-font-size-2xl)',
            fontWeight: 'var(--occ-font-weight-bold)',
            color,
            marginBottom: 'var(--occ-space-1)'
        }}>
        {value}
      </div>
      <div style={{
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-text-secondary)'
        }}>
        {title}
      </div>
    </div>);
}
/**
 * Growth Engine Content Component
 */
function GrowthEngineContent({ metrics, currentPhase, shopDomain, operatorEmail }) {
    const { currentRoute, isLoading, error } = useGrowthEngineRoute();
    if (isLoading) {
        return <div>Loading content...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (<div>
      <h2>Growth Engine Content</h2>
      <p>Current Route: {currentRoute?.component || 'None'}</p>
      <p>Phase: {currentPhase}</p>
      <p>Shop: {shopDomain}</p>
      <p>Operator: {operatorEmail}</p>
      
      {/* Add more content based on current route */}
      <div style={{ marginTop: 'var(--occ-space-4)' }}>
        <h3>Recent Activity</h3>
        <div style={{
            background: 'var(--occ-bg-secondary)',
            padding: 'var(--occ-space-3)',
            borderRadius: 'var(--occ-radius-sm)',
            fontSize: 'var(--occ-font-size-sm)'
        }}>
          <p>• {metrics.activeActions} actions currently active</p>
          <p>• {metrics.completedActions} actions completed this phase</p>
          <p>• {metrics.blockedActions} actions blocked</p>
          <p>• Performance score: {metrics.performanceScore}/100</p>
        </div>
      </div>
    </div>);
}
/**
 * Fetch dashboard metrics
 */
async function fetchDashboardMetrics(shopDomain, phase) {
    // Mock implementation - in production this would fetch from database
    return {
        totalActions: 45,
        activeActions: 12,
        completedActions: 28,
        blockedActions: 5,
        averageROI: 3.2,
        totalRevenue: 125000,
        phaseProgress: 75.5,
        performanceScore: 87
    };
}
//# sourceMappingURL=GrowthEngineCoreDashboard.js.map