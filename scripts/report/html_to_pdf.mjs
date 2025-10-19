#!/usr/bin/env node
/**
 * Render an HTML file to PDF using Playwright Chromium.
 * Usage:
 *   node scripts/report/html_to_pdf.mjs reports/manager/board/2025-10-19_incident_report.html reports/manager/board/2025-10-19_incident_report.pdf
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

async function main() {
  const [,, inPath, outPath] = process.argv;
  if (!inPath || !outPath) {
    console.error("usage: node scripts/report/html_to_pdf.mjs <input.html> <output.pdf>");
    process.exit(2);
  }
  const absIn = path.resolve(inPath);
  const absOut = path.resolve(outPath);
  if (!fs.existsSync(absIn)) {
    console.error(`input not found: ${absIn}`);
    process.exit(3);
  }
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();
  const fileUrl = url.pathToFileURL(absIn).toString();
  await page.goto(fileUrl, { waitUntil: "load" });
  await page.emulateMedia({ media: "screen" });
  await page.pdf({
    path: absOut,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
  });
  await browser.close();
  console.log(`PDF written: ${absOut}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

