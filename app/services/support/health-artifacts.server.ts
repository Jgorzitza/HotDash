import path from "node:path";
import { promises as fs } from "node:fs";

export interface SupportHealthArtifact {
  filename: string;
  absolutePath: string;
  size: number;
  modifiedAt: Date;
}

type FsClient = Pick<typeof fs, "readdir" | "stat">;

interface CollectOptions {
  rootDir?: string;
  fsClient?: FsClient;
}

const DEFAULT_ROOT = process.cwd();

function isDirentFile(entry: unknown): entry is {
  name: string;
  isFile(): boolean;
} {
  return (
    Boolean(entry) &&
    typeof entry === "object" &&
    "name" in entry &&
    typeof (entry as { name: unknown }).name === "string" &&
    "isFile" in entry &&
    typeof (entry as { isFile: unknown }).isFile === "function"
  );
}

export async function collectSupportHealthArtifacts(
  date: string,
  options: CollectOptions = {},
): Promise<SupportHealthArtifact[]> {
  const rootDir = options.rootDir ?? DEFAULT_ROOT;
  const fsClient = options.fsClient ?? fs;
  const opsDir = path.join(rootDir, "artifacts", "support", date, "ops");

  let entries: unknown[];
  try {
    entries = await fsClient.readdir(opsDir, { withFileTypes: true });
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return [];
    }
    throw error;
  }

  const files = entries.filter(isDirentFile).filter((entry) => entry.isFile());

  const artifacts: SupportHealthArtifact[] = [];
  for (const file of files) {
    const absolutePath = path.join(opsDir, file.name);
    const stat = await fsClient.stat(absolutePath);
    artifacts.push({
      filename: file.name,
      absolutePath,
      size: Number(stat.size ?? 0),
      modifiedAt:
        stat.mtime instanceof Date ? stat.mtime : new Date(stat.mtime),
    });
  }

  artifacts.sort((a, b) => a.filename.localeCompare(b.filename));
  return artifacts;
}

function isMissingDirectoryError(error: unknown): error is { code?: string } {
  return (
    Boolean(error) &&
    typeof error === "object" &&
    (error as { code?: string }).code === "ENOENT"
  );
}
