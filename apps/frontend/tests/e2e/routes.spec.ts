import { expect, test } from '@playwright/test';
import { signUp } from './support/auth';

// Build and type checks can't see a removed framework module that only throws when a route uses
// it, so every signed-in page has to open without an error.
test('every signed-in page opens without an error', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));

	await signUp(page);
	const date = new Date().toISOString().slice(0, 10);
	const routes = [
		'/dashboard',
		'/chat',
		'/settings',
		'/docs',
		'/account',
		`/food-diary/${date}`,
		`/food-diary/${date}/add-food`,
		`/food-diary/${date}/add-food/manual`,
		'/food-diary/goals',
		'/food-diary/goals/activity',
		'/food-diary/goals/meals',
		'/food-diary/goals/metrics',
		'/food-diary/goals/recipes',
		'/food-diary/goals/targets',
		'/privacy-policy',
		'/terms-of-service'
	];

	for (const route of routes) {
		await page.goto(route);
		await expect(page.getByText('Internal Error'), route).toHaveCount(0);
		await expect(page.locator('main, [data-sidebar="inset"]').first(), route).toBeVisible();
	}
	expect(errors).toEqual([]);
});
