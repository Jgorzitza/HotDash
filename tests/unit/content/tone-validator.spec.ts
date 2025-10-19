/**
 * Tone Validator Tests
 *
 * @see app/lib/content/tone-validator.ts
 */

import { describe, it, expect } from "vitest";
import { validateTone } from "~/lib/content/tone-validator";

describe("Tone Validator", () => {
  describe("Brand Voice", () => {
    it("passes for conversational, on-brand copy", () => {
      const text =
        "Check out our new custom shift knobs! Perfect for your classic hot rod restoration. Shop now 👉";

      const result = validateTone(text, "instagram");

      expect(result.checks.brand_voice.status).toBe("pass");
      expect(result.checks.brand_voice.score).toBeGreaterThanOrEqual(70);
    });

    it.todo("flags spammy language", () => {
      const text = "BUY NOW!!! Limited time!!! Don't miss out!!!";

      const result = validateTone(text, "instagram");

      expect(result.checks.brand_voice.status).not.toBe("pass");
      expect(result.checks.brand_voice.issues).toContain(
        expect.stringContaining("spammy"),
      );
    });

    it.todo("flags missing conversational tone", () => {
      const text = "Product available. Specifications listed below.";

      const result = validateTone(text, "instagram");

      expect(result.checks.brand_voice.issues).toContain(
        expect.stringContaining("conversational"),
      );
    });

    it("rewards community language", () => {
      const text =
        "We love classic hot rod restoration! Check out this vintage build.";

      const result = validateTone(text, "instagram");

      expect(result.checks.brand_voice.score).toBeGreaterThan(50);
    });

    it.todo("penalizes business jargon", () => {
      const text =
        "Leverage our synergy to disrupt the paradigm of hot rod excellence.";

      const result = validateTone(text, "instagram");

      expect(result.checks.brand_voice.issues).toContain(
        expect.stringContaining("jargon"),
      );
    });
  });

  describe("CTA Analysis", () => {
    it("detects primary CTA", () => {
      const text = "New shift knobs available! Shop now and get yours today.";

      const result = validateTone(text, "instagram");

      expect(result.cta_analysis.present).toBe(true);
      expect(result.cta_analysis.type).toBe("primary");
      expect(result.cta_analysis.effectiveness).toBe("strong");
    });

    it("detects secondary CTA", () => {
      const text =
        "Behind the scenes of our restoration process. Learn more in our latest blog post.";

      const result = validateTone(text, "facebook");

      expect(result.cta_analysis.present).toBe(true);
      expect(result.cta_analysis.type).toBe("secondary");
      expect(result.cta_analysis.effectiveness).toBe("moderate");
    });

    it("detects urgency CTA", () => {
      const text = "Limited stock on custom shift knobs! First 50 units only.";

      const result = validateTone(text, "instagram");

      expect(result.cta_analysis.present).toBe(true);
      expect(result.cta_analysis.type).toBe("urgency");
      expect(result.cta_analysis.effectiveness).toBe("strong");
    });

    it("flags missing CTA", () => {
      const text = "We're working on something cool. More details soon.";

      const result = validateTone(text, "instagram");

      expect(result.cta_analysis.present).toBe(false);
      expect(result.cta_analysis.effectiveness).toBe("weak");
    });
  });

  describe("Length Analysis", () => {
    it("marks optimal Instagram length", () => {
      const text =
        "Our new shift knobs are here! 🚗 Perfect for your classic hot rod. Limited first run - pre-order now!";

      const result = validateTone(text, "instagram");

      expect(result.length_analysis.optimal).toBe(true);
      expect(result.length_analysis.character_count).toBeLessThan(300);
    });

    it("flags too-long copy", () => {
      const text = "A".repeat(500);

      const result = validateTone(text, "instagram");

      expect(result.length_analysis.optimal).toBe(false);
    });

    it("includes platform limit", () => {
      const result = validateTone("Test", "instagram");

      expect(result.length_analysis.platform_limit).toBe(2200);
    });
  });

  describe("Platform-Specific Guidelines", () => {
    it.todo("flags Instagram links in caption", () => {
      const text = "Check out our new products at https://hotrodan.com";

      const result = validateTone(text, "instagram");

      expect(result.checks.platform_guidelines.issues).toContain(
        expect.stringContaining("link in bio"),
      );
    });

    it.todo("flags excessive Instagram hashtags", () => {
      const text = "Post text #1 #2 #3 #4 #5 #6 #7 #8 #9 #10 #11 #12";

      const result = validateTone(text, "instagram");

      expect(result.checks.platform_guidelines.issues).toContain(
        expect.stringContaining("hashtags"),
      );
    });

    it.todo("flags missing link on Facebook with learn more CTA", () => {
      const text =
        "Great new products available! Learn more about our offerings.";

      const result = validateTone(text, "facebook");

      expect(result.checks.platform_guidelines.issues).toContain(
        expect.stringContaining("link URL"),
      );
    });
  });

  describe("SEO & Discoverability", () => {
    it("passes when keyword in first 100 chars", () => {
      const text =
        "New hot rod shift knobs now available! Custom designs for classic cars.";

      const result = validateTone(text, "instagram");

      expect(result.checks.seo_discoverability.status).toBe("pass");
    });

    it("flags missing keyword in opening", () => {
      const text =
        "Amazing new product launch! You're going to love this amazing thing we made!";

      const result = validateTone(text, "instagram");

      expect(result.checks.seo_discoverability.issues.length).toBeGreaterThan(
        0,
      );
      expect(result.checks.seo_discoverability.issues[0]).toContain(
        "100 characters",
      );
    });

    it("suggests hashtags if missing", () => {
      const text = "Amazing product available now!";

      const result = validateTone(text, "instagram");

      const suggestions = result.checks.seo_discoverability.suggestions;
      expect(suggestions.some((s) => s.toLowerCase().includes("hashtag"))).toBe(
        true,
      );
    });
  });

  describe("Overall Validation", () => {
    it("returns pass for good copy", () => {
      const text =
        "We're launching custom hot rod shift knobs! 🚗 Period-correct designs for your classic restoration. Pre-order now - limited first run! #HotRod #ClassicCars";

      const result = validateTone(text, "instagram");

      expect(result.overall).toBe("pass");
    });

    it("returns review for mediocre copy", () => {
      const text = "Product available. Details on website.";

      const result = validateTone(text, "instagram");

      expect(result.overall).toBe("review");
    });

    it("returns fail for spammy copy", () => {
      const text = "BUY NOW!!! Limited time!!! Click here!!! Don't miss out!!!";

      const result = validateTone(text, "instagram");

      expect(result.overall).toBe("fail");
    });
  });
});
