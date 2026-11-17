import { expect, test, type Page } from '@playwright/test';
import { signUp } from './support/auth.js';

// A drawer or sheet the user opens is one step in the history: Back (the system gesture, the
// Android button, the browser) closes it and stays on the page, instead of leaving the page and
// whatever the user typed.

const today = () => new Date().toLocaleDateString('en-CA');

/** The browser's Back, which is also what the Android back button and the system gesture do. */
async function back(page: Page) {
	await page.evaluate(() => history.back());
}

test('Back closes the nutrition editor and keeps the entry being typed', async ({ page }) => {
	await signUp(page);
	const manual = `/food-diary/${today()}/add-food/manual`;
	await page.goto(`/food-diary/${today()}`);
	await page.goto(manual);

	await page.getByRole('button', { name: 'Edit nutrition (100g)' }).click();
	const editor = page.getByRole('dialog', { name: 'Edit nutrition (100g)' });
	await expect(editor).toBeVisible();
	await editor.getByLabel('Calories').fill('123');

	await back(page);
	await expect(editor).toBeHidden();
	await expect(page).toHaveURL(manual);

	await page.getByRole('button', { name: 'Edit nutrition (100g)' }).click();
	await expect(editor.getByLabel('Calories')).toHaveValue('123');

	// Closing it from inside steps back over its entry, so the next Back leaves the page.
	await editor.getByRole('button', { name: 'Close' }).click();
	await expect(editor).toBeHidden();
	await expect(page).toHaveURL(manual);
	await back(page);
	await expect(page).toHaveURL(`/food-diary/${today()}`);
});

test('Back closes the sync panel', async ({ page }) => {
	await signUp(page);
	await page.goto('/settings');
	await page.goto('/dashboard');

	await page.getByRole('button', { name: 'Data sync' }).click();
	const panel = page.getByRole('dialog', { name: 'Data sync' });
	await expect(panel).toBeVisible();

	await back(page);
	await expect(panel).toBeHidden();
	await expect(page).toHaveURL('/dashboard');

	// A reload keeps the step: the panel opens again, and Back still closes it on this page.
	await page.getByRole('button', { name: 'Data sync' }).click();
	await expect(panel).toBeVisible();
	await page.reload();
	await expect(panel).toBeVisible();
	await back(page);
	await expect(panel).toBeHidden();
	await expect(page).toHaveURL('/dashboard');
	await back(page);
	await expect(page).toHaveURL('/settings');
});

test('Back closes the phone sidebar, and a link in it does not leave it in the history', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await signUp(page);
	await page.goto('/dashboard');

	const sidebar = page
		.getByRole('dialog')
		.filter({ has: page.getByRole('link', { name: 'Settings' }) });
	await page.getByRole('button', { name: 'Menu' }).first().click();
	await expect(sidebar).toBeVisible();

	await back(page);
	await expect(sidebar).toBeHidden();
	await expect(page).toHaveURL('/dashboard');

	await page.getByRole('button', { name: 'Menu' }).first().click();
	await sidebar.getByRole('link', { name: 'Settings' }).click();
	await expect(page).toHaveURL('/settings');
	await expect(sidebar).toBeHidden();

	// Back returns to the page the sidebar was opened on, with the sidebar closed.
	await back(page);
	await expect(page).toHaveURL('/dashboard');
	await expect(sidebar).toBeHidden();
});
