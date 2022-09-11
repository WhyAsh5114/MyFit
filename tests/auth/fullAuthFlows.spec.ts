import { test, expect } from '../fixtures.js';
import type { Cookie } from '@playwright/test';

test('testing normal auth flow register->login->logout through endpoints', async ({
    page,
    creatableUsername
}) => {
    let cookies: Cookie[];
    let sessionID: Cookie | undefined;

    const registerRes = await page.request.post('/api/auth/register', {
        data: {
            username: creatableUsername,
            password: 'password'
        }
    });
    expect(registerRes.status()).toStrictEqual(201);
    cookies = await page.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeUndefined();

    const loginRes = await page.request.post('/api/auth/login', {
        data: {
            username: creatableUsername,
            password: 'password'
        }
    });
    expect(loginRes.status()).toStrictEqual(200);
    cookies = await page.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeDefined();

    const logoutRes = await page.request.get('/api/auth/logout');
    expect(logoutRes.status()).toStrictEqual(201);
    cookies = await page.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeUndefined();
});

test('testing normal auth flow register->login->logout through UI', async ({
    page,
    creatableUsername
}) => {
    let cookies: Cookie[];
    let sessionID: Cookie | undefined;

    // Register
    await page.goto('/profile/register');
    await page.fill('input[placeholder=Username]', creatableUsername);
    await page.fill('input[placeholder=Password]', 'password');
    await page.fill('input[placeholder="Confirm Password"]', 'password');
    // Button and response
    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/register') && response.status() === 201
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);
    // Modal message
    const messages = page.locator('ul[data-test-id=modal-messages-list] li');
    expect(await messages.allTextContents()).toStrictEqual(['Account created successfully']);
    // Cookies
    cookies = await page.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeUndefined();

    // Login
    await Promise.all([
        page.locator('[data-test-id=close-modal-button]').click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain('/profile/login');
    await page.fill('input[placeholder=Username]', creatableUsername);
    await page.fill('input[placeholder=Password]', 'password');
    // Button and response
    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/login') && response.status() === 200
        ),
        page.locator('button', { hasText: 'Submit' }).click()
    ]);
    // Cookies
    cookies = await page.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeDefined();

    // Logout
    await expect(page).toHaveURL('/profile');
    // Button and response
    await Promise.all([
        page.waitForResponse(
            (response) => response.url().includes('/api/auth/logout') && response.status() === 201
        ),
        page.locator('a[data-test-id=profile-logout-button]').click()
    ]);
    await expect(page).toHaveURL('/profile/logout');
    // Cookies
    cookies = await page.context().cookies();
    sessionID = cookies.find((cookie) => cookie.name === 'sessionID');
    expect(sessionID).toBeUndefined();
});
