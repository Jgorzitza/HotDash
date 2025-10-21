/**
 * Content Optimizer Service Tests
 * 
 * Tests for automated content optimization service including:
 * - Flesch Reading Ease score calculation
 * - Keyword density analysis
 * - Heading structure analysis
 * - Internal linking analysis
 * - Image alt text verification
 * - Overall SEO score calculation
 */

import { describe, expect, it, vi } from "vitest";
import { analyzeContent } from "../../../../app/services/seo/content-optimizer";

describe("Content Optimizer Service", () => {
  describe("analyzeContent", () => {
    it("should analyze content and return comprehensive SEO analysis", async () => {
      const url = "https://example.com/test";
      const html = `
        <h1>Test Product Page</h1>
        <h2>Product Features</h2>
        <p>This is a simple test paragraph about skateboard decks. We sell quality skateboard products.</p>
        <p>Our skateboard decks are made from premium materials.</p>
        <img src="/test.jpg" alt="Skateboard deck product image" />
        <a href="/related">Related Products</a>
        <a href="/about">About Us</a>
      `;
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result).toHaveProperty("url", url);
      expect(result).toHaveProperty("readability");
      expect(result).toHaveProperty("keywords");
      expect(result).toHaveProperty("headings");
      expect(result).toHaveProperty("links");
      expect(result).toHaveProperty("images");
      expect(result).toHaveProperty("overallScore");
      expect(result).toHaveProperty("recommendations");
      expect(result).toHaveProperty("analyzedAt");
    });

    it("should calculate Flesch Reading Ease score correctly", async () => {
      const url = "https://example.com/test";
      const html = "<p>The cat sat on the mat. It was a nice day.</p>";
      const targetKeyword = "cat";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.readability).toHaveProperty("fleschScore");
      expect(result.readability.fleschScore).toBeGreaterThanOrEqual(0);
      expect(result.readability.fleschScore).toBeLessThanOrEqual(100);
      expect(result.readability).toHaveProperty("grade");
      expect(result.readability).toHaveProperty("interpretation");
      expect(result.readability).toHaveProperty("wordCount");
      expect(result.readability).toHaveProperty("sentenceCount");
      expect(result.readability).toHaveProperty("syllableCount");
    });

    it("should analyze keyword density correctly", async () => {
      const url = "https://example.com/test";
      const html = `
        <p>Skateboard decks are important. We sell skateboard products.</p>
        <p>Our skateboard selection includes many skateboard options.</p>
      `;
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.keywords).toHaveProperty("targetKeyword", targetKeyword);
      expect(result.keywords).toHaveProperty("density");
      expect(result.keywords).toHaveProperty("frequency");
      expect(result.keywords).toHaveProperty("isOptimal");
      expect(result.keywords).toHaveProperty("topKeywords");
      expect(result.keywords.frequency).toBeGreaterThan(0);
      expect(Array.isArray(result.keywords.topKeywords)).toBe(true);
    });

    it("should detect optimal keyword density (1-3%)", async () => {
      const url = "https://example.com/test";
      // Create content with approximately 2% keyword density (optimal)
      const words = "word ".repeat(100); // 100 words
      const html = `<p>skateboard ${words} skateboard</p>`; // 2 keywords in ~102 words = ~2%
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.keywords.density).toBeGreaterThanOrEqual(1);
      expect(result.keywords.density).toBeLessThanOrEqual(3);
      expect(result.keywords.isOptimal).toBe(true);
    });

    it("should detect non-optimal keyword density", async () => {
      const url = "https://example.com/test";
      const html = "<p>This content has no target keyword at all here.</p>";
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.keywords.frequency).toBe(0);
      expect(result.keywords.isOptimal).toBe(false);
    });

    it("should analyze heading structure correctly", async () => {
      const url = "https://example.com/test";
      const html = `
        <h1>Main Title with Skateboard</h1>
        <h2>Section 1</h2>
        <h3>Subsection 1.1</h3>
        <h2>Section 2</h2>
        <h4>Deep subsection</h4>
      `;
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.headings).toHaveProperty("h1Count", 1);
      expect(result.headings).toHaveProperty("h2Count", 2);
      expect(result.headings).toHaveProperty("h3Count", 1);
      expect(result.headings).toHaveProperty("h4Count", 1);
      expect(result.headings).toHaveProperty("hasProperStructure");
      expect(result.headings.hasProperStructure).toBe(true); // Single H1
      expect(Array.isArray(result.headings.headings)).toBe(true);
    });

    it("should detect improper heading structure (multiple H1s)", async () => {
      const url = "https://example.com/test";
      const html = `
        <h1>First Title</h1>
        <h1>Second Title</h1>
        <h2>Section</h2>
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.headings.h1Count).toBe(2);
      expect(result.headings.hasProperStructure).toBe(false);
    });

    it("should detect keyword in headings", async () => {
      const url = "https://example.com/test";
      const html = `
        <h1>Skateboard Products</h1>
        <h2>Skateboard Decks</h2>
        <h3>Other Products</h3>
      `;
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      const headingsWithKeyword = result.headings.headings.filter(h => h.hasKeyword);
      expect(headingsWithKeyword.length).toBeGreaterThan(0);
    });

    it("should analyze internal and external links", async () => {
      const url = "https://example.com/test";
      const html = `
        <a href="/internal-page">Internal Link 1</a>
        <a href="/another-page">Internal Link 2</a>
        <a href="https://external.com">External Link</a>
        <a href="https://example.com/same-domain">Same Domain Link</a>
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.links).toHaveProperty("totalLinks");
      expect(result.links).toHaveProperty("internalLinks");
      expect(result.links).toHaveProperty("externalLinks");
      expect(result.links).toHaveProperty("linkDensity");
      expect(result.links).toHaveProperty("hasProperLinking");
      expect(result.links.totalLinks).toBeGreaterThan(0);
      expect(result.links.internalLinks).toBeGreaterThan(0);
    });

    it("should calculate proper link density", async () => {
      const url = "https://example.com/test";
      // 100 words with 3 internal links = 3 links per 100 words (optimal: 2-5)
      const words = "word ".repeat(100);
      const html = `
        <p>${words}</p>
        <a href="/link1">Link 1</a>
        <a href="/link2">Link 2</a>
        <a href="/link3">Link 3</a>
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.links.linkDensity).toBeGreaterThan(0);
      expect(result.links.hasProperLinking).toBe(true);
    });

    it("should analyze image alt text", async () => {
      const url = "https://example.com/test";
      const html = `
        <img src="/img1.jpg" alt="Descriptive alt text for image 1" />
        <img src="/img2.jpg" alt="Another image description" />
        <img src="/img3.jpg" />
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.images).toHaveProperty("totalImages", 3);
      expect(result.images).toHaveProperty("imagesWithAlt", 2);
      expect(result.images).toHaveProperty("imagesWithoutAlt", 1);
      expect(result.images).toHaveProperty("altTextQuality");
      expect(["good", "fair", "poor"]).toContain(result.images.altTextQuality);
    });

    it("should detect good alt text quality", async () => {
      const url = "https://example.com/test";
      const html = `
        <img src="/img1.jpg" alt="High quality descriptive alt text for image" />
        <img src="/img2.jpg" alt="Another good alt text description" />
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.images.totalImages).toBe(2);
      expect(result.images.imagesWithAlt).toBe(2);
      expect(result.images.altTextQuality).toBe("good");
    });

    it("should calculate overall SEO score (0-100)", async () => {
      const url = "https://example.com/test";
      const html = `
        <h1>Main Title</h1>
        <h2>Section 1</h2>
        <p>Good readable content with proper structure and keywords.</p>
        <p>More content to ensure good readability score here.</p>
        <img src="/test.jpg" alt="Descriptive image" />
        <a href="/related">Related Link</a>
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.overallScore).toHaveProperty("score");
      expect(result.overallScore.score).toBeGreaterThanOrEqual(0);
      expect(result.overallScore.score).toBeLessThanOrEqual(100);
      expect(result.overallScore).toHaveProperty("grade");
      expect(["A", "B", "C", "D", "F"]).toContain(result.overallScore.grade);
      expect(result.overallScore).toHaveProperty("breakdown");
    });

    it("should provide score breakdown by category", async () => {
      const url = "https://example.com/test";
      const html = "<h1>Test</h1><p>Content</p>";
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.overallScore.breakdown).toHaveProperty("readability");
      expect(result.overallScore.breakdown).toHaveProperty("keywords");
      expect(result.overallScore.breakdown).toHaveProperty("headings");
      expect(result.overallScore.breakdown).toHaveProperty("links");
      expect(result.overallScore.breakdown).toHaveProperty("images");
      
      // Each category should be 0-20
      Object.values(result.overallScore.breakdown).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(20);
      });
    });

    it("should generate actionable recommendations", async () => {
      const url = "https://example.com/test";
      const html = "<p>Poor content</p>"; // Missing H1, no links, no images, no keywords
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should recommend adding H1
      const hasH1Recommendation = result.recommendations.some(r => 
        r.toLowerCase().includes("h1") || r.toLowerCase().includes("heading")
      );
      expect(hasH1Recommendation).toBe(true);
    });

    it("should recommend keyword optimization when density is low", async () => {
      const url = "https://example.com/test";
      const html = "<h1>Title</h1><p>Content without the target keyword anywhere.</p>";
      const targetKeyword = "skateboard";

      const result = await analyzeContent(url, html, targetKeyword);

      const hasKeywordRecommendation = result.recommendations.some(r => 
        r.toLowerCase().includes("keyword") && r.toLowerCase().includes("density")
      );
      expect(hasKeywordRecommendation).toBe(true);
    });

    it("should recommend adding internal links when none exist", async () => {
      const url = "https://example.com/test";
      const html = "<h1>Title</h1><p>Content with no links at all.</p>";
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      const hasLinkRecommendation = result.recommendations.some(r => 
        r.toLowerCase().includes("internal") && r.toLowerCase().includes("link")
      );
      expect(hasLinkRecommendation).toBe(true);
    });

    it("should recommend adding alt text for images without it", async () => {
      const url = "https://example.com/test";
      const html = `
        <h1>Title</h1>
        <p>Content</p>
        <img src="/test.jpg" />
        <img src="/test2.jpg" />
      `;
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      const hasAltRecommendation = result.recommendations.some(r => 
        r.toLowerCase().includes("alt")
      );
      expect(hasAltRecommendation).toBe(true);
    });

    it("should handle empty or minimal content gracefully", async () => {
      const url = "https://example.com/test";
      const html = "";
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result).toHaveProperty("url");
      expect(result.readability.wordCount).toBe(0);
      expect(result.keywords.frequency).toBe(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should include timestamp in analyzedAt field", async () => {
      const url = "https://example.com/test";
      const html = "<h1>Test</h1><p>Content</p>";
      const targetKeyword = "test";

      const result = await analyzeContent(url, html, targetKeyword);

      expect(result.analyzedAt).toBeTruthy();
      expect(new Date(result.analyzedAt).toString()).not.toBe("Invalid Date");
    });
  });
});

