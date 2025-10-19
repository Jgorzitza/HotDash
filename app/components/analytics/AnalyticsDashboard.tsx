/**
 * AnalyticsDashboard Component
 *
 * Displays all analytics metrics in a grid layout.
 * Fetches data from analytics API endpoints and handles loading/error states.
 */

import { useState, useEffect } from "react";
import { Layout, Page, BlockStack } from "@shopify/polaris";
import { MetricTile } from "./MetricTile";
import type {
  RevenueResponse,
  ConversionResponse,
  TrafficResponse,
  IdeaPoolResponse,
} from "../../lib/analytics/schemas";

// ============================================================================
// Types
// ============================================================================

interface DashboardData {
  revenue: RevenueResponse | null;
  conversion: ConversionResponse | null;
  traffic: TrafficResponse | null;
  ideaPool: IdeaPoolResponse | null;
}

interface LoadingState {
  revenue: boolean;
  conversion: boolean;
  traffic: boolean;
  ideaPool: boolean;
}

interface ErrorState {
  revenue: string | null;
  conversion: string | null;
  traffic: string | null;
  ideaPool: string | null;
}

// ============================================================================
// Component
// ============================================================================

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData>({
    revenue: null,
    conversion: null,
    traffic: null,
    ideaPool: null,
  });

  const [loading, setLoading] = useState<LoadingState>({
    revenue: true,
    conversion: true,
    traffic: true,
    ideaPool: true,
  });

  const [errors, setErrors] = useState<ErrorState>({
    revenue: null,
    conversion: null,
    traffic: null,
    ideaPool: null,
  });

  // Fetch all metrics on mount
  useEffect(() => {
    fetchAllMetrics();
  }, []);

  async function fetchAllMetrics() {
    await Promise.all([
      fetchRevenue(),
      fetchConversion(),
      fetchTraffic(),
      fetchIdeaPool(),
    ]);
  }

  async function fetchRevenue() {
    try {
      setLoading((prev) => ({ ...prev, revenue: true }));
      const response = await fetch("/api/analytics/revenue");
      const data = await response.json();
      setData((prev) => ({ ...prev, revenue: data }));
      setErrors((prev) => ({ ...prev, revenue: null }));
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        revenue: error.message || "Failed to load revenue",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, revenue: false }));
    }
  }

  async function fetchConversion() {
    try {
      setLoading((prev) => ({ ...prev, conversion: true }));
      const response = await fetch("/api/analytics/conversion-rate");
      const data = await response.json();
      setData((prev) => ({ ...prev, conversion: data }));
      setErrors((prev) => ({ ...prev, conversion: null }));
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        conversion: error.message || "Failed to load conversion rate",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, conversion: false }));
    }
  }

  async function fetchTraffic() {
    try {
      setLoading((prev) => ({ ...prev, traffic: true }));
      const response = await fetch("/api/analytics/traffic");
      const data = await response.json();
      setData((prev) => ({ ...prev, traffic: data }));
      setErrors((prev) => ({ ...prev, traffic: null }));
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        traffic: error.message || "Failed to load traffic",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, traffic: false }));
    }
  }

  async function fetchIdeaPool() {
    try {
      setLoading((prev) => ({ ...prev, ideaPool: true }));
      const response = await fetch("/api/analytics/idea-pool");
      const json = await response.json();
      setData((prev) => ({ ...prev, ideaPool: json }));
      setErrors((prev) => ({ ...prev, ideaPool: null }));
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        ideaPool: error.message || "Failed to load idea pool",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, ideaPool: false }));
    }
  }

  return (
    <Page title="Analytics Dashboard">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section variant="oneThird">
            <MetricTile
              title="Revenue"
              value={data.revenue?.revenue || 0}
              change={data.revenue?.change}
              period={data.revenue?.period}
              loading={loading.revenue}
              error={errors.revenue || undefined}
              format="currency"
              currency={data.revenue?.currency || "USD"}
            />
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <MetricTile
              title="Conversion Rate"
              value={data.conversion?.conversionRate || 0}
              change={data.conversion?.change}
              period={data.conversion?.period}
              loading={loading.conversion}
              error={errors.conversion || undefined}
              format="percentage"
            />
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <MetricTile
              title="Sessions"
              value={data.traffic?.sessions || 0}
              period={data.traffic?.period}
              loading={loading.traffic}
              error={errors.traffic || undefined}
              format="number"
            />
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneThird">
            <MetricTile
              title="Users"
              value={data.traffic?.users || 0}
              period={data.traffic?.period}
              loading={loading.traffic}
              error={errors.traffic || undefined}
              format="number"
            />
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <MetricTile
              title="Pageviews"
              value={data.traffic?.pageviews || 0}
              period={data.traffic?.period}
              loading={loading.traffic}
              error={errors.traffic || undefined}
              format="number"
            />
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <MetricTile
              title="Pending Ideas"
              value={data.ideaPool?.data?.totals?.pending || 0}
              period="Idea Pool"
              loading={loading.ideaPool}
              error={errors.ideaPool || undefined}
              format="number"
            />
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
