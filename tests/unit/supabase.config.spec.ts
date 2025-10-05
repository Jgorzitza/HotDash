import { beforeEach, describe, expect, it, vi } from "vitest";

describe("supabase config", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  it("creates supabase-backed memory when credentials exist", async () => {
    const fakeMemory = {
      putDecision: vi.fn(),
      listDecisions: vi.fn(async () => []),
      putFact: vi.fn(),
      getFacts: vi.fn(async () => []),
    };

    const supabaseMemoryMock = vi.fn(() => fakeMemory);

    vi.doMock("../../packages/memory/supabase", () => ({
      supabaseMemory: supabaseMemoryMock,
    }));

    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "service-key";

    const { getMemory, getSupabaseConfig } = await import("../../app/config/supabase.server");

    const config = getSupabaseConfig();
    expect(config).toEqual({ url: "https://example.supabase.co", serviceKey: "service-key" });

    const memory = getMemory();
    expect(memory).toBe(fakeMemory);
    expect(supabaseMemoryMock).toHaveBeenCalledWith("https://example.supabase.co", "service-key");

    const memorySecond = getMemory();
    expect(memorySecond).toBe(fakeMemory);
    expect(supabaseMemoryMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to in-memory implementation when credentials missing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getMemory } = await import("../../app/config/supabase.server");

    const memory = getMemory();
    const now = new Date().toISOString();
    await memory.putDecision({
      id: "1",
      scope: "build",
      who: "tester",
      what: "test",
      why: "",
      createdAt: now,
    });
    const decisions = await memory.listDecisions();
    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.id).toBe("1");

    const buildDecisions = await memory.listDecisions("build");
    expect(buildDecisions).toHaveLength(1);

    await memory.putFact({
      project: "hotdash",
      topic: "cx",
      key: "sla",
      value: "90%",
      createdAt: now,
    });
    const facts = await memory.getFacts();
    expect(facts).toHaveLength(1);

    warnSpy.mockRestore();
  });
});
