import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/login');
});

test.describe('Testing login page', () => {
	test('should throw error (Username and Password cannot be empty)', async ({ page }) => {
		await page.locator('button', { hasText: 'Submit' }).click();

		const messages = page.locator('ul[data-test-id=modal-messages-list] li');
		expect(await messages.allTextContents()).toStrictEqual([
			'Username cannot be empty',
			'Password cannot be empty'
		]);
	}),

    test('should throw error (Username cannot be empty)', async ({ page }) => {
        await page.fill('input[placeholder=Password]', 'password');
        await page.locator('button', { hasText: 'Submit' }).click();

        const messages = page.locator('ul[data-test-id=modal-messages-list] li');
        expect(await messages.allTextContents()).toStrictEqual(['Username cannot be empty']);
    }),

    test('should throw error (Password cannot be empty)', async ({ page }) => {
        await page.fill('input[placeholder=Username]', 'username');
        await page.locator('button', { hasText: 'Submit' }).click();

        const messages = page.locator('ul[data-test-id=modal-messages-list] li');
        expect(await messages.allTextContents()).toStrictEqual(['Password cannot be empty']);
    })
});
