import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { InventoryTrackingService } from "./inventory-tracking";

export interface SocketServerConfig {
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  inventoryTracking: {
    lowStockThreshold: number;
    reorderPoint: number;
    overstockThreshold: number;
    alertFrequency: number;
    enableRealtimeUpdates: boolean;
    enableAlerts: boolean;
  };
}

export class InventorySocketServer {
  private httpServer: any;
  private io: SocketIOServer;
  private inventoryTracking: InventoryTrackingService;

  constructor(config: SocketServerConfig) {
    // Create HTTP server
    this.httpServer = createServer();

    // Create Socket.IO server
    this.io = new SocketIOServer(this.httpServer, {
      cors: config.cors,
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    });

    // Initialize inventory tracking service
    this.inventoryTracking = new InventoryTrackingService(
      this.io,
      config.inventoryTracking
    );

    this.setupServer();
  }

  /**
   * Setup server event handlers and middleware
   */
  private setupServer() {
    // Authentication middleware
    this.io.use((socket, next) => {
      // Add authentication logic here
      // For now, allow all connections
      next();
    });

    // Connection handling
    this.io.on('connection', (socket) => {

      // Handle inventory tracking specific events
      socket.on('join-inventory-room', (room: string) => {
        socket.join(room);
      });

      socket.on('leave-inventory-room', (room: string) => {
        socket.leave(room);
      });

      // Handle real-time inventory requests
      socket.on('request-inventory-sync', async (data: { variantIds: string[] }) => {
        try {
          const inventoryData = await this.inventoryTracking.getBulkRealtimeInventoryData(data.variantIds);
          socket.emit('inventory-sync', inventoryData);
        } catch (error) {
          socket.emit('error', { message: 'Failed to sync inventory data', error: error.message });
        }
      });

      // Handle alert acknowledgment
      socket.on('acknowledge-alert', async (data: { alertId: string; userId: string }) => {
        try {
          await this.inventoryTracking.acknowledgeAlert(data.alertId, data.userId);
          socket.emit('alert-acknowledged', { alertId: data.alertId });
        } catch (error) {
          socket.emit('error', { message: 'Failed to acknowledge alert', error: error.message });
        }
      });

      // Handle configuration updates
      socket.on('update-tracking-config', async (config: any) => {
        try {
          await this.inventoryTracking.updateTrackingConfig(config);
          socket.emit('config-updated', config);
        } catch (error) {
          socket.emit('error', { message: 'Failed to update configuration', error: error.message });
        }
      });

      socket.on('disconnect', () => {
      });
    });

    // Error handling
    this.io.on('error', (error) => {
      console.error('Socket.IO server error:', error);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(3001, () => {
        resolve();
      });

      this.httpServer.on('error', (error: any) => {
        console.error('HTTP server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        this.httpServer.close(() => {
          resolve();
        });
      });
    });
  }

  /**
   * Get the Socket.IO server instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Get the inventory tracking service
   */
  getInventoryTracking(): InventoryTrackingService {
    return this.inventoryTracking;
  }

  /**
   * Broadcast inventory update to all connected clients
   */
  broadcastInventoryUpdate(update: any): void {
    this.io.emit('inventory-update', update);
  }

  /**
   * Broadcast alert to all connected clients
   */
  broadcastAlert(alert: any): void {
    this.io.emit('inventory-alert', alert);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.io.engine.clientsCount;
  }

  /**
   * Get server statistics
   */
  getServerStats(): {
    connectedClients: number;
    rooms: string[];
    uptime: number;
  } {
    return {
      connectedClients: this.getConnectedClientsCount(),
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
      uptime: process.uptime(),
    };
  }
}
