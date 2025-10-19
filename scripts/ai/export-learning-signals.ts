/**
 * Export Learning Signals — Prepare data for supervised fine-tuning
 *
 * Exports grading metadata and learning signals in formats suitable for:
 * - OpenAI fine-tuning (JSONL)
 * - CSV for analysis
 * - Training datasets
 */

import fs from "node:fs";
import path from "node:path";

interface LearningSignalExport {
  conversationId: string;
  draftReply: string;
  humanReply: string;
  editDistance: number;
  editRatio: number;
  tone: number;
  accuracy: number;
  policy: number;
  approved: boolean;
  ragSources: string[];
  confidence: number;
  timestamp: string;
}

interface OpenAIFineTuningFormat {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}

/**
 * Convert learning signal to OpenAI fine-tuning format (JSONL)
 */
function toOpenAIFormat(
  signal: LearningSignalExport,
  conversationContext: string[],
): OpenAIFineTuningFormat {
  return {
    messages: [
      {
        role: "system",
        content:
          "You are a helpful customer support assistant for Hot Rod AN. Respond to customer inquiries with a friendly, professional tone.",
      },
      {
        role: "user",
        content: conversationContext.join("\n\n"),
      },
      {
        role: "assistant",
        content: signal.humanReply, // Use human-edited reply as ground truth
      },
    ],
  };
}

/**
 * Convert learning signal to CSV row
 */
function toCSVRow(signal: LearningSignalExport): string {
  const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;

  return [
    signal.conversationId,
    escape(signal.draftReply),
    escape(signal.humanReply),
    signal.editDistance,
    signal.editRatio.toFixed(3),
    signal.tone,
    signal.accuracy,
    signal.policy,
    signal.approved ? "true" : "false",
    signal.ragSources.join(";"),
    signal.confidence.toFixed(3),
    signal.timestamp,
  ].join(",");
}

/**
 * Export learning signals to JSONL for OpenAI fine-tuning
 */
export async function exportToJSONL(
  signals: LearningSignalExport[],
  conversationContexts: Map<string, string[]>,
  outputPath: string,
): Promise<void> {
  const lines: string[] = [];

  for (const signal of signals) {
    // Only export approved signals with human edits
    if (!signal.approved || !signal.humanReply) continue;

    const context = conversationContexts.get(signal.conversationId) || [];
    const formatted = toOpenAIFormat(signal, context);
    lines.push(JSON.stringify(formatted));
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, lines.join("\n"));
  console.log(`Exported ${lines.length} training examples to ${outputPath}`);
}

/**
 * Export learning signals to CSV for analysis
 */
export async function exportToCSV(
  signals: LearningSignalExport[],
  outputPath: string,
): Promise<void> {
  const header = [
    "conversation_id",
    "draft_reply",
    "human_reply",
    "edit_distance",
    "edit_ratio",
    "tone",
    "accuracy",
    "policy",
    "approved",
    "rag_sources",
    "confidence",
    "timestamp",
  ].join(",");

  const rows = signals.map(toCSVRow);
  const csv = [header, ...rows].join("\n");

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, csv);
  console.log(`Exported ${signals.length} learning signals to ${outputPath}`);
}

/**
 * Filter signals by quality criteria
 */
export function filterHighQualitySignals(
  signals: LearningSignalExport[],
  minTone: number = 4,
  minAccuracy: number = 4,
  minPolicy: number = 4,
): LearningSignalExport[] {
  return signals.filter(
    (s) =>
      s.approved &&
      s.tone >= minTone &&
      s.accuracy >= minAccuracy &&
      s.policy >= minPolicy,
  );
}

/**
 * Generate training dataset summary
 */
export function generateSummary(signals: LearningSignalExport[]): {
  total: number;
  approved: number;
  highQuality: number;
  avgEditRatio: number;
  avgQualityScore: number;
} {
  const approved = signals.filter((s) => s.approved);
  const highQuality = filterHighQualitySignals(signals);

  const avgEditRatio =
    signals.length > 0
      ? signals.reduce((sum, s) => sum + s.editRatio, 0) / signals.length
      : 0;

  const avgTone = signals.reduce((sum, s) => sum + s.tone, 0) / signals.length;
  const avgAccuracy =
    signals.reduce((sum, s) => sum + s.accuracy, 0) / signals.length;
  const avgPolicy =
    signals.reduce((sum, s) => sum + s.policy, 0) / signals.length;
  const avgQualityScore = (avgTone + avgAccuracy + avgPolicy) / 3;

  return {
    total: signals.length,
    approved: approved.length,
    highQuality: highQuality.length,
    avgEditRatio: Number(avgEditRatio.toFixed(3)),
    avgQualityScore: Number(avgQualityScore.toFixed(2)),
  };
}

/**
 * CLI entry point
 */
async function main() {
  // TODO: Fetch from Supabase customer_reply_grading table
  console.log("Learning signal export utility");
  console.log(
    "Usage: tsx scripts/ai/export-learning-signals.ts [--format jsonl|csv] [--output path]",
  );
  console.log(
    "\nThis is a stub implementation. Connect to Supabase to fetch real data.",
  );

  // Example usage:
  const mockSignals: LearningSignalExport[] = [
    {
      conversationId: "conv-1",
      draftReply: "Thank you for reaching out!",
      humanReply: "Thanks for contacting us! I'll help you with that.",
      editDistance: 15,
      editRatio: 0.25,
      tone: 5,
      accuracy: 4,
      policy: 5,
      approved: true,
      ragSources: ["shipping-policy"],
      confidence: 0.85,
      timestamp: "2025-10-19T09:00:00Z",
    },
  ];

  const summary = generateSummary(mockSignals);
  console.log("\nDataset Summary:", JSON.stringify(summary, null, 2));

  // Export examples
  await exportToCSV(mockSignals, "artifacts/learning-signals/export.csv");
  await exportToJSONL(
    mockSignals,
    new Map([["conv-1", ["Customer: I need help with my order"]]]),
    "artifacts/learning-signals/training.jsonl",
  );
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
