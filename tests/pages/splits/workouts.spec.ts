import { testLoggedIn, expect } from '../../fixtures.js';

testLoggedIn(
	'should redirect to /splits/new as SplitName & SplitSchedule stores are empty',
	async ({ page }) => {
		await page.goto('/splits/new/workouts');
		await page.waitForNavigation();
		await expect(page).toHaveURL('/splits/new');
	}
);
