import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "tests/unit/**/*.spec.ts",
      "app/**/__tests__/**/*.test.ts", // Growth spec TDD tests
      "app/**/__tests__/*.test.ts", // Growth spec TDD tests
    ],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    exclude: ["tests/playwright/**"],
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage/vitest",
    },
  },
});
