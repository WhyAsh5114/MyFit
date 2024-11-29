import { expect, test } from '../fixtures';
import { createMesocycle, createTemplateExerciseSplit } from './commonFunctions';

test.beforeEach(async ({ page }) => {
	await page.goto('/exercise-splits');
	await createTemplateExerciseSplit(page);
	await page.getByRole('link', { name: 'Mesocycles' }).click();
});

test('create a mesocycle', async ({ page }) => {
	await expect(page.getByRole('main')).toContainText('Active No active mesocycle All No mesocycles found');
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
	await page.getByRole('button', { name: 'Next' }).click();

	await page.getByLabel('Chest-start-volume').fill('12');
	await page.getByRole('combobox', { name: 'Chest-set-increase-amount' }).click();
	await page.getByRole('option', { name: '2' }).click();
	await page.getByLabel('Chest-increase-volume-').click();
	await page.getByLabel('Chest-max-volume').fill('50');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByRole('status').filter({ hasText: 'Mesocycle created successfully' })).toBeVisible({
		timeout: 10000
	});
	await page.getByRole('link', { name: 'My Mesocycle Unused' }).click();
	await expect(page.getByRole('tabpanel')).toContainText('My Mesocycle No dates available Unused');
	await expect(page.getByRole('tabpanel')).toContainText(
		'RIR progression 12 cycles 2 1 0 Start exercise template Pull Push Legs Start overload percentage 1.25% Last set to failure Force RIR matching'
	);

	await page.getByRole('tab', { name: 'Volume' }).click();
	await expect(page.getByTestId('mesocycle-volume-table-body')).toContainText('50');
	await expect(page.getByTestId('mesocycle-volume-table-body')).toContainText('2');
});

test('delete a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoToDelete');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.waitForURL('/mesocycles/manage/progression');
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL(/\/mesocycles\/manage\/volume/);
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoToDelete Unused' }).click();
	await page.getByLabel('mesocycle-options').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Yes, delete' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Mesocycle deleted successfully' })).toBeVisible({
		timeout: 10000
	});
	await expect(page.getByRole('main')).toContainText('No mesocycles found');
});

test('edit a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoName');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.waitForURL('/mesocycles/manage/progression');
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL(/\/mesocycles\/manage\/volume/);
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();

	await page.getByRole('link', { name: 'MesoName Unused' }).click();
	await page.getByLabel('mesocycle-options').click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	await page.getByLabel('Mesocycle name').fill('MesoName (edited)');
	await page.getByRole('button', { name: 'Next' }).click();
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
	await expect(page.getByRole('status').filter({ hasText: 'Mesocycle edited successfully' })).toBeVisible({
		timeout: 10000
	});

	await page.getByRole('link', { name: 'MesoName (edited) Unused' }).click();
	await expect(page.locator('h3')).toContainText('MesoName (edited)');
	await expect(page.getByRole('tabpanel')).toContainText(
		'RIR progression 10 cycles 3 2 1 0 Start exercise template Pull Push Legs Start overload percentage 1.25% Last set to failure Force RIR matching'
	);
	await page.getByRole('tab', { name: 'Volume' }).click();
	await expect(page.getByTestId('mesocycle-volume-table-body')).toContainText('45');
	await expect(page.getByTestId('mesocycle-volume-table-body')).toContainText('3');
});

test('start and stop a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoName');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL('/mesocycles/manage/progression');
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL(/\/mesocycles\/manage\/volume/);
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoName Unused' }).click();
	await page.getByRole('button', { name: 'Start mesocycle' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Mesocycle started successfully' })).toBeVisible({
		timeout: 10000
	});
	await expect(page.getByRole('tabpanel')).toContainText(`MesoName ${new Date().toLocaleDateString('en-US')} Active`);
	await page.getByRole('link', { name: 'Mesocycles' }).click();
	await expect(page.getByRole('main')).toContainText("Active MesoName Active All MesoName Active That's all");
	await page.getByRole('link', { name: 'MesoName Active' }).first().click();
	await page.getByRole('button', { name: 'Stop mesocycle' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Mesocycle stopped successfully' })).toBeVisible({
		timeout: 10000
	});
	await expect(page.getByRole('tabpanel')).toContainText(
		`MesoName ${new Date().toLocaleDateString('en-US')} to ${new Date().toLocaleDateString('en-US')} Completed`
	);
	await page.getByRole('link', { name: 'Mesocycles' }).click();
	await expect(page.getByRole('main')).toContainText("Active No active mesocycle All MesoName Completed That's all");
});

test("edit mesocycle's exercise split", async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MesoName');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.waitForURL('/mesocycles/manage/progression');
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.waitForURL(/\/mesocycles\/manage\/volume/);
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: 'MesoName Unused' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(`MesoName No dates available Unused`);
	await page.getByRole('tab', { name: 'Split' }).click();
	await expect(page.getByRole('main')).toContainText('Face pulls 3 Straight sets of 15 to 30 reps Rear delts');
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
	await expect(page.getByRole('main')).toContainText('Face pulls 4 Straight sets of 15 to 30 reps Rear delts');
});

