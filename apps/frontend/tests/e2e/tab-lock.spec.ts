import { expect, test, type Page } from '@playwright/test';
import { signUp } from './support/auth';

const blockedDialog = (page: Page) =>
	page.getByRole('dialog', { name: 'MyFit is open in another tab' });

test('a second tab is blocked until the first closes, then takes over', async ({ context }) => {
	const first = await context.newPage();
	const email = await signUp(first);

	const second = await context.newPage();
	await second.goto('/dashboard');
	await expect(blockedDialog(second)).toBeVisible();

	await first.close();
	await expect(second.getByRole('button', { name: new RegExp(email) })).toBeVisible();
	await expect(blockedDialog(second)).toBeHidden();
});

test('navigating between pages does not block the tab on its own lock', async ({ page }) => {
	await signUp(page);
	await page.goto('/login');
	await page.goto('/dashboard');
	await expect(blockedDialog(page)).toBeHidden();
	await expect(page).toHaveURL(/\/dashboard/);
});

test('without Web Locks every tab runs', async ({ context }) => {
	await context.addInitScript(() =>
		Object.defineProperty(navigator, 'locks', { value: undefined })
	);
	const first = await context.newPage();
	const email = await signUp(first);

	const second = await context.newPage();
	await second.goto('/dashboard');
	await expect(second.getByRole('button', { name: new RegExp(email) })).toBeVisible();
	await expect(blockedDialog(second)).toBeHidden();
});
