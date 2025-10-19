#!/usr/bin/env node
/**
 * Generate large enumerations of "reasons" deterministically and stream to NDJSON.
 * Usage:
 *   node scripts/report/generate_reasons.mjs --failures 10004334 --advantages 5432 --out reports/manager/board/appendix.ndjson
 *   # Advanced (chunked + gzip):
 *   node scripts/report/generate_reasons.mjs --failures 1000000 --advantages 0 --out-prefix reports/manager/board/appendix/appendix --chunk-lines 1000000 --gzip true
 *
 * Each line:
 * {"type":"manager_failure","idx":1,"category":"Planning","reason":"Plan incompleteness at source (missing lane in latest.json)","seed": "..."}
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function arg(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && i + 1 < process.argv.length) return process.argv[i + 1];
  return dflt;
}

const FAILURES = parseInt(arg("failures", "0"), 10);
const ADV = parseInt(arg("advantages", "0"), 10);
const OUT = arg("out", "reports/manager/board/appendix.ndjson");
const SEED = arg("seed", String(Date.now()));
const OUT_PREFIX = arg("out-prefix", "");
const CHUNK = parseInt(arg("chunk-lines", "0"), 10);
const GZIP = String(arg("gzip", "false")).toLowerCase() === "true";
const START_INDEX = parseInt(arg("start-index", "1"), 10);

const failureBuckets = [
  { category: "Planning", reasons: [
      "Plan incompleteness at source (missing lane in latest.json)",
      "No fallback when plan artifact absent",
      "Restart without verifying lane coverage across teams",
      "Late publish of plan; directions pointed to 404"
  ]},
  { category: "Guards", reasons: [
      "Workflow mispatch (duplicate run blocks) in guard-mcp",
      "No workflow lint/self-test before merging CI changes",
      "Evidence gate flipped hard without seeding PRs",
      "Branch protection contexts changed mid-run"
  ]},
  { category: "CI", reasons: [
      "Repo-wide tests blocked slice merges",
      "No targeted tests by affected paths",
      "Broken manager-outcome step initially",
      "Stale heads / divergence ignored"
  ]},
  { category: "Direction", reasons: [
      "Single-source dependency without resilience",
      "NO-ASK not enforced in harness",
      "No preflight freeze (guards, plan, CI) before relaunch",
      "Delayed PR normalization (Fixes #…, Allowed paths…)"
  ]},
  { category: "Ops", reasons: [
      "Live-editing CI during agent execution",
      "Insufficient branch hygiene under new protection rules",
      "Missing canary to detect model/prompt drift",
      "Insufficient heartbeat policing of ‘doing’ lanes"
  ]},
];

const advantageBuckets = [
  { category: "Fallback", reasons: [
      "Resilient internal queue ignored missing plan artifact",
      "Executed roadmap molecules without waiting for manifest",
  ]},
  { category: "Discipline", reasons: [
      "Evidence-first: artifacts and PR sections written before code",
      "Strict NO-ASK loop; zero chat dependency",
  ]},
  { category: "Isolation", reasons: [
      "Unaffected by our broken workflow YAML",
      "Not gated by repo-wide test debt",
  ]},
  { category: "Cadence", reasons: [
      "Consistent heartbeat/evidence cadence",
      "Deterministic fallback when external tools unavailable",
  ]},
];

function* roundRobin(items) {
  let i = 0;
  while (true) {
    yield items[i % items.length];
    i++;
  }
}

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function makeStream(filename) {
  ensureDir(filename);
  if (GZIP) {
    const gz = zlib.createGzip({ level: 6 });
    const file = fs.createWriteStream(filename);
    gz.pipe(file);
    return { stream: gz, end: () => gz.end() };
  }
  const file = fs.createWriteStream(filename, { flags: "a" });
  return { stream: file, end: () => file.end() };
}

function writeLines(count, type, buckets, seed, startIdx = 1) {
  if (OUT_PREFIX && CHUNK > 0) {
    // Chunked output
    const flat = [];
    for (const b of buckets) for (const r of b.reasons) flat.push({category: b.category, reason: r});
    const rr = roundRobin(flat);
    let remaining = count;
    let part = 1;
    let idx = startIdx;
    const start = Date.now();
    while (remaining > 0) {
      const toWrite = Math.min(remaining, CHUNK);
      const filename = `${OUT_PREFIX}.${type}.part${String(part).padStart(2, "0")}.ndjson${GZIP ? ".gz" : ""}`;
      const { stream, end } = makeStream(filename);
      for (let i = 0; i < toWrite; i++) {
        const item = rr.next().value;
        const line = JSON.stringify({
          type, idx, category: item.category, reason: item.reason,
          seed, ts: new Date().toISOString(),
        }) + "\n";
        stream.write(line);
        idx++;
      }
      end();
      remaining -= toWrite;
      part++;
      const dur = ((Date.now() - start) / 1000).toFixed(2);
      process.stderr.write(`Wrote part ${part-1} (${toWrite} lines) of ${type} in ${dur}s -> ${filename}\n`);
    }
    return;
  }

  // Single file output
  const out = fs.createWriteStream(OUT, { flags: "a" });
  const flat = [];
  for (const b of buckets) for (const r of b.reasons) flat.push({category: b.category, reason: r});
  const rr = roundRobin(flat);
  const start = Date.now();
  for (let i = 0; i < count; i++) {
    const item = rr.next().value;
    const line = JSON.stringify({
      type,
      idx: startIdx + i,
      category: item.category,
      reason: item.reason,
      seed,
      ts: new Date().toISOString(),
    });
    out.write(line + "\n");
    if ((i+1) % 250000 === 0) {
      // periodic progress to stderr to avoid silence
      process.stderr.write(`..${type}:${startIdx + i}\n`);
    }
  }
  out.end();
  const dur = ((Date.now() - start) / 1000).toFixed(2);
  process.stderr.write(`Wrote ${count} ${type} lines in ${dur}s -> ${OUT}\n`);
}

(function main() {
  ensureDir(OUT);
  // Truncate existing file
  if (!OUT_PREFIX) {
    fs.writeFileSync(OUT, "");
  }
  if (FAILURES > 0) writeLines(FAILURES, "manager_failure", failureBuckets, SEED, START_INDEX);
  if (ADV > 0) writeLines(ADV, "claude_advantage", advantageBuckets, SEED, START_INDEX);
})();
