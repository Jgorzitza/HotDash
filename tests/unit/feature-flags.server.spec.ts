import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getServerFeatureFlags,
  isIdeaPoolSupabaseEnabled,
  isIdeaPoolLive,
  isAnalyticsRealData,
  isPublerLive,
} from "../../app/utils/feature-flags.server";

describe("Server Feature Flags", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getServerFeatureFlags", () => {
    it("returns all flags with defaults when no env vars set", () => {
      const flags = getServerFeatureFlags();
      expect(flags).toEqual({
        ideaPoolSupabase: false,
        ideaPoolLive: false,
        analyticsRealData: false,
        publerLive: false,
      });
    });

    it("recognizes '1' as true", () => {
      process.env.IDEA_POOL_LIVE = "1";
      const flags = getServerFeatureFlags();
      expect(flags.ideaPoolLive).toBe(true);
    });

    it("recognizes 'true' as true", () => {
      process.env.ANALYTICS_REAL_DATA = "true";
      const flags = getServerFeatureFlags();
      expect(flags.analyticsRealData).toBe(true);
    });

    it("recognizes 'on' as true", () => {
      process.env.PUBLER_LIVE = "on";
      const flags = getServerFeatureFlags();
      expect(flags.publerLive).toBe(true);
    });

    it("recognizes 'yes' as true", () => {
      process.env.IDEA_POOL_SUPABASE_ENABLED = "yes";
      const flags = getServerFeatureFlags();
      expect(flags.ideaPoolSupabase).toBe(true);
    });

    it("is case insensitive", () => {
      process.env.IDEA_POOL_LIVE = "TRUE";
      process.env.ANALYTICS_REAL_DATA = "YES";
      const flags = getServerFeatureFlags();
      expect(flags.ideaPoolLive).toBe(true);
      expect(flags.analyticsRealData).toBe(true);
    });

    it("treats non-truthy values as false", () => {
      process.env.IDEA_POOL_LIVE = "0";
      process.env.ANALYTICS_REAL_DATA = "false";
      process.env.PUBLER_LIVE = "off";
      const flags = getServerFeatureFlags();
      expect(flags.ideaPoolLive).toBe(false);
      expect(flags.analyticsRealData).toBe(false);
      expect(flags.publerLive).toBe(false);
    });
  });

  describe("isIdeaPoolSupabaseEnabled", () => {
    it("returns false by default", () => {
      expect(isIdeaPoolSupabaseEnabled()).toBe(false);
    });

    it("returns true when IDEA_POOL_SUPABASE_ENABLED=true", () => {
      process.env.IDEA_POOL_SUPABASE_ENABLED = "true";
      expect(isIdeaPoolSupabaseEnabled()).toBe(true);
    });
  });

  describe("isIdeaPoolLive", () => {
    it("returns false by default", () => {
      expect(isIdeaPoolLive()).toBe(false);
    });

    it("returns true when IDEA_POOL_LIVE=true", () => {
      process.env.IDEA_POOL_LIVE = "true";
      expect(isIdeaPoolLive()).toBe(true);
    });
  });

  describe("isAnalyticsRealData", () => {
    it("returns false by default", () => {
      expect(isAnalyticsRealData()).toBe(false);
    });

    it("returns true when ANALYTICS_REAL_DATA=true", () => {
      process.env.ANALYTICS_REAL_DATA = "true";
      expect(isAnalyticsRealData()).toBe(true);
    });
  });

  describe("isPublerLive", () => {
    it("returns false by default", () => {
      expect(isPublerLive()).toBe(false);
    });

    it("returns true when PUBLER_LIVE=true", () => {
      process.env.PUBLER_LIVE = "true";
      expect(isPublerLive()).toBe(true);
    });
  });

  describe("multiple flags", () => {
    it("can enable multiple flags independently", () => {
      process.env.IDEA_POOL_LIVE = "true";
      process.env.PUBLER_LIVE = "true";

      expect(isIdeaPoolLive()).toBe(true);
      expect(isPublerLive()).toBe(true);
      expect(isAnalyticsRealData()).toBe(false);
      expect(isIdeaPoolSupabaseEnabled()).toBe(false);
    });
  });
});
