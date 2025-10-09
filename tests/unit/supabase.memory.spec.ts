import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DecisionLog, Memory } from "../../packages/memory";

const insertMock = vi.fn();
const orderMock = vi.fn(() => Promise.resolve({ data: [] }));
const selectMock = vi.fn(() => ({ order: orderMock }));
const eqMock = vi.fn(() => ({ order: orderMock }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "decision_log") {
        return {
          insert: (...args: unknown[]) => insertMock(...args),
          select: selectMock,
          eq: eqMock,
          order: orderMock,
        };
      }

      return {
        insert: (...args: unknown[]) => insertMock(...args),
        select: selectMock,
        eq: eqMock,
        order: orderMock,
      };
    },
  })),
}));

import { __internal, supabaseMemory } from "../../packages/memory/supabase";

const baseDecision: DecisionLog = {
  id: "1",
  scope: "ops",
  who: "agent",
  what: "approve",
  why: "",
  sha: undefined,
  evidenceUrl: undefined,
  createdAt: new Date().toISOString(),
};

describe("supabaseMemory putDecision", () => {
  let memory: Memory;

  beforeEach(() => {
    insertMock.mockReset();
    selectMock.mockReset();
    eqMock.mockReset();
    orderMock.mockReset();
    memory = supabaseMemory("https://example.supabase.co", "service-key");
    __internal.setWaitForTests(async () => {});
  });

  afterEach(() => {
    __internal.resetWaitForTests();
  });

  it("retries when Supabase insert returns retryable error and eventually succeeds", async () => {
    insertMock
      .mockResolvedValueOnce({ error: { message: "ETIMEDOUT", code: "ETIMEDOUT" } })
      .mockResolvedValueOnce({ data: [{ id: 1 }], error: null });

    await expect(memory.putDecision(baseDecision)).resolves.toBeUndefined();
    expect(insertMock).toHaveBeenCalledTimes(2);
  });

  it("throws when Supabase insert keeps failing with retryable error beyond max attempts", async () => {
    insertMock.mockResolvedValue({ error: { message: "ETIMEDOUT", code: "ETIMEDOUT" } });

    await expect(memory.putDecision(baseDecision)).rejects.toMatchObject({
      message: expect.stringContaining("ETIMEDOUT"),
    });
    expect(insertMock).toHaveBeenCalledTimes(3);
  });

  it("throws immediately on non-retryable error", async () => {
    insertMock.mockResolvedValue({ error: { message: "invalid input", code: "400" } });

    await expect(memory.putDecision(baseDecision)).rejects.toMatchObject({
      message: expect.stringContaining("invalid input"),
    });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("retries when Supabase insert rejects with network error", async () => {
    insertMock
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce({ data: [{ id: 1 }], error: null });

    await expect(memory.putDecision(baseDecision)).resolves.toBeUndefined();
    expect(insertMock).toHaveBeenCalledTimes(2);
  });
});
