/**
 * Vitest Configuration for Clarity Smart Contract Testing
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'clarinet',
    singleThread: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
