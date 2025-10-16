/**
 * Idempotency Keys for Write Endpoints
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { createHash } from "crypto";

export interface IdempotencyRecord {
  key: string;
  response: any;
  createdAt: number;
  expiresAt: number;
}

const idempotencyStore = new Map<string, IdempotencyRecord>();
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateIdempotencyKey(data: any): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

export function storeIdempotentResponse(key: string, response: any, ttlMs = DEFAULT_TTL_MS): void {
  const now = Date.now();
  idempotencyStore.set(key, {
    key,
    response,
    createdAt: now,
    expiresAt: now + ttlMs,
  });
}

export function getIdempotentResponse(key: string): any | null {
  const record = idempotencyStore.get(key);
  
  if (!record) return null;
  
  if (Date.now() > record.expiresAt) {
    idempotencyStore.delete(key);
    return null;
  }
  
  return record.response;
}

export function clearExpiredIdempotencyKeys(): number {
  const now = Date.now();
  let cleared = 0;
  
  for (const [key, record] of idempotencyStore.entries()) {
    if (now > record.expiresAt) {
      idempotencyStore.delete(key);
      cleared++;
    }
  }
  
  return cleared;
}

export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const cached = getIdempotentResponse(key);
  if (cached !== null) {
    return cached as T;
  }

  const result = await fn();
  storeIdempotentResponse(key, result, ttlMs);
  return result;
}

// Cleanup expired keys every hour
setInterval(() => {
  const cleared = clearExpiredIdempotencyKeys();
  if (cleared > 0) {
    console.log('Cleared ' + cleared + ' expired idempotency keys');
  }
}, 60 * 60 * 1000);
