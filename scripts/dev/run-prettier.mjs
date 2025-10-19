#!/usr/bin/env node

import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = Number.parseInt(
  process.env.FMT_TIMEOUT_MS ?? "20000",
  10,
);

const prettierArgs = process.argv.slice(2);

const targetArgs =
  prettierArgs.length > 0
    ? prettierArgs
    : [
        "--write",
        "{app,packages,tests,scripts,docs}/**/*.{ts,tsx,js,jsx,json,md}",
      ];

const controller = new AbortController();
const timeout = setTimeout(() => {
  console.error(
    `[fmt] Prettier exceeded ${DEFAULT_TIMEOUT_MS}ms, aborting to avoid hang. ` +
      "Override with FMT_TIMEOUT_MS if needed.",
  );
  controller.abort();
}, DEFAULT_TIMEOUT_MS).unref();

const child = spawn("npx", ["prettier", ...targetArgs], {
  stdio: "inherit",
  signal: controller.signal,
});

child.on("error", (error) => {
  clearTimeout(timeout);
  if (error.name === "AbortError") {
    console.error("[fmt] Prettier run aborted after timeout.");
    process.exit(124);
    return;
  }
  console.error("[fmt] Failed to execute Prettier:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  clearTimeout(timeout);
  if (signal) {
    console.error(`[fmt] Prettier terminated with signal ${signal}.`);
    process.exit(1);
    return;
  }
  process.exit(code ?? 0);
});
