import type { InventoryAlert } from "../../services/shopify/types";

interface InventoryHeatmapTileProps {
  alerts: InventoryAlert[];
}

export function InventoryHeatmapTile({ alerts }: InventoryHeatmapTileProps) {
  return (
    <>
      {alerts.length ? (
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.1rem",
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-1)",
            color: "var(--occ-text-primary)",
          }}
        >
          {alerts.map((alert) => (
            <li key={alert.variantId}>
              {alert.title}: {alert.quantityAvailable} left
              {alert.daysOfCover != null
                ? ` • ${alert.daysOfCover} days of cover`
                : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          No low stock alerts right now.
        </p>
      )}
    </>
  );
}
