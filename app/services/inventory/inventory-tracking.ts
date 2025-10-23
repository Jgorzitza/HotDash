import { prisma } from "~/db.server";
import { logDecision } from "~/services/decisions.server";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

export interface InventoryUpdate {
  variantId: string;
  sku: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeType: 'increase' | 'decrease' | 'adjustment';
  changeAmount: number;
  reason: string;
  timestamp: Date;
  userId?: string;
}

export interface InventoryAlert {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_point' | 'negative_stock';
  currentStock: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface RealtimeInventoryData {
  variantId: string;
  sku: string;
  productName: string;
  currentStock: number;
  availableStock: number;
  committedStock: number;
  incomingStock: number;
  averageLandedCost: number;
  lastUpdated: Date;
  location: string;
}

export interface InventoryTrackingConfig {
  lowStockThreshold: number;
  reorderPoint: number;
  overstockThreshold: number;
  alertFrequency: number; // minutes
  enableRealtimeUpdates: boolean;
  enableAlerts: boolean;
}

export class InventoryTrackingService {
  private io: SocketIOServer;
  private config: InventoryTrackingConfig;

  constructor(io: SocketIOServer, config: InventoryTrackingConfig) {
    this.io = io;
    this.config = config;
    this.setupSocketHandlers();
  }

  /**
   * Setup Socket.IO event handlers for real-time inventory tracking
   */
  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join inventory tracking room
      socket.join('inventory-tracking');

      // Handle subscription to specific variants
      socket.on('subscribe-variant', (variantId: string) => {
        socket.join(`variant-${variantId}`);
        console.log(`Client ${socket.id} subscribed to variant ${variantId}`);
      });

      // Handle unsubscription from variants
      socket.on('unsubscribe-variant', (variantId: string) => {
        socket.leave(`variant-${variantId}`);
        console.log(`Client ${socket.id} unsubscribed from variant ${variantId}`);
      });

      // Handle inventory update requests
      socket.on('request-inventory-update', async (variantId: string) => {
        try {
          const inventoryData = await this.getRealtimeInventoryData(variantId);
          socket.emit('inventory-update', inventoryData);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get inventory data', error: error.message });
        }
      });

