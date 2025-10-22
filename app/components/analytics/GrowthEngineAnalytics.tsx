/**
 * Growth Engine Advanced Analytics Dashboard Component
 *
 * ANALYTICS-023: Display growth engine advanced analytics for Growth Engine phases 9-12
 *
 * Features:
 * - Advanced attribution visualization
 * - Performance insights dashboard
 * - Optimization recommendations
 * - Budget allocation guidance
 */

import React, { useState, useEffect } from 'react';
import { 
  GrowthEngineAnalytics, 
  AttributionData, 
  GrowthAction,
  exportGrowthEngineAnalytics 
} from '~/services/analytics/growthEngineAdvanced';

interface GrowthEngineAnalyticsProps {
  analytics?: GrowthEngineAnalytics;
  loading?: boolean;
  error?: string;
}

export function GrowthEngineAnalyticsComponent({ 
  analytics, 
  loading = false, 
  error 
}: GrowthEngineAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '14d' | '28d'>('28d');
  const [selectedView, setSelectedView] = useState<'overview' | 'attribution' | 'recommendations'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading growth engine analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">⚠️</div>
          <div className="ml-2">
            <h3 className="text-red-800 font-medium">Error loading analytics</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500">
        No growth engine analytics data available
      </div>
    );
  }

  const dashboardData = exportGrowthEngineAnalytics(analytics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Growth Engine Analytics</h2>
          <p className="text-gray-600">
            Advanced analytics for Growth Engine phases 9-12
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '14d' | '28d')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">7 Days</option>
            <option value="14d">14 Days</option>
            <option value="28d">28 Days</option>
          </select>
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value as 'overview' | 'attribution' | 'recommendations')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="overview">Overview</option>
            <option value="attribution">Attribution</option>
            <option value="recommendations">Recommendations</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Actions"
          value={dashboardData.summary.totalActions}
          icon="📊"
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${dashboardData.summary.totalRevenue.toLocaleString()}`}
          icon="💰"
        />
        <SummaryCard
          title="Total Conversions"
          value={dashboardData.summary.totalConversions.toLocaleString()}
          icon="🎯"
        />
        <SummaryCard
          title="Average ROI"
          value={`${dashboardData.summary.averageROI.toFixed(2)}x`}
          icon="📈"
        />
      </div>

      {/* Main Content */}
      {selectedView === 'overview' && (
        <OverviewView 
          analytics={analytics} 
          timeframe={selectedTimeframe}
          dashboardData={dashboardData}
        />
      )}

      {selectedView === 'attribution' && (
        <AttributionView 
          attributionData={analytics.attributionAnalysis}
          timeframe={selectedTimeframe}
        />
      )}

      {selectedView === 'recommendations' && (
        <RecommendationsView 
          recommendations={analytics.recommendations}
          performanceInsights={analytics.performanceInsights}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="text-2xl">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OverviewView({ 
  analytics, 
  timeframe, 
  dashboardData 
}: { 
  analytics: GrowthEngineAnalytics; 
  timeframe: string;
  dashboardData: any;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performing Action */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Action</h3>
        {dashboardData.topAction ? (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{dashboardData.topAction.title}</h4>
                <p className="text-sm text-gray-600 capitalize">{dashboardData.topAction.type}</p>
              </div>
              <span className="text-lg font-bold text-green-600">
                ${dashboardData.topAction.revenue.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Action ID: {dashboardData.topAction.id}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No top performing action data available</p>
        )}
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Best Performing Type:</span>
            <span className="text-sm font-medium capitalize">{dashboardData.performance.bestType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Worst Performing Type:</span>
            <span className="text-sm font-medium capitalize">{dashboardData.performance.worstType}</span>
          </div>
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Optimization Opportunities:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {dashboardData.performance.opportunities.map((opportunity: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData.performance.insights.map((insight: string, index: number) => (
            <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-500 mr-2">💡</span>
              <span className="text-sm text-blue-800">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AttributionView({ 
  attributionData, 
  timeframe 
}: { 
  attributionData: AttributionData[]; 
  timeframe: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Attribution Analysis</h3>
        <p className="text-sm text-gray-600">Performance metrics for {timeframe} attribution window</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROAS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Efficiency
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attributionData.map((data) => {
              const windowData = data.attributionWindows[timeframe];
              return (
                <tr key={data.actionId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.actionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {data.actionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {windowData.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${windowData.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {windowData.roas.toFixed(2)}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${data.efficiency.efficiencyScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{data.efficiency.efficiencyScore}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecommendationsView({ 
  recommendations, 
  performanceInsights 
}: { 
  recommendations: any; 
  performanceInsights: any;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scale Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-green-500 mr-2">📈</span>
          Scale Actions ({recommendations.scale.length})
        </h3>
        {recommendations.scale.length > 0 ? (
          <div className="space-y-2">
            {recommendations.scale.map((actionId: string) => (
              <div key={actionId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium text-green-800">{actionId}</span>
                <span className="text-xs text-green-600">High Performance</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No actions ready for scaling</p>
        )}
      </div>

      {/* Optimize Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-yellow-500 mr-2">⚡</span>
          Optimize Actions ({recommendations.optimize.length})
        </h3>
        {recommendations.optimize.length > 0 ? (
          <div className="space-y-2">
            {recommendations.optimize.map((actionId: string) => (
              <div key={actionId} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm font-medium text-yellow-800">{actionId}</span>
                <span className="text-xs text-yellow-600">Needs Optimization</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No actions need optimization</p>
        )}
      </div>

      {/* Pause Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-red-500 mr-2">⏸️</span>
          Pause Actions ({recommendations.pause.length})
        </h3>
        {recommendations.pause.length > 0 ? (
          <div className="space-y-2">
            {recommendations.pause.map((actionId: string) => (
              <div key={actionId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium text-red-800">{actionId}</span>
                <span className="text-xs text-red-600">Low Performance</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No actions need to be paused</p>
        )}
      </div>

      {/* Budget Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-blue-500 mr-2">💰</span>
          Budget Recommendations ({recommendations.budget.length})
        </h3>
        {recommendations.budget.length > 0 ? (
          <div className="space-y-3">
            {recommendations.budget.map((rec: any, index: number) => (
              <div key={index} className="p-3 bg-blue-50 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-blue-900">{rec.actionId}</span>
                  <span className="text-xs text-blue-600">
                    Expected ROI: {rec.expectedROI.toFixed(2)}x
                  </span>
                </div>
                <div className="text-xs text-blue-700">
                  Current: ${rec.currentBudget.toLocaleString()} → 
                  Recommended: ${rec.recommendedBudget.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No budget recommendations available</p>
        )}
      </div>
    </div>
  );
}

export default GrowthEngineAnalyticsComponent;
