export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const DEFAULT_EMBEDDING_DIM = 1536;
export interface EmbeddingOptions { model?: string; devFallback?: boolean }
export function stubEmbedding(text: string, dim: number = DEFAULT_EMBEDDING_DIM): number[] {
  const vec = new Array<number>(dim).fill(0);
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619) >>> 0; vec[hash % dim] += 1 }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1; return vec.map(v => v / norm);
}
export async function generateEmbedding(text: string, opts: EmbeddingOptions = {}): Promise<number[]> {
  const { model = DEFAULT_EMBEDDING_MODEL, devFallback = false } = opts; const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || devFallback || process.env.KB_EMBEDDINGS_MODE === "stub") return stubEmbedding(text);
  const { OpenAI } = await import("openai"); const client = new OpenAI({ apiKey });
  const res = await client.embeddings.create({ model, input: text });
  const embedding = res.data?.[0]?.embedding as unknown as number[] | undefined;
  if (!embedding || embedding.length !== DEFAULT_EMBEDDING_DIM) throw new Error(`Embedding shape ${embedding?.length ?? 0} != ${DEFAULT_EMBEDDING_DIM}`);
  return embedding;
}

