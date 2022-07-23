import { test, expect } from '@playwright/test';
import { testWithCreatableUsername, testWithExistingUsername } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/login');
});

testWithCreatableUsername(
	'should create account successfully',
	async ({ page, creatable_username }) => {
		await page.fill('input[placeholder=Username]', creatable_username);
		await page.fill('input[placeholder=Password]', 'password');
        await page.fill('input[placeholder="Confirm Password"]', 'password');

        await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/register') && response.status() === 201
			),
			page.locator('button', { hasText: 'Submit' }).click()
		]);

        
	}
);
