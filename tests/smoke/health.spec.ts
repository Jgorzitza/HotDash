/**
 * Smoke Test: Health Endpoints
 *
 * Purpose: Verify basic application health
 * Run: npm run test:smoke or vitest run tests/smoke/
 */

import { describe, it, expect } from "vitest";

const BASE_URL = process.env.SMOKE_TEST_URL || "http://localhost:3000";

describe("Health Endpoints Smoke Tests", () => {
  it("should return OK from /health", async () => {
    const response = await fetch(`${BASE_URL}/health`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data.status).toBe("ok");
  });

  it("should return healthy from /api/health", async () => {
    const response = await fetch(`${BASE_URL}/api/health`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data.status).toBe("healthy");
  });

  it("should respond within 3 seconds", async () => {
    const startTime = Date.now();

    await fetch(`${BASE_URL}/health`);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });
});
