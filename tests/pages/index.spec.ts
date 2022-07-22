import { test, expect } from '@playwright/test';
import { testLoggedIn } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test.describe('Testing home page', () => {
	test('should only show login in dropdown when not signed in', async ({ page }) => {
		const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
		const options = await dropdown.allTextContents();
		expect(options).toStrictEqual(['Login']);
	});

	testLoggedIn(
		'should show [profile, settings, logout] in dropdown when signed in',
		async ({ page }) => {
			const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
			const options = await dropdown.allTextContents();
			expect(options).toStrictEqual(['Profile', 'Settings', 'Logout']);
		}
	);
});
