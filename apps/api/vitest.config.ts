import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
		// The suites share one database, so they take turns instead of running in parallel.
		fileParallelism: false,
		// The seed test starts the real importer in child processes, which exceeds the 5 s default.
		testTimeout: 30_000,
		// The values `lib/env.ts` requires, so the app modules load under test.
		env: {
			DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
			TRUSTED_ORIGINS: '[]',
			BETTER_AUTH_SECRET: 'test-secret',
			BETTER_AUTH_URL: 'http://localhost:3000'
		}
	}
});
