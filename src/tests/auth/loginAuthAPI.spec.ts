import { test, expect, generateRandomPhrase } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/profile/login');
});

test('should throw error (User does not exist)', async ({ page, creatableUsername }) => {
    await page.fill('input[placeholder=Username]', creatableUsername);
    await page.fill('input[placeholder=Password]', generateRandomPhrase(9));

    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/login') && response.status() === 404
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);

    const messages = page.locator('ul[data-test-id=modal-messages-list] li');
    expect(await messages.allTextContents()).toStrictEqual(['User does not exist']);
});

test('should throw error (Incorrect password)', async ({ page, registeredAccount }) => {
    await page.fill('input[placeholder=Username]', registeredAccount.username);
    // In fixtures, random phrase is of length 9
    // so the following phrase will always be different
    await page.fill('input[placeholder=Password]', generateRandomPhrase(9));

    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/login') && response.status() === 403
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);

    const messages = page.locator('ul[data-test-id=modal-messages-list] li');
    expect(await messages.allTextContents()).toStrictEqual(['Incorrect password']);
});

test('should login successfully and redirect to /profile', async ({ page, registeredAccount }) => {
    await page.fill('input[placeholder=Username]', registeredAccount.username);
    await page.fill('input[placeholder=Password]', registeredAccount.password);

    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/login') && response.status() === 200
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);

    await expect(page).toHaveURL('/profile');
});
