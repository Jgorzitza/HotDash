import { WordTokenizer } from "natural";

const tokenizer = new WordTokenizer();

/**
 * Simple BLEU score implementation (1-gram precision)
 * Returns score between 0 and 1
 */
export function bleuScore(candidate: string, reference: string): number {
  const candTokens = tokenizer.tokenize(candidate.toLowerCase()) || [];
  const refTokens = tokenizer.tokenize(reference.toLowerCase()) || [];

  if (candTokens.length === 0) return 0;

  const refSet = new Set(refTokens);
  let matches = 0;

  for (const token of candTokens) {
    if (refSet.has(token)) {
      matches++;
    }
  }

  return matches / candTokens.length;
}

/**
 * Simple ROUGE-L implementation (Longest Common Subsequence)
 * Returns F1 score between 0 and 1
 */
export function rougeL(candidate: string, reference: string): number {
  const candTokens = tokenizer.tokenize(candidate.toLowerCase()) || [];
  const refTokens = tokenizer.tokenize(reference.toLowerCase()) || [];

  if (candTokens.length === 0 || refTokens.length === 0) return 0;

  const lcs = longestCommonSubsequence(candTokens, refTokens);

  const precision = lcs / candTokens.length;
  const recall = lcs / refTokens.length;

  if (precision + recall === 0) return 0;

  return (2 * precision * recall) / (precision + recall);
}

/**
 * Calculate longest common subsequence length
 */
function longestCommonSubsequence(seq1: string[], seq2: string[]): number {
  const m = seq1.length;
  const n = seq2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (seq1[i - 1] === seq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Check if required citations are present in the response
 */
export function checkCitations(
  response: any,
  requiredCites: string[],
): {
  found: string[];
  missing: string[];
  score: number;
} {
  const citations = response.citations || [];
  const citationSources = citations.map((c: any) => {
    // Extract source type from citation ID or metadata
    if (typeof c === "string") {
      if (c.includes("hotrodan.com") || c.includes("web:"))
        return "hotrodan.com";
      if (c.includes("decision:")) return "decision_log";
      if (c.includes("telemetry:")) return "telemetry_events";
      if (c.includes("curated:")) return "curated";
    }
    if (c.metadata?.table) return c.metadata.table;
    if (c.metadata?.url?.includes("hotrodan.com")) return "hotrodan.com";
    return "unknown";
  });

  const found = requiredCites.filter((req) => citationSources.includes(req));
  const missing = requiredCites.filter((req) => !citationSources.includes(req));

  return {
    found,
    missing,
    score: requiredCites.length > 0 ? found.length / requiredCites.length : 1,
  };
}
