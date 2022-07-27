import { test, expect, generate_random_phrase } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/login');
});

test('should throw error (User does not exist)', async ({ page, creatable_username }) => {
	await page.fill('input[placeholder=Username]', creatable_username);
	await page.fill('input[placeholder=Password]', generate_random_phrase(9));

	await Promise.all([
		page.waitForResponse(
			(response) => response.url().includes('/api/auth/login') && response.status() === 404
		),
		page.locator('button', { hasText: 'Submit' }).click()
	]);

	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['User does not exist']);
});

test('should throw error (Incorrect password)', async ({ page, registered_account }) => {
	await page.fill('input[placeholder=Username]', registered_account.username);
	// In fixtures, random phrase is of length 9
	// so the following phrase will always be different
	await page.fill('input[placeholder=Password]', generate_random_phrase(9));

	await Promise.all([
		page.waitForResponse(
			(response) => response.url().includes('/api/auth/login') && response.status() === 403
		),
		page.locator('button', { hasText: 'Submit' }).click()
	]);

	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['Incorrect password']);
});

test(
	'should login successfully and redirect to /profile',
	async ({ page, registered_account }) => {
		await page.fill('input[placeholder=Username]', registered_account.username);
		await page.fill('input[placeholder=Password]', registered_account.password);

		await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/login') && response.status() === 200
			),
			page.locator('button', { hasText: 'Submit' }).click()
		]);

		await expect(page).toHaveURL('/profile');
	}
);
