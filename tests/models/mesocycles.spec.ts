import { test, expect } from '../fixtures';
import { createTemplateExerciseSplit } from './commonFunctions';

test.beforeEach(async ({ page }) => {
	await page.goto('/exercise-splits');
	await createTemplateExerciseSplit(page);
	await page.getByRole('link', { name: 'Mesocycles' }).click();
});

test('create a mesocycle', async ({ page }) => {
	await expect(page.getByRole('main')).toContainText(
		'Active No active mesocycle All No mesocycles found'
	);
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('My Mesocycle');
	await page.getByLabel('Mesocycle duration').fill('12');
	await page.getByRole('combobox').click();
	await page.getByRole('option', { name: '2 RIR' }).click();
	await page.getByRole('button', { name: 'Next' }).click();

	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByLabel('Take last set to failure').click();
	await page.locator('span > .absolute').click();
	await page.locator('#mesocycle-progression-option').click();
	await page.getByRole('option', { name: 'Load' }).click();
	await page.getByRole('button', { name: 'Next' }).click();

	await page.getByLabel('Chest-start-volume').fill('12');
	await page.getByRole('combobox', { name: 'Chest-set-increase-amount' }).click();
	await page.getByRole('option', { name: '2' }).click();
	await page.getByLabel('Chest-increase-volume-').click();
	await page.getByLabel('Chest-max-volume').fill('50');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByRole('status')).toContainText('Mesocycle created successfully', {
		timeout: 10000
	});
	await page.getByRole('link', { name: 'My Mesocycle Unused' }).click();
	await expect(page.getByRole('tabpanel')).toContainText('My Mesocycle No dates available Unused');
	await expect(page.getByRole('tabpanel')).toContainText(
		'RIR progression 12 cycles 2 1 0 Start exercise template Pull Push Legs Preferred progression variable Load Start overload percentage 1.25% Last set to failure Force RIR matching'
	);

	// TODO: confirm the chest cyclic set changes being applied
});
