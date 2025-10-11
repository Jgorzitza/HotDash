import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DecisionLog, Memory } from "../../packages/memory";

const insertMock = vi.fn();
const orderMock = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      const makeOrder = () => (...args: unknown[]) => orderMock(table, ...args);
      const makeEq = () => (column: string, value: unknown) => {
        eqMock(table, column, value);
        return { order: makeOrder() };
      };
      const makeSelect = () => (...args: unknown[]) => {
        selectMock(table, ...args);
        return { order: makeOrder(), eq: makeEq() };
      };

      return {
        insert: (...args: unknown[]) => insertMock(table, ...args),
        select: makeSelect(),
        eq: makeEq(),
        order: makeOrder(),
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
    orderMock.mockResolvedValue({ data: [], error: null });
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

  it("maps decision fields to Supabase column names", async () => {
    insertMock.mockResolvedValue({ data: [{ id: 1 }], error: null });

    await memory.putDecision(baseDecision);

    const [table, payload] = insertMock.mock.calls[0] ?? [];
    expect(table).toBe("DecisionLog");
    expect(payload).toMatchObject({
      scope: baseDecision.scope,
      actor: baseDecision.who,
      action: baseDecision.what,
      rationale: baseDecision.why,
      createdAt: baseDecision.createdAt,
    });
    expect(payload).not.toHaveProperty("evidenceUrl");
    expect(payload).not.toHaveProperty("externalRef");
  });

  it("falls back to legacy schema when actor columns are missing", async () => {
    insertMock
      .mockResolvedValueOnce({ error: { code: "42703", message: 'column "actor" does not exist' } })
      .mockResolvedValueOnce({ data: [{ id: 1 }], error: null });

    await expect(memory.putDecision(baseDecision)).resolves.toBeUndefined();

    const [firstTable, firstPayload] = insertMock.mock.calls[0] ?? [];
    expect(firstTable).toBe("DecisionLog");
    expect(firstPayload).toMatchObject({ actor: baseDecision.who });

    const [secondTable, secondPayload] = insertMock.mock.calls[1] ?? [];
    expect(secondTable).toBe("decision_log");
    expect(secondPayload).toMatchObject({
      who: baseDecision.who,
      what: baseDecision.what,
      why: baseDecision.why,
    });
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

describe("supabaseMemory listDecisions", () => {
  let memory: Memory;

  beforeEach(() => {
    insertMock.mockReset();
    selectMock.mockReset();
    eqMock.mockReset();
    orderMock.mockReset();
    orderMock.mockResolvedValue({ data: [], error: null });
    memory = supabaseMemory("https://example.supabase.co", "service-key");
  });

  it("returns mapped decision logs", async () => {
    const createdAt = new Date().toISOString();
    orderMock.mockResolvedValue({
      data: [
        {
          id: 42,
          scope: "ops",
          actor: "agent",
          action: "approve",
          rationale: "",
          evidenceUrl: "https://example.com",
          externalRef: "abc123",
          createdAt,
        },
      ],
      error: null,
    });

    const results = await memory.listDecisions();

    expect(results).toEqual([
      {
        id: "42",
        scope: "ops",
        who: "agent",
        what: "approve",
        why: "",
        sha: "abc123",
        evidenceUrl: "https://example.com",
        createdAt,
      },
    ]);

    expect(selectMock).toHaveBeenCalledWith(
      "DecisionLog",
      "id,scope,actor,action,rationale,evidenceUrl,externalRef,createdAt",
    );
    expect(orderMock).toHaveBeenCalledWith("DecisionLog", "createdAt", { ascending: false });
  });

  it("filters by scope when provided", async () => {
    await memory.listDecisions("ops");

    expect(eqMock).toHaveBeenCalledWith("DecisionLog", "scope", "ops");
  });

  it("falls back to legacy table when DecisionLog is unavailable", async () => {
    const createdAt = new Date().toISOString();
    orderMock
      .mockResolvedValueOnce({ error: { code: "42P01", message: 'relation "DecisionLog" does not exist' } })
      .mockResolvedValueOnce({
        data: [
          {
            id: 7,
            scope: "build",
            who: "legacy-agent",
            what: "ship",
            why: "needed",
            sha: "legacy-sha",
            evidence_url: "https://legacy.example.com",
            created_at: createdAt,
          },
        ],
        error: null,
      });

    const results = await memory.listDecisions();

    expect(results).toEqual([
      {
        id: "7",
        scope: "build",
        who: "legacy-agent",
        what: "ship",
        why: "needed",
        sha: "legacy-sha",
        evidenceUrl: "https://legacy.example.com",
        createdAt,
      },
    ]);

    expect(selectMock).toHaveBeenNthCalledWith(1, "DecisionLog", "id,scope,actor,action,rationale,evidenceUrl,externalRef,createdAt");
    expect(selectMock).toHaveBeenNthCalledWith(2, "decision_log", "*");
    expect(orderMock).toHaveBeenNthCalledWith(1, "DecisionLog", "createdAt", { ascending: false });
    expect(orderMock).toHaveBeenNthCalledWith(2, "decision_log", "created_at", { ascending: false });
  });
});
