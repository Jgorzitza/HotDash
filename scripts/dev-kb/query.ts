#!/usr/bin/env tsx
/**
 * Dev Knowledge Base Query CLI
 *
 * Embeds a question, retrieves the most relevant chunks from the dev-only
 * Supabase knowledge_base (pgvector), and optionally synthesizes an LLM answer.
 *
 * Usage:
 *   npx tsx scripts/dev-kb/query.ts "How do I log shutdown status?"
 *
 * Flags:
 *   --top <n>         Number of chunks to retrieve (default 12)
 *   --no-synthesis    Skip LLM answer and just list sources
 *   --json            Output JSON (useful for automation)
 */

import { Document } from "llamaindex";
import OpenAI from "openai";
import { Client } from "pg";

const REQUIRED_ENVS = ["SUPABASE_DEV_KB_DIRECT_URL", "OPENAI_API_KEY"] as const;

type CliOptions = {
  question: string;
  top: number;
  synthesize: boolean;
  json: boolean;
};

function requireEnv() {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
  }
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      'Usage: query.ts "<question>" [--top 12] [--no-synthesis] [--json]',
    );
    process.exit(1);
  }

  let top = 12;
  let synthesize = true;
  let json = false;
  const questionParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--top") {
      const value = args[++i];
      if (!value) throw new Error("--top requires a numeric value");
      top = Number(value);
      if (Number.isNaN(top) || top <= 0) {
        throw new Error("--top must be a positive integer");
      }
    } else if (arg === "--no-synthesis") {
      synthesize = false;
    } else if (arg === "--json") {
      json = true;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      questionParts.push(arg);
    }
  }

  if (questionParts.length === 0) {
    throw new Error("A question is required.");
  }

  return {
    question: questionParts.join(" "),
    top,
    synthesize,
    json,
  };
}

async function embedQuery(openai: OpenAI, text: string): Promise<number[]> {
  const normalized = text.length > 8000 ? text.slice(0, 8000) : text;
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: normalized,
  });
  const vector = response.data?.[0]?.embedding;
  if (!vector) {
    throw new Error("Embedding response missing data.");
  }
  return vector;
}

type RetrievedChunk = {
  document_key: string;
  title: string;
  content: string;
  source_url: string | null;
  tags: string[] | null;
  category: string | null;
  metadata: any;
  similarity: number;
};

async function fetchTopChunks(
  pgClient: Client,
  embedding: number[],
  limit: number,
): Promise<RetrievedChunk[]> {
  const probes = Math.min(50, Math.max(1, limit * 2));
  await pgClient.query(`SET ivfflat.probes = ${probes}`);
  const vectorLiteral = `[${embedding.join(",")}]`;
  const sql = `
    SELECT
      document_key,
      title,
      content,
      source_url,
      tags,
      category,
      metadata,
      1 - (embedding <=> $1::vector) AS similarity
    FROM knowledge_base
    WHERE project = 'dev_kb'
    ORDER BY embedding <=> $1::vector
    LIMIT $2
  `;
  const { rows } = await pgClient.query(sql, [vectorLiteral, limit]);
  return rows as RetrievedChunk[];
}

function buildDocumentsFromChunks(chunks: RetrievedChunk[]): Document[] {
  return chunks.map((chunk, index) => {
    const meta = {
      source: chunk.source_url ?? chunk.document_key,
      title: chunk.title,
      tags: chunk.tags ?? [],
      category: chunk.category ?? "unknown",
      similarity: chunk.similarity,
      document_key: chunk.document_key,
      ...chunk.metadata,
    };

    return new Document({
      text: chunk.content,
      metadata: meta,
      id_: `${chunk.document_key}#${index}`,
    });
  });
}

async function synthesizeAnswer(
  openai: OpenAI,
  question: string,
  documents: Document[],
): Promise<{
  answer: string;
  sources: Array<{ source: string; title?: string; similarity?: number }>;
}> {
  if (documents.length === 0) {
    return { answer: "No relevant documents found.", sources: [] };
  }

  const contextSections = documents.map((doc, idx) => {
    const meta = doc.metadata ?? {};
    const source = meta.source ?? meta.document_key ?? `chunk-${idx + 1}`;
    const title = meta.title ? ` (${meta.title})` : "";
    const snippet = doc.getText().slice(0, 1800);
    return `Source ${idx + 1}: ${source}${title}\n${snippet}`;
  });

  const systemPrompt =
    "You are the documentation assistant for the HotDash dev team. Answer using only the provided sources. Cite sources using [Source #]. If the answer is unknown, state that explicitly.";
  const userPrompt = `Question: ${question}\n\nContext:\n${contextSections.join(
    "\n\n",
  )}\n\nAnswer:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 600,
  });

  const answer =
    response.choices?.[0]?.message?.content?.trim() ??
    "Unable to generate an answer.";

  const sources = documents.map((doc) => {
    const meta = doc.metadata ?? {};
    return {
      source: meta.source ?? "unknown",
      title: meta.title,
      similarity: meta.similarity,
    };
  });

  return { answer, sources };
}

async function main() {
  requireEnv();
  const options = parseArgs();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embedding = await embedQuery(openai, options.question);
  const pgClient = new Client({
    connectionString: process.env.SUPABASE_DEV_KB_DIRECT_URL,
  });
  await pgClient.connect();

  try {
    const rows = await fetchTopChunks(pgClient, embedding, options.top);

    if (rows.length === 0) {
      const payload = {
        question: options.question,
        answer: null,
        sources: [],
        retrieved: 0,
      };
      if (options.json) {
        console.log(JSON.stringify(payload));
      } else {
        console.log("No matching documents found.");
      }
      return;
    }

    const documents = buildDocumentsFromChunks(rows);

    if (!options.synthesize) {
      if (options.json) {
        console.log(
          JSON.stringify({
            question: options.question,
            answer: null,
            sources: documents.map((doc) => doc.metadata),
            retrieved: rows.length,
          }),
        );
      } else {
        console.log(`Retrieved ${rows.length} chunk(s):`);
        for (const doc of documents) {
          const meta = doc.metadata ?? {};
          console.log(
            `- ${meta.title ?? meta.source} (similarity: ${
              meta.similarity?.toFixed?.(3) ?? "n/a"
            })`,
          );
          console.log(`  source: ${meta.source}`);
        }
      }
      return;
    }

    const summary = await synthesizeAnswer(openai, options.question, documents);
    const payload = {
      question: options.question,
      answer: summary.answer,
      sources: summary.sources,
      retrieved: rows.length,
    };

    if (options.json) {
      console.log(JSON.stringify(payload));
    } else {
      console.log(`🧠 Question: ${options.question}\n`);
      console.log(summary.answer);
      console.log("\n🔎 Sources:");
      summary.sources.forEach((source, idx) => {
        const title = source.title ? ` — ${source.title}` : "";
        const similarity = source.similarity
          ? ` (similarity: ${source.similarity.toFixed(3)})`
          : "";
        console.log(`${idx + 1}. ${source.source}${title}${similarity}`);
      });
    }
  } finally {
    await pgClient.end();
  }
}

main().catch((error) => {
  console.error("❌ dev-kb query failed:", error);
  process.exitCode = 1;
});
