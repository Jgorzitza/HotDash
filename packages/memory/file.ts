import { promises as fs } from "fs";
import { dirname, join } from "path";
import type { DecisionLog, Fact, Memory } from "./index";

type RecordType = "decisions" | "facts";

async function ensureDirectory(filePath: string) {
  await fs.mkdir(dirname(filePath), { recursive: true });
}

async function appendRecord(filePath: string, record: unknown) {
  await ensureDirectory(filePath);
  const line = `${JSON.stringify(record)}\n`;
  await fs.appendFile(filePath, line, "utf8");
}

async function readRecords<T>(filePath: string): Promise<T[]> {
  try {
    const contents = await fs.readFile(filePath, "utf8");
    return contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as T);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function filePathFor(baseDir: string, type: RecordType): string {
  const fileName = type === "decisions" ? "decisions.ndjson" : "facts.ndjson";
  return join(baseDir, fileName);
}

export function fileMemory(baseDir: string): Memory {
  const decisionsPath = filePathFor(baseDir, "decisions");
  const factsPath = filePathFor(baseDir, "facts");

  return {
    async putDecision(decision: DecisionLog) {
      await appendRecord(decisionsPath, decision);
    },

    async listDecisions(scope?: "build" | "ops") {
      const entries = await readRecords<DecisionLog>(decisionsPath);
      if (!scope) {
        return entries;
      }
      return entries.filter((entry) => entry.scope === scope);
    },

    async putFact(fact: Fact) {
      await appendRecord(factsPath, fact);
    },

    async getFacts(topic?: string, key?: string) {
      const entries = await readRecords<Fact>(factsPath);
      return entries.filter((entry) => {
        const topicMatch = topic ? entry.topic === topic : true;
        const keyMatch = key ? entry.key === key : true;
        return topicMatch && keyMatch;
      });
    },
  };
}

export function fileMemoryPaths(baseDir: string) {
  return {
    decisions: filePathFor(baseDir, "decisions"),
    facts: filePathFor(baseDir, "facts"),
  };
}
