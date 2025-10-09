import { afterEach, describe, expect, it } from "vitest";

import { getAllFeatureFlags, getFeatureFlag, isFeatureEnabled } from "../../app/config/featureFlags";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("feature flag resolution", () => {
  it("falls back to default when flag is not defined", () => {
    expect(isFeatureEnabled("ai_escalations")).toBe(false);
    expect(isFeatureEnabled("ai_escalations", true)).toBe(true);
  });

  it("supports FEATURE_ prefix", () => {
    process.env.FEATURE_AI_ESCALATIONS = "1";
    expect(isFeatureEnabled("ai_escalations")).toBe(true);
    expect(getFeatureFlag("ai_escalations")).toBe("1");
  });

  it("supports FEATURE_FLAG_ legacy prefix", () => {
    process.env.FEATURE_FLAG_AI_ESCALATIONS = "yes";
    expect(isFeatureEnabled("ai_escalations")).toBe(true);
    expect(getFeatureFlag("ai_escalations")).toBe("yes");
  });

  it("lists all known flags regardless of prefix", () => {
    process.env.FEATURE_AI_ESCALATIONS = "1";
    process.env.FEATURE_FLAG_DASHBOARD_REFRESH = "true";

    const all = getAllFeatureFlags();
    expect(all).toMatchObject({
      ai_escalations: "1",
      dashboard_refresh: "true",
    });
  });
});
