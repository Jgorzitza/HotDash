import { Server as SocketIOServer } from "socket.io";
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
export declare class InventorySocketServer {
    private httpServer;
    private io;
    private inventoryTracking;
    constructor(config: SocketServerConfig);
    /**
     * Setup server event handlers and middleware
     */
    private setupServer;
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Stop the server
     */
    stop(): Promise<void>;
    /**
     * Get the Socket.IO server instance
     */
    getIO(): SocketIOServer;
    /**
     * Get the inventory tracking service
     */
    getInventoryTracking(): InventoryTrackingService;
    /**
     * Broadcast inventory update to all connected clients
     */
    broadcastInventoryUpdate(update: any): void;
    /**
     * Broadcast alert to all connected clients
     */
    broadcastAlert(alert: any): void;
    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number;
    /**
     * Get server statistics
     */
    getServerStats(): {
        connectedClients: number;
        rooms: string[];
        uptime: number;
    };
}
//# sourceMappingURL=socket-server.d.ts.map