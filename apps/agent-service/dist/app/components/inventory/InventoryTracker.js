import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
export const InventoryTracker = ({ variantIds, autoRefresh = true, refreshInterval = 30000, // 30 seconds
onInventoryUpdate, onAlert, onError, }) => {
    const [socket, setSocket] = useState(null);
    const [inventoryData, setInventoryData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    // Initialize Socket.IO connection
    useEffect(() => {
        const newSocket = io(process.env.SOCKET_SERVER_URL || 'http://localhost:3001', {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });
        newSocket.on('connect', () => {
            console.log('Connected to inventory tracking server');
            setIsConnected(true);
            // Join inventory tracking room
            newSocket.emit('join-inventory-room', 'inventory-tracking');
            // Subscribe to specific variants
            variantIds.forEach(variantId => {
                newSocket.emit('subscribe-variant', variantId);
            });
        });
        newSocket.on('disconnect', () => {
            console.log('Disconnected from inventory tracking server');
            setIsConnected(false);
        });
        newSocket.on('inventory-change', (data) => {
            console.log('Inventory change received:', data);
            setInventoryData(prev => prev.map(item => item.variantId === data.realtimeData.variantId ? data.realtimeData : item));
            setLastUpdate(new Date());
            onInventoryUpdate?.(data.realtimeData);
        });
        newSocket.on('variant-update', (data) => {
            console.log('Variant update received:', data);
            setInventoryData(prev => prev.map(item => item.variantId === data.realtimeData.variantId ? data.realtimeData : item));
            setLastUpdate(new Date());
            onInventoryUpdate?.(data.realtimeData);
        });
        newSocket.on('inventory-alert', (alert) => {
            console.log('Inventory alert received:', alert);
            setAlerts(prev => [alert, ...prev]);
            onAlert?.(alert);
        });
        newSocket.on('variant-alert', (alert) => {
            console.log('Variant alert received:', alert);
            setAlerts(prev => [alert, ...prev]);
            onAlert?.(alert);
        });
        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
            onError?.(error.message);
        });
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [variantIds, onInventoryUpdate, onAlert, onError]);
    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh || !socket || !isConnected)
            return;
        const interval = setInterval(() => {
            if (socket && isConnected) {
                socket.emit('request-bulk-inventory-update', variantIds);
            }
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, socket, isConnected, variantIds, refreshInterval]);
    // Load initial inventory data
    useEffect(() => {
        if (!socket || !isConnected)
            return;
        const loadInitialData = async () => {
            try {
                // Request bulk inventory update
                socket.emit('request-bulk-inventory-update', variantIds);
                // Load active alerts
                const response = await fetch(`/api/inventory/tracking?action=get-active-alerts`);
                if (response.ok) {
                    const result = await response.json();
                    setAlerts(result.data || []);
                }
            }
            catch (error) {
                console.error('Failed to load initial data:', error);
                onError?.('Failed to load initial inventory data');
            }
        };
        loadInitialData();
    }, [socket, isConnected, variantIds, onError]);
    // Handle inventory update
    const handleInventoryUpdate = useCallback(async (variantId, newStock, reason) => {
        if (!socket || !isConnected)
            return;
        try {
            const formData = new FormData();
            formData.append('action', 'track-inventory-change');
            formData.append('variantId', variantId);
            formData.append('previousStock', inventoryData.find(item => item.variantId === variantId)?.currentStock.toString() || '0');
            formData.append('newStock', newStock.toString());
            formData.append('changeType', newStock > (inventoryData.find(item => item.variantId === variantId)?.currentStock || 0) ? 'increase' : 'decrease');
            formData.append('reason', reason);
            const response = await fetch('/api/inventory/tracking', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to update inventory');
            }
        }
        catch (error) {
            console.error('Failed to update inventory:', error);
            onError?.('Failed to update inventory');
        }
    }, [socket, isConnected, inventoryData, onError]);
    // Handle alert acknowledgment
    const handleAcknowledgeAlert = useCallback(async (alertId, userId) => {
        if (!socket || !isConnected)
            return;
        try {
            const formData = new FormData();
            formData.append('action', 'acknowledge-alert');
            formData.append('alertId', alertId);
            formData.append('acknowledgedBy', userId);
            const response = await fetch('/api/inventory/tracking', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to acknowledge alert');
            }
            // Remove acknowledged alert from local state
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        }
        catch (error) {
            console.error('Failed to acknowledge alert:', error);
            onError?.('Failed to acknowledge alert');
        }
    }, [socket, isConnected, onError]);
    // Get inventory data for a specific variant
    const getInventoryData = useCallback((variantId) => {
        return inventoryData.find(item => item.variantId === variantId);
    }, [inventoryData]);
    // Get alerts for a specific variant
    const getVariantAlerts = useCallback((variantId) => {
        return alerts.filter(alert => alert.variantId === variantId);
    }, [alerts]);
    // Get critical alerts
    const getCriticalAlerts = useCallback(() => {
        return alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);
    }, [alerts]);
    return {
        socket,
        inventoryData,
        alerts,
        isConnected,
        lastUpdate,
        handleInventoryUpdate,
        handleAcknowledgeAlert,
        getInventoryData,
        getVariantAlerts,
        getCriticalAlerts,
    };
};
export default InventoryTracker;
//# sourceMappingURL=InventoryTracker.js.map