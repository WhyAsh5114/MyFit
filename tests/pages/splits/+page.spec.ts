import { test, expect } from '../../fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/splits');
});

test('should redirect to login page "New split"', async ({ page }) => {
    await page.locator('h2', { hasText: 'New split' }).click();
    await page.waitForNavigation();
    expect(page.url()).toContain('/profile/login');
});

test('should redirect to login page "Split records"', async ({ page }) => {
    await page.locator('h2', { hasText: 'Split records' }).click();
    await page.waitForNavigation();
    expect(page.url()).toContain('/profile/login');
});

test('should redirect to "/splits/new" if logged in "New split"', async ({ loggedInPage }) => {
    await loggedInPage.locator('h2', { hasText: 'New split' }).click();
    await loggedInPage.waitForNavigation();
    expect(loggedInPage.url()).toContain('/splits/new');
});

test('should redirect to "/records/splits" if logged in "Split records"', async ({
    loggedInPage
}) => {
    await loggedInPage.locator('h2', { hasText: 'Split records' }).click();
    await loggedInPage.waitForNavigation();
    expect(loggedInPage.url()).toContain('/records/splits');
});
