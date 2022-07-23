import { test, expect } from '@playwright/test';
import { testWithCreatableUsername, testWithExistingUsername } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/login');
});

testWithCreatableUsername(
	'should throw error (User does not exist)',
	async ({ page, creatable_username }) => {
		await page.fill('input[placeholder=Username]', creatable_username);
		await page.fill('input[placeholder=Password]', 'random_password');

		await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/login') && response.status() === 404
			),
			page.locator('button', { hasText: 'Submit' }).click()
		]);

		const messages = page.locator('ul[data-test-id=modal-messages-list] li');
		expect(await messages.allTextContents()).toStrictEqual(['User does not exist']);
	}
);

testWithExistingUsername('should throw error (Incorrect password)', async ({ page, username }) => {
	await page.fill('input[placeholder=Username]', username);
	// In fixtures, normal password of existing account is just 'password'
	await page.fill('input[placeholder=Password]', 'wrong_password');

	await Promise.all([
		page.waitForResponse(
			(response) => response.url().includes('/api/auth/login') && response.status() === 403
		),
		page.locator('button', { hasText: 'Submit' }).click()
	]);

	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['Incorrect password']);
});

testWithExistingUsername(
	'should login successfully and redirect to /profile',
	async ({ page, username }) => {
		await page.fill('input[placeholder=Username]', username);
		// In fixtures, normal password of existing account is just 'password'
		await page.fill('input[placeholder=Password]', 'password');

		await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/login') && response.status() === 200
			),
			page.locator('button', { hasText: 'Submit' }).click()
		]);

		await expect(page).toHaveURL('/profile');
	}
);
