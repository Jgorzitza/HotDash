/**
 * Stock Risk Dashboard Tile
 * 
 * Displays top 5 critical inventory items with days until stockout
 * Manager-specified path: app/components/dashboard/StockRiskTile.tsx
 */

import { type InventoryStatus } from "../../services/inventory/status";
import { classifyStockRisk, getCriticalItems, type RiskLevel } from "../../lib/inventory/risk-classifier";

export interface StockRiskItem {
  id: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  quantity: number;
  daysOfCover: number | null;
  status: InventoryStatus;
  reorderPoint: number;
}

export interface StockRiskTileProps {
  items: StockRiskItem[];
}

/**
 * Stock Risk Tile Component
 * 
 * Note: In React Router 7, this would be used with a loader:
 * 
 * ```tsx
 * // In route file: app/routes/dashboard.tsx
 * export async function loader() {
 *   const inventory = await fetchInventory();
 *   const items = inventory.map(item => ({
 *     ...item,
 *     daysOfCover: calculateDaysOfCover(item.quantity, item.avgDailySales),
 *     status: evaluateInventoryStatus(item.quantity, item.rop, item.safety)
 *   }));
 *   return { items };
 * }
 * 
 * export default function Dashboard({ loaderData }) {
 *   return <StockRiskTile items={loaderData.items} />;
 * }
 * ```
 */
export function StockRiskTile({ items }: StockRiskTileProps) {
  const criticalItems = getCriticalItems(items).slice(0, 5);

  if (criticalItems.length === 0) {
    return (
      <div className="stock-risk-tile tile-ok">
        <h2>Stock Risk</h2>
        <div className="status-ok">
          <p>✓ All inventory levels healthy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-risk-tile tile-critical">
      <h2>Stock Risk - {criticalItems.length} Critical Item{criticalItems.length > 1 ? "s" : ""}</h2>
      <div className="critical-items">
        {criticalItems.map((item) => (
          <div key={item.id} className="critical-item">
            <div className="item-info">
              <h3>{item.productTitle}</h3>
              {item.variantTitle !== "Default" && (
                <span className="variant">{item.variantTitle}</span>
              )}
              {item.sku && <span className="sku">SKU: {item.sku}</span>}
            </div>
            <div className="item-status">
              <div className={`risk-badge risk-${item.risk.level}`}>
                {item.risk.level.toUpperCase()}
              </div>
              <div className="stock-info">
                <span className="quantity">{item.quantity} units</span>
                {item.daysOfCover !== null && (
                  <span className="days-remaining">
                    {item.daysOfCover.toFixed(1)} days left
                  </span>
                )}
              </div>
            </div>
            <div className="item-message">{item.risk.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Get risk level badge color
 */
function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "#ef4444"; // red
    case "warning":
      return "#f59e0b"; // amber
    case "ok":
      return "#10b981"; // green
  }
}

/**
 * CSS Styles (to be added to app stylesheet)
 * 
 * ```css
 * .stock-risk-tile {
 *   padding: 1.5rem;
 *   border-radius: 0.5rem;
 *   background: white;
 *   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
 * }
 * 
 * .stock-risk-tile h2 {
 *   font-size: 1.25rem;
 *   font-weight: 600;
 *   margin-bottom: 1rem;
 * }
 * 
 * .critical-item {
 *   padding: 1rem;
 *   margin-bottom: 0.75rem;
 *   border-left: 4px solid #ef4444;
 *   background: #fef2f2;
 *   border-radius: 0.25rem;
 * }
 * 
 * .risk-badge {
 *   display: inline-block;
 *   padding: 0.25rem 0.5rem;
 *   border-radius: 0.25rem;
 *   font-size: 0.75rem;
 *   font-weight: 600;
 * }
 * 
 * .risk-critical { background: #fee2e2; color: #991b1b; }
 * .risk-warning { background: #fef3c7; color: #92400e; }
 * .risk-ok { background: #d1fae5; color: #065f46; }
 * ```
 */
