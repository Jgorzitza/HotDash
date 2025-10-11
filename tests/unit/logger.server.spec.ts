import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, withRequestLogger } from "../../app/utils/logger.server";
import { ServiceError } from "../../app/services/types";

// Mock fetch to avoid making actual HTTP calls during tests
global.fetch = vi.fn();

describe("Logger", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock successful edge function response
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("basic logging methods", () => {
    it("should log info messages with metadata", async () => {
      const message = "Test info message";
      const metadata = { userId: "123", action: "test" };

      logger.info(message, metadata);

      // Wait for async call to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/functions/v1/occ-log"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining(message),
        })
      );
    });

    it("should log errors with appropriate level", async () => {
      const message = "Test error message";
      const metadata = { component: "test", errorCode: 500 };

      logger.error(message, metadata);

      await new Promise(resolve => setTimeout(resolve, 10));

      const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(callBody.level).toBe("ERROR");
      expect(callBody.message).toBe(message);
      expect(callBody.metadata.component).toBe("test");
    });
  });

  describe("ServiceError logging", () => {
    it("should log ServiceError with structured metadata", async () => {
      const serviceError = new ServiceError("Test service failure", {
        scope: "test.service",
        code: "TEST_ERROR",
        retryable: true,
        cause: new Error("Original error"),
      });

      logger.logServiceError(serviceError);

      await new Promise(resolve => setTimeout(resolve, 10));

      const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(callBody.level).toBe("ERROR");
      expect(callBody.message).toContain("ServiceError in test.service");
      expect(callBody.metadata.scope).toBe("test.service");
      expect(callBody.metadata.code).toBe("TEST_ERROR");
      expect(callBody.metadata.retryable).toBe(true);
    });

    it("should include additional metadata when provided", async () => {
      const serviceError = new ServiceError("Test failure", {
        scope: "test.service",
        code: "TEST_ERROR",
      });

      const additionalMetadata = {
        requestPath: "/api/test",
        userId: "user123",
      };

      logger.logServiceError(serviceError, undefined, additionalMetadata);

      await new Promise(resolve => setTimeout(resolve, 10));

      const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(callBody.metadata.requestPath).toBe("/api/test");
      expect(callBody.metadata.userId).toBe("user123");
    });
  });

  describe("request-aware logging", () => {
    it("should capture request context", async () => {
      const mockRequest = new Request("https://example.com/test", {
        headers: {
          "x-request-id": "req-123",
          "user-agent": "test-agent/1.0",
        },
      });

      const requestLogger = withRequestLogger(mockRequest);
      requestLogger.info("Request processed", { status: "success" });

      await new Promise(resolve => setTimeout(resolve, 10));

      const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
      expect(callBody.requestId).toBe("req-123");
      expect(callBody.userAgent).toBe("test-agent/1.0");
      expect(callBody.metadata.status).toBe("success");
    });
  });

  describe("fallback behavior", () => {
    it("should fall back to console logging when edge function fails", async () => {
      // Mock fetch to fail
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
      
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.info("Test message", { test: true });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send log to edge function:",
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[INFO] Test message",
        expect.objectContaining({ test: true })
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("should fall back to console when environment not configured", async () => {
      // Create a logger instance with missing config
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // Import logger again to get instance without config
      const { logger: unconfiguredLogger } = await import("../../app/utils/logger.server");
      unconfiguredLogger.warn("Test warning", { fallback: true });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WARN] Test warning",
        expect.objectContaining({ fallback: true })
      );

      // Don't call fetch when not configured
      expect(fetch).not.toHaveBeenCalled();

      process.env = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("should handle HTTP error responses gracefully", async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response("Internal Server Error", { status: 500 })
      );

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.error("Test error message");

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logger edge function error: 500 Internal Server Error"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "[ERROR] Test error message",
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
