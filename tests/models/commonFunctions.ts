import { expect, type Page } from '../fixtures';

export async function createTemplateExerciseSplit(page: Page) {
	await page.getByLabel('exercise-split-new-options').click();
	await page.getByRole('menuitem', { name: 'Use template' }).click();
	await page.getByRole('button', { name: 'Pull Push Legs 7 days / cycle' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL('/exercise-splits/manage/exercises');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Exercise split created successfully' })
	).toBeVisible({ timeout: 10000 });
	await page.waitForURL('/exercise-splits');
}

export async function createMesocycle(page: Page) {
	await createTemplateExerciseSplit(page);
	await page.goto('/mesocycles');
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').click();
	await page.getByLabel('Mesocycle name').fill('MyMeso');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL(/\/mesocycles\/manage\/volume/);
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByLabel('Start immediately').click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle created successfully' })
	).toBeVisible({ timeout: 10000 });
	await page.waitForURL('/mesocycles');
}
