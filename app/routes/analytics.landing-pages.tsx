/**
 * Landing Page Performance Dashboard
 * 
 * Analyze landing page effectiveness with bounce rates, conversions, and revenue.
 */


import { useLoaderData } from 'react-router';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../config/ga.server';
import { appMetrics } from '../utils/metrics.server';

interface LandingPageMetrics {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  revenuePerSession: number;
}

export async function loader({ request }: any) {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'landingPage' },
        { name: 'landingPagePlusQueryString' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    });

    const pages: LandingPageMetrics[] = (response.rows || []).map((row) => {
      const pagePath = row.dimensionValues?.[0]?.value || '/';
      const pageTitle = row.dimensionValues?.[1]?.value || pagePath;
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const bounceRate = parseFloat(row.metricValues?.[1]?.value || '0');
      const avgSessionDuration = parseFloat(row.metricValues?.[2]?.value || '0');
      const conversions = parseInt(row.metricValues?.[3]?.value || '0', 10);
      const revenue = parseFloat(row.metricValues?.[4]?.value || '0');

      const conversionRate = sessions > 0 ? (conversions / sessions) * 100 : 0;
      const revenuePerSession = sessions > 0 ? revenue / sessions : 0;

      return {
        pagePath,
        pageTitle,
        sessions,
        bounceRate,
        avgSessionDuration,
        conversions,
        conversionRate,
        revenue,
        revenuePerSession,
      };
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('landingPagePerformance', true, duration);

    return Response.json({ success: true, data: { pages, period: { start: startDate, end: endDate } } });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('landingPagePerformance', false, duration);
    
    console.error('[Landing Pages] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export default function LandingPagesDashboard() {
  const { success, data, error } = useLoaderData<typeof loader>();

  if (!success || !data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Landing Page Performance</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  const totalSessions = data.pages.reduce((sum, p) => sum + p.sessions, 0);
  const totalRevenue = data.pages.reduce((sum, p) => sum + p.revenue, 0);
  const avgBounceRate = data.pages.reduce((sum, p) => sum + p.bounceRate, 0) / data.pages.length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Landing Page Performance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold">{totalSessions.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Bounce Rate</h3>
          <p className="text-3xl font-bold">{avgBounceRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pages Tracked</h3>
          <p className="text-3xl font-bold">{data.pages.length}</p>
        </div>
      </div>

      {/* Landing Pages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Top Landing Pages</h2>
          <p className="text-sm text-gray-500 mt-1">
            Period: {data.period.start} to {data.period.end}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Page
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Sessions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Bounce Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Conversions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Conv. Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Rev/Session
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.pages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {page.pagePath}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {page.sessions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {page.bounceRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {Math.floor(page.avgSessionDuration / 60)}m {Math.floor(page.avgSessionDuration % 60)}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {page.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {page.conversionRate.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${page.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    ${page.revenuePerSession.toFixed(2)}
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

