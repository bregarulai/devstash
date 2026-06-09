import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['actions/**/*.test.ts', 'lib/**/*.test.ts'],
    exclude: [
      'node_modules',
      '.next',
      'app',
      'components',
      'hooks',
      'types',
      'scripts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['actions/**/*.ts', 'lib/**/*.ts'],
      exclude: [
        'actions/**/*.test.ts',
        'lib/**/*.test.ts',
        'lib/prisma.ts',
        'lib/db/**/*.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
})
