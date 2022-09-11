import { test, expect } from '../fixtures.js';

test('should logout and redirect to /profile/logout', async ({ loggedInPage }) => {
    await loggedInPage.goto('/profile');
    await Promise.all([
        loggedInPage.waitForResponse(
            (response) => response.url().includes('/api/auth/logout') && response.status() === 201
        ),
        loggedInPage.locator('a[data-test-id=profile-logout-button]').click()
    ]);
    await expect(loggedInPage).toHaveURL('/profile/logout');
});
