/**
 * LlamaIndex MCP Client (graceful fallback)
 * - Provides query/context/related calls to MCP server
 * - Uses global fetch; timeouts and error handling included
 */

const DEFAULT_BASE = process.env.LLAMAINDEX_MCP_URL || 'http://localhost:8080';
const TIMEOUT_MS = Number(process.env.LLAMAINDEX_TIMEOUT_MS || 5000);

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let to: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    to = setTimeout(() => reject(new Error(`LlamaIndex MCP request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(to!);
  }
}

async function request(path: string, body: any) {
  const url = `${DEFAULT_BASE}${path}`;
  try {
    const res = await withTimeout(
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      TIMEOUT_MS,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    // Graceful fallback
    return { error: e?.message || 'request_failed' };
  }
}

export async function mcpQuery(question: string) {
  return request('/query', { question });
}

export async function mcpContext(question: string, context?: Record<string, any>) {
  return request('/context', { question, context });
}

export async function mcpRelatedArticles(question: string) {
  return request('/related', { question });
}

