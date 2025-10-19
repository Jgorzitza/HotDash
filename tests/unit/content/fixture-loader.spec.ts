/**
 * Fixture Loader Tests
 */

import { describe, it, expect } from "vitest";
import {
  loadIdeaPoolFixture,
  loadAllIdeaPoolFixtures,
  getWildcardFixture,
  validateIdeaPool,
} from "~/lib/content/fixture-loader";

describe("Fixture Loader", () => {
  it("loads fixture by ID", () => {
    const fixture = loadIdeaPoolFixture("launch-001");

    expect(fixture).toBeDefined();
    expect(fixture?.id).toBe("launch-001");
    expect(fixture?.type).toBe("launch");
  });

  it("returns null for non-existent fixture", () => {
    const fixture = loadIdeaPoolFixture("non-existent");

    expect(fixture).toBeNull();
  });

  it("loads all fixtures", () => {
    const all = loadAllIdeaPoolFixtures();

    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("gets wildcard fixture", () => {
    const wildcard = getWildcardFixture();

    expect(wildcard).toBeDefined();
    expect(wildcard?.type).toBe("wildcard");
  });

  it("validates idea pool structure", () => {
    const validation = validateIdeaPool();

    expect(validation.valid).toBe(true);
    expect(validation.issues.length).toBe(0);
  });
});
