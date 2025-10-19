/**
 * Content Fixture Loader
 *
 * Loads idea pool fixtures and other content fixtures.
 * Replaces placeholder implementation in post-drafter.ts
 *
 * @see app/fixtures/content/idea-pool.json
 */

import ideaPoolData from "~/fixtures/content/idea-pool.json";

/**
 * Idea Pool Fixture Entry
 */
export interface IdeaPoolEntry {
  id: string;
  type: "launch" | "evergreen" | "wildcard";
  title: string;
  description: string;
  provenance: {
    mode: "dev:test" | "production";
    created_at: string;
    agent: string;
    feedback_ref: string;
  };
  evidence: Record<string, string>;
  supabase_linkage: {
    table: string;
    status: string;
    priority?: string;
    [key: string]: any;
  };
  messaging: {
    headline?: string;
    hook?: string;
    key_benefits?: string[];
    content_pillars?: string[];
    incentive_structure?: string[];
    cta?: string;
    [key: string]: any;
  };
  launch_timeline?: {
    [key: string]: string;
  };
  [key: string]: any;
}

/**
 * Load Idea Pool Fixture by ID
 *
 * @param fixtureId - Fixture ID (e.g., "launch-001")
 * @returns Fixture entry or null if not found
 */
export function loadIdeaPoolFixture(fixtureId: string): IdeaPoolEntry | null {
  const entry = ideaPoolData.find((item) => item.id === fixtureId);
  return entry || null;
}

/**
 * Load All Idea Pool Fixtures
 *
 * @returns Array of all fixture entries
 */
export function loadAllIdeaPoolFixtures(): IdeaPoolEntry[] {
  return ideaPoolData as IdeaPoolEntry[];
}

/**
 * Load Fixtures by Type
 *
 * @param type - Fixture type (launch/evergreen/wildcard)
 * @returns Array of matching fixtures
 */
export function loadFixturesByType(
  type: "launch" | "evergreen" | "wildcard",
): IdeaPoolEntry[] {
  return ideaPoolData.filter((item) => item.type === type) as IdeaPoolEntry[];
}

/**
 * Get Wildcard Fixture
 *
 * Per North Star: "exactly one Wildcard" at all times
 *
 * @returns Wildcard fixture or null
 */
export function getWildcardFixture(): IdeaPoolEntry | null {
  const wildcards = loadFixturesByType("wildcard");

  if (wildcards.length === 0) {
    console.warn("No wildcard fixture found - North Star requires exactly 1");
    return null;
  }

  if (wildcards.length > 1) {
    console.warn(
      `Multiple wildcards found (${wildcards.length}) - North Star requires exactly 1`,
    );
  }

  return wildcards[0];
}

/**
 * Validate Idea Pool Structure
 *
 * Ensures fixture meets requirements:
 * - At least 3 scenarios
 * - Exactly 1 wildcard
 * - Required fields present
 *
 * @returns Validation result
 */
export function validateIdeaPool(): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const all = loadAllIdeaPoolFixtures();

  // Check minimum count
  if (all.length < 3) {
    issues.push(`Insufficient scenarios: ${all.length} (need ≥3)`);
  }

  // Check wildcard count
  const wildcards = loadFixturesByType("wildcard");
  if (wildcards.length === 0) {
    issues.push("Missing wildcard - North Star requires exactly 1");
  } else if (wildcards.length > 1) {
    issues.push(`Too many wildcards: ${wildcards.length} (need exactly 1)`);
  }

  // Check required fields
  all.forEach((entry) => {
    if (!entry.id)
      issues.push(
        `Entry missing id: ${JSON.stringify(entry).substring(0, 50)}`,
      );
    if (!entry.type) issues.push(`Entry ${entry.id} missing type`);
    if (!entry.messaging) issues.push(`Entry ${entry.id} missing messaging`);
    if (!entry.evidence) issues.push(`Entry ${entry.id} missing evidence`);
    if (!entry.supabase_linkage)
      issues.push(`Entry ${entry.id} missing supabase_linkage`);
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
