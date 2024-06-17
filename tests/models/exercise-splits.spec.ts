import { test, expect } from '../fixtures';
import { createTemplateExerciseSplit } from './commonFunctions';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Exercise splits' }).click();
});

test('create an exercise split', async ({ page }) => {
	await page.getByLabel('exercise-split-new-options').click();
	await page.getByRole('menuitem', { name: 'Start from scratch' }).click();
	await page.getByPlaceholder('Type here').fill('Pull Push Legs');
	await page.getByRole('button', { name: 'Remove' }).click({
		clickCount: 5
	});

	await page.getByPlaceholder('Day 1').fill('Pull');
	await page.getByRole('row', { name: '2' }).getByRole('checkbox').click();
	await page.getByRole('button', { name: 'Next' }).click();

	await page.getByLabel('add-exercise').click();
	await page.getByPlaceholder('Type here or search...').fill('Custom exercise');
	await page.locator('button').filter({ hasText: 'Pick one' }).click();
	await page.getByRole('option', { name: 'Custom' }).click();
	await page.getByLabel('Muscle group').fill('Soleus');
	await page.getByLabel('Involves bodyweight').click();
	await page.locator('button').filter({ hasText: 'Straight' }).click();
	await page.getByRole('option', { name: 'Drop' }).click();
	await page.getByLabel('Rep range start').fill('15');
	await page.getByLabel('Rep range end').fill('30');
	await page.locator('#exercise-set-decrement').fill('5');
	await page.getByPlaceholder('Exercise cues, machine').fill('Custom note');
	await page.getByRole('button', { name: 'Add exercise' }).click();

	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('status')).toContainText('Exercise split created successfully', {
		timeout: 15000
	});
	await expect(page.getByRole('main')).toContainText('Pull Push Legs 2 days / cycle');
});

test('create exercise split from PPL template', async ({ page }) => {
	await createTemplateExerciseSplit(page);
	await page.getByRole('link', { name: 'Pull Push Legs 7 days / cycle' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(
		'Pull Push Legs Pull APush ALegs APull BPush BLegs BRest'
	);
	await page.getByRole('tab', { name: 'Exercises' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(
		'Pull APush ALegs APull BPush BLegs BRest Pull A Day 1 Pull-ups Straight sets of 5 to 15 reps BW Lats Barbell rows Straight sets of 10 to 15 reps Traps Dumbbell bicep curls Straight sets of 10 to 20 reps Biceps Face pulls Straight sets of 15 to 30 reps Rear Delts'
	);
});

test('create a clone of a split', async ({ page }) => {
	await createTemplateExerciseSplit(page);
	await page.getByRole('link', { name: 'Pull Push Legs 7 days / cycle' }).click();
	await page.getByLabel('exercise-split-options').click();
	await page.getByRole('menuitem', { name: 'Clone' }).click();
	await page.getByPlaceholder('Type here').click();
	await page.getByPlaceholder('Type here').fill('Pull Push Legs (clone)');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('status')).toContainText('Exercise split created successfully');
	await expect(
		page.locator('div').filter({ hasText: 'Pull Push Legs (clone) 7 days' }).nth(1)
	).toBeVisible();
});

test('delete an exercise split', async ({ page }) => {
	await createTemplateExerciseSplit(page);
	await page.getByRole('link', { name: 'Pull Push Legs 7 days / cycle' }).click();
	await page.getByLabel('exercise-split-options').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Yes, delete' }).click();
	await expect(
		page.getByRole('status').filter({ hasText: 'Exercise split deleted successfully' })
	).toBeVisible();
	await expect(page.getByRole('main')).toContainText('No exercise splits found');
});

test('edit an exercise split', async ({ page }) => {
	await createTemplateExerciseSplit(page);
	await page.getByRole('link', { name: 'Pull Push Legs 7 days / cycle' }).click();
	await page.getByLabel('exercise-split-options').click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	await page.getByPlaceholder('Type here').click();
	await page.getByPlaceholder('Type here').fill('Pull Push Legs (edited)');
	await page.getByRole('row', { name: 'Legs B' }).getByRole('checkbox').click();
	await page.getByRole('button', { name: 'Remove' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('status')).toContainText('Exercise split edited successfully', {
		timeout: 15000
	});
	await page.getByRole('link', { name: 'Pull Push Legs (edited) 6' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(
		'Pull Push Legs (edited) Pull APush ALegs APull BPush BRest'
	);
});

