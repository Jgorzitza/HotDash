/**
 * Inventory Health Dashboard Component
 *
 * INVENTORY-022: Production Inventory Monitoring & Alerts
 *
 * Displays comprehensive inventory health metrics including:
 * - Overall health status
 * - Stock level distribution
 * - Alert trends
 * - ROP compliance
 * - Emergency sourcing recommendations
 */
import { Card, Badge, Text, InlineStack, BlockStack, ProgressBar } from '@shopify/polaris';
import { useState, useEffect } from 'react';
export function InventoryHealthDashboard({ metrics, autoRefresh = true, refreshInterval = 60000, // 1 minute
onRefresh, }) {
    const [localMetrics, setLocalMetrics] = useState(metrics || null);
    const [isLoading, setIsLoading] = useState(!metrics);
    // Fetch metrics if not provided
    useEffect(() => {
        if (metrics) {
            setLocalMetrics(metrics);
            setIsLoading(false);
            return;
        }
        const fetchMetrics = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/inventory/health-metrics');
                if (response.ok) {
                    const data = await response.json();
                    setLocalMetrics(data.metrics);
                }
            }
            catch (error) {
                console.error('Failed to fetch inventory health metrics:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchMetrics();
    }, [metrics]);
    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            if (onRefresh) {
                onRefresh();
            }
            else if (!metrics) {
                // Re-fetch if metrics not provided
                fetch('/api/inventory/health-metrics')
                    .then(res => res.json())
                    .then(data => setLocalMetrics(data.metrics))
                    .catch(console.error);
            }
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, onRefresh, metrics]);
    if (isLoading || !localMetrics) {
        return (<Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">Inventory Health</Text>
          <Text as="p" tone="subdued">Loading...</Text>
        </BlockStack>
      </Card>);
    }
    const getHealthTone = (health) => {
        switch (health) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'critical';
            default: return 'warning';
        }
    };
    const getHealthLabel = (health) => {
        switch (health) {
            case 'healthy': return 'Healthy';
            case 'warning': return 'Needs Attention';
            case 'critical': return 'Critical';
            default: return 'Unknown';
        }
    };
    const stockDistribution = [
        { label: 'In Stock', value: localMetrics.inStock, tone: 'success' },
        { label: 'Low Stock', value: localMetrics.lowStock, tone: 'warning' },
        { label: 'Out of Stock', value: localMetrics.outOfStock, tone: 'critical' },
        { label: 'Overstock', value: localMetrics.overstock, tone: 'info' },
    ];
    return (<Card>
      <BlockStack gap="500">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">Inventory Health Dashboard</Text>
          <Badge tone={getHealthTone(localMetrics.overallHealth)}>
            {getHealthLabel(localMetrics.overallHealth)}
          </Badge>
        </InlineStack>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <Text as="p" variant="headingLg">{localMetrics.totalProducts}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Total Products</Text>
          </div>
          <div>
            <Text as="p" variant="headingLg" tone="success">{localMetrics.inStock}</Text>
            <Text as="p" variant="bodySm" tone="subdued">In Stock</Text>
          </div>
          <div>
            <Text as="p" variant="headingLg" tone="warning">{localMetrics.lowStock}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Low Stock</Text>
          </div>
          <div>
            <Text as="p" variant="headingLg" tone="critical">{localMetrics.outOfStock}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Out of Stock</Text>
          </div>
        </div>

        {/* Stock Distribution */}
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">Stock Level Distribution</Text>
          {stockDistribution.map((item) => (<div key={item.label}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="bodySm">{item.label}</Text>
                <Text as="span" variant="bodySm" fontWeight="semibold">
                  {item.value} ({((item.value / localMetrics.totalProducts) * 100).toFixed(1)}%)
                </Text>
              </InlineStack>
              <ProgressBar progress={(item.value / localMetrics.totalProducts) * 100} tone={item.tone} size="small"/>
            </div>))}
        </BlockStack>

        {/* Alert Status */}
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">Alert Status</Text>
          <InlineStack gap="400">
            <div>
              <Text as="p" variant="headingMd">{localMetrics.activeAlerts}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Active Alerts</Text>
            </div>
            <div>
              <Text as="p" variant="headingMd" tone="critical">{localMetrics.criticalAlerts}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Critical</Text>
            </div>
            <div>
              <Text as="p" variant="headingMd" tone="warning">{localMetrics.emergencySourcingNeeded}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Emergency Sourcing</Text>
            </div>
          </InlineStack>
        </BlockStack>

        {/* ROP Compliance */}
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">Reorder Point Compliance</Text>
          <div>
            <InlineStack align="space-between" blockAlign="center">
              <Text as="span" variant="bodySm">Products Above ROP</Text>
              <Text as="span" variant="bodySm" fontWeight="semibold">
                {localMetrics.ropCompliance.toFixed(1)}%
              </Text>
            </InlineStack>
            <ProgressBar progress={localMetrics.ropCompliance} tone={localMetrics.ropCompliance >= 90 ? 'success' : localMetrics.ropCompliance >= 75 ? 'warning' : 'critical'} size="small"/>
          </div>
          <Text as="p" variant="bodySm" tone="subdued">
            Average days to stockout: {localMetrics.avgDaysToStockout.toFixed(1)} days
          </Text>
        </BlockStack>

        {/* Critical Alerts Warning */}
        {localMetrics.criticalAlerts > 0 && (<div style={{
                padding: '12px',
                backgroundColor: '#FFF4E5',
                borderLeft: '4px solid #D72C0D',
                borderRadius: '4px'
            }}>
            <Text as="p" variant="bodySm" fontWeight="semibold" tone="critical">
              ⚠️ {localMetrics.criticalAlerts} critical alert{localMetrics.criticalAlerts !== 1 ? 's' : ''} require immediate attention
            </Text>
          </div>)}

        {/* Emergency Sourcing Warning */}
        {localMetrics.emergencySourcingNeeded > 0 && (<div style={{
                padding: '12px',
                backgroundColor: '#FFF4E5',
                borderLeft: '4px solid #FFA500',
                borderRadius: '4px'
            }}>
            <Text as="p" variant="bodySm" fontWeight="semibold" tone="warning">
              🚨 {localMetrics.emergencySourcingNeeded} product{localMetrics.emergencySourcingNeeded !== 1 ? 's' : ''} may need emergency sourcing
            </Text>
          </div>)}

        {/* Last Updated */}
        <Text as="p" variant="bodySm" tone="subdued" alignment="end">
          Last updated: {new Date(localMetrics.lastUpdated).toLocaleString()}
        </Text>
      </BlockStack>
    </Card>);
}
export default InventoryHealthDashboard;
//# sourceMappingURL=InventoryHealthDashboard.js.map