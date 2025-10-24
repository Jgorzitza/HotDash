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
export interface InventoryHealthMetrics {
    overallHealth: 'healthy' | 'warning' | 'critical';
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    overstock: number;
    activeAlerts: number;
    criticalAlerts: number;
    ropCompliance: number;
    avgDaysToStockout: number;
    emergencySourcingNeeded: number;
    lastUpdated: string;
}
interface InventoryHealthDashboardProps {
    metrics?: InventoryHealthMetrics;
    autoRefresh?: boolean;
    refreshInterval?: number;
    onRefresh?: () => void;
}
export declare function InventoryHealthDashboard({ metrics, autoRefresh, refreshInterval, // 1 minute
onRefresh, }: InventoryHealthDashboardProps): React.JSX.Element;
export default InventoryHealthDashboard;
//# sourceMappingURL=InventoryHealthDashboard.d.ts.map