import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('http://localhost:4173');
});

test('title should be MyFit', async ({ page }) => {
	const title = await page.title();
	expect(title).toBe('MyFit');
});

test('show "Getting started" questionnaire', async ({ page }) => {
	await page.getByRole('link').click();
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('button', { name: 'Sign in as anonymous' }).click();
	await expect(page.locator('h1')).toContainText('Getting started');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Finish' }).click();
	await expect(page.getByLabel('Notifications alt+T').getByRole('listitem')).toContainText(
		'Your preferences have been saved!'
	);
});
