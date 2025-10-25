import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const toolFactory = vi.hoisted(() => (config: any) => ({ ...config }));
const fetchMock = vi.fn();

vi.mock("@openai/agents-core", () => ({
  tool: toolFactory,
  setDefaultModelProvider: vi.fn(),
}), { virtual: true });

vi.mock("@openai/agents-openai", () => ({
  OpenAIProvider: class {},
  setDefaultOpenAITracingExporter: vi.fn(),
}), { virtual: true });

vi.mock("@openai/agents", () => ({
  tool: toolFactory,
}), { virtual: true });

vi.mock("node-fetch", () => ({
  __esModule: true,
  default: fetchMock,
}));

let answerFromDocs: typeof import("../../../apps/agent-service/src/tools/rag")["answerFromDocs"];

beforeAll(async () => {
  ({ answerFromDocs } = await import("../../../apps/agent-service/src/tools/rag.ts"));
});

beforeEach(() => {
  fetchMock.mockReset();
});

describe("answerFromDocs", () => {
  it("returns text content from MCP when available", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: "Knowledge base summary",
          },
        ],
      }),
    });

    const response = await answerFromDocs.execute({ question: "Where is my order?", topK: 3 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, Record<string, any>];
    expect(url).toMatch(/\/tools\/call$/);
    expect(options?.method).toBe("POST");
    expect(options?.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(String(options?.body))).toEqual({
      name: "query_support",
      arguments: {
        q: "Where is my order?",
        topK: 3,
      },
    });
    expect(response).toBe("Knowledge base summary");
  });

  it("returns fallback copy when MCP has no content", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [] }),
    });

    const response = await answerFromDocs.execute({ question: "Unknown", topK: 5 });

    expect(response).toBe("No answer found in knowledge base.");
  });

  it("surfaces MCP errors as human-readable strings", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
    });

    const response = await answerFromDocs.execute({ question: "Need help" });

    expect(response).toBe("Error querying knowledge base: MCP server returned 503");
  });
});
