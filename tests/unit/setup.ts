import "@testing-library/jest-dom";

// Set up environment variables for logger tests
// Must be set BEFORE logger module is imported by any test
process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_SERVICE_KEY = "test-service-key-for-unit-tests";


// jsdom: mock matchMedia for Polaris breakpoints
import { vi } from 'vitest';
// Override matchMedia to a stable stub for Polaris
// @ts-expect-error test env shim
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
// Also expose on globalThis for defensive access
// @ts-expect-error test env shim
globalThis.matchMedia = window.matchMedia;


// Polaris/Popover relies on ResizeObserver
// @ts-expect-error test env shim
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error test env shim
window.ResizeObserver = RO as any;
// @ts-expect-error test env shim
(globalThis as any).ResizeObserver = window.ResizeObserver;

// Avoid jsdom warnings/errors for scroll
// @ts-expect-error test env shim
window.scroll = vi.fn();
