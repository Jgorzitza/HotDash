import { useState } from "react";

import type { InventoryAlert } from "../../services/shopify/types";
import { InventoryModal } from "../modals";

interface InventoryHeatmapTileProps {
  alerts: InventoryAlert[];
  enableModal?: boolean;
}

export function InventoryHeatmapTile({
  alerts,
  enableModal = false,
}: InventoryHeatmapTileProps) {
  const [selectedAlert, setSelectedAlert] = useState<InventoryAlert | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (alert: InventoryAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

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
              {enableModal ? (
                <button
                  type="button"
                  className="occ-link-button"
                  onClick={() => openModal(alert)}
                  style={{ textAlign: "left" }}
                >
                  {alert.title}: {alert.quantityAvailable} left
                  {alert.daysOfCover != null
                    ? ` • ${alert.daysOfCover} days of cover`
                    : ""}
                </button>
              ) : (
                <span>
                  {alert.title}: {alert.quantityAvailable} left
                  {alert.daysOfCover != null
                    ? ` • ${alert.daysOfCover} days of cover`
                    : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          No low stock alerts right now.
        </p>
      )}
      {enableModal && isModalOpen && selectedAlert ? (
        <InventoryModal
          alert={selectedAlert}
          open={isModalOpen}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}
