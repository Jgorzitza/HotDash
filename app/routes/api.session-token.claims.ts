import type { LoaderFunctionArgs } from "react-router";
import shopify, { authenticate } from "../shopify.server";

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

function json(data: SessionTokenResponse, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    ...init,
  });
}

function unauthorized(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
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

    const decoded = await (
      shopify as unknown as {
        session: { decodeSessionToken(token: string): Promise<any> };
      }
    ).session.decodeSessionToken(encodedToken);

    const response: SessionTokenResponse = {
      shopDomain: decoded.dest,
      destination: decoded.dest,
      audience: decoded.aud,
      issuedAt: new Date(decoded.iat * 1000).toISOString(),
      notBefore: new Date(decoded.nbf * 1000).toISOString(),
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      sessionId: decoded.sid ?? null,
      userId: decoded.sub ?? null,
    };

    return json(response);
  } catch (error) {
    console.error("Failed to decode Shopify session token", error);
    return unauthorized("Invalid or expired session token");
  }
}
