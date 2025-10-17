import { defineConfig } from "vitest/config";
import path from "node:path";

const rootDir = path.resolve(new URL(".", import.meta.url).pathname);

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(rootDir, "app"),
    },
  },
  test: {
    include: [
      "tests/unit/**/*.spec.ts",
      "tests/unit/**/*.spec.tsx",
      "tests/integration/**/*.spec.ts",
      "tests/agents/**/*.spec.ts",
    ],
    environment: "jsdom",
    // Tinypool EPIPE under Node 24.9; keeping vmThreads globally until Vitest supports scoped pools reliably.
    pool: "vmThreads",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    exclude: ["tests/playwright/**"],
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage/vitest",
    },
  },
});
