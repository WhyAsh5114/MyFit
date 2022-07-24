import { test, expect } from '@playwright/test';
import { testLoggedIn } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('should show [login, register] in dropdown when not signed in', async ({ page }) => {
	const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
	const options = await dropdown.allTextContents();
	expect(options).toStrictEqual(['Login', 'Register']);

	await page.locator('button[data-test-id=dropdown-button]').click();
	await Promise.all([dropdown.first().click(), page.waitForNavigation()]);
	expect(page.url()).toContain('/profile/login');
	await page.goBack();

	await page.locator('button[data-test-id=dropdown-button]').click();
	await Promise.all([dropdown.nth(1).click(), page.waitForNavigation()]);
	expect(page.url()).toContain('/profile/register');
});

testLoggedIn(
	'should show [profile, settings, logout] in dropdown when signed in',
	async ({ page }) => {
		const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
		const options = await dropdown.allTextContents();
		expect(options).toStrictEqual(['Profile', 'Settings', 'Logout']);

		await page.locator('button[data-test-id=dropdown-button]').click();
		await dropdown.nth(0).click();
		await expect(page).toHaveURL('/profile');
		await page.goBack();

		await page.locator('button[data-test-id=dropdown-button]').click();
		await dropdown.nth(1).click();
		await expect(page).toHaveURL('/profile/settings');
		await page.goBack();

		await page.locator('button[data-test-id=dropdown-button]').click();
		await dropdown.nth(2).click();
		await expect(page).toHaveURL('/profile/login');
	}
);
