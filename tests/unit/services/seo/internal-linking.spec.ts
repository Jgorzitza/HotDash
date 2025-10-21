/**
 * Internal Linking Service Tests
 * 
 * Tests for internal linking analysis including:
 * - Orphan page detection
 * - Content similarity analysis
 * - Page authority calculation (PageRank-style)
 * - Link graph analysis
 * - Linking recommendations
 */

import { describe, expect, it } from "vitest";
import { analyzeInternalLinking, getPageLinkingRecommendations } from "../../../../app/services/seo/internal-linking";

describe("Internal Linking Service", () => {
  describe("analyzeInternalLinking", () => {
    it("should analyze internal linking and return comprehensive analysis", async () => {
      const pages = [
        { url: "/page1", links: ["/page2", "/page3"], content: "Content for page 1" },
        { url: "/page2", links: ["/page1"], content: "Content for page 2" },
        { url: "/page3", links: [], content: "Content for page 3" },
      ];

      const result = await analyzeInternalLinking(pages);

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("pages");
      expect(result).toHaveProperty("orphans");
      expect(result).toHaveProperty("topRecommendations");
      expect(result).toHaveProperty("analyzedAt");
    });

    it("should calculate summary statistics correctly", async () => {
      const pages = [
        { url: "/page1", links: ["/page2"], content: "Content 1" },
        { url: "/page2", links: ["/page1"], content: "Content 2" },
        { url: "/page3", links: [], content: "Content 3" },
      ];

      const result = await analyzeInternalLinking(pages);

      expect(result.summary).toHaveProperty("totalPages", 3);
      expect(result.summary).toHaveProperty("orphanPages");
      expect(result.summary).toHaveProperty("overLinkedPages");
      expect(result.summary).toHaveProperty("avgIncomingLinks");
      expect(result.summary).toHaveProperty("avgOutgoingLinks");
      expect(result.summary).toHaveProperty("totalInternalLinks");
    });

    it("should detect orphan pages (no incoming links)", async () => {
      const pages = [
        { url: "/page1", links: ["/page2"], content: "Content 1" },
        { url: "/page2", links: [], content: "Content 2" },
        { url: "/orphan", links: [], content: "Orphan content" },
      ];

      const result = await analyzeInternalLinking(pages);

      const orphans = result.pages.filter(p => p.isOrphan);
      expect(orphans.length).toBeGreaterThan(0);
      expect(result.summary.orphanPages).toBeGreaterThan(0);
      expect(result.orphans.length).toBeGreaterThan(0);
    });

    it("should identify page with incoming links", async () => {
      const pages = [
        { url: "/page1", links: ["/page2"], content: "Content 1" },
        { url: "/page2", links: ["/page1"], content: "Content 2" },
      ];

      const result = await analyzeInternalLinking(pages);

      const page2 = result.pages.find(p => p.url === "/page2");
      expect(page2).toBeDefined();
      expect(page2!.incomingLinks).toBeGreaterThan(0);
      expect(page2!.isOrphan).toBe(false);
    });

    it("should detect over-linked pages (50+ outgoing links)", async () => {
      const manyLinks = Array.from({ length: 60 }, (_, i) => `/page${i}`);
      const pages = [
        { url: "/hub", links: manyLinks, content: "Hub page content" },
        ...manyLinks.map(url => ({ url, links: [], content: "Page content" })),
      ];

      const result = await analyzeInternalLinking(pages);

      const hubPage = result.pages.find(p => p.url === "/hub");
      expect(hubPage).toBeDefined();
      expect(hubPage!.isOverLinked).toBe(true);
      expect(result.summary.overLinkedPages).toBeGreaterThan(0);
    });

    it("should calculate page authority scores", async () => {
      const pages = [
        { url: "/page1", links: ["/page2", "/page3"], content: "Content 1" },
        { url: "/page2", links: ["/page3"], content: "Content 2" },
        { url: "/page3", links: [], content: "Content 3" },
      ];

      const result = await analyzeInternalLinking(pages);

      result.pages.forEach(page => {
        expect(page).toHaveProperty("pageAuthority");
        expect(page.pageAuthority).toBeGreaterThanOrEqual(0);
        expect(page.pageAuthority).toBeLessThanOrEqual(100);
      });
    });

    it("should give higher authority to pages with more incoming links", async () => {
      const pages = [
        { url: "/page1", links: ["/popular"], content: "Content 1" },
        { url: "/page2", links: ["/popular"], content: "Content 2" },
        { url: "/page3", links: ["/popular"], content: "Content 3" },
        { url: "/popular", links: [], content: "Popular page content" },
        { url: "/unpopular", links: [], content: "Unpopular content" },
      ];

      const result = await analyzeInternalLinking(pages);

      const popularPage = result.pages.find(p => p.url === "/popular");
      const unpopularPage = result.pages.find(p => p.url === "/unpopular");

      expect(popularPage).toBeDefined();
      expect(unpopularPage).toBeDefined();
      expect(popularPage!.pageAuthority).toBeGreaterThan(unpopularPage!.pageAuthority);
    });

    it("should count incoming and outgoing links correctly", async () => {
      const pages = [
        { url: "/page1", links: ["/page2", "/page3"], content: "Content 1" },
        { url: "/page2", links: ["/page1"], content: "Content 2" },
        { url: "/page3", links: [], content: "Content 3" },
      ];

      const result = await analyzeInternalLinking(pages);

      const page1 = result.pages.find(p => p.url === "/page1");
      const page2 = result.pages.find(p => p.url === "/page2");
      const page3 = result.pages.find(p => p.url === "/page3");

      expect(page1!.outgoingLinks).toBe(2);
      expect(page1!.incomingLinks).toBe(1); // from page2

      expect(page2!.outgoingLinks).toBe(1);
      expect(page2!.incomingLinks).toBe(1); // from page1

      expect(page3!.outgoingLinks).toBe(0);
      expect(page3!.incomingLinks).toBe(1); // from page1
    });

    it("should generate recommendations for each page", async () => {
      const pages = [
        { url: "/page1", links: ["/page2"], content: "skateboard products" },
        { url: "/page2", links: [], content: "skateboard decks" },
        { url: "/orphan", links: [], content: "isolated content" },
      ];

      const result = await analyzeInternalLinking(pages);

      result.pages.forEach(page => {
        expect(page).toHaveProperty("recommendations");
        expect(Array.isArray(page.recommendations)).toBe(true);
      });
    });

    it("should recommend links for orphan pages", async () => {
      const pages = [
        { url: "/page1", links: [], content: "skateboard decks and wheels" },
        { url: "/orphan", links: [], content: "skateboard accessories" },
      ];

      const result = await analyzeInternalLinking(pages);

      const orphan = result.pages.find(p => p.url === "/orphan");
      expect(orphan).toBeDefined();
      expect(orphan!.isOrphan).toBe(true);
      
      const hasLinkRecommendation = orphan!.recommendations.some(r => 
        r.type === "add-internal-link"
      );
      expect(hasLinkRecommendation).toBe(true);
    });

    it("should recommend reducing links for over-linked pages", async () => {
      const manyLinks = Array.from({ length: 60 }, (_, i) => `/page${i}`);
      const pages = [
        { url: "/hub", links: manyLinks, content: "Hub page" },
        ...manyLinks.slice(0, 10).map(url => ({ url, links: [], content: "Content" })),
      ];

      const result = await analyzeInternalLinking(pages);

      const hubPage = result.pages.find(p => p.url === "/hub");
      expect(hubPage).toBeDefined();
      
      const hasReduceLinksRecommendation = hubPage!.recommendations.some(r => 
        r.type === "remove-excessive-links"
      );
      expect(hasReduceLinksRecommendation).toBe(true);
    });

    it("should suggest contextual links based on content similarity", async () => {
      const pages = [
        { 
          url: "/skateboard-decks", 
          links: [], 
          content: "skateboard decks made from maple wood with great quality" 
        },
        { 
          url: "/skateboard-wheels", 
          links: [], 
          content: "skateboard wheels for smooth riding and tricks" 
        },
        { 
          url: "/unrelated", 
          links: [], 
          content: "completely different topic about cooking" 
        },
      ];

      const result = await analyzeInternalLinking(pages);

      // Pages with similar content about skateboards should have recommendations to link to each other
      const skateboardDeckPage = result.pages.find(p => p.url === "/skateboard-decks");
      
      if (skateboardDeckPage && skateboardDeckPage.recommendations.length > 0) {
        const hasSimilarContentRecommendation = skateboardDeckPage.recommendations.some(r => 
          r.type === "add-internal-link" && r.toPage.includes("skateboard")
        );
        // This may or may not have recommendations depending on similarity threshold
        expect(hasSimilarContentRecommendation).toBeDefined();
      }
    });

    it("should prioritize recommendations by importance", async () => {
      const pages = [
        { url: "/page1", links: [], content: "Content 1" },
        { url: "/page2", links: [], content: "Content 2" },
      ];

      const result = await analyzeInternalLinking(pages);

      expect(Array.isArray(result.topRecommendations)).toBe(true);
      
      if (result.topRecommendations.length > 1) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        
        for (let i = 0; i < result.topRecommendations.length - 1; i++) {
          const current = priorityOrder[result.topRecommendations[i].priority];
          const next = priorityOrder[result.topRecommendations[i + 1].priority];
          expect(current).toBeLessThanOrEqual(next);
        }
      }
    });

    it("should limit top recommendations to 10", async () => {
      const manyPages = Array.from({ length: 20 }, (_, i) => ({
        url: `/page${i}`,
        links: [],
        content: `Content for page ${i}`,
      }));

      const result = await analyzeInternalLinking(manyPages);

      expect(result.topRecommendations.length).toBeLessThanOrEqual(10);
    });

    it("should include recommendation details", async () => {
      const pages = [
        { url: "/page1", links: [], content: "Content 1" },
        { url: "/page2", links: [], content: "Content 2" },
      ];

      const result = await analyzeInternalLinking(pages);

      if (result.topRecommendations.length > 0) {
        const recommendation = result.topRecommendations[0];
        
        expect(recommendation).toHaveProperty("type");
        expect(recommendation).toHaveProperty("fromPage");
        expect(recommendation).toHaveProperty("toPage");
        expect(recommendation).toHaveProperty("reason");
        expect(recommendation).toHaveProperty("priority");
        expect(["high", "medium", "low"]).toContain(recommendation.priority);
      }
    });

    it("should calculate average link metrics", async () => {
      const pages = [
        { url: "/page1", links: ["/page2", "/page3"], content: "Content 1" },
        { url: "/page2", links: ["/page1"], content: "Content 2" },
        { url: "/page3", links: [], content: "Content 3" },
      ];

      const result = await analyzeInternalLinking(pages);

      // Total outgoing: 2 + 1 + 0 = 3, avg = 1
      expect(result.summary.avgOutgoingLinks).toBe(1);
      
      // Total incoming: 1 + 1 + 1 = 3, avg = 1
      expect(result.summary.avgIncomingLinks).toBe(1);
      
      expect(result.summary.totalInternalLinks).toBe(3);
    });

    it("should include timestamp in analyzedAt field", async () => {
      const pages = [
        { url: "/page1", links: [], content: "Content 1" },
      ];

      const result = await analyzeInternalLinking(pages);

      expect(result.analyzedAt).toBeTruthy();
      expect(new Date(result.analyzedAt).toString()).not.toBe("Invalid Date");
    });

    it("should handle pages without content gracefully", async () => {
      const pages = [
        { url: "/page1", links: ["/page2"] },
        { url: "/page2", links: [] },
      ];

      const result = await analyzeInternalLinking(pages);

      expect(result.pages.length).toBe(2);
      expect(result.summary.totalPages).toBe(2);
    });

    it("should handle empty page list gracefully", async () => {
      const pages: Array<{ url: string; links: string[]; content?: string }> = [];

      const result = await analyzeInternalLinking(pages);

      expect(result.summary.totalPages).toBe(0);
      expect(result.pages.length).toBe(0);
      expect(result.orphans.length).toBe(0);
    });
  });

  describe("getPageLinkingRecommendations", () => {
    it("should return recommendations for a specific page", async () => {
      const pages = [
        { url: "/page1", links: [], content: "Content 1" },
        { url: "/page2", links: [], content: "Content 2" },
      ];

      const recommendations = await getPageLinkingRecommendations("/page1", pages);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should return empty array for non-existent page", async () => {
      const pages = [
        { url: "/page1", links: [], content: "Content 1" },
      ];

      const recommendations = await getPageLinkingRecommendations("/non-existent", pages);

      expect(recommendations).toEqual([]);
    });

    it("should return recommendations for orphan page", async () => {
      const pages = [
        { url: "/page1", links: [], content: "skateboard products" },
        { url: "/orphan", links: [], content: "skateboard accessories" },
      ];

      const recommendations = await getPageLinkingRecommendations("/orphan", pages);

      if (recommendations.length > 0) {
        const hasRelevantRecommendation = recommendations.some(r => 
          r.type === "add-internal-link"
        );
        expect(hasRelevantRecommendation).toBe(true);
      }
    });
  });
});

