import { getConfig } from "../config.js";
export async function answerQuery(query, topK = 5) {
  void getConfig();
  const mockSources = [
    {
      id: "mock-1",
      text: "Mock answer content related to the query",
      metadata: {
        source: "hotrodan.com",
        created_at: new Date().toISOString(),
      },
      score: 0.95,
    },
    {
      id: "mock-2",
      text: "Additional context from documentation",
      metadata: { source: "curated", created_at: new Date().toISOString() },
      score: 0.87,
    },
  ];
  return {
    query,
    answer: `Based on available documentation, here's information about: ${query}. This is a mock response for testing purposes.`,
    citations: mockSources.slice(0, topK),
    confidence: 0.8,
  };
}
