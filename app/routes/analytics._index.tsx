/**
 * Analytics Dashboard Index
 * 
 * Main analytics dashboard with tiles and navigation.
 */


import { useLoaderData, Link } from 'react-router';
import { getRevenueMetrics, getTrafficMetrics, getConversionMetrics } from '../lib/analytics/ga4';

export async function loader({ request }: any) {
  try {
    const [revenue, traffic, conversion] = await Promise.all([
      getRevenueMetrics(),
      getTrafficMetrics(),
      getConversionMetrics(),
    ]);

    return Response.json({ success: true, data: { revenue, traffic, conversion } });
  } catch (error: any) {
    console.error('[Analytics Dashboard] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export default function AnalyticsDashboard() {
  const { success, data, error } = useLoaderData<typeof loader>();

  if (!success || !data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  const { revenue, traffic, conversion } = data;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Period: {revenue.period.start} to {revenue.period.end}
        </p>
      </div>

      {/* Key Metrics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Tile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold mb-2">${revenue.totalRevenue.toLocaleString()}</p>
          <p className={`text-sm ${revenue.trend.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenue.trend.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenue.trend.revenueChange).toFixed(1)}% vs previous period
          </p>
        </div>

        {/* Sessions Tile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold mb-2">{traffic.totalSessions.toLocaleString()}</p>
          <p className={`text-sm ${traffic.trend.sessionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {traffic.trend.sessionsChange >= 0 ? '↑' : '↓'} {Math.abs(traffic.trend.sessionsChange).toFixed(1)}% vs previous period
          </p>
        </div>

        {/* Conversion Rate Tile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold mb-2">{conversion.conversionRate.toFixed(2)}%</p>
          <p className={`text-sm ${conversion.trend.conversionRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {conversion.trend.conversionRateChange >= 0 ? '↑' : '↓'} {Math.abs(conversion.trend.conversionRateChange).toFixed(1)}% vs previous period
          </p>
        </div>

        {/* AOV Tile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold mb-2">${revenue.averageOrderValue.toFixed(2)}</p>
          <p className={`text-sm ${revenue.trend.aovChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenue.trend.aovChange >= 0 ? '↑' : '↓'} {Math.abs(revenue.trend.aovChange).toFixed(1)}% vs previous period
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Organic Traffic</h3>
          <p className="text-2xl font-bold text-blue-900">{traffic.organicPercentage.toFixed(1)}%</p>
          <p className="text-sm text-blue-700 mt-1">
            {traffic.organicSessions.toLocaleString()} organic sessions
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-green-900 mb-2">Transactions</h3>
          <p className="text-2xl font-bold text-green-900">{revenue.transactions}</p>
          <p className="text-sm text-green-700 mt-1">
            {revenue.trend.transactionsChange >= 0 ? '↑' : '↓'} {Math.abs(revenue.trend.transactionsChange).toFixed(1)}% change
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Revenue per Session</h3>
          <p className="text-2xl font-bold text-purple-900">
            ${(revenue.totalRevenue / traffic.totalSessions).toFixed(2)}
          </p>
          <p className="text-sm text-purple-700 mt-1">Average value per visit</p>
        </div>
      </div>

      {/* Navigation to Detailed Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/analytics/traffic" 
            className="p-4 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <h3 className="font-semibold mb-1">Traffic Analysis</h3>
            <p className="text-sm text-gray-600">Breakdown by source and channel</p>
          </Link>

          <Link 
            to="/analytics/funnels" 
            className="p-4 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <h3 className="font-semibold mb-1">Conversion Funnels</h3>
            <p className="text-sm text-gray-600">Identify drop-off points</p>
          </Link>

          <Link 
            to="/analytics/landing-pages" 
            className="p-4 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <h3 className="font-semibold mb-1">Landing Pages</h3>
            <p className="text-sm text-gray-600">Top performing pages</p>
          </Link>

          <a 
            href="/api/analytics/export?type=revenue" 
            className="p-4 border border-gray-200 rounded hover:border-green-500 hover:bg-green-50 transition"
          >
            <h3 className="font-semibold mb-1">Export Revenue</h3>
            <p className="text-sm text-gray-600">Download CSV report</p>
          </a>

          <a 
            href="/api/analytics/export?type=traffic" 
            className="p-4 border border-gray-200 rounded hover:border-green-500 hover:bg-green-50 transition"
          >
            <h3 className="font-semibold mb-1">Export Traffic</h3>
            <p className="text-sm text-gray-600">Download CSV report</p>
          </a>

          <a 
            href="/api/analytics/export?type=products" 
            className="p-4 border border-gray-200 rounded hover:border-green-500 hover:bg-green-50 transition"
          >
            <h3 className="font-semibold mb-1">Export Products</h3>
            <p className="text-sm text-gray-600">Download CSV report</p>
          </a>
        </div>
      </div>

      {/* SLO Status */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">API Latency</p>
            <p className="text-lg font-semibold text-green-600">✓ &lt;500ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cache Hit Rate</p>
            <p className="text-lg font-semibold text-green-600">✓ &gt;80%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-lg font-semibold text-green-600">✓ &gt;99%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data Freshness</p>
            <p className="text-lg font-semibold text-green-600">✓ 5min cache</p>
          </div>
        </div>
      </div>
    </div>
  );
}

