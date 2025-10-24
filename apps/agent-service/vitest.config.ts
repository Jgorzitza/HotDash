import { defineConfig } from 'vitest/config';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from root .env file for tests
config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    env: {
      // Load environment variables from root .env
      ...process.env,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        'vitest.config.ts',
        // Exclude files not covered in Phase 1 (will be tested in Phase 2-3)
        'src/server.ts',
        'src/feedback/**',
        'src/handoff/**',
        'src/integrations/**',
        'src/monitoring/**',
        'src/quality/**',
        'src/collaboration/**',
        'src/tools/shipping.ts', // Separate shipping tool not yet covered
      ],
      include: ['src/**/*.ts'],
      all: true,
      // Phase 1 targets - focus on core agent and tool configuration
      thresholds: {
        'src/agents/index.ts': {
          lines: 80,
          functions: 0, // Tool execute functions tested in integration
          branches: 100,
          statements: 80,
        },
        'src/context/conversation-manager.ts': {
          lines: 85,
          functions: 80,
          branches: 50,
          statements: 85,
        },
        'src/tools/rag.ts': {
          lines: 15,
          functions: 0, // Execute function tested in integration
          branches: 20,
          statements: 15,
        },
      },
    },
    include: ['tests/**/*.spec.ts'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
