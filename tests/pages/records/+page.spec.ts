import { test, expect } from '../../fixtures.js';

test.beforeEach(async ({ loggedInPage }) => {
    await loggedInPage.goto('/records');
});

test('should redirect to split records', async ({ loggedInPage }) => {
    await loggedInPage.locator('h2', { hasText: 'Split records' }).click();
    await loggedInPage.waitForNavigation();
    expect(loggedInPage.url()).toContain('/records/splits');
});
