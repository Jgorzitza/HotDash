/**
 * Telemetry for Ads Cost/Latency
 * 
 * Purpose: Track cost and latency metrics for ads operations
 * Owner: ads agent
 * Date: 2025-10-15
 */

export interface TelemetryEvent {
  eventType: 'api_call' | 'calculation' | 'cache_hit' | 'cache_miss' | 'error';
  operation: string;
  durationMs: number;
  cost?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class AdsTelemetry {
  private events: TelemetryEvent[] = [];
  private maxEvents: number = 1000;

  recordEvent(event: Omit<TelemetryEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
    });
    
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  getEvents(filter?: Partial<TelemetryEvent>): TelemetryEvent[] {
    if (!filter) return [...this.events];
    
    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return event[key as keyof TelemetryEvent] === value;
      });
    });
  }

  getAverageLatency(operation?: string): number {
    const filtered = operation
      ? this.events.filter(e => e.operation === operation)
      : this.events;
    
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, e) => acc + e.durationMs, 0);
    return sum / filtered.length;
  }

  getTotalCost(operation?: string): number {
    const filtered = operation
      ? this.events.filter(e => e.operation === operation)
      : this.events;
    
    return filtered.reduce((acc, e) => acc + (e.cost || 0), 0);
  }

  clear(): void {
    this.events = [];
  }
}

export const adsTelemetry = new AdsTelemetry();

