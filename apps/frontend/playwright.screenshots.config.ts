import { defineConfig } from '@playwright/test';
import { API, MAIL, WEB } from './tests/screenshots/support/env';

const DATABASE_URL = process.env.SCREENSHOT_DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error('Run this through `pnpm screenshots`, which prepares the database first.');
}

/**
 * Captures every screen of the built app in light and dark. It runs the real app against a real
 * API and a disposable database, with the same mail stub the e2e tests use. Run it with
 * `pnpm screenshots`; see the README.
 */
export default defineConfig({
	testDir: 'tests/screenshots',
	testMatch: '*.spec.ts',
	// Both themes run at once; each signs in as its own user.
	fullyParallel: true,
	timeout: 240_000,
	expect: { timeout: 15_000 },
	reporter: 'list',
	use: {
		baseURL: WEB,
		locale: 'en-US',
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 2
	},
	projects: [
		{ name: 'light', use: { colorScheme: 'light' } },
		{ name: 'dark', use: { colorScheme: 'dark' } }
	],
	webServer: [
		{
			command: 'node tests/e2e/support/mail-stub.ts',
			url: `${MAIL}/health`,
			reuseExistingServer: true
		},
		{
			command: 'bun run src/index.ts',
			cwd: '../api',
			url: `${API}/api/health`,
			reuseExistingServer: false,
			env: {
				PORT: new URL(API).port,
				DATABASE_URL,
				TRUSTED_ORIGINS: JSON.stringify([WEB]),
				BETTER_AUTH_SECRET: 'screenshots-secret-screenshots-secret-0123',
				BETTER_AUTH_URL: API,
				RESEND_API_KEY: 're_screenshots',
				RESEND_BASE_URL: MAIL
			}
		},
		{
			// Always builds fresh, so the images show the current code.
			command: 'pnpm exec vite build && node tests/e2e/support/static-server.ts',
			url: WEB,
			reuseExistingServer: false,
			timeout: 240_000,
			env: {
				PORT: new URL(WEB).port,
				PUBLIC_API_URL: API,
				PUBLIC_POSTHOG_KEY: 'screenshots',
				PUBLIC_POSTHOG_HOST: MAIL
			}
		}
	]
});
