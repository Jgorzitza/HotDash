#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { answerQuery } from "../pipeline/query_simple.js";
import { getConfig } from "../config.js";
import { bleuScore, rougeL, checkCitations } from "./metrics.js";
async function loadTestCases(dataPath) {
  const content = await fs.readFile(dataPath, "utf-8");
  return content
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}
async function runEvaluation() {
  const config = getConfig();
  const timestamp = new Date().toISOString().replace(/[:]/g, "").slice(0, 15);
  const evalDir = path.join(config.LOG_DIR, "eval", timestamp);
  await fs.mkdir(evalDir, { recursive: true });
  const dataPath = path.join(process.cwd(), "eval", "data.jsonl");
  let testCases;
  try {
    testCases = await loadTestCases(dataPath);
  } catch (error) {
    console.error(`Failed to load test cases: ${error}`);
    process.exit(1);
  }
  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const startTime = Date.now();
    try {
      const response = await answerQuery(testCase.q, 5);
      const responseTime = Date.now() - startTime;
      const bleu = bleuScore(response.answer, testCase.ref);
      const rouge = rougeL(response.answer, testCase.ref);
      const citationCheck = checkCitations(response, testCase.must_cite || []);
      results.push({
        question: testCase.q,
        answer: response.answer,
        reference: testCase.ref,
        bleu: Math.round(bleu * 1000) / 1000,
        rouge_l: Math.round(rouge * 1000) / 1000,
        citation_check: citationCheck,
        response_time_ms: responseTime,
      });
    } catch (error) {
      results.push({
        question: testCase.q,
        answer: "",
        reference: testCase.ref,
        bleu: 0,
        rouge_l: 0,
        citation_check: {
          found: [],
          missing: testCase.must_cite || [],
          score: 0,
        },
        response_time_ms: Date.now() - startTime,
      });
    }
  }
  const bleuScores = results.map((r) => r.bleu);
  const rougeScores = results.map((r) => r.rouge_l);
  const citationScores = results.map((r) => r.citation_check.score);
  const avgBleu =
    bleuScores.reduce((a, b) => a + b, 0) / (bleuScores.length || 1);
  const avgRouge =
    rougeScores.reduce((a, b) => a + b, 0) / (rougeScores.length || 1);
  const avgCitation =
    citationScores.reduce((a, b) => a + b, 0) / (citationScores.length || 1);
  const report = {
    timestamp: new Date().toISOString(),
    total_cases: results.length,
    avg_bleu: Math.round(avgBleu * 1000) / 1000,
    avg_rouge_l: Math.round(avgRouge * 1000) / 1000,
    avg_citation_score: Math.round(avgCitation * 1000) / 1000,
    results,
  };
  const reportPath = path.join(evalDir, "report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      success: true,
      reportPath,
      metrics: {
        avg_bleu: report.avg_bleu,
        avg_rouge_l: report.avg_rouge_l,
        avg_citation_score: report.avg_citation_score,
      },
    }),
  );
}
if (import.meta.url === `file://${process.argv[1]}`) {
  runEvaluation().catch((error) => {
    console.error("Evaluation failed:", error);
    process.exit(1);
  });
}
