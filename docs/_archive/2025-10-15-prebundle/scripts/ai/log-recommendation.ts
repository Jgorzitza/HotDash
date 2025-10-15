import { parseArgs } from "node:util";
import { promises as fs } from "fs";
import { join, relative } from "path";
import type { DecisionLog, Memory } from "../../packages/memory";
import { fileMemory } from "../../packages/memory/file";
import { supabaseMemory } from "../../packages/memory/supabase";
import { loadEnvFromFiles } from "../utils/env";

type CliOptions = {
  logDir: string;
  id?: string;
  caseId: string;
  summary?: string;
  inputPath?: string;
  outputPath?: string;
  output?: string;
  artifact?: string;
  backend: string[];
  supabaseUrl?: string;
  supabaseKey?: string;
};

type MemoryAdapter = {
  label: string;
  memory: Memory;
};

function generateId(caseId: string) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  return `build-${caseId}-${timestamp}`;
}

async function readFileMaybe(filePath?: string): Promise<string | undefined> {
  if (!filePath) {
    return undefined;
  }
  const contents = await fs.readFile(filePath, "utf8");
  return contents.trim();
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

async function writeDetailFile(directory: string, fileName: string, payload: unknown) {
  await ensureDir(directory);
  const filePath = join(directory, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}

async function getGitSha(): Promise<string | undefined> {
  try {
    const { exec } = await import("node:child_process");
    const execAsync = (await import("node:util")).promisify(exec);
    const { stdout } = await execAsync("git rev-parse HEAD");
    return stdout.trim();
  } catch {
    return undefined;
  }
}

async function buildAdapters(options: CliOptions): Promise<MemoryAdapter[]> {
  const adapters: MemoryAdapter[] = [];

  if (options.backend.includes("file")) {
    adapters.push({
      label: "file",
      memory: fileMemory(options.logDir),
    });
  }

  if (options.backend.includes("supabase")) {
    if (!options.supabaseUrl || !options.supabaseKey) {
      throw new Error(
        "Supabase backend selected but SUPABASE_URL or SUPABASE_SERVICE_KEY is undefined. Provide via env or CLI flags.",
      );
    }

    adapters.push({
      label: "supabase",
      memory: supabaseMemory(options.supabaseUrl, options.supabaseKey),
    });
  }

  if (!adapters.length) {
    throw new Error("No logging backends configured. Specify at least one backend (`file`, `supabase`).");
  }

  return adapters;
}

async function run() {
  const { values } = parseArgs({
    options: {
      case: { type: "string", required: true },
      id: { type: "string" },
      summary: { type: "string" },
      input: { type: "string" },
      output: { type: "string" },
      "output-path": { type: "string" },
      artifact: { type: "string" },
      "log-dir": { type: "string", default: "packages/memory/logs/build" },
      backend: { type: "string", multiple: true },
      "supabase-url": { type: "string" },
      "supabase-key": { type: "string" },
    },
  });

  await loadEnvFromFiles([
    "vault/occ/supabase/service_key_staging.env",
    ".env.staging",
    ".env",
  ]);

  const supabaseEnvAvailable = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
  const defaultBackends = supabaseEnvAvailable ? ["file", "supabase"] : ["file"];

  const backendValues = (values.backend as string[] | undefined)?.length
    ? (values.backend as string[])
    : defaultBackends;

  if (typeof values.case !== "string" || values.case.trim() === "") {
    throw new Error("Argument `--case` is required and must be a non-empty string.");
  }

  const caseId = values.case as string;

  const options: CliOptions = {
    caseId,
    id: values.id,
    summary: values.summary,
    inputPath: values.input,
    outputPath: values["output-path"],
    output: values.output,
    artifact: values.artifact,
    logDir: values["log-dir"],
    backend: backendValues.map((entry) => entry.toLowerCase()),
    supabaseUrl: values["supabase-url"] ?? process.env.SUPABASE_URL,
    supabaseKey: values["supabase-key"] ?? process.env.SUPABASE_SERVICE_KEY,
  };

  if (!options.output && !options.outputPath) {
    throw new Error("Provide `--output` or `--output-path` so the recommendation text can be logged.");
  }

  const recommendationOutput =
    options.output ?? (await readFileMaybe(options.outputPath)) ?? "/* output missing */";
  const recommendationInput = await readFileMaybe(options.inputPath);

  const decisionId = options.id ?? generateId(options.caseId);
  const now = new Date().toISOString();
  const who = process.env.AI_AGENT_ID ?? "ai-agent@hotdash.dev";
  const summary =
    options.summary ??
    `Captured AI recommendation results for ${options.caseId}; see detail JSON for input/output payloads.`;

  const sha = await getGitSha();
  const detailPath = await writeDetailFile(
    join(options.logDir, "recommendations"),
    `${decisionId}.json`,
    {
      id: decisionId,
      caseId: options.caseId,
      summary,
      input: recommendationInput,
      output: recommendationOutput,
      artifact: options.artifact,
      createdAt: now,
    },
  );

  const decision: DecisionLog = {
    id: decisionId,
    scope: "build",
    who,
    what: `AI recommendation captured (${options.caseId})`,
    why: summary,
    createdAt: now,
    sha,
    evidenceUrl: relative(process.cwd(), detailPath),
  };

  const adapters = await buildAdapters(options);

  await Promise.all(
    adapters.map(async ({ memory, label }) => {
      try {
        await memory.putDecision(decision);
      } catch (error) {
        const message = (error as Error)?.message ?? String(error);
        throw new Error(`[ai:log-recommendation] ${label} backend failed: ${message}`);
      }
    }),
  );

  console.log(
    JSON.stringify(
      {
        status: "ok",
        message: "Recommendation logged",
        decisionId,
        detailPath: decision.evidenceUrl,
        backends: adapters.map(({ label }) => label),
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error("[ai:log-recommendation] failed", error);
  process.exitCode = 1;
});
