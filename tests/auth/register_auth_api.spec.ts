import { test, expect } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/register');
});

test(
	'should create account successfully',
	async ({ page, creatableUsername }) => {
		await page.fill('input[placeholder=Username]', creatableUsername);
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

test('should throw error (User already exists)', async ({ page, registeredAccount }) => {
	await page.fill('input[placeholder=Username]', registeredAccount.username);
	await page.fill('input[placeholder=Password]', registeredAccount.password);
	await page.fill('input[placeholder="Confirm Password"]', registeredAccount.password);

	await Promise.all([
		page.waitForResponse(
			(response) => response.url().includes('/api/auth/register') && response.status() === 409
		),
		page.locator('button', { hasText: 'Submit' }).click()
	]);

	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['User already exists']);
});
