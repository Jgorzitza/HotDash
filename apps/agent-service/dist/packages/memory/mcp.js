// packages/memory/mcp.ts
// Thin client that proxies to a Memory MCP server if available.
export async function putFactMCP(serverUrl, payload) {
    await fetch(`${serverUrl}/facts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}
//# sourceMappingURL=mcp.js.map