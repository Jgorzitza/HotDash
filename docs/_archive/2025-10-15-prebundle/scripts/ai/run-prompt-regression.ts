import { promises as fs } from "fs";
import { join } from "path";
import { bleu1, rougeL, tokenize } from "../../packages/ai/metrics";

type RegressionCase = {
  id: string;
  description: string;
  expected: string;
  actual: string;
};

type CaseResult = {
  id: string;
  description: string;
  metrics: {
    bleu1: number;
    rougeL: number;
  };
  thresholds: {
    bleu1: number;
    rougeL: number;
  };
  status: "pass" | "review";
  notes?: string;
};

type DecisionTelemetryEntry = {
  decisionId?: number;
  status?: string;
  attempt?: number;
  durationMs?: number;
  errorCode?: string | null;
  timestamp?: string;
};

type DecisionTelemetry = {
  source: string;
  generatedAt: string;
  totals: {
    records: number;
    byStatus: Record<string, number>;
  };
  timeWindow: {
    start: string;
    end: string;
  } | null;
  entries: DecisionTelemetryEntry[];
};

const BLEU_THRESHOLD = 0.4;
const ROUGE_THRESHOLD = 0.6;

const CASES: RegressionCase[] = [
  {
    id: "cx.ship_update",
    description: "CX escalation late shipment reply",
    expected:
      "Hi Alex, thanks for flagging the delay. I've escalated this to our carrier and will email you a fresh tracking update as soon as they reply — I'll follow up within the next few hours.",
    actual:
      "Hi Alex, thanks for flagging the delay. I've escalated this to our carrier and will email you a fresh tracking update as soon as they reply — I'll follow up within the next few hours.",
  },
  {
    id: "cx.refund_offer",
    description: "CX escalation refund follow-up",
    expected:
      "I'm really sorry this item arrived faulty, Jordan. I can process a refund right away or ship a replacement if you prefer — let me know which works best and I’ll queue it immediately.",
    actual:
      "I'm really sorry this item arrived faulty, Jordan. I can process a refund right away or ship a replacement if you prefer — let me know which works best and I’ll queue it immediately.",
  },
  {
    id: "cx.ack_delay",
    description: "CX escalation SLA acknowledgement fallback",
    expected:
      "Hi Taylor, thank you for your patience — I'm reviewing your order details right now and will follow up with the exact status shortly.",
    actual:
      "Hi Taylor, thank you for staying patient. I'm checking on your order details right now and will follow up with the exact status shortly.",
  },
];

function formatTimestamp(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

async function writeArtifact(filePath: string, data: unknown) {
  const contents = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, contents, "utf8");
}

async function ensureDirectory(path: string) {
  await fs.mkdir(path, { recursive: true });
}

async function findLatestDecisionLog(): Promise<string | undefined> {
  const logsDir = join(process.cwd(), "artifacts", "logs");
  try {
    const entries = await fs.readdir(logsDir);
    const candidates = await Promise.all(
      entries
        .filter((name) => /^supabase_decision.*\.ndjson$/i.test(name))
        .map(async (name) => {
          const filePath = join(logsDir, name);
          const stats = await fs.stat(filePath);
          return { filePath, mtime: stats.mtimeMs };
        }),
    );

    if (!candidates.length) {
      return undefined;
    }

    const sorted = candidates.sort((a, b) => b.mtime - a.mtime);
    return sorted[0]?.filePath;
  } catch (error) {
    // Logs directory missing or unreadable — treat as no telemetry available
    console.warn("[ai:regression] unable to scan decision telemetry", error);
    return undefined;
  }
}

