import { expect, test } from '@playwright/test';
import {
	API,
	clickLogout,
	localAccount,
	signIn,
	signUp,
	signUpWithUnsyncedEdit,
	unblockApi
} from './support/auth';

const failedDialog = (page: import('@playwright/test').Page) =>
	page.getByRole('dialog', { name: "Couldn't log out" });

test('logging out deletes the local account and returns to login', async ({ page }) => {
	const email = await signUp(page);
	expect((await localAccount(page)).users).toBe(1);

	await clickLogout(page, email);
	await expect(page).toHaveURL(/\/login/);
	expect((await localAccount(page)).users).toBe(0);

	// The cleared session must not bring the account back or let the app reopen.
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login/);
	expect((await localAccount(page)).users).toBe(0);
});

test('logging out saves unsynced edits first', async ({ page, context, browser }) => {
	const email = await signUpWithUnsyncedEdit(context, page);
	await unblockApi(context);

	await clickLogout(page, email);
	await expect(page).toHaveURL(/\/login/);

	// The name only exists on the server if the logout flushed it before signing out.
	const other = await browser.newContext();
	const otherPage = await other.newPage();
	await signIn(otherPage, email);
	await expect(otherPage).toHaveURL(/\/dashboard/);
	await other.close();
});

test('a failed save keeps the account and edits, and trying again finishes the logout', async ({
	page,
	context
}) => {
	const email = await signUpWithUnsyncedEdit(context, page);

	await clickLogout(page, email);
	await expect(failedDialog(page)).toBeVisible();
	await page.getByRole('button', { name: 'Cancel logout' }).click();
	await expect(page).toHaveURL(/\/dashboard/);
	expect((await localAccount(page)).users).toBe(1);

	await clickLogout(page, email);
	await expect(failedDialog(page)).toBeVisible();
	await unblockApi(context);
	await page.getByRole('button', { name: 'Try again' }).click();
	await expect(page).toHaveURL(/\/login/);
	expect((await localAccount(page)).users).toBe(0);
});

test('logging out anyway discards unsynced edits, but only once sign-out succeeds', async ({
	page,
	context,
	browser
}) => {
	const email = await signUpWithUnsyncedEdit(context, page);

	await clickLogout(page, email);
	await expect(failedDialog(page)).toBeVisible();
	// Offline, sign-out itself fails, so the edits must survive the discard attempt.
	await page.getByRole('button', { name: 'Log out anyway' }).click();
	await expect(failedDialog(page)).toBeVisible();
	expect((await localAccount(page)).users).toBe(1);

	await unblockApi(context);
	await page.getByRole('button', { name: 'Log out anyway' }).click();
	await expect(page).toHaveURL(/\/login/);

	// The discarded name never reached the server, so onboarding asks for it again.
	const other = await browser.newContext();
	const otherPage = await other.newPage();
	await signIn(otherPage, email);
	await expect(otherPage.getByLabel('Name')).toBeVisible();
	await other.close();
});

test('logout keeps local data when the session check is unavailable, and a retry succeeds', async ({
	page
}) => {
	const email = await signUp(page);
	await page.route(`${API}/api/auth/get-session*`, (route) =>
		route.fulfill({ status: 503, json: { message: 'Session check unavailable' } })
	);

	await clickLogout(page, email);
	await expect(failedDialog(page)).toBeVisible();
	expect((await localAccount(page)).users).toBe(1);

	await page.unroute(`${API}/api/auth/get-session*`);
	await page.getByRole('button', { name: 'Try again' }).click();
	await expect(page).toHaveURL(/\/login/);
	expect((await localAccount(page)).users).toBe(0);
});

test('logout keeps local data while the session is still reported active', async ({ page }) => {
	const email = await signUp(page);
	const session = await page.evaluate(
		async (api) => (await fetch(`${api}/api/auth/get-session`, { credentials: 'include' })).json(),
		API
	);
	await page.route(`${API}/api/auth/get-session*`, (route) => route.fulfill({ json: session }));

	await clickLogout(page, email);
	await expect(failedDialog(page)).toBeVisible();
	expect((await localAccount(page)).users).toBe(1);

	await page.unroute(`${API}/api/auth/get-session*`);
	await page.getByRole('button', { name: 'Try again' }).click();
	await expect(page).toHaveURL(/\/login/);
});
