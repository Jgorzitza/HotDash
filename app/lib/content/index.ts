/**
 * Content Library - Public Exports
 *
 * Centralized exports for content agent modules.
 */

// Tracking
export {
  calculateEngagementRate,
  calculateClickThroughRate,
  calculateConversionRate,
  getPerformanceTier,
  getPlatformEngagementTarget,
  getPlatformCTRTarget,
  getPlatformConversionTarget,
  getContentPerformance,
  getAggregatedPerformance,
  getTopPerformingPosts,
  type SocialPlatform,
  type EngagementMetrics,
  type ReachMetrics,
  type ClickMetrics,
  type ConversionMetrics,
  type ContentPerformance,
  type AggregatedPerformance,
} from "./tracking";

// Tone Validation
export { validateTone, type ToneValidationResult } from "./tone-validator";

// Fixture Loading
export {
  loadIdeaPoolFixture,
  loadAllIdeaPoolFixtures,
  loadFixturesByType,
  getWildcardFixture,
  validateIdeaPool,
  type IdeaPoolEntry,
} from "./fixture-loader";
