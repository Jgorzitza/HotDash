import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { InventoryTrackingService } from "./inventory-tracking";
export class InventorySocketServer {
    httpServer;
    io;
    inventoryTracking;
    constructor(config) {
        // Create HTTP server
        this.httpServer = createServer();
        // Create Socket.IO server
        this.io = new SocketIOServer(this.httpServer, {
            cors: config.cors,
            transports: ['websocket', 'polling'],
            allowEIO3: true,
        });
        // Initialize inventory tracking service
        this.inventoryTracking = new InventoryTrackingService(this.io, config.inventoryTracking);
        this.setupServer();
    }
    /**
     * Setup server event handlers and middleware
     */
    setupServer() {
        // Authentication middleware
        this.io.use((socket, next) => {
            // Add authentication logic here
            // For now, allow all connections
            next();
        });
        // Connection handling
        this.io.on('connection', (socket) => {
            console.log(`Inventory tracking client connected: ${socket.id}`);
            // Handle inventory tracking specific events
            socket.on('join-inventory-room', (room) => {
                socket.join(room);
                console.log(`Client ${socket.id} joined room: ${room}`);
            });
            socket.on('leave-inventory-room', (room) => {
                socket.leave(room);
                console.log(`Client ${socket.id} left room: ${room}`);
            });
            // Handle real-time inventory requests
            socket.on('request-inventory-sync', async (data) => {
                try {
                    const inventoryData = await this.inventoryTracking.getBulkRealtimeInventoryData(data.variantIds);
                    socket.emit('inventory-sync', inventoryData);
                }
                catch (error) {
                    socket.emit('error', { message: 'Failed to sync inventory data', error: error.message });
                }
            });
            // Handle alert acknowledgment
            socket.on('acknowledge-alert', async (data) => {
                try {
                    await this.inventoryTracking.acknowledgeAlert(data.alertId, data.userId);
                    socket.emit('alert-acknowledged', { alertId: data.alertId });
                }
                catch (error) {
                    socket.emit('error', { message: 'Failed to acknowledge alert', error: error.message });
                }
            });
            // Handle configuration updates
            socket.on('update-tracking-config', async (config) => {
                try {
                    await this.inventoryTracking.updateTrackingConfig(config);
                    socket.emit('config-updated', config);
                }
                catch (error) {
                    socket.emit('error', { message: 'Failed to update configuration', error: error.message });
                }
            });
            socket.on('disconnect', () => {
                console.log(`Inventory tracking client disconnected: ${socket.id}`);
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
    async start() {
        return new Promise((resolve, reject) => {
            this.httpServer.listen(3001, () => {
                console.log('Inventory tracking Socket.IO server started on port 3001');
                resolve();
            });
            this.httpServer.on('error', (error) => {
                console.error('HTTP server error:', error);
                reject(error);
            });
        });
    }
    /**
     * Stop the server
     */
    async stop() {
        return new Promise((resolve) => {
            this.io.close(() => {
                this.httpServer.close(() => {
                    console.log('Inventory tracking Socket.IO server stopped');
                    resolve();
                });
            });
        });
    }
    /**
     * Get the Socket.IO server instance
     */
    getIO() {
        return this.io;
    }
    /**
     * Get the inventory tracking service
     */
    getInventoryTracking() {
        return this.inventoryTracking;
    }
    /**
     * Broadcast inventory update to all connected clients
     */
    broadcastInventoryUpdate(update) {
        this.io.emit('inventory-update', update);
    }
    /**
     * Broadcast alert to all connected clients
     */
    broadcastAlert(alert) {
        this.io.emit('inventory-alert', alert);
    }
    /**
     * Get connected clients count
     */
    getConnectedClientsCount() {
        return this.io.engine.clientsCount;
    }
    /**
     * Get server statistics
     */
    getServerStats() {
        return {
            connectedClients: this.getConnectedClientsCount(),
            rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
            uptime: process.uptime(),
        };
    }
}
//# sourceMappingURL=socket-server.js.map