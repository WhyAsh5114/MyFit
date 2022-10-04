import { test, expect } from '../../fixtures.js';

test('should redirect to login when not logged in', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile/login');
});

test('should show username and logout button when logged in', async ({ loggedInPage, user }) => {
    await loggedInPage.goto('/profile');
    await expect(loggedInPage.locator('b')).toHaveText(`Hi ${user.username}`);
    const logoutButton = loggedInPage.locator('a[data-test-id=profile-logout-button]', {
        hasText: 'Logout'
    });
    expect(await logoutButton.count()).toStrictEqual(1);
});
