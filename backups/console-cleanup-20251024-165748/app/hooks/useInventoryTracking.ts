import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface InventoryData {
  variantId: string;
  sku: string;
  productName: string;
  currentStock: number;
  availableStock: number;
  committedStock: number;
  incomingStock: number;
  averageLandedCost: number;
  lastUpdated: string;
  location: string;
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
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface InventoryUpdate {
  variantId: string;
  sku: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeType: 'increase' | 'decrease' | 'adjustment';
  changeAmount: number;
  reason: string;
  timestamp: string;
  userId?: string;
}

export interface UseInventoryTrackingOptions {
  variantIds: string[];
  autoConnect?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onInventoryUpdate?: (data: InventoryData) => void;
  onAlert?: (alert: InventoryAlert) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface UseInventoryTrackingReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate: Date | null;
  
  // Data
  inventoryData: InventoryData[];
  alerts: InventoryAlert[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  refreshInventory: (variantIds?: string[]) => Promise<void>;
  updateInventory: (variantId: string, newStock: number, reason: string) => Promise<void>;
  acknowledgeAlert: (alertId: string, userId: string) => Promise<void>;
  
  // Getters
  getInventoryData: (variantId: string) => InventoryData | undefined;
  getVariantAlerts: (variantId: string) => InventoryAlert[];
  getCriticalAlerts: () => InventoryAlert[];
  getUnacknowledgedAlerts: () => InventoryAlert[];
  
  // Utilities
  subscribeToVariant: (variantId: string) => void;
  unsubscribeFromVariant: (variantId: string) => void;
}

export const useInventoryTracking = (options: UseInventoryTrackingOptions): UseInventoryTrackingReturn => {
  const {
    variantIds,
    autoConnect = true,
    autoRefresh = true,
    refreshInterval = 30000,
    onInventoryUpdate,
    onAlert,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    const newSocket = io(process.env.SOCKET_SERVER_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to inventory tracking server');
      setIsConnected(true);
      setIsConnecting(false);
      
      // Join inventory tracking room
      newSocket.emit('join-inventory-room', 'inventory-tracking');
      
      // Subscribe to specific variants
      variantIds.forEach(variantId => {
        newSocket.emit('subscribe-variant', variantId);
      });
      
      onConnect?.();
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from inventory tracking server');
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnect?.();
    });

    newSocket.on('inventory-change', (data: { update: InventoryUpdate; realtimeData: InventoryData }) => {
      console.log('Inventory change received:', data);
      setInventoryData(prev => 
        prev.map(item => 
          item.variantId === data.realtimeData.variantId ? data.realtimeData : item
        )
      );
      setLastUpdate(new Date());
      onInventoryUpdate?.(data.realtimeData);
    });

    newSocket.on('variant-update', (data: { update: InventoryUpdate; realtimeData: InventoryData }) => {
      console.log('Variant update received:', data);
      setInventoryData(prev => 
        prev.map(item => 
          item.variantId === data.realtimeData.variantId ? data.realtimeData : item
        )
      );
      setLastUpdate(new Date());
      onInventoryUpdate?.(data.realtimeData);
    });

    newSocket.on('inventory-alert', (alert: InventoryAlert) => {
      console.log('Inventory alert received:', alert);
      setAlerts(prev => [alert, ...prev]);
      onAlert?.(alert);
    });

    newSocket.on('variant-alert', (alert: InventoryAlert) => {
      console.log('Variant alert received:', alert);
      setAlerts(prev => [alert, ...prev]);
      onAlert?.(alert);
    });

    newSocket.on('error', (error: { message: string; error: string }) => {
      console.error('Socket error:', error);
      onError?.(error.message);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;
  }, [variantIds, onInventoryUpdate, onAlert, onError, onConnect, onDisconnect]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;

    const startRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        if (isConnected) {
          refreshInventory();
          startRefresh(); // Schedule next refresh
        }
      }, refreshInterval);
    };

    startRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, isConnected, refreshInterval]);

  // Refresh inventory data
  const refreshInventory = useCallback(async (variantIdsToRefresh?: string[]) => {
    if (!socket || !isConnected) return;

    try {
      const idsToRefresh = variantIdsToRefresh || variantIds;
      socket.emit('request-bulk-inventory-update', idsToRefresh);
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
      onError?.('Failed to refresh inventory data');
    }
  }, [socket, isConnected, variantIds, onError]);

  // Update inventory
  const updateInventory = useCallback(async (variantId: string, newStock: number, reason: string) => {
    if (!socket || !isConnected) return;

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
    } catch (error) {
      console.error('Failed to update inventory:', error);
      onError?.('Failed to update inventory');
    }
  }, [socket, isConnected, inventoryData, onError]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string, userId: string) => {
    if (!socket || !isConnected) return;

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
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      onError?.('Failed to acknowledge alert');
    }
  }, [socket, isConnected, onError]);

  // Get inventory data for a specific variant
  const getInventoryData = useCallback((variantId: string): InventoryData | undefined => {
    return inventoryData.find(item => item.variantId === variantId);
  }, [inventoryData]);

  // Get alerts for a specific variant
  const getVariantAlerts = useCallback((variantId: string): InventoryAlert[] => {
    return alerts.filter(alert => alert.variantId === variantId);
  }, [alerts]);

  // Get critical alerts
  const getCriticalAlerts = useCallback((): InventoryAlert[] => {
    return alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);
  }, [alerts]);

  // Get unacknowledged alerts
  const getUnacknowledgedAlerts = useCallback((): InventoryAlert[] => {
    return alerts.filter(alert => !alert.acknowledged);
  }, [alerts]);

  // Subscribe to variant
  const subscribeToVariant = useCallback((variantId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe-variant', variantId);
    }
  }, [socket, isConnected]);

  // Unsubscribe from variant
  const unsubscribeFromVariant = useCallback((variantId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe-variant', variantId);
    }
  }, [socket, isConnected]);

  return {
    isConnected,
    isConnecting,
    lastUpdate,
    inventoryData,
    alerts,
    connect,
    disconnect,
    refreshInventory,
    updateInventory,
    acknowledgeAlert,
    getInventoryData,
    getVariantAlerts,
    getCriticalAlerts,
    getUnacknowledgedAlerts,
    subscribeToVariant,
    unsubscribeFromVariant,
  };
};
