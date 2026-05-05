import { devices, type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	fullyParallel: true,
	retries: 0,
	globalSetup: './tests/global-setup',
	globalTeardown: './tests/global-teardown',
	workers: 1,
	reporter: process.env.CI ? 'list' : 'html',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		video: 'retain-on-failure',
		locale: 'en-US'
	},
	timeout: 15000,
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
};

export default config;
