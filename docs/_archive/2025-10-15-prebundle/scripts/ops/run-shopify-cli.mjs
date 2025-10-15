#!/usr/bin/env node
/**
 * Wrapper around Shopify CLI invocations that streams command output while
 * emitting structured JSON logs for observability.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_LOG_DIR = path.join(process.cwd(), "artifacts", "engineering", "shopify_cli");

function sanitizeSegment(value) {
  if (!value) return "shopify-cli";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "shopify-cli";
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    logPath: undefined,
    artifactDir: process.env.SHOPIFY_CLI_LOG_DIR || DEFAULT_LOG_DIR,
    label: undefined,
  };

  let separatorIndex = args.indexOf("--");
  if (separatorIndex === -1) {
    separatorIndex = args.length;
  }

  const optionArgs = args.slice(0, separatorIndex);
  const cliArgs = args.slice(separatorIndex + 1);

  for (let i = 0; i < optionArgs.length; i += 1) {
    const current = optionArgs[i];
    const requireValue = () => {
      i += 1;
      const value = optionArgs[i];
      if (value === undefined) {
        throw new Error(`Option "${current}" requires a value`);
      }
      return value;
    };
    switch (current) {
      case "--log":
        options.logPath = requireValue();
        break;
      case "--artifact-dir":
        options.artifactDir = requireValue();
        break;
      case "--label":
        options.label = requireValue();
        break;
      case "":
        break;
      default:
        throw new Error(`Unknown option "${current}". Supported: --log, --artifact-dir, --label, --`);
    }
  }

  if (cliArgs.length === 0) {
    throw new Error("Usage: run-shopify-cli.mjs [--log <file>] [--label <label>] [--artifact-dir <dir>] -- <command args>");
  }

  return { cliArgs, options };
}

async function writeJsonFile(filePath, payload) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function writeTextFile(filePath, contents) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`[shopify-cli] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  const { cliArgs, options } = parsed;
  const startedAt = new Date();
  const command = ["--yes", "@shopify/cli@latest", ...cliArgs];

  const child = spawn("npx", command, {
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    stdout += text;
    process.stdout.write(chunk);
  });

  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    stderr += text;
    process.stderr.write(chunk);
  });

  const exitInfo = await new Promise((resolve) => {
    child.on("close", (code, signal) => {
      resolve({ code, signal });
    });
    child.on("error", (error) => {
      resolve({ code: 1, signal: null, error });
    });
  });

  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  const logRecord = {
    label: options.label ?? cliArgs.join(" "),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs,
    command: {
      executable: "npx",
      args: command,
      cwd: process.cwd(),
    },
    environment: {
      shopDomain:
        process.env.STAGING_SHOP_DOMAIN ??
        process.env.PRODUCTION_SHOP_DOMAIN ??
        process.env.SHOP_DOMAIN ??
        null,
      shopifyEnvironment: process.env.SHOPIFY_FLAG_ENVIRONMENT ?? null,
    },
    status: {
      exitCode: exitInfo.code,
      signal: exitInfo.signal,
    },
  };

  const clientIdFlagIndex = cliArgs.findIndex((arg) => arg === "--client-id");
  if (clientIdFlagIndex !== -1 && clientIdFlagIndex + 1 < cliArgs.length) {
    logRecord.environment = {
      ...logRecord.environment,
      clientId: cliArgs[clientIdFlagIndex + 1],
    };
  }

  if (exitInfo.error) {
    logRecord.status.error = exitInfo.error.message;
  }

  if (stdout) {
    logRecord.stdoutBytes = Buffer.byteLength(stdout, "utf8");
  }

  if (stderr) {
    logRecord.stderrBytes = Buffer.byteLength(stderr, "utf8");
  }

  const timestampSegment = startedAt.toISOString().replace(/[:]/g, "-");
  const labelSegment = sanitizeSegment(options.label ?? cliArgs[0]);
  const logDir = options.artifactDir || DEFAULT_LOG_DIR;
  const structuredLogPath = path.join(logDir, `${timestampSegment}-${labelSegment}.json`);

  await writeTextFile(options.logPath, stdout);
  await writeJsonFile(structuredLogPath, {
    ...logRecord,
    stdout,
    stderr,
    logFile: options.logPath ? path.resolve(options.logPath) : null,
  });

  console.error(`[shopify-cli] Structured log saved to ${structuredLogPath}`);

  if (exitInfo.code && exitInfo.code !== 0) {
    process.exitCode = exitInfo.code;
  }
}

await main();
