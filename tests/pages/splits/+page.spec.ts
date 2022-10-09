import { test, expect } from '../../fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/splits');
});

test('should redirect to login page "New split"', async ({ page }) => {
    await Promise.all([
        page.locator('h2', { hasText: 'New split' }).click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain('/profile/login');
});

test('should redirect to login page "Split records"', async ({ page }) => {
    await Promise.all([
        page.locator('h2', { hasText: 'Split records' }).click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain('/profile/login');
});

test('should redirect to "/splits/new" if logged in "New split"', async ({ loggedInPage }) => {
    await Promise.all([
        loggedInPage.locator('h2', { hasText: 'New split' }).click(),
        loggedInPage.waitForNavigation()
    ]);
    expect(loggedInPage.url()).toContain('/splits/new');
});

test('should redirect to "/records/splits" if logged in "Split records"', async ({
    loggedInPage
}) => {
    await Promise.all([
        loggedInPage.locator('h2', { hasText: 'Split records' }).click(),
        loggedInPage.waitForNavigation()
    ]);
    expect(loggedInPage.url()).toContain('/records/splits');
});
