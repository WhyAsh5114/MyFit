import { defineConfig, devices } from '@playwright/test';

const WEB = 'http://localhost:4173';
const API = 'http://localhost:3000';
const MAIL = 'http://localhost:4010';
const DATABASE_URL =
	process.env.TEST_DATABASE_URL ?? 'postgresql://myfit:password@localhost:5432/myfit';

/**
 * Runs the built app against a real API and Postgres. The API's mail provider points at a stub
 * that records sign-in codes, so tests log in without sending email or changing production code.
 * Apply the migrations first: `DATABASE_URL=<url> pnpm --filter @myfit/shared db:migrate`.
 */
export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	// Sign-in, sync and logout each make several round trips, and workers share one API.
	expect: { timeout: 15_000 },
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'list' : 'html',
	use: { baseURL: WEB, locale: 'en-US', trace: 'retain-on-failure' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: [
		{
			command: 'node tests/e2e/support/mail-stub.ts',
			url: `${MAIL}/health`,
			reuseExistingServer: !process.env.CI
		},
		{
			command: 'bun run src/index.ts',
			cwd: '../api',
			url: `${API}/api/health`,
			reuseExistingServer: !process.env.CI,
			env: {
				PORT: '3000',
				DATABASE_URL,
				TRUSTED_ORIGINS: JSON.stringify([WEB]),
				BETTER_AUTH_SECRET: 'e2e-secret-e2e-secret-e2e-secret-0123',
				BETTER_AUTH_URL: API,
				RESEND_API_KEY: 're_e2e',
				RESEND_BASE_URL: MAIL
			}
		},
		{
			command: 'pnpm exec vite build && node tests/e2e/support/static-server.ts',
			url: WEB,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
			env: {
				PUBLIC_API_URL: API,
				PUBLIC_POSTHOG_KEY: 'e2e',
				PUBLIC_POSTHOG_HOST: MAIL
			}
		}
	]
});
