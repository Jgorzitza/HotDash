#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const target = process.env.LIGHTHOUSE_TARGET || process.env.STAGING_SMOKE_TEST_URL;

async function main() {
  if (!target) {
    console.log(
      "Skipping Lighthouse audit: set LIGHTHOUSE_TARGET or STAGING_SMOKE_TEST_URL once dashboard routing is live.",
    );
    return;
  }

  await mkdir("coverage/lighthouse", { recursive: true });

  const args = [
    target,
    "--quiet",
    "--chrome-flags=--headless=new",
    "--output=json",
    "--output-path=coverage/lighthouse/report.json",
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(require.resolve("lighthouse/lighthouse-cli"), args, {
      stdio: "inherit",
      env: { ...process.env },
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Lighthouse exited with code ${code}`));
    });
  });

  await writeFile(
    "coverage/lighthouse/last-target.txt",
    `target=${target}\nrunAt=${new Date().toISOString()}\n`,
    { encoding: "utf8" },
  );
}

// ensure lighthouse dependency resolved even in ESM contexts
createRequire(import.meta.url)("lighthouse");

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
