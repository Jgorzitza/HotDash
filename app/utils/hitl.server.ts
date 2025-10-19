import { createHash, timingSafeEqual } from "crypto";

const TOKEN_HEADER_CANDIDATES = ["x-hitl-token", "x-hotdash-hitl-token"];

function normalizeToken(token: string) {
  return createHash("sha256").update(token).digest();
}

function safeCompare(provided: string, expected: string) {
  const providedHash = normalizeToken(provided);
  const expectedHash = normalizeToken(expected);
  return timingSafeEqual(providedHash, expectedHash);
}

function extractToken(request: Request): string | null {
  for (const header of TOKEN_HEADER_CANDIDATES) {
    const value = request.headers.get(header);
    if (value) {
      return value.trim();
    }
  }

  const url = new URL(request.url);
  const queryValue = url.searchParams.get("hitl_token");
  return queryValue ? queryValue.trim() : null;
}

export interface HitlTokenValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateHitlToken(request: Request): HitlTokenValidationResult {
  const expected = process.env.HITL_PREVIEW_TOKEN?.trim();
  if (!expected) {
    return { valid: false, reason: "HITL token not configured" };
  }

  const provided = extractToken(request);
  if (!provided) {
    return { valid: false, reason: "Missing HITL token" };
  }

  if (!safeCompare(provided, expected)) {
    return { valid: false, reason: "Invalid HITL token" };
  }

  return { valid: true };
}
