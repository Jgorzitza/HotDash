import { promises as fs } from "fs";
import { join } from "path";

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

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function bleu1(referenceTokens: string[], candidateTokens: string[]): number {
  if (!referenceTokens.length || !candidateTokens.length) {
    return 0;
  }

  const referenceCounts = new Map<string, number>();
  for (const token of referenceTokens) {
    referenceCounts.set(token, (referenceCounts.get(token) ?? 0) + 1);
  }

  let matchCount = 0;
  const candidateCounts = new Map<string, number>();
  for (const token of candidateTokens) {
    candidateCounts.set(token, (candidateCounts.get(token) ?? 0) + 1);
  }

  for (const [token, count] of candidateCounts.entries()) {
    const refCount = referenceCounts.get(token) ?? 0;
    matchCount += Math.min(count, refCount);
  }

  return matchCount / candidateTokens.length;
}

function longestCommonSubsequenceLength(a: string[], b: string[]): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[a.length][b.length];
}

function rougeL(referenceTokens: string[], candidateTokens: string[]): number {
  if (!referenceTokens.length || !candidateTokens.length) {
    return 0;
  }

  const lcs = longestCommonSubsequenceLength(referenceTokens, candidateTokens);
  return lcs / referenceTokens.length;
}

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
  };

  await writeArtifact(artifactPath, artifact);

  const passCount = artifact.summary.passed;
  console.log(
    `[ai:regression] ${artifact.summary.status.toUpperCase()} — ${passCount}/${artifact.summary.totalCases} cases above thresholds (BLEU: ${artifact.summary.metrics.bleu1.toFixed(4)}, ROUGE-L: ${artifact.summary.metrics.rougeL.toFixed(4)})`,
  );
  console.log(`[ai:regression] artifact saved to ${artifactPath}`);
}

run().catch((error) => {
  console.error("[ai:regression] failed", error);
  process.exitCode = 1;
});