test('disallow exercise split editing after workout added', async ({ page }) => {
	await createMesocycle(page, { exerciseSplitCreated: true });
	await page.getByRole('link', { name: 'Workouts' }).click();
	await page.getByLabel('create-workout').click();
	await page.getByPlaceholder('Type here').fill('100');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByTestId('Pull-ups-menu-button').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByTestId('Barbell rows-menu-button').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByTestId('Dumbbell bicep curls-menu-button').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();

	await page.locator('[id="Face\\ pulls-set-1-reps"]').fill('13');
	await page.locator('[id="Face\\ pulls-set-2-reps"]').fill('11');
	await page.locator('[id="Face\\ pulls-set-3-reps"]').fill('11');
	await page.locator('[id="Face\\ pulls-set-1-load"]').fill('10');
	await page.getByTestId('Face pulls-set-1-action').click();
	await page.getByTestId('Face pulls-set-2-action').click();
	await page.getByTestId('Face pulls-set-3-action').click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL('/workouts');

	const lockedText =
		"Cannot change the length or rest days of the mesocycle's exercise split after workouts have been added";
	await page.getByRole('link', { name: 'Mesocycles' }).click();
	await page.getByRole('link', { name: 'MyMeso Active' }).first().click();
	await expect(page.getByRole('main')).toContainText(new Date().toLocaleDateString('en-US'));
	await page.getByRole('tab', { name: 'Split' }).click();
	await page.getByRole('button', { name: 'Edit' }).click();
	await page.getByLabel('mesocycle-exercise-split-edit').click();
	await expect(page.getByText(lockedText)).toBeInViewport();
	await expect(page.getByRole('button').filter({ hasText: 'Remove' })).toBeDisabled();
	await expect(page.getByRole('button').filter({ hasText: 'Add' })).toBeDisabled();
});

test('extract exercise split from mesocycle', async ({ page }) => {
	await createMesocycle(page, { exerciseSplitCreated: true });
	await page.getByRole('link', { name: 'MyMeso' }).first().click();
	await expect(page.getByRole('main')).toContainText(new Date().toLocaleDateString('en-US'));
	await page.getByRole('tab', { name: 'Split' }).click();
	await page.getByRole('button', { name: 'Edit' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('tabpanel').getByRole('list').getByRole('button').first().click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	await page.getByPlaceholder('Type here or search...').fill('Lat pulldowns');
	await page.locator('#exercise-involves-bodyweight').click();
	await page.getByRole('button', { name: 'Edit exercise' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();

	await page.getByLabel('mesocycle-options').click();
	await page.getByRole('menuitem', { name: 'Extract split' }).click();
	await page.getByPlaceholder('Type here').fill('MyMeso exercise split');
	await page.getByRole('button', { name: 'Yes, extract' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Exercise split created successfully' })).toBeVisible();
	await page.getByRole('link', { name: 'Exercise splits' }).click();
	await page.getByRole('link', { name: 'MyMeso exercise split 7 days' }).click();
	await page.getByRole('tab', { name: 'Exercises' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(
		'Pull A Day 1 Lat pulldowns Straight sets of 5 to 15 reps Lats Barbell rows Straight sets of 10 to 15 reps Traps Dumbbell bicep curls Straight sets of 10 to 20 reps Biceps Face pulls Straight sets of 15 to 30 reps Rear delts'
	);
});

test('complete a mesocycle', async ({ page }) => {
	await page.getByLabel('create-new-mesocycle').click();
	await page.getByLabel('Mesocycle name').fill('MyMeso');
	await page.getByLabel('Mesocycle duration').fill('1');
	await page.getByRole('combobox').click();
	await page.getByRole('option', { name: '0 RIR' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByText('Pick one').click();
	await page.getByRole('option', { name: 'Pull Push Legs' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByLabel('Start immediately').click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL('/mesocycles');

	await page.getByRole('link', { name: 'Workouts' }).click();
	await page.getByLabel('create-workout').click();
	await page.getByPlaceholder('Type here').fill('70');
	await page.getByRole('button', { name: 'Skip' }).click();
	await expect(page.getByRole('paragraph').last()).toContainText('Day 2, Cycle 1');
	await page.getByRole('button', { name: 'Skip' }).click();
	await expect(page.getByRole('paragraph').last()).toContainText('Day 3, Cycle 1');
	await page.getByRole('button', { name: 'Skip' }).click();
	await expect(page.getByRole('paragraph').last()).toContainText('Day 4, Cycle 1');
	await page.getByRole('button', { name: 'Skip' }).click();
	await expect(page.getByRole('paragraph').last()).toContainText('Day 5, Cycle 1');
	await page.getByRole('button', { name: 'Skip' }).click();
	await expect(page.getByRole('paragraph').last()).toContainText('Day 6, Cycle 1');
	await page.getByRole('button', { name: 'Skip' }).click();
	await page.getByRole('button', { name: 'Complete' }).click();

	await page.waitForURL(/\/mesocycles\/[a-zA-Z0-9]+(\?completion)/);
	await expect(page.getByRole('dialog')).toContainText(
		'Congratulations! 🎉 You have successfully completed this mesocycle'
	);
	await expect(page.getByRole('tabpanel')).toContainText('Completed');
});
