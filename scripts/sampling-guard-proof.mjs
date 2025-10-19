#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLING_KEYWORDS = ["sample", "data sampling"];
const SAMPLING_ERROR_CODES = new Set(["DATA_PARTIAL", "DATA_SAMPLING"]);

function isSamplingError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const details = error;

  if (details.code && SAMPLING_ERROR_CODES.has(details.code)) {
    return true;
  }

  const rawMessage =
    typeof details.message === "string"
      ? details.message
      : typeof details.message === "undefined" && "message" in error
        ? error.message
        : "";

  if (typeof rawMessage !== "string") {
    return false;
  }

  const normalized = rawMessage.toLowerCase();
  return SAMPLING_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function buildTestCases() {
  return [
    {
      name: "success_non_sampled_response",
      input: {},
      expect: false,
    },
    {
      name: "flagged_sampled_response",
      input: { code: "DATA_SAMPLING" },
      expect: true,
    },
    {
      name: "error_code_contains_sample",
      input: { code: "DATA_PARTIAL", message: "Partial data returned" },
      expect: true,
    },
    {
      name: "string_message_contains_sample",
      input: {
        message: "Warning: report includes data sampling on property 123",
      },
      expect: true,
    },
    {
      name: "object_message_contains_sample",
      input: new Error("Data sampling triggered upstream"),
      expect: true,
    },
  ];
}

function formatTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const startedAt = new Date();
  const cases = buildTestCases();

  const results = cases.map((test) => {
    const got = isSamplingError(test.input);
    return {
      name: test.name,
      expect: test.expect,
      got,
      pass: got === test.expect,
    };
  });

  const passed = results.filter((result) => result.pass).length;
  const finishedAt = new Date();

  const proof = {
    proofType: "sampling_guard_proof",
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
    },
    results,
    notes:
      "Validates GA4 sampling detection heuristics. Mock inputs only; no external API calls performed.",
  };

  const isoDate = startedAt.toISOString().split("T")[0];
  const proofDir = join(
    fileURLToPath(new URL(".", import.meta.url)),
    "..",
    "artifacts",
    "analytics",
    isoDate,
  );

  mkdirSync(proofDir, { recursive: true });

  const proofPath = join(
    proofDir,
    `sampling_guard_proof_${formatTimestamp(finishedAt)}.json`,
  );

  writeFileSync(proofPath, JSON.stringify(proof, null, 2));

  console.log(
    JSON.stringify(
      {
        proofPath,
        total: proof.summary.total,
        passed: proof.summary.passed,
        failed: proof.summary.failed,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Sampling guard proof failed", error);
  process.exitCode = 1;
});
