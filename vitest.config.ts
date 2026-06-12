import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['actions/**/*.test.ts', 'lib/**/*.test.ts', 'types/**/*.test.ts'],
    exclude: [
      'node_modules',
      '.next',
      'app',
      'components',
      'hooks',
      'scripts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'lib/auth.ts',
        'lib/rate-limit.ts',
        'lib/verification-token.ts',
        'lib/account-deletion.ts',
        'lib/auth.config.ts',
        'lib/utils.ts',
        'lib/constants.ts',
        'lib/db/collections.ts',
        'lib/db/items.ts',
        'types/db.ts',
        'actions/auth.ts',
        'actions/sign-in.ts',
        'actions/forgot-password.ts',
        'actions/reset-password.ts',
        'actions/resend-verification.ts',
        'actions/sign-in-github.ts',
        'actions/profile.ts',
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
