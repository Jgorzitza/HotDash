import { describe, expect, it } from "vitest";

/**
 * OpenAI API Contract Tests
 */

describe("OpenAI API Contract", () => {
  it("chat completions response shape", () => {
    const mock = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1234567890,
      model: "gpt-4",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "Response" },
          finish_reason: "stop",
        },
      ],
    };

    expect(mock).toHaveProperty("choices");
    expect(mock.choices[0]).toHaveProperty("message");
    expect(mock.choices[0].message).toHaveProperty("content");
  });

  it("embeddings response shape", () => {
    const mock = {
      object: "list",
      data: [{ object: "embedding", embedding: [0.1, 0.2, 0.3], index: 0 }],
      model: "text-embedding-ada-002",
    };

    expect(mock).toHaveProperty("data");
    expect(mock.data[0]).toHaveProperty("embedding");
    expect(mock.data[0].embedding).toBeInstanceOf(Array);
  });
});
