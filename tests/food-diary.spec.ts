import { test, expect } from './fixtures';

test('log food entry', async ({ page }) => {
	await page.getByRole('link', { name: 'Food diary' }).click();
	await page.getByRole('link', { name: 'Add food' }).click();
	await page.getByPlaceholder('Type here').fill('ripen at home bananas');
	await expect(page.locator('[data-test-id="food-search-result-1"]')).toContainText(
		'Ripen At Home Bananas 90 kcal, Tesco'
	);
	await page.locator('[data-test-id="add-food-search-result-1"]').click();

	const date = new Date();
	await expect(page.getByRole('main')).toContainText('Ripen At Home Bananas Tesco');
	await expect(page.getByRole('main')).toContainText(
		'90 kcal 90% 20.3g Carbs5% 0.5g Fats5% 1.2g Protein'
	);
	await expect(page.locator('h2')).toContainText('Code: 10001882');
	await expect(page.locator('#food-entry-form')).toContainText(
		`Date ${date.toLocaleDateString(['en-US'], { dateStyle: 'long' })} Quantity (g) Time`
	);
	await expect(page.getByLabel('Time')).toHaveValue(
		date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
	);

	await page.getByPlaceholder('Enter quantity in grams').fill('150');
	await expect(page.getByRole('main')).toContainText(
		'135 kcal 90% 30.5g Carbs5% 0.8g Fats5% 1.8g Protein'
	);

	await page.getByRole('button', { name: 'Add food' }).click();
	await expect(page.getByLabel('Notifications alt+T').getByRole('listitem').first()).toContainText(
		'Food entry logged successfully!'
	);
	await expect(page.getByRole('main')).toContainText('Ripen At Home Bananas 150g - 135 cals');
});
