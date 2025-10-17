import "@testing-library/jest-dom";
import { vi } from "vitest";

// Set up environment variables for logger tests
// Must be set BEFORE logger module is imported by any test
process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_SERVICE_KEY = "test-service-key-for-unit-tests";

// Mock window.matchMedia for Shopify Polaris components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Polyfill ResizeObserver for Polaris components
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// @ts-expect-error jsdom global assignment
global.ResizeObserver = MockResizeObserver;

// Stub window scrolling APIs used by Polaris components
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "scroll", {
  writable: true,
  value: () => {},
});

// Provide Remix-style json helper for loaders/actions across integration tests
vi.mock("react-router", async () => {
  const actual = await vi.importActual<any>("react-router");
  return {
    ...actual,
    json: (data: unknown, init?: ResponseInit) =>
      Response.json(data as any, init),
  };
});