      // Handle bulk inventory update requests
      socket.on('request-bulk-inventory-update', async (variantIds: string[]) => {
        try {
          const inventoryData = await this.getBulkRealtimeInventoryData(variantIds);
          socket.emit('bulk-inventory-update', inventoryData);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get bulk inventory data', error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Track inventory changes and broadcast real-time updates
   */
  async trackInventoryChange(update: InventoryUpdate): Promise<void> {
    try {
      // Log the inventory change to database
      await prisma.inventory_change_log.create({
        data: {
          variantId: update.variantId,
          previousStock: update.previousStock,
          newStock: update.newStock,
          changeType: update.changeType,
          changeAmount: update.changeAmount,
          reason: update.reason,
          userId: update.userId,
          timestamp: update.timestamp,
        },
      });

      // Update current stock in database
      await prisma.product_variant.update({
        where: { id: update.variantId },
        data: {
          onHand: update.newStock,
          updatedAt: new Date(),
        },
      });

      // Broadcast real-time update to all connected clients
      if (this.config.enableRealtimeUpdates) {
        const realtimeData = await this.getRealtimeInventoryData(update.variantId);
        
        // Broadcast to all inventory tracking clients
        this.io.to('inventory-tracking').emit('inventory-change', {
          update,
          realtimeData,
        });

        // Broadcast to specific variant subscribers
        this.io.to(`variant-${update.variantId}`).emit('variant-update', {
          update,
          realtimeData,
        });
      }

      // Check for alerts
      if (this.config.enableAlerts) {
        await this.checkAndCreateAlerts(update.variantId, update.newStock);
      }

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "track_inventory_change",
        rationale: `Tracked inventory change for variant ${update.variantId}: ${update.changeType} of ${update.changeAmount} units`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "completed",
        progressPct: 100,
      });
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "track_inventory_change_error",
        rationale: `Failed to track inventory change: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Get real-time inventory data for a specific variant
   */
  async getRealtimeInventoryData(variantId: string): Promise<RealtimeInventoryData> {
    try {
      const variant = await prisma.product_variant.findUnique({
        where: { id: variantId },
        include: {
          product: true,
          inventory_levels: {
            where: { available: { gt: 0 } },
            include: { location: true },
          },
        },
      });

      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }

      const currentStock = variant.onHand || 0;
      const availableStock = variant.inventory_levels.reduce(
        (sum, level) => sum + level.available,
        0
      );
      const committedStock = variant.inventory_levels.reduce(
        (sum, level) => sum + (level.committed || 0),
        0
      );
      const incomingStock = variant.inventory_levels.reduce(
        (sum, level) => sum + (level.incoming || 0),
        0
      );

      const realtimeData: RealtimeInventoryData = {
        variantId: variant.id,
        sku: variant.sku || '',
        productName: variant.product?.title || '',
        currentStock,
        availableStock,
        committedStock,
        incomingStock,
        averageLandedCost: variant.averageLandedCost || 0,
        lastUpdated: variant.updatedAt,
        location: variant.inventory_levels[0]?.location?.name || 'Unknown',
      };

      return realtimeData;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_realtime_inventory_data_error",
        rationale: `Failed to get real-time inventory data: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Get real-time inventory data for multiple variants
   */
  async getBulkRealtimeInventoryData(variantIds: string[]): Promise<RealtimeInventoryData[]> {
    try {
      const variants = await prisma.product_variant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: true,
          inventory_levels: {
            where: { available: { gt: 0 } },
            include: { location: true },
          },
        },
      });

      const realtimeData: RealtimeInventoryData[] = variants.map(variant => {
        const currentStock = variant.onHand || 0;
        const availableStock = variant.inventory_levels.reduce(
          (sum, level) => sum + level.available,
          0
        );
        const committedStock = variant.inventory_levels.reduce(
          (sum, level) => sum + (level.committed || 0),
          0
        );
        const incomingStock = variant.inventory_levels.reduce(
          (sum, level) => sum + (level.incoming || 0),
          0
        );

        return {
          variantId: variant.id,
          sku: variant.sku || '',
          productName: variant.product?.title || '',
          currentStock,
          availableStock,
          committedStock,
          incomingStock,
          averageLandedCost: variant.averageLandedCost || 0,
          lastUpdated: variant.updatedAt,
          location: variant.inventory_levels[0]?.location?.name || 'Unknown',
        };
      });

      return realtimeData;
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_bulk_realtime_inventory_data_error",
        rationale: `Failed to get bulk real-time inventory data: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Check for inventory alerts and create them if needed
   */
  async checkAndCreateAlerts(variantId: string, currentStock: number): Promise<void> {
    try {
      const variant = await prisma.product_variant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant) return;

      const alerts: Partial<InventoryAlert>[] = [];

      // Check for low stock alert
      if (currentStock <= this.config.lowStockThreshold && currentStock > 0) {
        alerts.push({
          variantId,
          sku: variant.sku || '',
          productName: variant.product?.title || '',
          alertType: 'low_stock',
          currentStock,
          threshold: this.config.lowStockThreshold,
          severity: currentStock <= this.config.reorderPoint ? 'critical' : 'high',
          message: `Low stock alert: ${variant.sku} has ${currentStock} units remaining`,
        });
      }

      // Check for out of stock alert
      if (currentStock <= 0) {
        alerts.push({
          variantId,
          sku: variant.sku || '',
          productName: variant.product?.title || '',
          alertType: 'out_of_stock',
          currentStock,
          threshold: 0,
          severity: 'critical',
          message: `Out of stock: ${variant.sku} has no units available`,
        });
      }

      // Check for overstock alert
      if (currentStock >= this.config.overstockThreshold) {
        alerts.push({
          variantId,
          sku: variant.sku || '',
          productName: variant.product?.title || '',
          alertType: 'overstock',
          currentStock,
          threshold: this.config.overstockThreshold,
          severity: 'medium',
          message: `Overstock alert: ${variant.sku} has ${currentStock} units (threshold: ${this.config.overstockThreshold})`,
        });
      }

      // Check for negative stock alert
      if (currentStock < 0) {
        alerts.push({
          variantId,
          sku: variant.sku || '',
          productName: variant.product?.title || '',
          alertType: 'negative_stock',
          currentStock,
          threshold: 0,
          severity: 'critical',
          message: `Negative stock: ${variant.sku} has ${currentStock} units (data integrity issue)`,
        });
      }

      // Create alerts in database
      for (const alert of alerts) {
        const createdAlert = await prisma.inventory_alert.create({
          data: {
            variantId: alert.variantId!,
            alertType: alert.alertType!,
            currentStock: alert.currentStock!,
            threshold: alert.threshold!,
            severity: alert.severity!,
            message: alert.message!,
            acknowledged: false,
          },
        });

        // Broadcast alert to connected clients
        this.io.to('inventory-tracking').emit('inventory-alert', createdAlert);
        this.io.to(`variant-${variantId}`).emit('variant-alert', createdAlert);
      }

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "check_and_create_alerts",
        rationale: `Checked alerts for variant ${variantId}, created ${alerts.length} alerts`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "completed",
        progressPct: 100,
      });
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "check_and_create_alerts_error",
        rationale: `Failed to check and create alerts: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Get active alerts for a variant
   */
  async getActiveAlerts(variantId?: string): Promise<InventoryAlert[]> {
    try {
      const whereClause = variantId ? { variantId } : {};
      
      const alerts = await prisma.inventory_alert.findMany({
        where: {
          ...whereClause,
          acknowledged: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return alerts.map(alert => ({
        id: alert.id,
        variantId: alert.variantId,
        sku: alert.sku || '',
        productName: alert.productName || '',
        alertType: alert.alertType as any,
        currentStock: alert.currentStock,
        threshold: alert.threshold,
        severity: alert.severity as any,
        message: alert.message,
        createdAt: alert.createdAt,
        acknowledged: alert.acknowledged,
        acknowledgedBy: alert.acknowledgedBy || undefined,
        acknowledgedAt: alert.acknowledgedAt || undefined,
      }));
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_active_alerts_error",
        rationale: `Failed to get active alerts: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      await prisma.inventory_alert.update({
        where: { id: alertId },
        data: {
          acknowledged: true,
          acknowledgedBy,
          acknowledgedAt: new Date(),
        },
      });

      // Broadcast alert acknowledgment
      this.io.to('inventory-tracking').emit('alert-acknowledged', {
        alertId,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      });

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "acknowledge_alert",
        rationale: `Alert ${alertId} acknowledged by ${acknowledgedBy}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "completed",
        progressPct: 100,
      });
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "acknowledge_alert_error",
        rationale: `Failed to acknowledge alert: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Get inventory change history for a variant
   */
  async getInventoryChangeHistory(
    variantId: string,
    limit: number = 50
  ): Promise<InventoryUpdate[]> {
    try {
      const changes = await prisma.inventory_change_log.findMany({
        where: { variantId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return changes.map(change => ({
        variantId: change.variantId,
        sku: '', // Would need to join with variant table
        productName: '', // Would need to join with product table
        previousStock: change.previousStock,
        newStock: change.newStock,
        changeType: change.changeType as any,
        changeAmount: change.changeAmount,
        reason: change.reason,
        timestamp: change.timestamp,
        userId: change.userId || undefined,
      }));
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "get_inventory_change_history_error",
        rationale: `Failed to get inventory change history: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }

  /**
   * Update tracking configuration
   */
  async updateTrackingConfig(newConfig: Partial<InventoryTrackingConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };

      // Broadcast configuration update
      this.io.to('inventory-tracking').emit('config-updated', this.config);

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "update_tracking_config",
        rationale: `Updated tracking configuration: ${JSON.stringify(newConfig)}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "completed",
        progressPct: 100,
      });
    } catch (error) {
      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "update_tracking_config_error",
        rationale: `Failed to update tracking configuration: ${error}`,
        evidenceUrl: "app/services/inventory/inventory-tracking.ts",
        status: "failed",
        progressPct: 0,
      });
      throw error;
    }
  }
}
