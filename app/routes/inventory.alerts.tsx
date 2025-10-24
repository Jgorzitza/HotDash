/**
 * Inventory Alerts Dashboard Route
 * 
 * INVENTORY-022: Production Inventory Monitoring & Alerts
 * 
 * Displays real-time inventory alerts, ROP notifications, and emergency sourcing triggers.
 * Provides alert acknowledgment and escalation workflow.
 */

import { useLoaderData, useRevalidator } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Page, Layout, Card, Badge, Text, Button, DataTable, Banner, InlineStack, BlockStack } from '@shopify/polaris';
import { useState, useEffect } from 'react';
import { json } from '~/utils/http.server';
import prisma from '~/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Fetch active inventory alerts from database
    const activeAlerts = await prisma.inventory_alert.findMany({
      where: {
        acknowledged: false,
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    // Fetch recent ROP suggestions
    const ropSuggestions = await prisma.reorder_suggestion.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Calculate alert summary
    const alertSummary = {
      total: activeAlerts.length,
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      medium: activeAlerts.filter(a => a.severity === 'medium').length,
      low: activeAlerts.filter(a => a.severity === 'low').length,
    };

    // Calculate ROP summary
    const ropSummary = {
      total: ropSuggestions.length,
      urgent: ropSuggestions.filter(r => (r.days_until_stockout || 999) < 7).length,
      normal: ropSuggestions.filter(r => (r.days_until_stockout || 999) >= 7).length,
    };

    return json({
      activeAlerts,
      ropSuggestions,
      alertSummary,
      ropSummary,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error loading inventory alerts:', error);
    return json({
      activeAlerts: [],
      ropSuggestions: [],
      alertSummary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
      ropSummary: { total: 0, urgent: 0, normal: 0 },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load alerts',
    });
  }
}

export default function InventoryAlertsPage() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, revalidator]);

  const getSeverityTone = (severity: string): 'critical' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'info';
    }
  };

  const getAlertTypeBadge = (alertType: string) => {
    const typeMap: Record<string, { label: string; tone: 'critical' | 'warning' | 'info' }> = {
      low_stock: { label: 'Low Stock', tone: 'warning' },
      out_of_stock: { label: 'Out of Stock', tone: 'critical' },
      overstock: { label: 'Overstock', tone: 'info' },
      reorder_point: { label: 'Reorder Point', tone: 'warning' },
      negative_stock: { label: 'Negative Stock', tone: 'critical' },
    };

    const config = typeMap[alertType] || { label: alertType, tone: 'info' as const };
    return <Badge tone={config.tone}>{config.label}</Badge>;
  };

  // Prepare alert table rows
  const alertRows = data.activeAlerts.map((alert) => [
    <Badge tone={getSeverityTone(alert.severity!)}>{alert.severity?.toUpperCase()}</Badge>,
    getAlertTypeBadge(alert.alertType!),
    <Text as="span" fontWeight="semibold">{alert.sku || 'N/A'}</Text>,
    <Text as="span">{alert.productName || 'Unknown Product'}</Text>,
    <Text as="span">{alert.currentStock || 0}</Text>,
    <Text as="span">{alert.threshold || 0}</Text>,
    <Text as="span" tone="subdued">{new Date(alert.createdAt!).toLocaleString()}</Text>,
    <Button size="slim" onClick={() => handleAcknowledgeAlert(alert.id!)}>Acknowledge</Button>,
  ]);

  // Prepare ROP table rows
  const ropRows = data.ropSuggestions.map((rop) => [
    <Text as="span" fontWeight="semibold">{rop.sku || 'N/A'}</Text>,
    <Text as="span">{rop.product_name || 'Unknown Product'}</Text>,
    <Text as="span">{rop.current_stock || 0}</Text>,
    <Text as="span">{rop.reorder_point || 0}</Text>,
    <Text as="span">{rop.recommended_order_qty || 0}</Text>,
    <Badge tone={(rop.days_until_stockout || 999) < 7 ? 'critical' : 'info'}>
      {rop.days_until_stockout || 'N/A'} days
    </Badge>,
    <Text as="span" tone="subdued">{new Date(rop.createdAt!).toLocaleString()}</Text>,
    <Button size="slim" onClick={() => handleCreatePO(rop.id!)}>Create PO</Button>,
  ]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge-alert',
          alertId,
          acknowledgedBy: 'current-user', // TODO: Get from session
        }),
      });

      if (response.ok) {
        revalidator.revalidate();
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleCreatePO = async (ropId: string) => {
    // TODO: Navigate to PO creation or trigger PO automation
  };

  return (
    <Page
      title="Inventory Alerts"
      subtitle="Real-time inventory monitoring and reorder notifications"
      primaryAction={{
        content: autoRefresh ? 'Pause Auto-Refresh' : 'Resume Auto-Refresh',
        onAction: () => setAutoRefresh(!autoRefresh),
      }}
      secondaryActions={[
        {
          content: 'Refresh Now',
          onAction: () => revalidator.revalidate(),
        },
      ]}
    >
      <BlockStack gap="400">
        {/* Alert Summary */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Alert Summary</Text>
                <InlineStack gap="400">
                  <div>
                    <Text as="p" variant="headingLg">{data.alertSummary.total}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Total Alerts</Text>
                  </div>
                  <div>
                    <Text as="p" variant="headingLg" tone="critical">{data.alertSummary.critical}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Critical</Text>
                  </div>
                  <div>
                    <Text as="p" variant="headingLg" tone="warning">{data.alertSummary.high}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">High</Text>
                  </div>
                  <div>
                    <Text as="p" variant="headingLg">{data.alertSummary.medium}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Medium</Text>
                  </div>
                  <div>
                    <Text as="p" variant="headingLg">{data.alertSummary.low}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Low</Text>
                  </div>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  Last updated: {new Date(data.lastUpdated).toLocaleString()}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">ROP Notifications</Text>
                <InlineStack gap="400">
                  <div>
                    <Text as="p" variant="headingLg">{data.ropSummary.total}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Pending Reorders</Text>
                  </div>
                  <div>
                    <Text as="p" variant="headingLg" tone="critical">{data.ropSummary.urgent}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Urgent (&lt; 7 days)</Text>
                  </div>
                  <div>
                    <Text as="p" variant="headingLg">{data.ropSummary.normal}</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Normal</Text>
                  </div>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Active Alerts Table */}
        {data.alertSummary.total > 0 && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Active Alerts</Text>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'numeric', 'text', 'text']}
                headings={['Severity', 'Type', 'SKU', 'Product', 'Current', 'Threshold', 'Created', 'Action']}
                rows={alertRows}
              />
            </BlockStack>
          </Card>
        )}

        {/* ROP Suggestions Table */}
        {data.ropSummary.total > 0 && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Reorder Point Notifications</Text>
              <DataTable
                columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'text', 'text', 'text']}
                headings={['SKU', 'Product', 'Current', 'ROP', 'Recommended Qty', 'Days to Stockout', 'Created', 'Action']}
                rows={ropRows}
              />
            </BlockStack>
          </Card>
        )}

        {/* Empty State */}
        {data.alertSummary.total === 0 && data.ropSummary.total === 0 && (
          <Banner tone="success">
            <p>No active alerts or reorder notifications. Inventory levels are healthy!</p>
          </Banner>
        )}

        {/* Error State */}
        {data.error && (
          <Banner tone="critical">
            <p>{data.error}</p>
          </Banner>
        )}
      </BlockStack>
    </Page>
  );
}

