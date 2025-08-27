import { expect, test } from './fixtures';

test('perform macro-tracking quickstart', async ({ page }) => {
	await page.getByRole('link').filter({ hasText: /^$/ }).first().click();
	await page.getByText('Macro tracking').click();
	await page.getByRole('link', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('spinbutton', { name: 'Bodyweight' }).fill('50');
	await page.getByRole('spinbutton', { name: 'Height' }).fill('150');
	await page.getByRole('spinbutton', { name: 'Age' }).fill('20');
	await page.getByRole('spinbutton', { name: 'Body fat %' }).fill('10');
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('tab', { name: 'Manual' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('spinbutton', { name: 'Proteins' }).fill('40');
	await page.getByRole('spinbutton', { name: 'Carbs' }).fill('30');
	await page.getByRole('spinbutton', { name: 'Fats' }).fill('30');
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByLabel('Notifications alt+T').getByRole('listitem')).toContainText(
		'Data saved successfully'
	);
});
