import { expect, test } from '@playwright/test';
import { signUp } from './support/auth';

// Accepting a real update needs a second build under the running server, which would pull files
// out from under the other tests, so only the check itself runs here.
test('settings checks for an app update and says when there is none', async ({ page }) => {
	await signUp(page);
	await page.goto('/settings');

	// The card appears once the service worker has registered.
	await page.getByRole('button', { name: 'Check for updates' }).first().click();
	await expect(page.getByText("You're on the latest version.")).toBeVisible();
	await expect(page.getByRole('button', { name: 'Update now' })).toHaveCount(0);
});
