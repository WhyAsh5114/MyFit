import { test, expect } from '@playwright/test';
import { testLoggedIn } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('should show [login, create account] in dropdown when not signed in', async ({ page }) => {
	const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
	const options = await dropdown.allTextContents();
	expect(options).toStrictEqual(['Login', 'Register']);
});

testLoggedIn(
	'should show [profile, settings, logout] in dropdown when signed in',
	async ({ page }) => {
		const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
		const options = await dropdown.allTextContents();
		expect(options).toStrictEqual(['Profile', 'Settings', 'Logout']);
	}
);
