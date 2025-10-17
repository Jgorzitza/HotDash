import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { embeddedUrl } from "../fixtures/shopify-admin";

describe("embeddedUrl", () => {
  const originalHost = process.env.PLAYWRIGHT_SHOPIFY_HOST_PARAM;
  const originalBase = process.env.PLAYWRIGHT_BASE_URL;

  beforeEach(() => {
    process.env.PLAYWRIGHT_SHOPIFY_HOST_PARAM = "test-host";
    process.env.PLAYWRIGHT_BASE_URL = "https://example.com/app";
  });

  afterEach(() => {
    process.env.PLAYWRIGHT_SHOPIFY_HOST_PARAM = originalHost;
    process.env.PLAYWRIGHT_BASE_URL = originalBase;
  });

  it("includes host, embedded, and mock parameters", () => {
    const url = new URL(
      embeddedUrl("/app", { mock: "0", searchParams: { foo: "bar" } }),
    );

    expect(url.origin).toBe("https://example.com");
    expect(url.searchParams.get("host")).toBe("test-host");
    expect(url.searchParams.get("embedded")).toBe("1");
    expect(url.searchParams.get("mock")).toBe("0");
    expect(url.searchParams.get("foo")).toBe("bar");
  });
});
