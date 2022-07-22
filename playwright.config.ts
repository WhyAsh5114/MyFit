import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	webServer: {
		command: 'export NODE_NO_WARNINGS=1 && npm run build && npm run preview',
		port: 4173
	},
	use: {
		baseURL: 'http://localhost:4173',
		video: 'retain-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome']
			}
		},

		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox']
			}
		},

		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5']
			}
		},

		{
			name: 'Google Chrome',
			use: {
				channel: 'chrome'
			}
		}
	]
};

export default config;
