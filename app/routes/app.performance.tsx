/**
 * Recommender Performance Dashboard - P0
 * 
 * Displays performance metrics and analytics for action recommenders
 * Features:
 * - Overview cards (actions, approval rate, ROI, time saved)
 * - Recommender breakdown table
 * - Trend charts (approval over time, ROI by week)
 * - Filters (date range, type, status)
 * - Export button
 */

import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { useState } from 'react';
import { 
  Page, 
  Layout, 
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Select,
  Badge,
} from '@shopify/polaris';
import { PerformanceOverview } from '~/components/performance/PerformanceOverview';
import { RecommenderBreakdownTable } from '~/components/performance/RecommenderBreakdownTable';
import { TrendCharts } from '~/components/performance/TrendCharts';
import { PerformanceFilters } from '~/components/performance/PerformanceFilters';

// Helper function for JSON responses
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export interface PerformanceData {
  overview: {
    totalActions: number;
    approvalRate: number;
    totalROI: number;
    timeSaved: number; // in hours
  };
  recommenders: Array<{
    id: string;
    name: string;
    actionsCount: number;
    approvalRate: number;
    avgConfidence: number;
    roi: number;
  }>;
  trends: {
    approvals: Array<{ date: string; approved: number; rejected: number }>;
    roi: Array<{ week: string; roi: number }>;
  };
}

/**
 * Load performance data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const dateRange = url.searchParams.get('dateRange') || '30d';
    const type = url.searchParams.get('type') || 'all';
    const status = url.searchParams.get('status') || 'all';

    // TODO: Fetch real data from API
    // For now, return mock data
    const mockData: PerformanceData = {
      overview: {
        totalActions: 1247,
        approvalRate: 87.3,
        totalROI: 45600,
        timeSaved: 124.5,
      },
      recommenders: [
        {
          id: 'seo-ctr',
          name: 'SEO CTR Optimizer',
          actionsCount: 432,
          approvalRate: 92.1,
          avgConfidence: 85.2,
          roi: 18400,
        },
        {
          id: 'metaobject',
          name: 'Metaobject Generator',
          actionsCount: 318,
          approvalRate: 88.5,
          avgConfidence: 78.9,
          roi: 12300,
        },
        {
          id: 'merch-playbook',
          name: 'Merchandising Playbook',
          actionsCount: 256,
          approvalRate: 84.7,
          avgConfidence: 72.4,
          roi: 8900,
        },
        {
          id: 'guided-selling',
          name: 'Guided Selling',
          actionsCount: 189,
          approvalRate: 81.2,
          avgConfidence: 69.8,
          roi: 4800,
        },
        {
          id: 'cwv-repair',
          name: 'Core Web Vitals Repair',
          actionsCount: 52,
          approvalRate: 76.9,
          avgConfidence: 65.3,
          roi: 1200,
        },
      ],
      trends: {
        approvals: [
          { date: '2025-09-15', approved: 42, rejected: 8 },
          { date: '2025-09-22', approved: 48, rejected: 6 },
          { date: '2025-09-29', approved: 51, rejected: 7 },
          { date: '2025-10-06', approved: 45, rejected: 5 },
          { date: '2025-10-13', approved: 53, rejected: 4 },
        ],
        roi: [
          { week: 'Week 1', roi: 8200 },
          { week: 'Week 2', roi: 9800 },
          { week: 'Week 3', roi: 11200 },
          { week: 'Week 4', roi: 7900 },
          { week: 'Week 5', roi: 8500 },
        ],
      },
    };

    return json({ data: mockData, filters: { dateRange, type, status } });
  } catch (error) {
    console.error('Error loading performance data:', error);
    return json({
      data: null,
      error: error instanceof Error ? error.message : 'Failed to load performance data',
    });
  }
}

/**
 * Performance Dashboard Page Component
 */
export default function PerformancePage() {
  const { data, filters, error } = useLoaderData<typeof loader>();
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [exportingData, setExportingData] = useState(false);

  const handleExport = async () => {
    setExportingData(true);
    try {
      // TODO: Implement actual export
      const csvData = generateCSVData(data);
      downloadCSV(csvData, `performance-${new Date().toISOString().split('T')[0]}.csv`);
    } finally {
      setExportingData(false);
    }
  };

  if (error || !data) {
    return (
      <Page title="Performance Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <Text tone="critical">
                {error || 'Failed to load performance data'}
              </Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Performance Dashboard"
      subtitle="Track recommender performance and ROI"
      primaryAction={{
        content: 'Export Data',
        onAction: handleExport,
        loading: exportingData,
      }}
    >
      <Layout>
        {/* Filters */}
        <Layout.Section>
          <PerformanceFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </Layout.Section>

        {/* Overview Cards */}
        <Layout.Section>
          <PerformanceOverview overview={data.overview} />
        </Layout.Section>

        {/* Trend Charts */}
        <Layout.Section>
          <TrendCharts trends={data.trends} />
        </Layout.Section>

        {/* Recommender Breakdown Table */}
        <Layout.Section>
          <RecommenderBreakdownTable recommenders={data.recommenders} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * Generate CSV data from performance data
 */
function generateCSVData(data: PerformanceData): string {
  let csv = 'Recommender,Actions,Approval Rate,Avg Confidence,ROI\n';
  
  data.recommenders.forEach(rec => {
    csv += `${rec.name},${rec.actionsCount},${rec.approvalRate}%,${rec.avgConfidence}%,$${rec.roi}\n`;
  });
  
  return csv;
}

/**
 * Download CSV file
 */
function downloadCSV(csvData: string, filename: string): void {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

