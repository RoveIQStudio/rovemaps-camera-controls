import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text', 'lcov'],
      thresholds: {
        // Ratchet floors set to floor(measured) - 2 (baseline: L76.22 F65.77 B65.77 S76.22).
        lines: 74,
        functions: 63,
        branches: 63,
        statements: 74,
      },
    },
    // Fix for jsdom environment pooling issues in CI
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false
      }
    }
  }
});
