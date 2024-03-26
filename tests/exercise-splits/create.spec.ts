import { test, expect } from '../fixtures';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('successfully create a split', async ({ page }) => {
	await page.getByRole('link', { name: 'Exercise splits' }).click();
	await page.getByRole('main').getByRole('button').nth(1).click();
	await page.getByRole('menuitem', { name: 'Start from scratch' }).click();
	await page.getByRole('link', { name: 'Create new split' }).click();

	await page.getByPlaceholder('Type here').fill('New split name');
	await page.getByPlaceholder('Day 1 name').fill('Push');
	await page.getByRole('button', { name: 'Remove' }).click({
		clickCount: 6
	});
	await page.getByRole('button', { name: 'Next' }).click();

	await page.getByLabel('Add exercise').click();
	await page.getByRole('option', { name: 'Barbell bench press' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Add exercise' }).click();

	await page.getByLabel('Add exercise').click();
	await page.getByPlaceholder('Type here or search...').fill('Custom exercise');
	await page.locator('#UYgnKEimNx').click();
	await page.getByRole('option', { name: 'Side delts' }).click();
	await page.getByLabel('Involves bodyweight').click();
	await page.getByLabel('Sets').fill('4');
	await page.getByRole('option', { name: 'down' }).click();
	await page.getByLabel('Rep range start').fill('10');
	await page.getByLabel('Rep range end').fill('30');
	await page.getByRole('dialog').getByRole('button', { name: 'Add exercise' }).click();
	await page.getByRole('button', { name: 'Next' }).click();

	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('status')).toBeVisible();

	await page.locator('div').filter({ hasText: 'New split name 7 sets Push' }).nth(2).click();
	await page.getByRole('button', { name: 'New split name 7 sets Push' }).click();
	await expect(page.locator('h3')).toContainText('New split name');
	await expect(page.getByRole('paragraph')).toContainText('Push');
	await page.getByRole('tab', { name: 'Exercises' }).click();
	await expect(page.getByRole('tabpanel')).toContainText(
		'Push Day 1 Barbell bench press 3 straight sets of 5 to 10 reps ChestCustom exercise 4 down sets of 10 to 30 reps BW Side delts'
	);
});
