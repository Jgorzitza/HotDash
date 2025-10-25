import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { InventoryTrackingService } from "~/services/inventory/inventory-tracking";
import { logDecision } from "~/services/decisions.server";
import prisma from "~/db.server";

// This would be initialized elsewhere in the app
let inventoryTracking: InventoryTrackingService | null = null;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "get-realtime-data":
        const variantId = url.searchParams.get("variantId");
        if (!variantId) {
          return json({ error: "variantId is required" }, { status: 400 });
        }

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        const realtimeData = await inventoryTracking.getRealtimeInventoryData(variantId);
        return json({ data: realtimeData });

      case "get-bulk-realtime-data":
        const variantIds = url.searchParams.get("variantIds")?.split(",");
        if (!variantIds || variantIds.length === 0) {
          return json({ error: "variantIds are required" }, { status: 400 });
        }

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        const bulkData = await inventoryTracking.getBulkRealtimeInventoryData(variantIds);
        return json({ data: bulkData });

      case "get-active-alerts":
        const variantIdForAlerts = url.searchParams.get("variantId");
        
        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        const alerts = await inventoryTracking.getActiveAlerts(variantIdForAlerts || undefined);
        return json({ data: alerts });

      case "get-change-history":
        const variantIdForHistory = url.searchParams.get("variantId");
        const limit = parseInt(url.searchParams.get("limit") || "50");

        if (!variantIdForHistory) {
          return json({ error: "variantId is required" }, { status: 400 });
        }

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        const history = await inventoryTracking.getInventoryChangeHistory(variantIdForHistory, limit);
        return json({ data: history });

      case "get-server-stats":
        // This would require access to the socket server
        return json({ 
          data: { 
            message: "Server stats not available in this endpoint",
            timestamp: new Date().toISOString()
          }
        });

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "inventory_tracking_api_error",
      rationale: `API error in inventory tracking: ${error}`,
      evidenceUrl: "app/routes/api/inventory.tracking.ts",
      status: "failed",
      progressPct: 0,
    });

    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "track-inventory-change":
        const variantId = formData.get("variantId") as string;
        const previousStock = parseFloat(formData.get("previousStock") as string);
        const newStock = parseFloat(formData.get("newStock") as string);
        const changeType = formData.get("changeType") as "increase" | "decrease" | "adjustment";
        const reason = formData.get("reason") as string;
        const userId = formData.get("userId") as string;

        if (!variantId || isNaN(previousStock) || isNaN(newStock) || !changeType || !reason) {
          return json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        const changeAmount = newStock - previousStock;
        const update = {
          variantId,
          sku: "", // Would be populated from database
          productName: "", // Would be populated from database
          previousStock,
          newStock,
          changeType,
          changeAmount,
          reason,
          timestamp: new Date(),
          userId: userId || undefined,
        };

        await inventoryTracking.trackInventoryChange(update);

        await logDecision({
          scope: "build",
          actor: "inventory",
          action: "track_inventory_change_api",
          rationale: `Tracked inventory change via API for variant ${variantId}`,
          evidenceUrl: "app/routes/api/inventory.tracking.ts",
          status: "completed",
          progressPct: 100,
        });

        return json({ success: true, message: "Inventory change tracked successfully" });

      case "acknowledge-alert":
        const alertId = formData.get("alertId") as string;
        const acknowledgedBy = formData.get("acknowledgedBy") as string;

        if (!alertId || !acknowledgedBy) {
          return json({ error: "Missing required fields: alertId and acknowledgedBy" }, { status: 400 });
        }

        try {
          const updatedAlert = await prisma.inventory_alert.update({
            where: { id: alertId },
            data: {
              acknowledged: true,
              acknowledgedBy,
              acknowledgedAt: new Date(),
            },
          });

          await logDecision({
            scope: "build",
            actor: "inventory",
            action: "acknowledge_alert",
            rationale: `Alert ${alertId} acknowledged by ${acknowledgedBy}`,
            evidenceUrl: "app/routes/api/inventory.tracking.ts",
            status: "completed",
            progressPct: 100,
          });

          return json({
            success: true,
            message: "Alert acknowledged successfully",
            alert: updatedAlert,
          });
        } catch (error) {
          console.error("Failed to acknowledge alert:", error);
          return json({ error: "Failed to acknowledge alert" }, { status: 500 });
        }

      case "acknowledge-alert":
        const alertId = formData.get("alertId") as string;
        const acknowledgedBy = formData.get("acknowledgedBy") as string;

        if (!alertId || !acknowledgedBy) {
          return json({ error: "alertId and acknowledgedBy are required" }, { status: 400 });
        }

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        await inventoryTracking.acknowledgeAlert(alertId, acknowledgedBy);

        await logDecision({
          scope: "build",
          actor: "inventory",
          action: "acknowledge_alert_api",
          rationale: `Alert ${alertId} acknowledged by ${acknowledgedBy}`,
          evidenceUrl: "app/routes/api/inventory.tracking.ts",
          status: "completed",
          progressPct: 100,
        });

        return json({ success: true, message: "Alert acknowledged successfully" });

      case "update-tracking-config":
        const configData = formData.get("config") as string;
        if (!configData) {
          return json({ error: "config is required" }, { status: 400 });
        }

        const config = JSON.parse(configData);

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        await inventoryTracking.updateTrackingConfig(config);

        await logDecision({
          scope: "build",
          actor: "inventory",
          action: "update_tracking_config_api",
          rationale: `Updated tracking configuration via API`,
          evidenceUrl: "app/routes/api/inventory.tracking.ts",
          status: "completed",
          progressPct: 100,
        });

        return json({ success: true, message: "Configuration updated successfully" });

      case "bulk-inventory-update":
        const updatesData = formData.get("updates") as string;
        if (!updatesData) {
          return json({ error: "updates are required" }, { status: 400 });
        }

        const updates = JSON.parse(updatesData);

        if (!inventoryTracking) {
          return json({ error: "Inventory tracking service not initialized" }, { status: 500 });
        }

        // Process bulk updates
        for (const update of updates) {
          await inventoryTracking.trackInventoryChange(update);
        }

        await logDecision({
          scope: "build",
          actor: "inventory",
          action: "bulk_inventory_update_api",
          rationale: `Processed ${updates.length} bulk inventory updates`,
          evidenceUrl: "app/routes/api/inventory.tracking.ts",
          status: "completed",
          progressPct: 100,
        });

        return json({ success: true, message: `${updates.length} inventory updates processed successfully` });

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "inventory_tracking_action_error",
      rationale: `Action error in inventory tracking: ${error}`,
      evidenceUrl: "app/routes/api/inventory.tracking.ts",
      status: "failed",
      progressPct: 0,
    });

    return json({ error: "Internal server error" }, { status: 500 });
  }
}

// Initialize the inventory tracking service
export function initializeInventoryTracking(trackingService: InventoryTrackingService) {
  inventoryTracking = trackingService;
}
