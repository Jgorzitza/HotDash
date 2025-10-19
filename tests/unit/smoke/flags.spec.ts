import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isFeatureEnabled } from "../../../app/config/featureFlags";

const FLAGS = [
  "feature.programmaticSeoFactory",
  "feature.seoTelemetry",
  "feature.abHarness",
  "feature.guidedSelling",
  "feature.storefrontMcpSandbox",
  "feature.actionDock",
  "feature.mediaPipeline",
  "feature.inventorySettlement",
  "feature.hmacHarness",
  "feature.poReceiving",
  "feature.aiKnowledge",
  "feature.contentUpgrades",
  "feature.cxHealth",
];

describe("Feature flag smoke", () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...savedEnv } as NodeJS.ProcessEnv;
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("FEATURE_") || key.startsWith("FEATURE_FLAG_"))
        delete (process.env as any)[key];
    }
  });

  afterEach(() => {
    process.env = { ...savedEnv } as NodeJS.ProcessEnv;
  });

  it("defaults OFF for known flags", () => {
    for (const flag of FLAGS) {
      expect(isFeatureEnabled(flag, false)).toBe(false);
    }
  });

  it("enables when env is set truthy", () => {
    const key =
      "FEATURE_" +
      "feature.programmaticSeoFactory"
        .replace(/[^a-z0-9]/gi, "_")
        .toUpperCase();
    (process.env as any)[key] = "true";
    expect(isFeatureEnabled("feature.programmaticSeoFactory", false)).toBe(
      true,
    );
  });

  it("keeps unknown flags OFF even if unrelated env keys are set", () => {
    (process.env as any)["FEATURE_SOME_OTHER_FLAG"] = "true";
    expect(isFeatureEnabled("feature.guidedSelling", false)).toBe(false);
  });
});
