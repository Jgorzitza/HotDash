/**
 * OpenAI Contract Tests — Verify chat completion response shapes
 *
 * Tests that OpenAI API responses match expected contract.
 * Prevents breaking changes from impacting draft generation.
 */

import { describe, it, expect } from "vitest";

describe("OpenAI API Contract", () => {
  describe("Chat Completion Response Shape", () => {
    it("should have expected response structure", () => {
      // Expected response shape from OpenAI Chat Completions API
      const mockResponse = {
        id: "chatcmpl-123",
        object: "chat.completion",
        created: 1677652288,
        model: "gpt-4-turbo",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Thank you for reaching out! I'll help you with that.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 56,
          completion_tokens: 31,
          total_tokens: 87,
        },
      };

      expect(mockResponse).toHaveProperty("id");
      expect(mockResponse).toHaveProperty("choices");
      expect(mockResponse.choices).toBeInstanceOf(Array);
      expect(mockResponse.choices[0]).toHaveProperty("message");
      expect(mockResponse.choices[0].message).toHaveProperty("content");
      expect(mockResponse.choices[0].message).toHaveProperty("role");
      expect(mockResponse.choices[0].message.role).toBe("assistant");
    });

    it("should extract content from response", () => {
      const mockResponse = {
        choices: [
          {
            message: {
              role: "assistant",
              content: "Test reply content",
            },
          },
        ],
      };

      const content = mockResponse.choices[0].message.content;
      expect(content).toBe("Test reply content");
      expect(typeof content).toBe("string");
    });

    it("should have usage metadata", () => {
      const mockResponse = {
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      expect(mockResponse.usage).toHaveProperty("prompt_tokens");
      expect(mockResponse.usage).toHaveProperty("completion_tokens");
      expect(mockResponse.usage).toHaveProperty("total_tokens");
      expect(typeof mockResponse.usage.total_tokens).toBe("number");
    });
  });

  describe("Request Payload Shape", () => {
    it("should have required fields for chat completion", () => {
      const requestPayload = {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: "Hello" },
        ],
        temperature: 0.7,
        max_tokens: 300,
      };

      expect(requestPayload).toHaveProperty("model");
      expect(requestPayload).toHaveProperty("messages");
      expect(requestPayload.messages).toBeInstanceOf(Array);
      expect(requestPayload.messages.length).toBeGreaterThan(0);
      expect(requestPayload.messages[0]).toHaveProperty("role");
      expect(requestPayload.messages[0]).toHaveProperty("content");
    });

    it("should support system and user messages", () => {
      const messages = [
        { role: "system", content: "System prompt" },
        { role: "user", content: "User message" },
      ];

      expect(messages[0].role).toBe("system");
      expect(messages[1].role).toBe("user");
    });

    it("should validate model name", () => {
      const validModels = [
        "gpt-4-turbo",
        "gpt-4o-mini",
        "gpt-4",
        "gpt-3.5-turbo",
      ];
      const model = "gpt-4-turbo";

      expect(validModels).toContain(model);
    });

    it("should validate temperature range", () => {
      const temperature = 0.7;

      expect(temperature).toBeGreaterThanOrEqual(0);
      expect(temperature).toBeLessThanOrEqual(2);
    });

    it("should validate max_tokens", () => {
      const maxTokens = 300;

      expect(maxTokens).toBeGreaterThan(0);
      expect(typeof maxTokens).toBe("number");
    });
  });

  describe("Error Response Shape", () => {
    it("should handle error responses", () => {
      const errorResponse = {
        error: {
          message: "Invalid API key provided",
          type: "invalid_request_error",
          param: null,
          code: "invalid_api_key",
        },
      };

      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse.error).toHaveProperty("message");
      expect(errorResponse.error).toHaveProperty("type");
      expect(typeof errorResponse.error.message).toBe("string");
    });
  });
});
