import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, Spinner } from "@shopify/polaris";
import { RevenueTile } from "../components/dashboard/RevenueTile";
import { RevenueTileEnhanced } from "../components/dashboard/RevenueTileEnhanced";


interface TileData {
  status: "ok" | "loading" | "error";
  value?: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  error?: string;
}

interface DashboardData {
  mode: "dev:test" | "live";
  tiles: {
    revenue: TileData;
    aov: TileData;
    returns: TileData;
    stockRisk: TileData;
    seo: TileData;
    cx: TileData;
    approvals: TileData;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const modeParam = url.searchParams.get("mode") as DashboardData["mode"] | null;
  const override = process.env.HOTDASH_DASHBOARD_MODE as DashboardData["mode"] | undefined;
  const isTest = process.env.NODE_ENV === "test";
  const envDefault: DashboardData["mode"] = isTest
    ? (override ?? "dev:test")
    : (override ?? "live");
  const mode: DashboardData["mode"] = modeParam ?? envDefault;

  if (mode === "live") {
    // Live mode: fetch from internal APIs with graceful fallback per tile
    const tiles: DashboardData["tiles"] = {
      revenue: { status: "loading" },
      aov: { status: "loading" },
      returns: { status: "loading" },
      stockRisk: { status: "loading" },
      seo: { status: "loading" },
      cx: { status: "loading" },
      approvals: { status: "loading" },
    };

    // Fetch revenue first; others remain fixtures for now
    try {
      const res = await fetch(new URL("/api/shopify/revenue", url.origin));
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const nf = new Intl.NumberFormat(undefined, { style: "currency", currency: data.currency || "USD" });
      tiles.revenue = {
        status: "ok",
        value: nf.format(data.totalRevenue || 0),
        subtitle: `${data.orderCount ?? 0} orders (last ${data.windowDays ?? 30}d)`,
        trend: "neutral",
      };
    } catch (e: any) {
      tiles.revenue = { status: "error", error: "Revenue unavailable" };
    }

    // Fetch AOV
    try {
      const res = await fetch(new URL("/api/shopify/aov", url.origin));
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const nf = new Intl.NumberFormat(undefined, { style: "currency", currency: data.currency || "USD" });
      tiles.aov = {
        status: "ok",
        value: nf.format(data.averageOrderValue || 0),
        subtitle: `Avg over ${data.windowDays ?? 30}d (${data.orderCount ?? 0} orders)`,
        trend: "neutral",
      };
    } catch (e: any) {
      tiles.aov = { status: "error", error: "AOV unavailable" };
    }
    tiles.returns = { status: "ok", value: "3", subtitle: "2 pending review", trend: "neutral" };
    tiles.stockRisk = { status: "ok", value: "2 SKUs", subtitle: "Below reorder point", trend: "down" };
    tiles.seo = { status: "ok", value: "1 alert", subtitle: "/collections/new -24% WoW", trend: "down" };
    tiles.cx = { status: "ok", value: "1 escalation", subtitle: "SLA breached 3h ago", trend: "down" };
    tiles.approvals = { status: "ok", value: "0 pending", subtitle: "All clear", trend: "neutral" };

    return Response.json({ mode: "live", tiles });
  }

  // Default dev fixture
  const data: DashboardData = {
    mode: "dev:test",
    tiles: {
      revenue: { status: "ok", value: "$8,425.50", subtitle: "58 orders today", trend: "up" },
      aov: { status: "ok", value: "$145.27", subtitle: "+12% vs yesterday", trend: "up" },
      returns: { status: "ok", value: "3", subtitle: "2 pending review", trend: "neutral" },
      stockRisk: { status: "ok", value: "2 SKUs", subtitle: "Below reorder point", trend: "down" },
      seo: { status: "ok", value: "1 alert", subtitle: "/collections/new -24% WoW", trend: "down" },
      cx: { status: "ok", value: "1 escalation", subtitle: "SLA breached 3h ago", trend: "down" },
      approvals: { status: "ok", value: "0 pending", subtitle: "All clear", trend: "neutral" },
    },
  };
  return Response.json(data);
}

interface TileProps {
  title: string;
  data: TileData;
  testId?: string;
}

function DashboardTile({ title, data, testId }: TileProps) {
  let content;
  if (data.status === "loading") {
    content = (
      <BlockStack gap="400" align="center">
        <Spinner size="small" />
        <Text as="p" tone="subdued">Loading...</Text>
      </BlockStack>
    );
  } else if (data.status === "error") {
    content = (
      <BlockStack gap="200">
        <Text as="p" tone="critical">Error loading data</Text>
        {data.error && <Text as="p" tone="subdued" variant="bodySm">{data.error}</Text>}
      </BlockStack>
    );
  } else {
    content = (
      <BlockStack gap="200">
        <Text as="h2" variant="heading2xl">{data.value}</Text>
        {data.subtitle && (
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">{data.subtitle}</Text>
            {data.trend && data.trend !== "neutral" && (
              <Badge tone={data.trend === "up" ? "success" : "critical"}>{data.trend === "up" ? "↑" : "↓"}</Badge>
            )}
          </InlineStack>
        )}
      </BlockStack>
    );
  }
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">{title}</Text>
        <div data-testid={testId}>{content}</div>
      </BlockStack>
    </Card>
  );
}

