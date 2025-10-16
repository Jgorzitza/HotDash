/**
 * Traffic Analysis Dashboard
 * 
 * Detailed traffic breakdown by source with trends and visualizations.
 * Shows organic, paid, direct, referral, and social traffic.
 */


import { useLoaderData } from 'react-router';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../config/ga.server';
import { appMetrics } from '../utils/metrics.server';

// ============================================================================
// Types
// ============================================================================

interface TrafficSource {
  source: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  trend: number; // % change vs previous period
}

interface TrafficData {
  total: {
    sessions: number;
    users: number;
    trend: number;
  };
  sources: TrafficSource[];
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: any) {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    // Calculate date ranges (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const currentStart = thirtyDaysAgo.toISOString().split('T')[0];
    const currentEnd = today.toISOString().split('T')[0];
    const previousStart = sixtyDaysAgo.toISOString().split('T')[0];
    const previousEnd = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch current period data
    const [currentResponse] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate: currentStart, endDate: currentEnd }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    // Fetch previous period data for trends
    const [previousResponse] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate: previousStart, endDate: previousEnd }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
    });

    // Build previous period map
    const previousMap = new Map<string, number>();
    previousResponse.rows?.forEach((row) => {
      const source = row.dimensionValues?.[0]?.value || 'Unknown';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      previousMap.set(source, sessions);
    });

    // Process current period data
    let totalSessions = 0;
    let totalUsers = 0;
    const sources: TrafficSource[] = [];

    currentResponse.rows?.forEach((row) => {
      const source = row.dimensionValues?.[0]?.value || 'Unknown';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const users = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const bounceRate = parseFloat(row.metricValues?.[2]?.value || '0');
      const avgSessionDuration = parseFloat(row.metricValues?.[3]?.value || '0');
      const conversions = parseInt(row.metricValues?.[4]?.value || '0', 10);
      
      totalSessions += sessions;
      totalUsers += users;

      const previousSessions = previousMap.get(source) || 0;
      const trend = previousSessions > 0 
        ? ((sessions - previousSessions) / previousSessions) * 100 
        : sessions > 0 ? 100 : 0;

      const conversionRate = sessions > 0 ? (conversions / sessions) * 100 : 0;

      sources.push({
        source,
        sessions,
        users,
        bounceRate,
        avgSessionDuration,
        conversions,
        conversionRate,
        trend,
      });
    });

    // Calculate total trend
    const previousTotal = Array.from(previousMap.values()).reduce((sum, val) => sum + val, 0);
    const totalTrend = previousTotal > 0 
      ? ((totalSessions - previousTotal) / previousTotal) * 100 
      : totalSessions > 0 ? 100 : 0;

    const data: TrafficData = {
      total: {
        sessions: totalSessions,
        users: totalUsers,
        trend: totalTrend,
      },
      sources,
      period: {
        start: currentStart,
        end: currentEnd,
      },
    };

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('trafficDashboard', true, duration);

    return Response.json({ success: true, data });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('trafficDashboard', false, duration);
    
    console.error('[Traffic Dashboard] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// Component
// ============================================================================

export default function TrafficDashboard() {
  const { success, data, error } = useLoaderData<typeof loader>();

  if (!success || !data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Traffic Analysis</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error loading traffic data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Traffic Analysis Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold">{data.total.sessions.toLocaleString()}</p>
          <p className={`text-sm mt-2 ${data.total.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.total.trend >= 0 ? '↑' : '↓'} {Math.abs(data.total.trend).toFixed(1)}% vs previous period
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{data.total.users.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Period</h3>
          <p className="text-sm">{data.period.start} to {data.period.end}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Traffic Sources Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Traffic by Source</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounce Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conv. Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.sources.map((source, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {source.sessions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {source.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {source.bounceRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {Math.floor(source.avgSessionDuration / 60)}m {Math.floor(source.avgSessionDuration % 60)}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {source.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {source.conversionRate.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    source.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {source.trend >= 0 ? '↑' : '↓'} {Math.abs(source.trend).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

