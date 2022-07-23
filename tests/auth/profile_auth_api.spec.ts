import { test, expect } from '@playwright/test';
import { testLoggedIn } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile');
});

testLoggedIn('should logout and redirect to /profile/login', async ({ page }) => {
	await Promise.all([
		page.waitForResponse(
			(response) => response.url().includes('/api/auth/logout') && response.status() === 201
		),
		page.locator('button[data-test-id=profile-logout-button]').click()
	]);
	await expect(page).toHaveURL('/profile/login');
});
