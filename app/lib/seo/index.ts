/**
 * SEO Module - Barrel Exports
 *
 * Centralized exports for all SEO functionality
 */

// Core Web Vitals
export { normalizeVitals } from "./vitals";
export type { VitalsAssessment, WebVitals } from "./vitals";

// SEO Diagnostics
export { buildSeoDiagnostics } from "./diagnostics";

// Search Console
export { fetchSearchConsoleQueries } from "./search-console";
export type {
  SearchConsoleQuery,
  SearchConsoleAPIConfig,
} from "./search-console";

// Recommendations
export { generatePerformanceRecommendations } from "./recommendations";
export type { SEORecommendation } from "./recommendations";

// Cannibalization Detection
export { detectOrganicVsOrganicConflicts } from "./cannibalization";
export type { CannibalizationIssue } from "./cannibalization";

// Approvals
export { createSEOApprovalPayload } from "./approvals";
export type { SEOApprovalPayload } from "./approvals";

// Anomalies
export type { SEOAnomaly } from "./anomalies";
