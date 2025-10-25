#!/usr/bin/env node

/**
 * CI Guard: MCP Evidence Verification
 *
 * Verifies that MCP evidence JSONL files are present and valid in PR.
 * This is a CI merge blocker - PRs cannot merge without valid MCP evidence.
 *
 * Requirements:
 * - Parse PR body for MCP Evidence section
 * - Extract JSONL file paths
 * - Verify files exist
 * - Validate JSONL format (valid JSON, required fields)
 *
 * Exemptions:
 * - Non-code changes (docs-only, config-only)
 * - If PR body contains "No MCP usage - non-code change"
 */

const fs = require("fs");
const path = require("path");

/**
 * Parse PR body and extract MCP Evidence JSONL file paths
 * @param {string} prBody - PR description body
 * @returns {string[] | null} - Array of file paths or null if exempted
 * @throws {Error} - If MCP Evidence section missing or invalid
 */
function parsePRBody(prBody) {
  // Extract MCP Evidence section (between ## MCP Evidence and next ##)
  const match = prBody.match(/## MCP Evidence.*?\n([\s\S]*?)(?:\n##|$)/);

  if (!match) {
    throw new Error(
      "❌ MCP Evidence section missing from PR body. Required format:\n\n## MCP Evidence\n- artifacts/<agent>/<date>/mcp/<tool>.jsonl\n\nOr for non-code changes:\n\n## MCP Evidence\nNo MCP usage - non-code change (docs/config only)",
    );
  }

  const section = match[1];

  // Check for "non-code change" exemption
  if (
    section.includes("No MCP usage - non-code change") ||
    section.includes("non-code change") ||
    section.includes("docs-only") ||
    section.includes("config-only")
  ) {
    console.log(
      "✅ Non-code change exemption found - MCP evidence not required",
    );
    return null;
  }

  // Extract file paths matching pattern: artifacts/<agent>/<date>/mcp/*.jsonl
  const pathMatches = section.matchAll(
    /artifacts\/([^\/\s]+)\/([^\/\s]+)\/mcp\/([^\s\)]+\.jsonl)/g,
  );
  const paths = Array.from(pathMatches).map((m) => m[0]);

  if (paths.length === 0) {
    throw new Error(
      "❌ No MCP evidence JSONL paths found in PR body.\n\nExpected format:\n- artifacts/<agent>/<date>/mcp/<tool>.jsonl\n\nExample:\n- artifacts/devops/2025-10-21/mcp/ci-guards.jsonl\n- artifacts/engineer/2025-10-21/mcp/react-router.jsonl",
    );
  }

  return paths;
}

/**
 * Validate a single JSONL file
 * @param {string} filePath - Path to JSONL file
 * @throws {Error} - If file doesn't exist or is invalid
 */
function validateJSONL(filePath) {
  // Check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `❌ MCP evidence file not found: ${filePath}\n\nFile must be committed to the repository.`,
    );
  }

  // Read file content
  const content = fs.readFileSync(filePath, "utf8").trim();

  if (content.length === 0) {
    throw new Error(
      `❌ MCP evidence file is empty: ${filePath}\n\nEach MCP tool call must be logged as a JSON line.`,
    );
  }

  // Split into lines and validate each
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    if (line.trim().length === 0) {
      return; // Skip empty lines
    }

    try {
      const obj = JSON.parse(line);

      // Verify required fields
      const requiredFields = ["tool", "timestamp"];
      const missingFields = requiredFields.filter((field) => !obj[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Validate timestamp format (ISO 8601)
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
      if (!timestampRegex.test(obj.timestamp)) {
        throw new Error(
          `Invalid timestamp format: ${obj.timestamp}. Expected: YYYY-MM-DDTHH:MM:SSZ`,
        );
      }
    } catch (error) {
      throw new Error(
        `❌ ${filePath} - Line ${idx + 1} is not valid JSON: ${error.message}\n\nExpected format:\n{"tool":"shopify-dev|context7|web-search","doc_ref":"<url>","timestamp":"2025-10-21T14:30:00Z","purpose":"Learn X"}`,
      );
    }
  });

  console.log(`✅ Valid JSONL: ${filePath} (${lines.length} entries)`);
}

/**
 * Main execution
 */
async function main() {
  const prBody = process.env.PR_BODY;

  if (!prBody) {
    throw new Error(
      "❌ PR_BODY environment variable not set.\n\nThis script must be run in GitHub Actions with PR context.",
    );
  }

  console.log("🔍 Verifying MCP Evidence...\n");

  try {
    const paths = parsePRBody(prBody);

    if (paths === null) {
      // Non-code change exemption
      console.log("\n✅ MCP Evidence Check PASSED (exempted)");
      process.exit(0);
    }

    console.log(
      `Found ${paths.length} MCP evidence file(s):\n${paths.map((p) => `  - ${p}`).join("\n")}\n`,
    );

    // Validate all files
    paths.forEach(validateJSONL);

    console.log(
      `\n✅ MCP Evidence Check PASSED: ${paths.length} file(s) validated`,
    );
    process.exit(0);
  } catch (error) {
    console.error(`\n${error.message}\n`);
    console.error("💡 To fix this:");
    console.error("1. Ensure you've logged all MCP tool calls to JSONL files");
    console.error("2. Commit the JSONL files to artifacts/<agent>/<date>/mcp/");
    console.error("3. List the files in the PR body under '## MCP Evidence'");
    console.error(
      "\nSee: docs/runbooks/agent_startup_checklist.md (Section 2.1)\n",
    );
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`\n❌ Unexpected error: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = { parsePRBody, validateJSONL };
