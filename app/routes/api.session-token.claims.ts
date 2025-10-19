import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

interface SessionTokenResponse {
  shopDomain: string;
  destination: string;
  audience: string;
  issuedAt: string;
  notBefore: string;
  expiresAt: string;
  sessionId: string | null;
  userId: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toUnixSeconds = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const toMaybeString = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const stringOr = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;

function unauthorized(message: string) {
  return json({ error: message }, { status: 401 });
}

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return new Response(null, { status: 405 });
  }

  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return unauthorized("Missing session token");
  }

  const encodedToken = authorization.replace("Bearer ", "").trim();

  try {
    await authenticate.admin(request);

    const parts = encodedToken.split(".");
    if (parts.length < 2) {
      throw new Error("Invalid JWT format");
    }
    const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
    const parsedPayload: unknown = JSON.parse(payloadJson);

    if (!isRecord(parsedPayload)) {
      throw new Error("JWT payload must be an object");
    }

    const destination = stringOr(parsedPayload.dest, "");
    const audience = stringOr(parsedPayload.aud, "");

    const now = new Date();
    const fallbackIssued = now.toISOString();
    const fallbackExpires = new Date(now.getTime() + 60_000).toISOString();

    const issuedAtSeconds = toUnixSeconds(parsedPayload.iat);
    const notBeforeSeconds = toUnixSeconds(parsedPayload.nbf);
    const expiresAtSeconds = toUnixSeconds(parsedPayload.exp);

    const response: SessionTokenResponse = {
      shopDomain: destination,
      destination,
      audience,
      issuedAt:
        issuedAtSeconds !== undefined
          ? new Date(issuedAtSeconds * 1000).toISOString()
          : fallbackIssued,
      notBefore:
        notBeforeSeconds !== undefined
          ? new Date(notBeforeSeconds * 1000).toISOString()
          : fallbackIssued,
      expiresAt:
        expiresAtSeconds !== undefined
          ? new Date(expiresAtSeconds * 1000).toISOString()
          : fallbackExpires,
      sessionId: toMaybeString(parsedPayload.sid),
      userId: toMaybeString(parsedPayload.sub),
    };

    return json(response, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to decode Shopify session token", error);
    return unauthorized("Invalid or expired session token");
  }
}
