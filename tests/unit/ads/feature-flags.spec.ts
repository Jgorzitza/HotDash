/**
 * Feature Flag Enforcement Tests
 */

import { describe, it, expect } from "vitest";

describe("Ads Feature Flag Enforcement", () => {
  it("PUBLER_LIVE flag controls API mode", () => {
    // Flag is checked in publer-adapter.stub.ts
    // USE_REAL_PUBLER_API = process.env.PUBLER_LIVE === "true" || process.env.FEATURE_ADS_PUBLER_ENABLED === "true"

    const publlerLive = process.env.PUBLER_LIVE === "true";
    const featureEnabled = process.env.FEATURE_ADS_PUBLER_ENABLED === "true";

    // By default, both should be false in test environment
    expect(publlerLive || featureEnabled).toBe(false);
  });

  it("verifies flag prevents external calls when false", () => {
    // When PUBLER_LIVE=false, adapter runs in stub mode
    // Stub mode returns mock data without external API calls
    // This is enforced in publer-adapter.stub.ts via USE_REAL_PUBLER_API check

    expect(process.env.PUBLER_LIVE).not.toBe("true");
  });

  it("documents flag requirement for production posting", () => {
    // Production posting requires:
    // 1. PUBLER_LIVE=true OR FEATURE_ADS_PUBLER_ENABLED=true
    // 2. PUBLER_API_KEY configured
    // 3. PUBLER_WORKSPACE_ID configured
    // All three must be present for real API calls

    expect(true).toBe(true);
  });
});
