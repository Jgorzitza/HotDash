/**
 * Unit Tests: CI Guard - MCP Evidence Verification
 *
 * Tests the guard-mcp CI check that verifies MCP evidence JSONL files.
 * These tests validate all scenarios from QA-021 test plan.
 */

const {
  parsePRBody,
  validateJSONL,
} = require("../../scripts/ci/verify-mcp-evidence.cjs");
const fs = require("fs");
const path = require("path");
const os = require("os");

describe("CI Guard: MCP Evidence Verification", () => {
  let tempDir;

  beforeEach(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ci-guard-mcp-"));
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("parsePRBody", () => {
    test("TS-001: should extract MCP evidence file paths from PR body", () => {
      const prBody = `
## MCP Evidence
- artifacts/devops/2025-10-21/mcp/ci-guards.jsonl
- artifacts/engineer/2025-10-21/mcp/react-router.jsonl

## Other Section
Some other content
`;

      const paths = parsePRBody(prBody);

      expect(paths).toEqual([
        "artifacts/devops/2025-10-21/mcp/ci-guards.jsonl",
        "artifacts/engineer/2025-10-21/mcp/react-router.jsonl",
      ]);
    });

    test("TS-002: should return null for non-code change exemption", () => {
      const prBody = `
## MCP Evidence
No MCP usage - non-code change (docs-only)

## Other Section
Some other content
`;

      const paths = parsePRBody(prBody);

      expect(paths).toBeNull();
    });

    test("TS-003: should throw error if MCP Evidence section missing", () => {
      const prBody = `
## Some Other Section
No MCP Evidence section here
`;

      expect(() => parsePRBody(prBody)).toThrow(/MCP Evidence section missing/);
      expect(() => parsePRBody(prBody)).toThrow(/Required format/);
    });

    test("TS-004: should throw error if no JSONL paths found", () => {
      const prBody = `
## MCP Evidence
Some text but no file paths
`;

      expect(() => parsePRBody(prBody)).toThrow(
        /No MCP evidence JSONL paths found/,
      );
      expect(() => parsePRBody(prBody)).toThrow(/Expected format/);
    });

    test('TS-005: should accept "config-only" exemption', () => {
      const prBody = `
## MCP Evidence
config-only - no code changes
`;

      const paths = parsePRBody(prBody);
      expect(paths).toBeNull();
    });

    test('TS-006: should accept "docs-only" exemption', () => {
      const prBody = `
## MCP Evidence
docs-only changes
`;

      const paths = parsePRBody(prBody);
      expect(paths).toBeNull();
    });
  });

  describe("validateJSONL", () => {
    test("TS-007: should validate correct JSONL file", () => {
      const testFile = path.join(tempDir, "valid.jsonl");
      const content = `{"tool":"shopify-dev","doc_ref":"https://shopify.dev/docs","request_id":"123","timestamp":"2025-10-21T14:30:00Z","purpose":"Learn Polaris"}
{"tool":"context7","doc_ref":"https://context7.com/docs","request_id":"124","timestamp":"2025-10-21T14:35:00Z","purpose":"Learn Prisma"}`;

      fs.writeFileSync(testFile, content);

      // Should not throw
      expect(() => validateJSONL(testFile)).not.toThrow();
    });

    test("TS-008: should throw error if file does not exist", () => {
      const nonExistentFile = path.join(tempDir, "does-not-exist.jsonl");

      expect(() => validateJSONL(nonExistentFile)).toThrow(/not found/);
    });

    test("TS-009: should throw error if file is empty", () => {
      const emptyFile = path.join(tempDir, "empty.jsonl");
      fs.writeFileSync(emptyFile, "");

      expect(() => validateJSONL(emptyFile)).toThrow(/empty/);
    });

    test("TS-010: should throw error for invalid JSON", () => {
      const invalidFile = path.join(tempDir, "invalid.jsonl");
      fs.writeFileSync(invalidFile, "not valid json\n");

      expect(() => validateJSONL(invalidFile)).toThrow(/not valid JSON/);
    });

    test("TS-011: should throw error if required fields missing", () => {
      const testFile = path.join(tempDir, "missing-fields.jsonl");
      // Missing 'tool' field
      fs.writeFileSync(
        testFile,
        '{"timestamp":"2025-10-21T14:30:00Z","purpose":"Test"}\n',
      );

      expect(() => validateJSONL(testFile)).toThrow(/Missing required fields/);
      expect(() => validateJSONL(testFile)).toThrow(/tool/);
    });

    test("TS-012: should throw error for invalid timestamp format", () => {
      const testFile = path.join(tempDir, "invalid-timestamp.jsonl");
      fs.writeFileSync(
        testFile,
        '{"tool":"shopify-dev","timestamp":"2025-10-21 14:30:00","purpose":"Test"}\n',
      );

      expect(() => validateJSONL(testFile)).toThrow(/Invalid timestamp format/);
      expect(() => validateJSONL(testFile)).toThrow(/YYYY-MM-DDTHH:MM:SSZ/);
    });

    test("TS-013: should accept empty lines in JSONL", () => {
      const testFile = path.join(tempDir, "with-empty-lines.jsonl");
      const content = `{"tool":"shopify-dev","timestamp":"2025-10-21T14:30:00Z","purpose":"Test 1"}

{"tool":"context7","timestamp":"2025-10-21T14:35:00Z","purpose":"Test 2"}

`;

      fs.writeFileSync(testFile, content);

      // Should not throw
      expect(() => validateJSONL(testFile)).not.toThrow();
    });

    test("TS-014: should validate multiple valid entries", () => {
      const testFile = path.join(tempDir, "multiple.jsonl");
      const lines = [];
      for (let i = 0; i < 10; i++) {
        lines.push(
          JSON.stringify({
            tool: "shopify-dev",
            timestamp: `2025-10-21T14:${i.toString().padStart(2, "0")}:00Z`,
            purpose: `Test ${i}`,
          }),
        );
      }
      fs.writeFileSync(testFile, lines.join("\n"));

      // Should not throw
      expect(() => validateJSONL(testFile)).not.toThrow();
    });
  });

  describe("Error Messages", () => {
    test("TS-015: should provide clear error message for missing section", () => {
      const prBody = "## Some Section\nContent";

      try {
        parsePRBody(prBody);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("MCP Evidence section missing");
        expect(error.message).toContain("Required format");
        expect(error.message).toContain(
          "artifacts/<agent>/<date>/mcp/<tool>.jsonl",
        );
      }
    });

    test("TS-016: should provide clear error message for invalid JSONL", () => {
      const testFile = path.join(tempDir, "bad.jsonl");
      fs.writeFileSync(testFile, "{ invalid json");

      try {
        validateJSONL(testFile);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("not valid JSON");
        expect(error.message).toContain("Expected format");
      }
    });
  });

  describe("Integration Test Scenarios (from QA-021)", () => {
    test("Scenario 1: PR with missing MCP evidence → CI should fail", () => {
      const prBody = "## Some Section\nNo MCP Evidence section";

      expect(() => parsePRBody(prBody)).toThrow();
    });

    test("Scenario 2: PR with invalid JSONL → CI should fail", () => {
      const testFile = path.join(tempDir, "invalid.jsonl");
      fs.writeFileSync(testFile, "invalid json");

      expect(() => validateJSONL(testFile)).toThrow();
    });

    test("Scenario 3: PR with valid MCP evidence → CI should pass", () => {
      const prBody = `
## MCP Evidence
- artifacts/qa/2025-10-21/mcp/ci-guards.jsonl
`;

      const testFile = "artifacts/qa/2025-10-21/mcp/ci-guards.jsonl";

      // Create valid file
      const dir = path.dirname(testFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        testFile,
        JSON.stringify({
          tool: "web-search",
          timestamp: "2025-10-21T17:00:00Z",
          purpose: "CI guard testing",
        }),
      );

      const paths = parsePRBody(prBody);
      expect(paths).toEqual([testFile]);

      // Validate
      expect(() => validateJSONL(testFile)).not.toThrow();

      // Cleanup
      fs.rmSync(testFile);
      fs.rmSync("artifacts", { recursive: true, force: true });
    });

    test('Scenario 4: PR with "non-code change" → CI should pass', () => {
      const prBody = `
## MCP Evidence
No MCP usage - non-code change (docs only)
`;

      const paths = parsePRBody(prBody);
      expect(paths).toBeNull(); // Exempted
    });

    test("Scenario 5: Error messages are clear and actionable", () => {
      const prBody = "## Other\nNo MCP section";

      try {
        parsePRBody(prBody);
      } catch (error) {
        expect(error.message).toContain("❌");
        expect(error.message).toContain("Required format");
        expect(error.message).toContain("artifacts/");
        expect(error.message).toContain("Example");
      }
    });
  });
});
