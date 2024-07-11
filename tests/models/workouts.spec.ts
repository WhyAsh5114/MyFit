import { test, expect } from '../fixtures';
import { createMesocycle } from './commonFunctions';

test.beforeEach(async ({ page }) => {
	await page.goto('/exercise-splits');
	await createMesocycle(page);
	await page.goto('/workouts');
});

test('create a workout with active mesocycle', async ({ page }) => {
	await page.getByLabel('create-workout').click();
	await expect(page.getByRole('main')).toContainText(
		'Pull A Day 1, Cycle 1 LatsTrapsBicepsRear delts'
	);
	await page.getByPlaceholder('Type here').click();
	await page.getByPlaceholder('Type here').fill('100');
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByRole('main')).toContainText(
		'New workout Exercises Pull A Day 1, Cycle 1 Pull-ups 3 Straight sets of 5 to 15 reps BW Lats Reps Load (BW) RIR Barbell rows 3 Straight sets of 10 to 15 reps Traps Reps Load RIR Dumbbell bicep curls 3 Straight sets of 10 to 20 reps Biceps Reps Load RIR Face pulls 3 Straight sets of 15 to 30 reps Rear delts Reps Load RIR Previous Next'
	);
	await page.locator('#Pull-ups-set-1-reps').click();
	await page.locator('#Pull-ups-set-1-reps').fill('12');
	await page.locator('#Pull-ups-set-2-reps').click();
	await page.locator('#Pull-ups-set-2-reps').fill('11');
	await page.locator('#Pull-ups-set-3-reps').click();
	await page.locator('#Pull-ups-set-3-reps').fill('10');
	await page.locator('#Pull-ups-set-1-load').click();
	await page.locator('#Pull-ups-set-1-load').fill('0');
	await page.locator('.contents > .inline-flex').first().click();
	await page.locator('form:nth-child(6) > .inline-flex').first().click();
	await page.locator('form:nth-child(7) > .inline-flex').first().click();
	await page.locator('[id="Barbell\\ rows-set-1-reps"]').click();
	await page.locator('[id="Barbell\\ rows-set-1-reps"]').fill('15');
	await page.locator('[id="Barbell\\ rows-set-2-reps"]').click();
	await page.locator('[id="Barbell\\ rows-set-2-reps"]').fill('14');
	await page.locator('[id="Barbell\\ rows-set-3-reps"]').click();
	await page.locator('[id="Barbell\\ rows-set-3-reps"]').fill('15');
	await page.locator('[id="Barbell\\ rows-set-1-load"]').click();
	await page.locator('[id="Barbell\\ rows-set-1-load"]').fill('40');
	await page.locator('div:nth-child(2) > div > .grid > form > .inline-flex').first().click();
	await page.locator('div:nth-child(2) > div > .grid > form:nth-child(6) > .inline-flex').click();
	await page.locator('div:nth-child(2) > div > .grid > form:nth-child(7) > .inline-flex').click();
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-1-reps"]').click();
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-1-reps"]').fill('18');
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-2-reps"]').click();
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-2-reps"]').fill('17');
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-3-reps"]').click();
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-3-reps"]').fill('16');
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-1-load"]').click();
	await page.locator('[id="Dumbbell\\ bicep\\ curls-set-1-load"]').fill('10');
	await page.locator('div:nth-child(3) > div > .grid > form > .inline-flex').first().click();
	await page.locator('div:nth-child(3) > div > .grid > form:nth-child(6) > .inline-flex').click();
	await page.locator('div:nth-child(3) > div > .grid > form:nth-child(7) > .inline-flex').click();
	await page.locator('[id="Face\\ pulls-set-1-reps"]').click();
	await page.locator('[id="Face\\ pulls-set-1-reps"]').fill('25');
	await page.locator('[id="Face\\ pulls-set-2-reps"]').click();
	await page.locator('[id="Face\\ pulls-set-2-reps"]').fill('23');
	await page.locator('[id="Face\\ pulls-set-3-reps"]').click();
	await page.locator('[id="Face\\ pulls-set-3-reps"]').fill('23');
	await page.locator('[id="Face\\ pulls-set-1-load"]').click();
	await page.locator('[id="Face\\ pulls-set-1-load"]').fill('10');
	await page.locator('div:nth-child(4) > div > .grid > form > .inline-flex').first().click();
	await page.locator('div:nth-child(4) > div > .grid > form:nth-child(6) > .inline-flex').click();
	await page.locator('div:nth-child(4) > div > .grid > form:nth-child(7) > .inline-flex').click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('status')).toContainText('Workout created successfully');
	await expect(page.getByRole('main')).toContainText(
		`${new Date().toLocaleDateString(undefined, { month: 'long', day: '2-digit' })} Pull A`
	);
});
