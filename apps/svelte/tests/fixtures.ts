import { test as baseTest, expect } from '@playwright/test';

export const test = baseTest.extend<{ autoTestFixture: string }>({
	autoTestFixture: [
		async ({ page }, use) => {
			await page.goto('http://localhost:4173/login');
			await page.getByRole('button', { name: 'Sign in as anonymous' }).click();
			await page.getByRole('link', { name: 'Skip' }).click();
			await expect(page.getByRole('heading').filter({ hasText: 'Dashboard' })).toBeVisible();
			await use('autoTestFixture');
		},
		{ scope: 'test', auto: true }
	]
});

export * from '@playwright/test';
