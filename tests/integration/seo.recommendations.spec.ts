import { describe, it, expect } from "vitest";
import { normalizeVitals } from "../../app/lib/seo/vitals";
import { generatePerformanceRecommendations } from "../../app/lib/seo/recommendations";
import { createSEOApprovalPayload } from "../../app/lib/seo/approvals";

describe("SEO Recommendations Workflow Integration", () => {
  it("generates HITL-ready approval payload from vitals", () => {
    // Step 1: Normalize vitals (simulating GA4 data)
    const vitals = normalizeVitals(
      { LCP: 4500, FID: 150, CLS: 0.05 },
      "mobile",
    );

    // Verify vitals detection
    const failingVitals = vitals.filter((v) => !v.passes);
    expect(failingVitals.length).toBeGreaterThan(0);

    // Step 2: Generate recommendations
    const recommendations = generatePerformanceRecommendations(
      vitals,
      "/products/test",
    );
    expect(recommendations.length).toBeGreaterThan(0);

    const firstRec = recommendations[0];
    expect(firstRec).toHaveProperty("id");
    expect(firstRec).toHaveProperty("title");
    expect(firstRec).toHaveProperty("proposedActions");
    expect(firstRec).toHaveProperty("rollbackPlan");
    expect(firstRec.approversRequired).toContain("engineer");

    // Step 3: Create approval payload
    const payload = createSEOApprovalPayload(firstRec, vitals);

    // Verify HITL requirements
    expect(payload.kind).toBe("seo.recommendation");
    expect(payload.evidence.length).toBeGreaterThan(0);
    expect(payload.proposedChanges.length).toBeGreaterThan(0);
    expect(payload.rollback.steps.length).toBeGreaterThan(0);
    expect(payload.rollback.monitoringWindow).toBe("48 hours");

    // Verify evidence includes vitals
    const vitalsEvidence = payload.evidence.find(
      (e) => e.source === "Core Web Vitals",
    );
    expect(vitalsEvidence).toBeDefined();
  });

  it("prioritizes critical vitals issues", () => {
    const criticalVitals = normalizeVitals(
      { LCP: 5000, FID: 400, CLS: 0.3 },
      "mobile",
    );
    const recommendations = generatePerformanceRecommendations(
      criticalVitals,
      "/test",
    );

    const criticalRecs = recommendations.filter(
      (r) => r.priority === "critical",
    );
    expect(criticalRecs.length).toBeGreaterThan(0);
  });
});
