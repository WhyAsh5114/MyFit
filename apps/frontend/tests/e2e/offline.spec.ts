import { expect, test } from '@playwright/test';

test('the app loads offline once the service worker has cached it', async ({ page, context }) => {
	await page.goto('/login');
	await page.evaluate(() => navigator.serviceWorker.ready);
	// The first load isn't controlled by the worker yet.
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

	await context.setOffline(true);

	// A prerendered page and a route that only exists in the client router both still open.
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
	await page.goto('/privacy-policy');
	await expect(page).toHaveURL(/\/privacy-policy/);
	await page.goto('/food-diary');
	await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
});
