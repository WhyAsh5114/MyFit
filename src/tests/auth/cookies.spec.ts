import { test, expect } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/profile/login');
});

test('cookie should be set after login', async ({ loggedInPage }) => {
    const cookies = await loggedInPage.context().cookies();
    const sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeDefined();
    expect(sessionID?.secure).toStrictEqual(true);
});

test('cookie should not be set when not logged in', async ({ page }) => {
    const cookies = await page.context().cookies();
    const sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeUndefined();
});

test('cookie should be removed after logout', async ({ loggedInPage }) => {
    let cookies = await loggedInPage.context().cookies();
    let sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeDefined();

    await loggedInPage.request.get('/api/auth/logout');
    cookies = await loggedInPage.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeUndefined();
});
