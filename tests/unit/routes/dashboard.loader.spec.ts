import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loader } from "../../../app/routes/dashboard";

function makeReq(url: string) {
  return new Request(url);
}

declare global { var __oldFetch: any }

beforeEach(() => {
  global.__oldFetch = global.fetch;
});

afterEach(() => {
  global.fetch = global.__oldFetch;
  delete (global as any).__oldFetch;
  delete (process.env as any).HOTDASH_DASHBOARD_MODE;
});

describe("dashboard loader mode defaults", () => {
  it("defaults to dev:test in test env when no mode provided", async () => {
    const res = await loader({ request: makeReq("http://example.com/dashboard") } as any);
    const data = await (res as Response).json();
    expect(data.mode).toBe("dev:test");
    expect(data.tiles.revenue.status).toBe("ok");
  });

  it("defaults to live when env override set to live", async () => {
    (process.env as any).HOTDASH_DASHBOARD_MODE = "live";
    const fetchSpy = vi.fn(async (input: any) => {
      const url = String(input);
      if (url.includes('/api/shopify/revenue')) {
        return { ok: true, json: async () => ({ totalRevenue: 1000, currency: "USD", orderCount: 12, windowDays: 30 }) } as any;
      }
      if (url.includes('/api/shopify/aov')) {
        return { ok: true, json: async () => ({ averageOrderValue: 145.27, currency: "USD", orderCount: 12, windowDays: 30 }) } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    });
    global.fetch = fetchSpy as any;

    const res = await loader({ request: makeReq("http://example.com/dashboard") } as any);
    const data = await (res as Response).json();

    expect(data.mode).toBe("live");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(data.tiles.revenue.status).toBe("ok");
    expect(data.tiles.aov.status).toBe("ok");
  });

  it("falls back when AOV errors in live mode", async () => {
    (process.env as any).HOTDASH_DASHBOARD_MODE = "live";
    const fetchSpy = vi.fn(async (input: any) => {
      const url = String(input);
      if (url.includes('/api/shopify/revenue')) {
        return { ok: true, json: async () => ({ totalRevenue: 1000, currency: "USD", orderCount: 12, windowDays: 30 }) } as any;
      }
      if (url.includes('/api/shopify/aov')) {
        return { ok: false, json: async () => ({ error: { message: 'failed' } }) } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    });
    global.fetch = fetchSpy as any;

    const res = await loader({ request: makeReq("http://example.com/dashboard") } as any);
    const data = await (res as Response).json();

    expect(data.mode).toBe("live");
    expect(data.tiles.aov.status).toBe("error");
  });

  it("respects explicit mode=dev:test query even with live override", async () => {
    (process.env as any).HOTDASH_DASHBOARD_MODE = "live";
    const res = await loader({ request: makeReq("http://example.com/dashboard?mode=dev:test") } as any);
    const data = await (res as Response).json();
    expect(data.mode).toBe("dev:test");
  });
});

