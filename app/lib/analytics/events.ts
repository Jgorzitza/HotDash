/**
 * Custom Event Tracking (lightweight)
 *
 * Provides server-side helpers to record and summarize simple custom events
 * in dev/test without introducing external dependencies. In production, these
 * events should be emitted client-side to GA4/Shopify as appropriate.
 */

export interface CustomEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number; // ms epoch (defaults to now)
}

// In-memory ring buffer (dev/test only)
const MAX_EVENTS = 1000;
const _events: Required<CustomEvent>[] = [];

export function recordEvent(evt: CustomEvent): void {
  const event: Required<CustomEvent> = {
    name: evt.name,
    properties: evt.properties ?? {},
    timestamp: evt.timestamp ?? Date.now(),
  };
  _events.push(event);
  if (_events.length > MAX_EVENTS) _events.shift();
}

export function summarizeByName(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of _events) counts[e.name] = (counts[e.name] || 0) + 1;
  return counts;
}

export function lastN(n: number): Required<CustomEvent>[] {
  return _events.slice(-n);
}

