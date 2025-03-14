import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
	await page.goto('http://localhost:4173');
	const title = await page.title();
	expect(title).toBe('MyFit');
});
