import { test, expect } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/register');
});

test(
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

		const messages = page.locator('ul[data-test-id=modal-messages-list] li');
		expect(await messages.allTextContents()).toStrictEqual(['Account created successfully']);
	}
);

test('should throw error (User already exists)', async ({ page, registered_account }) => {
	await page.fill('input[placeholder=Username]', registered_account.username);
	await page.fill('input[placeholder=Password]', registered_account.password);
	await page.fill('input[placeholder="Confirm Password"]', registered_account.password);

	await Promise.all([
		page.waitForResponse(
			(response) => response.url().includes('/api/auth/register') && response.status() === 409
		),
		page.locator('button', { hasText: 'Submit' }).click()
	]);

	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['User already exists']);
});
