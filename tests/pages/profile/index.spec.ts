import { test, expect } from '@playwright/test';
import { testLoggedIn } from '../../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile');
});

test('should redirect to login when not logged in', async ({ page }) => {
	await expect(page).toHaveURL('/profile/login');
});

testLoggedIn('should show username and logout button when logged in', async ({ page, user }) => {
	await expect(page.locator('p')).toHaveText(`Hi ${user.username}`);
	const logoutButton = page.locator('button[data-test-id=profile-logout-button]', {
		hasText: 'Logout'
	});
	expect(await logoutButton.count()).toStrictEqual(1);
});
