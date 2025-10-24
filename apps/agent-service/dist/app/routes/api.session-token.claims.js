import shopify, { authenticate } from "../shopify.server";
function json(data, init) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
        },
        ...init,
    });
}
function unauthorized(message) {
    return new Response(JSON.stringify({ error: message }), {
        status: 401,
        headers: { "content-type": "application/json" },
    });
}
export async function loader({ request }) {
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
        const decoded = await shopify.session.decodeSessionToken(encodedToken);
        const response = {
            shopDomain: decoded.dest,
            destination: decoded.dest,
            audience: decoded.aud,
            issuedAt: new Date(decoded.iat * 1000).toISOString(),
            notBefore: new Date(decoded.nbf * 1000).toISOString(),
            expiresAt: new Date(decoded.exp * 1000).toISOString(),
            sessionId: decoded.sid ?? null,
            userId: decoded.sub ?? null,
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("Failed to decode Shopify session token", error);
        return unauthorized("Invalid or expired session token");
    }
}
//# sourceMappingURL=api.session-token.claims.js.map