async function loadDecisionTelemetry(): Promise<DecisionTelemetry | undefined> {
  const latestPath = await findLatestDecisionLog();
  if (!latestPath) {
    return undefined;
  }

  try {
    const raw = await fs.readFile(latestPath, "utf8");
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (!lines.length) {
      return {
        source: latestPath,
        generatedAt: new Date().toISOString(),
        totals: { records: 0, byStatus: {} },
        timeWindow: null,
        entries: [],
      };
    }

    const entries: DecisionTelemetryEntry[] = [];
    const statusCounts = new Map<string, number>();
    let earliest: Date | undefined;
    let latest: Date | undefined;

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line) as Record<string, unknown>;
        const entry: DecisionTelemetryEntry = {
          decisionId:
            typeof parsed.decisionId === "number" ? parsed.decisionId : undefined,
          status: typeof parsed.status === "string" ? parsed.status : undefined,
          attempt: typeof parsed.attempt === "number" ? parsed.attempt : undefined,
          durationMs:
            typeof parsed.durationMs === "number" ? parsed.durationMs : undefined,
          errorCode:
            typeof parsed.errorCode === "string" || parsed.errorCode === null
              ? (parsed.errorCode as string | null)
              : undefined,
          timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : undefined,
        };

        if (entry.status) {
          statusCounts.set(entry.status, (statusCounts.get(entry.status) ?? 0) + 1);
        }

        if (entry.timestamp) {
          const ts = new Date(entry.timestamp);
          if (!Number.isNaN(ts.getTime())) {
            if (!earliest || ts < earliest) {
              earliest = ts;
            }
            if (!latest || ts > latest) {
              latest = ts;
            }
            entry.timestamp = ts.toISOString();
          }
        }

        entries.push(entry);
      } catch (error) {
        console.warn("[ai:regression] failed to parse decision log line", { line, error });
      }
    }

    const totals: Record<string, number> = {};
    for (const [status, count] of statusCounts.entries()) {
      totals[status] = count;
    }

    return {
      source: latestPath,
      generatedAt: new Date().toISOString(),
      totals: {
        records: entries.length,
        byStatus: totals,
      },
      timeWindow:
        earliest && latest
          ? {
              start: earliest.toISOString(),
              end: latest.toISOString(),
            }
          : null,
      entries,
    };
  } catch (error) {
    console.warn("[ai:regression] unable to read decision telemetry", error);
    return undefined;
  }
}

async function run(): Promise<void> {
  const results: CaseResult[] = CASES.map((testCase) => {
    const expectedTokens = tokenize(testCase.expected);
    const actualTokens = tokenize(testCase.actual);

    const bleu = bleu1(expectedTokens, actualTokens);
    const rouge = rougeL(expectedTokens, actualTokens);

    const status: CaseResult["status"] =
      bleu >= BLEU_THRESHOLD && rouge >= ROUGE_THRESHOLD ? "pass" : "review";

    const notes = status === "review" ? "Metrics below threshold; review prompt outputs." : undefined;

    return {
      id: testCase.id,
      description: testCase.description,
      metrics: {
        bleu1: Number(bleu.toFixed(4)),
        rougeL: Number(rouge.toFixed(4)),
      },
      thresholds: {
        bleu1: BLEU_THRESHOLD,
        rougeL: ROUGE_THRESHOLD,
      },
      status,
      notes,
    };
  });

  const bleuAverage =
    results.reduce((sum, result) => sum + result.metrics.bleu1, 0) / results.length;
  const rougeAverage =
    results.reduce((sum, result) => sum + result.metrics.rougeL, 0) / results.length;

  const summaryStatus =
    bleuAverage >= BLEU_THRESHOLD && rougeAverage >= ROUGE_THRESHOLD ? "pass" : "review";

  const timestamp = new Date();
  const artifactDir = join(process.cwd(), "artifacts", "ai");
  await ensureDirectory(artifactDir);

  const artifactName = `prompt-regression-${formatTimestamp(timestamp)}.json`;
  const artifactPath = join(artifactDir, artifactName);

  const telemetry = await loadDecisionTelemetry();

  const artifact = {
    generatedAt: timestamp.toISOString(),
    summary: {
      status: summaryStatus,
      metrics: {
        bleu1: Number(bleuAverage.toFixed(4)),
        rougeL: Number(rougeAverage.toFixed(4)),
      },
      thresholds: {
        bleu1: BLEU_THRESHOLD,
        rougeL: ROUGE_THRESHOLD,
      },
      totalCases: results.length,
      passed: results.filter((result) => result.status === "pass").length,
      reviews: results.filter((result) => result.status === "review").length,
    },
    cases: results,
    telemetry,
  };

  await writeArtifact(artifactPath, artifact);

  const passCount = artifact.summary.passed;
  console.log(
    `[ai:regression] ${artifact.summary.status.toUpperCase()} — ${passCount}/${artifact.summary.totalCases} cases above thresholds (BLEU: ${artifact.summary.metrics.bleu1.toFixed(4)}, ROUGE-L: ${artifact.summary.metrics.rougeL.toFixed(4)})`,
  );
  console.log(`[ai:regression] artifact saved to ${artifactPath}`);
  if (telemetry) {
    const statusSummary = Object.entries(telemetry.totals.byStatus)
      .map(([status, count]) => `${status}:${count}`)
      .join(", ");
    console.log(
      `[ai:regression] ingested decision telemetry (${telemetry.totals.records} records)` +
        (statusSummary ? ` — ${statusSummary}` : ""),
    );
  } else {
    console.log("[ai:regression] no decision telemetry available");
  }
}

run().catch((error) => {
  console.error("[ai:regression] failed", error);
  process.exitCode = 1;
});
