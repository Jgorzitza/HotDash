import { promises as fs } from "node:fs";
import { extname, join, resolve } from "node:path";
import { DEFAULT_SOURCES } from "./build-llama-index";

type SourceReport = {
  source: string;
  absolutePath: string;
  exists: boolean;
  kind: "file" | "directory" | "missing";
  filesPresent: number;
  notes: string[];
};

const ALLOWED_EXTENSIONS = new Set([".md", ".mdx"]);

async function pathStats(path: string): Promise<fs.Stats | null> {
  try {
    return await fs.stat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function countFiles(target: string): Promise<number> {
  const stats = await fs.stat(target);
  if (stats.isDirectory()) {
    const entries = await fs.readdir(target);
    const counts = await Promise.all(
      entries.map((entry) => countFiles(join(target, entry))),
    );
    return counts.reduce((sum, value) => sum + value, 0);
  }

  if (stats.isFile()) {
    return ALLOWED_EXTENSIONS.has(extname(target).toLowerCase()) ? 1 : 0;
  }

  return 0;
}

async function inspectSource(source: string): Promise<SourceReport> {
  const absolutePath = resolve(process.cwd(), source);
  const stats = await pathStats(absolutePath);

  if (!stats) {
    return {
      source,
      absolutePath,
      exists: false,
      kind: "missing",
      filesPresent: 0,
      notes: ["Path does not exist."],
    };
  }

  if (stats.isDirectory()) {
    const markdownCount = await countFiles(absolutePath);
    return {
      source,
      absolutePath,
      exists: true,
      kind: "directory",
      filesPresent: markdownCount,
      notes: markdownCount
        ? [`Found ${markdownCount} markdown file(s).`]
        : ["Directory exists but contains no markdown files."],
    };
  }

  if (stats.isFile()) {
    const ext = extname(source).toLowerCase();
    const notes = ALLOWED_EXTENSIONS.has(ext)
      ? ["File ready for ingestion."]
      : [`Unsupported extension "${ext}".`];
    return {
      source,
      absolutePath,
      exists: true,
      kind: "file",
      filesPresent: ALLOWED_EXTENSIONS.has(ext) ? 1 : 0,
      notes,
    };
  }

  return {
    source,
    absolutePath,
    exists: true,
    kind: "missing",
    filesPresent: 0,
    notes: ["Path exists but is neither file nor directory."],
  };
}

async function main() {
  const reports = await Promise.all(DEFAULT_SOURCES.map(inspectSource));
  const summary = {
    timestamp: new Date().toISOString(),
    totalSources: DEFAULT_SOURCES.length,
    available: reports.filter((report) => report.exists).length,
    missing: reports.filter((report) => !report.exists).length,
    reports,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (summary.missing > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
