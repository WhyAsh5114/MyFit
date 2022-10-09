import { test, expect } from '../fixtures.js';

test('should redirect back to requested page after login', async ({ page, registeredAccount }) => {
    await page.goto('/records');
    const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
    const options = await dropdown.allTextContents();
    expect(options).toStrictEqual(['Login', 'Register']);

    await page.locator('button[data-test-id=dropdown-button]').click();
    await Promise.all([dropdown.first().click(), page.waitForNavigation()]);
    expect(page.url()).toContain('/profile/login');

    await expect(page).toHaveURL('/profile/login?page=/records');
    await page.fill('input[placeholder=Username]', registeredAccount.username);
    await page.fill('input[placeholder=Password]', registeredAccount.password);
    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/login') && response.status() === 200
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);

    await expect(page).toHaveURL('/records');
});

test('should redirect back to requested page after register & login', async ({
    page,
    creatableUsername
}) => {
    await page.goto('/records');
    const dropdown = page.locator('ul[data-test-id=profile-options-dropdown] li');
    const options = await dropdown.allTextContents();
    expect(options).toStrictEqual(['Login', 'Register']);

    await page.locator('button[data-test-id=dropdown-button]').click();
    await Promise.all([dropdown.nth(1).click(), page.waitForNavigation()]);
    expect(page.url()).toContain('/profile/register');

    await expect(page).toHaveURL('/profile/register?page=/records');
    await page.fill('input[placeholder=Username]', creatableUsername);
    await page.fill('input[placeholder=Password]', 'password');
    await page.fill('input[placeholder="Confirm Password"]', 'password');
    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/register') && response.status() === 201
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);

    await page.locator('[data-test-id=close-modal-button]').click();
    await expect(page).toHaveURL('/profile/login?page=/records');
    await page.fill('input[placeholder=Username]', creatableUsername);
    await page.fill('input[placeholder=Password]', 'password');
    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/login') && response.status() === 200
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);

    await expect(page).toHaveURL('/records');
});
