import { promises as fs } from "fs";
import { join } from "path";

const DEFAULT_TARGETS = [
  "https://hotrodan.com/",
  "https://hotrodan.com/products",
];

const RETRY_TARGETS = [
  "https://hotrodan.com/faq",
  "https://hotrodan.com/about",
  "https://hotrodan.com/support",
];

const CUSTOM_TARGETS = process.env.HOTRODAN_TARGETS
  ? process.env.HOTRODAN_TARGETS.split(/\s+/).filter(Boolean)
  : [...DEFAULT_TARGETS, ...RETRY_TARGETS];

function timestamp(): string {
  const now = new Date();
  return now.toISOString();
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

async function fetchContent(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "HotDash-AI-Ingest/1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return text;
}

async function main() {
  const outDir = join(process.cwd(), "packages", "memory", "logs", "build", "hotrodan_content");
  await ensureDir(outDir);
  const runTimestamp = timestamp().replace(/[:T]/g, "-").replace(/\..+$/, "");
  const outPath = join(outDir, `hotrodan-${runTimestamp}.ndjson`);

  const records: string[] = [];

  for (const url of CUSTOM_TARGETS) {
    try {
      const content = await fetchContent(url);
      const record = {
        source: url,
        fetchedAt: timestamp(),
        content,
      };
      records.push(JSON.stringify(record));
      console.log(`[ingest-hotrodan] fetched ${url}`);
    } catch (error) {
      const record = {
        source: url,
        fetchedAt: timestamp(),
        error: (error as Error).message,
      };
      records.push(JSON.stringify(record));
      console.error(`[ingest-hotrodan] error fetching ${url}:`, error);
    }
  }

  await fs.writeFile(outPath, records.join("\n") + "\n", "utf8");
  console.log(`[ingest-hotrodan] wrote ${records.length} records to ${outPath}`);
}

main().catch((error) => {
  console.error("[ingest-hotrodan] failed", error);
  process.exitCode = 1;
});
