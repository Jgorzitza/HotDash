/**
 * Post Scheduler Service
 *
 * Determines optimal posting times based on:
 * - Platform-specific engagement patterns
 * - Historical performance data
 * - Day of week / time of day analysis
 *
 * @see app/fixtures/content/content-calendar.json
 * @see app/services/content/engagement-analyzer.ts
 */

import type { SocialPlatform } from "~/adapters/publer/types";

/**
 * Optimal Posting Time
 */
export interface OptimalPostingTime {
  platform: SocialPlatform;
  day_of_week: number; // 0=Sunday, 6=Saturday
  hour: number; // 0-23 UTC
  engagement_boost: number; // Expected % boost vs baseline
  confidence: "high" | "medium" | "low";
  rationale: string;
}

/**
 * Scheduled Post Entry
 */
export interface ScheduledPost {
  id: string;
  fixture_id: string;
  platform: SocialPlatform;
  scheduled_time: string; // ISO 8601
  optimal_time: boolean;
  rationale: string;
  status: "draft" | "pending_approval" | "scheduled" | "published";
}

/**
 * Get Optimal Posting Times for Platform
 *
 * Based on industry benchmarks and historical data (when available).
 *
 * @param platform - Social platform
 * @returns Array of optimal posting windows
 */
export function getOptimalPostingTimes(
  platform: SocialPlatform,
): OptimalPostingTime[] {
  // Industry benchmarks - would replace with actual data analysis
  const optimalTimes: Record<SocialPlatform, OptimalPostingTime[]> = {
    instagram: [
      {
        platform: "instagram",
        day_of_week: 3, // Wednesday
        hour: 19, // 7 PM UTC
        engagement_boost: 25,
        confidence: "high",
        rationale:
          "Wednesday evening peak engagement - users browse after work",
      },
      {
        platform: "instagram",
        day_of_week: 6, // Saturday
        hour: 14, // 2 PM UTC
        engagement_boost: 22,
        confidence: "high",
        rationale: "Saturday afternoon - leisure browsing time",
      },
      {
        platform: "instagram",
        day_of_week: 0, // Sunday
        hour: 16, // 4 PM UTC
        engagement_boost: 18,
        confidence: "medium",
        rationale: "Sunday afternoon - weekend browsing",
      },
    ],
    facebook: [
      {
        platform: "facebook",
        day_of_week: 5, // Friday
        hour: 18, // 6 PM UTC
        engagement_boost: 20,
        confidence: "high",
        rationale: "Friday evening - week wrap-up browsing",
      },
      {
        platform: "facebook",
        day_of_week: 6, // Saturday
        hour: 19, // 7 PM UTC
        engagement_boost: 18,
        confidence: "medium",
        rationale: "Saturday evening - casual browsing",
      },
    ],
    tiktok: [
      {
        platform: "tiktok",
        day_of_week: 2, // Tuesday
        hour: 20, // 8 PM UTC
        engagement_boost: 30,
        confidence: "high",
        rationale: "Tuesday evening - primetime for TikTok engagement",
      },
      {
        platform: "tiktok",
        day_of_week: 4, // Thursday
        hour: 19, // 7 PM UTC
        engagement_boost: 28,
        confidence: "high",
        rationale: "Thursday evening - strong engagement window",
      },
      {
        platform: "tiktok",
        day_of_week: 0, // Sunday
        hour: 16, // 4 PM UTC
        engagement_boost: 22,
        confidence: "medium",
        rationale: "Sunday afternoon - weekend scrolling",
      },
    ],
  };

  return optimalTimes[platform] || [];
}

/**
 * Calculate Next Optimal Posting Time
 *
 * Finds soonest optimal window after specified date.
 *
 * @param platform - Social platform
 * @param afterDate - Earliest possible posting time
 * @returns Optimal posting time or null
 */
export function getNextOptimalTime(
  platform: SocialPlatform,
  afterDate: Date = new Date(),
): { time: Date; rationale: string; confidence: string } | null {
  const optimalTimes = getOptimalPostingTimes(platform);

  if (optimalTimes.length === 0) {
    return null;
  }

  // Find next occurrence of any optimal window
  const now = afterDate.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  for (const optimal of optimalTimes) {
    const nextDate = getNextOccurrence(
      afterDate,
      optimal.day_of_week,
      optimal.hour,
    );

    if (nextDate.getTime() > now && nextDate.getTime() < now + oneWeek) {
      return {
        time: nextDate,
        rationale: optimal.rationale,
        confidence: optimal.confidence,
      };
    }
  }

  // If no window in next week, return first optimal time
  const first = optimalTimes[0];
  return {
    time: getNextOccurrence(afterDate, first.day_of_week, first.hour),
    rationale: first.rationale,
    confidence: first.confidence,
  };
}

/**
 * Get Next Occurrence of Day/Hour
 */
function getNextOccurrence(
  afterDate: Date,
  dayOfWeek: number,
  hour: number,
): Date {
  const result = new Date(afterDate);
  result.setUTCHours(hour, 0, 0, 0);

  // Calculate days until target day
  const currentDay = result.getUTCDay();
  let daysUntil = dayOfWeek - currentDay;

  if (daysUntil < 0 || (daysUntil === 0 && result <= afterDate)) {
    daysUntil += 7;
  }

  result.setUTCDate(result.getUTCDate() + daysUntil);

  return result;
}

/**
 * Schedule Post at Optimal Time
 *
 * Creates scheduled post entry with optimal timing.
 *
 * @param fixtureId - Idea pool fixture ID
 * @param platform - Target platform
 * @param earliestDate - Earliest allowed posting time
 * @returns Scheduled post entry
 */
export function schedulePostOptimally(
  fixtureId: string,
  platform: SocialPlatform,
  earliestDate?: Date,
): ScheduledPost {
  const optimalTime = getNextOptimalTime(platform, earliestDate);

  if (!optimalTime) {
    throw new Error(`No optimal posting times found for ${platform}`);
  }

  return {
    id: `sched-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    fixture_id: fixtureId,
    platform,
    scheduled_time: optimalTime.time.toISOString(),
    optimal_time: true,
    rationale: optimalTime.rationale,
    status: "draft",
  };
}