export default function Dashboard() {
  const data = useLoaderData<DashboardData>();
  return (
    <Page title="Operator Control Center" subtitle="Live metrics and control levers">
      {data.mode === "dev:test" && (
        <div style={{ marginBottom: "var(--p-space-500)", padding: "var(--p-space-400)", border: "1px dashed var(--p-color-border-subdued)", borderRadius: "var(--p-border-radius-200)", background: "var(--p-color-bg-surface-secondary)" }}>
          <Text as="p" tone="subdued"><strong>Dev Mode:</strong> Displaying fixture data only.</Text>
        </div>
      )}
      <Layout>
        <Layout.Section variant="oneThird">
          {data.tiles.revenue.status !== "ok" ? (
            <DashboardTile title="Revenue" data={data.tiles.revenue} testId="tile-revenue" />
          ) : (
            data.mode === "dev:test" ? (
              <RevenueTileEnhanced
                value={String(data.tiles.revenue.value ?? "$0.00")}
                orderCount={(() => { const m = String(data.tiles.revenue.subtitle ?? "").match(/\d+/); return m ? parseInt(m[0], 10) : 0; })()}
                trend={(data.tiles.revenue.trend ?? "neutral") as any}
                sparklineData={[
                  { date: "2025-10-12", value: 100 },
                  { date: "2025-10-13", value: 140 },
                  { date: "2025-10-14", value: 120 },
                  { date: "2025-10-15", value: 180 },
                  { date: "2025-10-16", value: 160 },
                ]}
                anomalies={[{ date: "2025-10-15", reason: "Promo spike" }]}
              />
            ) : (
              <RevenueTile
                value={String(data.tiles.revenue.value ?? "$0.00")}
                orderCount={(() => { const m = String(data.tiles.revenue.subtitle ?? "").match(/\d+/); return m ? parseInt(m[0], 10) : 0; })()}
                trend={(data.tiles.revenue.trend ?? "neutral") as any}
              />
            )
          )}
        </Layout.Section>
        <Layout.Section variant="oneThird"><DashboardTile title="Average Order Value" data={data.tiles.aov} testId="tile-aov" /></Layout.Section>
        <Layout.Section variant="oneThird"><DashboardTile title="Returns" data={data.tiles.returns} testId="tile-returns" /></Layout.Section>
        <Layout.Section variant="oneThird"><DashboardTile title="Stock Risk" data={data.tiles.stockRisk} testId="tile-stock-risk" /></Layout.Section>
        <Layout.Section variant="oneThird"><DashboardTile title="SEO Alerts" data={data.tiles.seo} testId="tile-seo" /></Layout.Section>
        <Layout.Section variant="oneThird"><DashboardTile title="CX Queue" data={data.tiles.cx} testId="tile-cx" /></Layout.Section>
        <Layout.Section variant="fullWidth"><DashboardTile title="Approvals Queue" data={data.tiles.approvals} testId="tile-approvals" /></Layout.Section>
      </Layout>
    </Page>
  );
}
