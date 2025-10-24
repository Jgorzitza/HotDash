/**
 * Growth Engine Performance Analytics Route
 * 
 * ANALYTICS-PERFORMANCE-001: Performance analysis dashboard route
 * Displays real-time performance metrics, insights, and optimization recommendations
 */

import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';
import { useEffect } from 'react';
import { PerformanceOptimizationDashboard } from '~/components/analytics/PerformanceOptimizationDashboard';
import { GrowthEnginePerformanceAnalyzer } from '~/lib/growth-engine/performance-analysis';
import { GrowthEnginePerformanceOptimizer } from '~/services/analytics/performance-optimizer';
import { logDecision } from '~/services/decisions.server';

/**
 * Loader function to fetch performance data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Initialize performance analyzer
    const analyzer = new GrowthEnginePerformanceAnalyzer();
    
    // Perform comprehensive performance analysis
    const analysis = await analyzer.analyzePerformance();
    
    // Initialize optimizer with default config
    const optimizer = new GrowthEnginePerformanceOptimizer({
      autoOptimize: false, // Manual optimization for safety
      optimizationThreshold: 70,
      maxOptimizationsPerRun: 5,
      optimizationCooldown: 60,
      categories: {
        database: true,
        api: true,
        frontend: true,
        caching: true,
        analytics: true
      }
    });
    
    // Set baseline from current analysis
    await optimizer.setBaseline(analysis);
    
    // Generate optimization recommendations
    const optimization = await optimizer.optimizePerformance(analysis);
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'performance_dashboard_loaded',
      rationale: `Performance dashboard loaded with score: ${analysis.overallScore}`,
      evidenceUrl: 'app/routes/analytics.performance.tsx',
      payload: {
        overallScore: analysis.overallScore,
        recommendationsCount: analysis.recommendations.length,
        criticalIssuesCount: analysis.criticalIssues.length,
        optimizationsApplied: optimization.optimizationsApplied.length
      }
    });
    
    return Response.json({
      analysis,
      optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Performance dashboard error:', error);
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'performance_dashboard_error',
      rationale: `Performance dashboard error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evidenceUrl: 'app/routes/analytics.performance.tsx'
    });
    
    return Response.json({
      analysis: null,
      optimization: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Performance Analytics Dashboard Component
 */
export default function PerformanceAnalytics() {
  const { analysis, optimization, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [revalidator]);
  
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
          Growth Engine Performance Analytics
        </h1>
        <p style={{ 
          margin: 0,
          color: 'var(--occ-color-text-secondary)',
          fontSize: 'var(--occ-font-size-sm)'
        }}>
          Real-time performance monitoring, analysis, and optimization recommendations
        </p>
      </div>
      
      {/* Performance Dashboard */}
      <PerformanceOptimizationDashboard
        analysis={analysis}
        optimization={optimization}
        loading={revalidator.state === 'loading'}
        error={error}
      />
      
      {/* Footer Info */}
      <div style={{
        marginTop: 'var(--occ-space-4)',
        padding: 'var(--occ-space-3)',
        background: 'var(--occ-color-bg-secondary)',
        borderRadius: 'var(--occ-radius-md)',
        fontSize: 'var(--occ-font-size-sm)',
        color: 'var(--occ-color-text-secondary)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--occ-space-4)', flexWrap: 'wrap' }}>
          <div>
            <strong>Auto-refresh:</strong> Every 30 seconds
          </div>
          <div>
            <strong>Monitoring:</strong> Real-time
          </div>
          <div>
            <strong>API:</strong> /api/analytics/growth-engine-performance
          </div>
          <div>
            <strong>Task:</strong> ANALYTICS-PERFORMANCE-001
          </div>
        </div>
      </div>
    </div>
  );
}
