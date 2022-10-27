import { test, expect } from '../../fixtures.js';

test("should display today's workout type", async ({ splitCreatedPage, split }) => {
    const page = splitCreatedPage;
    await page.goto('/logging/workouts');

    const todaysWorkout = page.locator('[data-test-id=todays-workout]');
    await expect(todaysWorkout).toHaveText(split.schedule.at(new Date().getDay() - 1) as string);
});

test('should disable split template button if Rest or no active split', async ({ page }) => {
    await page.goto('/logging/workouts');
});
