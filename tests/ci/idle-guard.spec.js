/**
 * Unit Tests: CI Guard - Heartbeat Verification
 *
 * Tests the idle-guard CI check that verifies heartbeat freshness.
 * These tests validate all scenarios from QA-021 test plan.
 */

const {
  parseHeartbeatSection,
  verifyHeartbeat,
} = require("../../scripts/ci/verify-heartbeat.cjs");
const fs = require("fs");
const path = require("path");
const os = require("os");

describe("CI Guard: Heartbeat Verification", () => {
  let tempDir;

  beforeEach(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ci-guard-hb-"));
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("parseHeartbeatSection", () => {
    test("TS-001: should extract heartbeat file path from PR body", () => {
      const prBody = `
## Heartbeat
- artifacts/devops/2025-10-21/heartbeat.ndjson

## Other Section
Some content
`;

      const path = parseHeartbeatSection(prBody);

      expect(path).toBe("artifacts/devops/2025-10-21/heartbeat.ndjson");
    });

    test("TS-002: should return null for <2h single session exemption", () => {
      const prBody = `
## Heartbeat
<2h single session - heartbeat not required

## Other Section
Some content
`;

      const path = parseHeartbeatSection(prBody);

      expect(path).toBeNull();
    });

    test("TS-003: should throw error if Heartbeat section missing", () => {
      const prBody = `
## Some Other Section
No heartbeat section here
`;

      expect(() => parseHeartbeatSection(prBody)).toThrow(
        /Heartbeat section missing/,
      );
      expect(() => parseHeartbeatSection(prBody)).toThrow(/Required format/);
    });

    test("TS-004: should throw error if no heartbeat file path found", () => {
      const prBody = `
## Heartbeat
Some text but no file path
`;

      expect(() => parseHeartbeatSection(prBody)).toThrow(
        /No heartbeat file path found/,
      );
    });

    test('TS-005: should accept "<2 hours" exemption', () => {
      const prBody = `
## Heartbeat
Task completed in <2 hours
`;

      const path = parseHeartbeatSection(prBody);
      expect(path).toBeNull();
    });

    test('TS-006: should accept "< 2h" exemption', () => {
      const prBody = `
## Heartbeat
< 2h - no heartbeat needed
`;

      const path = parseHeartbeatSection(prBody);
      expect(path).toBeNull();
    });
  });

  describe("verifyHeartbeat", () => {
    test("TS-007: should validate fresh heartbeat (within 15 minutes)", () => {
      const testFile = path.join(tempDir, "heartbeat.ndjson");
      const now = new Date();
      const content = JSON.stringify({
        timestamp: now.toISOString(),
        task: "DEVOPS-014",
        status: "doing",
        progress: "75%",
        file: "scripts/ci/verify-mcp.cjs",
      });

      fs.writeFileSync(testFile, content);

      // Should not throw
      expect(() => verifyHeartbeat(testFile)).not.toThrow();
    });

    test("TS-008: should throw error for stale heartbeat (>15 minutes, status=doing)", () => {
      const testFile = path.join(tempDir, "stale.ndjson");
      const staleTime = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
      const content = JSON.stringify({
        timestamp: staleTime.toISOString(),
        task: "DEVOPS-014",
        status: "doing", // Still in progress
        progress: "50%",
      });

      fs.writeFileSync(testFile, content);

      expect(() => verifyHeartbeat(testFile)).toThrow(/Heartbeat stale/);
      expect(() => verifyHeartbeat(testFile)).toThrow(/15 minute threshold/);
    });

    test("TS-009: should accept stale heartbeat if status=done", () => {
      const testFile = path.join(tempDir, "done.ndjson");
      const oldTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const content = JSON.stringify({
        timestamp: oldTime.toISOString(),
        task: "DEVOPS-014",
        status: "done", // Task complete
        progress: "100%",
      });

      fs.writeFileSync(testFile, content);

      // Should not throw because task is done
      expect(() => verifyHeartbeat(testFile)).not.toThrow();
    });

    test("TS-010: should throw error if file does not exist", () => {
      const nonExistentFile = path.join(tempDir, "does-not-exist.ndjson");

      expect(() => verifyHeartbeat(nonExistentFile)).toThrow(/not found/);
    });

    test("TS-011: should throw error if file is empty", () => {
      const emptyFile = path.join(tempDir, "empty.ndjson");
      fs.writeFileSync(emptyFile, "");

      expect(() => verifyHeartbeat(emptyFile)).toThrow(/empty/);
    });

    test("TS-012: should throw error for invalid JSON", () => {
      const invalidFile = path.join(tempDir, "invalid.ndjson");
      fs.writeFileSync(invalidFile, "not valid json\n");

      expect(() => verifyHeartbeat(invalidFile)).toThrow(/not valid JSON/);
    });

    test("TS-013: should throw error if timestamp field missing", () => {
      const testFile = path.join(tempDir, "no-timestamp.ndjson");
      fs.writeFileSync(testFile, '{"task":"TEST","status":"doing"}\n');

      expect(() => verifyHeartbeat(testFile)).toThrow(/missing 'timestamp'/);
    });

    test("TS-014: should throw error if status field missing", () => {
      const testFile = path.join(tempDir, "no-status.ndjson");
      const now = new Date();
      fs.writeFileSync(
        testFile,
        JSON.stringify({
          timestamp: now.toISOString(),
          task: "TEST",
        }),
      );

      expect(() => verifyHeartbeat(testFile)).toThrow(/missing 'status'/);
    });

    test("TS-015: should throw error for invalid timestamp format", () => {
      const testFile = path.join(tempDir, "invalid-timestamp.ndjson");
      fs.writeFileSync(
        testFile,
        '{"timestamp":"2025-10-21 14:30:00","task":"TEST","status":"doing"}\n',
      );

      expect(() => verifyHeartbeat(testFile)).toThrow(
        /Invalid timestamp format/,
      );
    });

    test("TS-016: should read last heartbeat from multiple entries", () => {
      const testFile = path.join(tempDir, "multiple.ndjson");
      const now = new Date();
      const entries = [
        {
          timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
          task: "TEST",
          status: "doing",
          progress: "30%",
        },
        {
          timestamp: new Date(now - 20 * 60 * 1000).toISOString(),
          task: "TEST",
          status: "doing",
          progress: "60%",
        },
        {
          timestamp: now.toISOString(),
          task: "TEST",
          status: "doing",
          progress: "90%",
        },
      ];

      fs.writeFileSync(
        testFile,
        entries.map((e) => JSON.stringify(e)).join("\n"),
      );

      // Should use the LAST entry (fresh), not the first (stale)
      expect(() => verifyHeartbeat(testFile)).not.toThrow();
    });
  });

  describe("Integration Test Scenarios (from QA-021)", () => {
    test("Scenario 1: PR with stale heartbeat (>15min) → CI should fail", () => {
      const testFile = path.join(tempDir, "stale.ndjson");
      const staleTime = new Date(Date.now() - 20 * 60 * 1000);
      fs.writeFileSync(
        testFile,
        JSON.stringify({
          timestamp: staleTime.toISOString(),
          task: "TEST",
          status: "doing",
        }),
      );

      expect(() => verifyHeartbeat(testFile)).toThrow(/stale/);
    });

    test("Scenario 2: PR with fresh heartbeat → CI should pass", () => {
      const testFile = path.join(tempDir, "fresh.ndjson");
      const now = new Date();
      fs.writeFileSync(
        testFile,
        JSON.stringify({
          timestamp: now.toISOString(),
          task: "TEST",
          status: "doing",
        }),
      );

      expect(() => verifyHeartbeat(testFile)).not.toThrow();
    });

    test('Scenario 3: PR with "<2h single session" → CI should pass', () => {
      const prBody = `
## Heartbeat
<2h single session - heartbeat not required
`;

      const path = parseHeartbeatSection(prBody);
      expect(path).toBeNull(); // Exempted
    });

    test("Scenario 4: Error messages are clear", () => {
      const testFile = path.join(tempDir, "stale.ndjson");
      const staleTime = new Date(Date.now() - 25 * 60 * 1000);
      fs.writeFileSync(
        testFile,
        JSON.stringify({
          timestamp: staleTime.toISOString(),
          task: "TEST",
          status: "doing",
        }),
      );

      try {
        verifyHeartbeat(testFile);
      } catch (error) {
        expect(error.message).toContain("❌");
        expect(error.message).toContain("Heartbeat stale");
        expect(error.message).toContain("15 minute threshold");
        expect(error.message).toMatch(/\d+\.\d+ minutes ago/);
      }
    });
  });
});
