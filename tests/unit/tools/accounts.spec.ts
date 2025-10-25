import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const toolFactory = vi.hoisted(() => (config: any) => ({ ...config }));
const accountsServiceMock = {
  getCustomerOrders: vi.fn(),
  getOrderDetails: vi.fn(),
  getAccountInfo: vi.fn(),
  updatePreferences: vi.fn(),
  getMetrics: vi.fn(),
};

const AccountsSubAgentMock = vi.fn(() => accountsServiceMock);

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

vi.mock("../../../app/services/ai-customer/accounts-sub-agent.service.js", () => ({
  AccountsSubAgent: AccountsSubAgentMock,
}));

let getCustomerOrders: typeof import("../../../apps/agent-service/src/tools/accounts")["getCustomerOrders"];
let getOrderDetails: typeof import("../../../apps/agent-service/src/tools/accounts")["getOrderDetails"];
let getAccountInfo: typeof import("../../../apps/agent-service/src/tools/accounts")["getAccountInfo"];
let updatePreferences: typeof import("../../../apps/agent-service/src/tools/accounts")["updatePreferences"];
let getAccountsMetrics: typeof import("../../../apps/agent-service/src/tools/accounts")["getAccountsMetrics"];

beforeAll(async () => {
  const accountsTools = await import("../../../apps/agent-service/src/tools/accounts.ts");
  getCustomerOrders = accountsTools.getCustomerOrders;
  getOrderDetails = accountsTools.getOrderDetails;
  getAccountInfo = accountsTools.getAccountInfo;
  updatePreferences = accountsTools.updatePreferences;
  getAccountsMetrics = accountsTools.getAccountsMetrics;
});

beforeEach(() => {
  AccountsSubAgentMock.mockClear();
  accountsServiceMock.getCustomerOrders.mockReset();
  accountsServiceMock.getOrderDetails.mockReset();
  accountsServiceMock.getAccountInfo.mockReset();
  accountsServiceMock.updatePreferences.mockReset();
  accountsServiceMock.getMetrics.mockReset();
});

describe("Customer Accounts tools", () => {
  it("delegates order retrieval to AccountsSubAgent", async () => {
    accountsServiceMock.getCustomerOrders.mockResolvedValue([
      { id: "ord-1", totalPrice: { amount: "50.00", currencyCode: "USD" } },
    ]);

    const response = await getCustomerOrders.execute({
      customerId: "cust-42",
      token: "oauth-token",
      limit: 5,
    });

    expect(accountsServiceMock.getCustomerOrders).toHaveBeenCalledWith("cust-42", "oauth-token", 5);
    expect(response.success).toBe(true);
    expect(response.count).toBe(1);
    expect(response.message).toContain("Retrieved 1 orders for customer cust-42");
  });

  it("surfaces errors from AccountsSubAgent when fetching orders", async () => {
    accountsServiceMock.getCustomerOrders.mockRejectedValue(new Error("ABAC policy violation"));

    const result = await getCustomerOrders.execute({
      customerId: "cust-42",
      token: "oauth-token",
      limit: 2,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to retrieve customer orders");
    expect(result.error).toBe("ABAC policy violation");
  });

  it("retrieves order details through the service layer", async () => {
    accountsServiceMock.getOrderDetails.mockResolvedValue({ id: "ord-9", status: "FULFILLED" });

    const response = await getOrderDetails.execute({
      customerId: "cust-1",
      orderId: "ord-9",
      token: "token-123",
    });

    expect(accountsServiceMock.getOrderDetails).toHaveBeenCalledWith("cust-1", "ord-9", "token-123");
    expect(response.success).toBe(true);
    expect(response.order).toEqual({ id: "ord-9", status: "FULFILLED" });
    expect(response.message).toBe("Retrieved details for order ord-9");
  });

  it("bubbles up account info failures with safe messaging", async () => {
    accountsServiceMock.getAccountInfo.mockRejectedValue(new Error("Token expired"));

    const response = await getAccountInfo.execute({
      customerId: "cust-77",
      token: "bad-token",
    });

    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to retrieve account information");
    expect(response.error).toBe("Token expired");
  });

  it("updates preferences through AccountsSubAgent", async () => {
    accountsServiceMock.updatePreferences.mockResolvedValue(true);

    const response = await updatePreferences.execute({
      customerId: "cust-88",
      token: "oauth",
      preferences: { marketing: true, notifications: false },
    });

    expect(accountsServiceMock.updatePreferences).toHaveBeenCalledWith(
      "cust-88",
      "oauth",
      { marketing: true, notifications: false },
    );
    expect(response.success).toBe(true);
    expect(response.message).toContain("Updated preferences for customer cust-88");
  });

  it("fetches accounts metrics for observability", async () => {
    accountsServiceMock.getMetrics.mockResolvedValue({ totalQueries: 10, successRate: 0.9 });

    const response = await getAccountsMetrics.execute({});

    expect(accountsServiceMock.getMetrics).toHaveBeenCalled();
    expect(response.success).toBe(true);
    expect(response.metrics).toEqual({ totalQueries: 10, successRate: 0.9 });
  });
});
