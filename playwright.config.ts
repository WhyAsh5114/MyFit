import { devices, type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	fullyParallel: true,
	retries: 2,
	globalSetup: './tests/global-setup',
	globalTeardown: './tests/global-teardown',
	workers: process.env.CI ? 1 : '25%',
	reporter: process.env.CI ? 'list' : 'html',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		video: 'retain-on-failure'
	},
	timeout: 60000,
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
};

export default config;
