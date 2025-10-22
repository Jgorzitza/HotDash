/**
 * Growth Engine Analytics Dashboard Component
 *
 * ANALYTICS-274: Comprehensive Growth Engine analytics dashboard with
 * phase tracking, action performance, and optimization recommendations
 */

import { useState } from 'react';
import type { GrowthEngineAnalytics } from '~/services/analytics/growthEngine';

interface GrowthEngineDashboardProps {
  analytics: GrowthEngineAnalytics;
  loading?: boolean;
  error?: string;
}

type ViewMode = 'overview' | 'phases' | 'actions' | 'performance' | 'insights' | 'recommendations';

export function GrowthEngineDashboard({ 
  analytics, 
  loading = false, 
  error 
}: GrowthEngineDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

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
          <span>Loading Growth Engine analytics...</span>
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
            <h3 style={{ margin: 0, color: 'var(--occ-color-error)' }}>Error loading analytics</h3>
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
        <h2 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>
          Growth Engine Analytics
        </h2>
        <p style={{ 
          margin: 0, 
          color: 'var(--occ-text-secondary)',
          fontSize: 'var(--occ-font-size-sm)'
        }}>
          Comprehensive analytics for Growth Engine phases with advanced capabilities
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
          { key: 'phases', label: 'Phases' },
          { key: 'actions', label: 'Actions' },
          { key: 'performance', label: 'Performance' },
          { key: 'insights', label: 'Insights' },
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
      {viewMode === 'overview' && <OverviewView analytics={analytics} />}
      {viewMode === 'phases' && <PhasesView analytics={analytics} selectedPhase={selectedPhase} onSelectPhase={setSelectedPhase} />}
      {viewMode === 'actions' && <ActionsView analytics={analytics} />}
      {viewMode === 'performance' && <PerformanceView analytics={analytics} />}
      {viewMode === 'insights' && <InsightsView analytics={analytics} />}
      {viewMode === 'recommendations' && <RecommendationsView analytics={analytics} />}
    </div>
  );
}

