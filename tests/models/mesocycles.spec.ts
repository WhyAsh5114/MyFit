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
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle created successfully' })
	).toBeVisible({
		timeout: 10000
	});
	await page.getByRole('link', { name: 'My Mesocycle Unused' }).click();
	await expect(page.getByRole('tabpanel')).toContainText('My Mesocycle No dates available Unused');
	await expect(page.getByRole('tabpanel')).toContainText(
		'RIR progression 12 cycles 2 1 0 Start exercise template Pull Push Legs Preferred progression variable Load Start overload percentage 1.25% Last set to failure Force RIR matching'
	);

	await page.getByRole('tab', { name: 'Volume' }).click();
	await expect(page.locator('tbody')).toContainText('50');
	await expect(page.locator('tbody')).toContainText('2');
});

test('delete a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoToDelete');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByRole('main')).not.toContainText('Fetching exercises');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoToDelete Unused' }).click();
	await page.getByLabel('mesocycle-options').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Yes, delete' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle deleted successfully' })
	).toBeVisible({ timeout: 10000 });
	await expect(page.getByRole('main')).toContainText('No mesocycles found');
});

test('edit a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoName');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByRole('main')).not.toContainText('Fetching exercises');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoName Unused' }).click();
	await page.getByLabel('mesocycle-options').click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	await page.getByLabel('Mesocycle name').fill('MesoName (edited)');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.locator('#mesocycle-progression-option').click();
	await page.getByRole('option', { name: 'Load' }).click();
	await page.locator('#mesocycle-force-RIR-matching').click();
	await page.getByLabel('Take last set to failure').click();
	await page.locator('span > .absolute').click();
	await expect(page.getByRole('main')).toContainText('Starting exercise split cannot be changed');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByLabel('Chest-max-volume').click();
	await page.getByLabel('Chest-max-volume').fill('45');
	await page.getByRole('combobox', { name: 'Chest-set-increase-amount' }).click();
	await page.getByRole('option', { name: '3' }).click();
	await page.getByLabel('Chest-increase-volume-').click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle edited successfully' })
	).toBeVisible({ timeout: 10000 });
	await page.getByRole('link', { name: 'MesoName (edited) Unused' }).click();
	await expect(page.locator('h3')).toContainText('MesoName (edited)');
	await expect(page.getByRole('tabpanel')).toContainText(
		'RIR progression 10 cycles 3 2 1 0 Start exercise template Pull Push Legs Preferred progression variable Load Start overload percentage 1.25% Last set to failure Force RIR matching'
	);
	await page.getByRole('tab', { name: 'Volume' }).click();
	await expect(page.locator('tbody')).toContainText('45');
	await expect(page.locator('tbody')).toContainText('3');
});

test('start and stop a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoName');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Exercise split created successfully' })
	).not.toBeVisible();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoName Unused' }).click();
	await page.getByRole('button', { name: 'Start mesocycle' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle started successfully' })
	).toBeVisible({ timeout: 10000 });
	await expect(page.getByRole('tabpanel')).toContainText(
		`MesoName ${new Date().toLocaleDateString()} Active`
	);
	await page.getByRole('link', { name: 'Mesocycles' }).click();
	await expect(page.getByRole('main')).toContainText(
		"Active MesoName Active All MesoName Active That's all!"
	);
	await page.getByRole('link', { name: 'MesoName Active' }).first().click();
	await page.getByRole('button', { name: 'Stop mesocycle' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle stopped successfully' })
	).toBeVisible({ timeout: 10000 });
	await expect(page.getByRole('tabpanel')).toContainText(
		`MesoName ${new Date().toLocaleDateString()} to ${new Date().toLocaleDateString()} Completed`
	);
	await page.getByRole('link', { name: 'Mesocycles' }).click();
	await expect(page.getByRole('main')).toContainText(
		"Active No active mesocycle All MesoName Completed That's all!"
	);
});

test("edit mesocycle's exercise split", async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoName');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Exercise split created successfully' })
	).not.toBeVisible();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoName Unused' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(`MesoName No dates available Unused`);
	await page.getByRole('tab', { name: 'Split' }).click();
	await expect(page.getByRole('main')).toContainText(
		'Face pulls 3 Straight sets of 15 to 30 reps Rear delts'
	);
	await page.getByRole('button', { name: 'Edit' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('tabpanel').getByRole('list').getByRole('button').nth(3).click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	await page.getByLabel('Sets').click();
	await page.getByLabel('Sets').fill('4');
	await page.getByRole('button', { name: 'Edit exercise' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Mesocycle exercise split edited successfully' })
	).toBeVisible({ timeout: 10000 });
	await page.getByRole('tab', { name: 'Split' }).click();
	await expect(page.getByRole('main')).toContainText(
		'Face pulls 4 Straight sets of 15 to 30 reps Rear delts'
	);
});