function OverviewView({ analytics }: { analytics: GrowthEngineAnalytics }) {
  return (
    <div>
      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--occ-space-3)',
        marginBottom: 'var(--occ-space-4)'
      }}>
        <MetricCard
          title="Total Phases"
          value={analytics.overview.totalPhases}
          subtitle={`${analytics.overview.activePhases} active, ${analytics.overview.completedPhases} completed`}
          icon="📊"
        />
        <MetricCard
          title="Total Actions"
          value={analytics.overview.totalActions}
          subtitle={`${analytics.overview.activeActions} active, ${analytics.overview.completedActions} completed`}
          icon="🎯"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
          subtitle={`${analytics.overview.totalConversions} conversions`}
          icon="💰"
        />
        <MetricCard
          title="Average ROI"
          value={`${analytics.overview.averageROI.toFixed(1)}x`}
          subtitle={`${analytics.overview.overallProgress.toFixed(0)}% overall progress`}
          icon="📈"
        />
      </div>

      {/* Phase Progress */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Phase Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--occ-space-2)' }}>
          {analytics.phases.map(phase => {
            const phaseInsight = analytics.insights.phaseProgress.find(p => p.phase === phase.phase);
            return (
              <div key={phase.phase} style={{
                padding: 'var(--occ-space-3)',
                border: '1px solid var(--occ-border-default)',
                borderRadius: 'var(--occ-radius-md)',
                backgroundColor: 'var(--occ-bg-surface)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--occ-space-2)' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Phase {phase.phase}: {phase.name}</h4>
                    <p style={{ margin: 0, color: 'var(--occ-text-secondary)', fontSize: 'var(--occ-font-size-sm)' }}>
                      {phase.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: 'var(--occ-font-size-lg)',
                      fontWeight: 'var(--occ-font-weight-semibold)',
                      color: phaseInsight?.status === 'on-track' ? 'var(--occ-color-success)' :
                             phaseInsight?.status === 'at-risk' ? 'var(--occ-color-warning)' : 'var(--occ-color-error)'
                    }}>
                      {phaseInsight?.progress.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                      {phaseInsight?.status}
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--occ-bg-subdued)',
                  borderRadius: 'var(--occ-radius-sm)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${phaseInsight?.progress || 0}%`,
                    height: '100%',
                    backgroundColor: phaseInsight?.status === 'on-track' ? 'var(--occ-color-success)' :
                                   phaseInsight?.status === 'at-risk' ? 'var(--occ-color-warning)' : 'var(--occ-color-error)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PhasesView({ 
  analytics, 
  selectedPhase, 
  onSelectPhase 
}: { 
  analytics: GrowthEngineAnalytics; 
  selectedPhase: number | null;
  onSelectPhase: (phase: number | null) => void;
}) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Growth Phases</h3>
      <div style={{ display: 'grid', gap: 'var(--occ-space-3)' }}>
        {analytics.phases.map(phase => {
          const phaseInsight = analytics.insights.phaseProgress.find(p => p.phase === phase.phase);
          const phaseActions = analytics.actions.filter(action => action.phase === phase.phase);
          
          return (
            <div key={phase.phase} style={{
              padding: 'var(--occ-space-4)',
              border: '1px solid var(--occ-border-default)',
              borderRadius: 'var(--occ-radius-md)',
              backgroundColor: 'var(--occ-bg-surface)',
              cursor: 'pointer'
            }}
            onClick={() => onSelectPhase(selectedPhase === phase.phase ? null : phase.phase)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--occ-space-3)' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-1)' }}>
                    Phase {phase.phase}: {phase.name}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--occ-text-secondary)', fontSize: 'var(--occ-font-size-sm)' }}>
                    {phase.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 'var(--occ-font-size-lg)',
                    fontWeight: 'var(--occ-font-weight-semibold)',
                    color: phaseInsight?.status === 'on-track' ? 'var(--occ-color-success)' :
                           phaseInsight?.status === 'at-risk' ? 'var(--occ-color-warning)' : 'var(--occ-color-error)'
                  }}>
                    {phaseInsight?.progress.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                    {phase.status}
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div style={{ marginBottom: 'var(--occ-space-3)' }}>
                <h5 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Objectives:</h5>
                <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
                  {phase.objectives.map((objective, index) => (
                    <li key={index} style={{ marginBottom: 'var(--occ-space-1)' }}>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Success Criteria */}
              <div style={{ marginBottom: 'var(--occ-space-3)' }}>
                <h5 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Success Criteria:</h5>
                <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
                  {phase.successCriteria.map((criteria, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--occ-space-2)',
                      backgroundColor: 'var(--occ-bg-subdued)',
                      borderRadius: 'var(--occ-radius-sm)'
                    }}>
                      <span>{criteria.metric}: {criteria.current}/{criteria.target}</span>
                      <span style={{
                        color: criteria.status === 'on-track' ? 'var(--occ-color-success)' :
                               criteria.status === 'at-risk' ? 'var(--occ-color-warning)' : 'var(--occ-color-error)',
                        fontSize: 'var(--occ-font-size-sm)'
                      }}>
                        {criteria.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase Actions */}
              {selectedPhase === phase.phase && (
                <div>
                  <h5 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Actions ({phaseActions.length}):</h5>
                  <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
                    {phaseActions.map(action => (
                      <div key={action.actionId} style={{
                        padding: 'var(--occ-space-2)',
                        border: '1px solid var(--occ-border-default)',
                        borderRadius: 'var(--occ-radius-sm)',
                        backgroundColor: 'var(--occ-bg-subdued)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                              {action.title}
                            </div>
                            <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                              {action.actionType.toUpperCase()} • {action.priority} priority
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              color: action.actualROI && action.actualROI > 3 ? 'var(--occ-color-success)' :
                                     action.actualROI && action.actualROI > 2 ? 'var(--occ-color-warning)' : 'var(--occ-color-error)'
                            }}>
                              {action.actualROI?.toFixed(1)}x ROI
                            </div>
                            <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                              {action.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionsView({ analytics }: { analytics: GrowthEngineAnalytics }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>All Actions</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--occ-font-size-sm)'
        }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--occ-bg-subdued)' }}>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'left' }}>Action</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'left' }}>Phase</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'left' }}>Type</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'left' }}>Priority</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'right' }}>ROI</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'right' }}>Revenue</th>
              <th style={{ padding: 'var(--occ-space-3)', textAlign: 'right' }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {analytics.actions.map(action => (
              <tr key={action.actionId} style={{ borderBottom: '1px solid var(--occ-border-subdued)' }}>
                <td style={{ padding: 'var(--occ-space-3)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-xs)', color: 'var(--occ-text-secondary)' }}>
                      {action.targetSlug}
                    </div>
                  </div>
                </td>
                <td style={{ padding: 'var(--occ-space-3)' }}>
                  Phase {action.phase}
                </td>
                <td style={{ padding: 'var(--occ-space-3)' }}>
                  {action.actionType.toUpperCase()}
                </td>
                <td style={{ padding: 'var(--occ-space-3)' }}>
                  <span style={{
                    padding: 'var(--occ-space-1) var(--occ-space-2)',
                    borderRadius: 'var(--occ-radius-sm)',
                    fontSize: 'var(--occ-font-size-xs)',
                    backgroundColor: action.priority === 'critical' ? 'var(--occ-bg-error-subdued)' :
                                   action.priority === 'high' ? 'var(--occ-bg-warning-subdued)' :
                                   action.priority === 'medium' ? 'var(--occ-bg-info-subdued)' : 'var(--occ-bg-subdued)',
                    color: action.priority === 'critical' ? 'var(--occ-color-error)' :
                           action.priority === 'high' ? 'var(--occ-color-warning)' :
                           action.priority === 'medium' ? 'var(--occ-color-info)' : 'var(--occ-text-secondary)'
                  }}>
                    {action.priority}
                  </span>
                </td>
                <td style={{ padding: 'var(--occ-space-3)' }}>
                  <span style={{
                    padding: 'var(--occ-space-1) var(--occ-space-2)',
                    borderRadius: 'var(--occ-radius-sm)',
                    fontSize: 'var(--occ-font-size-xs)',
                    backgroundColor: action.status === 'completed' ? 'var(--occ-bg-success-subdued)' :
                                   action.status === 'executed' ? 'var(--occ-bg-info-subdued)' :
                                   action.status === 'approved' ? 'var(--occ-bg-warning-subdued)' : 'var(--occ-bg-subdued)',
                    color: action.status === 'completed' ? 'var(--occ-color-success)' :
                           action.status === 'executed' ? 'var(--occ-color-info)' :
                           action.status === 'approved' ? 'var(--occ-color-warning)' : 'var(--occ-text-secondary)'
                  }}>
                    {action.status}
                  </span>
                </td>
                <td style={{ 
                  padding: 'var(--occ-space-3)', 
                  textAlign: 'right',
                  color: action.actualROI && action.actualROI > 3 ? 'var(--occ-color-success)' :
                         action.actualROI && action.actualROI > 2 ? 'var(--occ-color-warning)' : 'var(--occ-color-error)'
                }}>
                  {action.actualROI?.toFixed(1)}x
                </td>
                <td style={{ padding: 'var(--occ-space-3)', textAlign: 'right' }}>
                  ${action.impact.actual.revenue.toLocaleString()}
                </td>
                <td style={{ 
                  padding: 'var(--occ-space-3)', 
                  textAlign: 'right',
                  color: action.confidence >= 80 ? 'var(--occ-color-success)' :
                         action.confidence >= 60 ? 'var(--occ-color-warning)' : 'var(--occ-color-error)'
                }}>
                  {action.confidence.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PerformanceView({ analytics }: { analytics: GrowthEngineAnalytics }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Performance Analysis</h3>
      
      {/* Top Performers */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Top Performing Actions</h4>
        <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
          {analytics.performance.topPerformingActions.map(action => (
            <div key={action.actionId} style={{
              padding: 'var(--occ-space-3)',
              border: '1px solid var(--occ-border-success)',
              borderRadius: 'var(--occ-radius-md)',
              backgroundColor: 'var(--occ-bg-success-subdued)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    {action.actionType.toUpperCase()} • Phase {action.phase}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--occ-color-success)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                    {action.actualROI?.toFixed(1)}x ROI
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)' }}>
                    ${action.impact.actual.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Underperformers */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Underperforming Actions</h4>
        <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
          {analytics.performance.underperformingActions.map(action => (
            <div key={action.actionId} style={{
              padding: 'var(--occ-space-3)',
              border: '1px solid var(--occ-border-error)',
              borderRadius: 'var(--occ-radius-md)',
              backgroundColor: 'var(--occ-bg-error-subdued)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    {action.actionType.toUpperCase()} • Phase {action.phase}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--occ-color-error)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                    {action.actualROI?.toFixed(1)}x ROI
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)' }}>
                    ${action.impact.actual.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Actions */}
      {analytics.performance.criticalActions.length > 0 && (
        <div style={{ marginBottom: 'var(--occ-space-4)' }}>
          <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Critical Actions</h4>
          <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
            {analytics.performance.criticalActions.map(action => (
              <div key={action.actionId} style={{
                padding: 'var(--occ-space-3)',
                border: '1px solid var(--occ-border-warning)',
                borderRadius: 'var(--occ-radius-md)',
                backgroundColor: 'var(--occ-bg-warning-subdued)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      {action.actionType.toUpperCase()} • Phase {action.phase}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--occ-color-warning)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                      CRITICAL
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)' }}>
                      {action.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightsView({ analytics }: { analytics: GrowthEngineAnalytics }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Growth Insights</h3>
      
      {/* Action Effectiveness */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Action Effectiveness by Type</h4>
        <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
          {analytics.insights.actionEffectiveness.map(effectiveness => (
            <div key={effectiveness.actionType} style={{
              padding: 'var(--occ-space-3)',
              border: '1px solid var(--occ-border-default)',
              borderRadius: 'var(--occ-radius-md)',
              backgroundColor: 'var(--occ-bg-surface)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--occ-space-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--occ-font-weight-medium)', textTransform: 'uppercase' }}>
                    {effectiveness.actionType}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--occ-font-size-lg)', fontWeight: 'var(--occ-font-weight-semibold)' }}>
                    {effectiveness.averageROI.toFixed(1)}x ROI
                  </div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                    {effectiveness.successRate.toFixed(0)}% success rate
                  </div>
                </div>
              </div>
              {effectiveness.recommendations.length > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--occ-font-size-sm)', fontWeight: 'var(--occ-font-weight-medium)', marginBottom: 'var(--occ-space-1)' }}>
                    Recommendations:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
                    {effectiveness.recommendations.map((rec, index) => (
                      <li key={index} style={{ fontSize: 'var(--occ-font-size-sm)' }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Optimization Opportunities</h4>
        <div style={{
          padding: 'var(--occ-space-3)',
          border: '1px solid var(--occ-border-info)',
          borderRadius: 'var(--occ-radius-md)',
          backgroundColor: 'var(--occ-bg-info-subdued)'
        }}>
          <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
            {analytics.insights.optimizationOpportunities.map((opportunity, index) => (
              <li key={index} style={{ marginBottom: 'var(--occ-space-1)' }}>
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Risk Factors */}
      {analytics.insights.riskFactors.length > 0 && (
        <div>
          <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Risk Factors</h4>
          <div style={{
            padding: 'var(--occ-space-3)',
            border: '1px solid var(--occ-border-error)',
            borderRadius: 'var(--occ-radius-md)',
            backgroundColor: 'var(--occ-bg-error-subdued)'
          }}>
            <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
              {analytics.insights.riskFactors.map((risk, index) => (
                <li key={index} style={{ marginBottom: 'var(--occ-space-1)' }}>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationsView({ analytics }: { analytics: GrowthEngineAnalytics }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: 'var(--occ-space-3)' }}>Growth Recommendations</h3>
      
      {/* Immediate Actions */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Immediate Actions</h4>
        <div style={{
          padding: 'var(--occ-space-3)',
          border: '1px solid var(--occ-border-error)',
          borderRadius: 'var(--occ-radius-md)',
          backgroundColor: 'var(--occ-bg-error-subdued)'
        }}>
          <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
            {analytics.recommendations.immediate.map((action, index) => (
              <li key={index} style={{ marginBottom: 'var(--occ-space-1)' }}>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Short Term */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Short Term (1-3 months)</h4>
        <div style={{
          padding: 'var(--occ-space-3)',
          border: '1px solid var(--occ-border-warning)',
          borderRadius: 'var(--occ-radius-md)',
          backgroundColor: 'var(--occ-bg-warning-subdued)'
        }}>
          <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
            {analytics.recommendations.shortTerm.map((action, index) => (
              <li key={index} style={{ marginBottom: 'var(--occ-space-1)' }}>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Long Term */}
      <div style={{ marginBottom: 'var(--occ-space-4)' }}>
        <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Long Term (3-12 months)</h4>
        <div style={{
          padding: 'var(--occ-space-3)',
          border: '1px solid var(--occ-border-info)',
          borderRadius: 'var(--occ-radius-md)',
          backgroundColor: 'var(--occ-bg-info-subdued)'
        }}>
          <ul style={{ margin: 0, paddingLeft: 'var(--occ-space-4)' }}>
            {analytics.recommendations.longTerm.map((action, index) => (
              <li key={index} style={{ marginBottom: 'var(--occ-space-1)' }}>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Budget Optimization */}
      {analytics.recommendations.budgetOptimization.length > 0 && (
        <div>
          <h4 style={{ margin: 0, marginBottom: 'var(--occ-space-2)' }}>Budget Optimization</h4>
          <div style={{ display: 'grid', gap: 'var(--occ-space-2)' }}>
            {analytics.recommendations.budgetOptimization.map((rec, index) => (
              <div key={index} style={{
                padding: 'var(--occ-space-3)',
                border: '1px solid var(--occ-border-default)',
                borderRadius: 'var(--occ-radius-md)',
                backgroundColor: 'var(--occ-bg-surface)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--occ-font-weight-medium)' }}>
                      Action {rec.actionId}
                    </div>
                    <div style={{ fontSize: 'var(--occ-font-size-sm)', color: 'var(--occ-text-secondary)' }}>
                      Current: ${rec.currentBudget.toLocaleString()} → Recommended: ${rec.recommendedBudget.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: rec.expectedImpact > 1 ? 'var(--occ-color-success)' : 'var(--occ-color-warning)',
                      fontWeight: 'var(--occ-font-weight-semibold)'
                    }}>
                      {rec.expectedImpact.toFixed(1)}x impact
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: string; 
}) {
  return (
    <div style={{
      padding: 'var(--occ-space-3)',
      border: '1px solid var(--occ-border-default)',
      borderRadius: 'var(--occ-radius-md)',
      backgroundColor: 'var(--occ-bg-surface)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--occ-space-2)' }}>
        <span style={{ fontSize: 'var(--occ-font-size-lg)' }}>{icon}</span>
        <div>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--occ-font-size-sm)',
            color: 'var(--occ-text-secondary)'
          }}>
            {title}
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--occ-font-size-lg)',
            fontWeight: 'var(--occ-font-weight-semibold)'
          }}>
            {value}
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--occ-font-size-xs)',
            color: 'var(--occ-text-secondary)'
          }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GrowthEngineDashboard;
