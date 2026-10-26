import { expect, test, type Page } from '@playwright/test';
import {
	API,
	enterCode,
	localAccount,
	newEmail,
	readCode,
	setUpName,
	signIn,
	signUp,
	signUpWithUnsyncedEdit,
	submitEmail,
	unblockApi,
	waitForNameSynced
} from './support/auth';

const expiredToast = 'Your session expired. Log in to sync your changes.';
const otherAccountDialog = (page: Page) =>
	page.getByRole('dialog', { name: "This isn't the account on this device" });

/** Signs in without the login form, the way a social login would: the app only sees the new session. */
async function signInOutsideForm(page: Page, email: string) {
	const post = (path: string, body: object) =>
		page.evaluate(
			async ([url, json]) =>
				(
					await fetch(url, {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						credentials: 'include',
						body: json
					})
				).ok,
			[`${API}/api/auth${path}`, JSON.stringify(body)]
		);
	expect(await post('/email-otp/send-verification-otp', { email, type: 'sign-in' })).toBe(true);
	expect(await post('/sign-in/email-otp', { email, otp: await readCode(email) })).toBe(true);
}

test('an expired session keeps the app usable and offers an optional login', async ({
	page,
	context
}) => {
	const email = await signUp(page);
	await waitForNameSynced(page);
	await context.clearCookies();
	await page.reload();

	await expect(page.getByText(expiredToast)).toBeVisible();
	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByRole('button', { name: new RegExp(email) })).toBeVisible();

	// The sync indicator says why nothing syncs instead of staying on "Connecting".
	await page.getByRole('button', { name: 'Data sync' }).click();
	await expect(page.getByText('Log in to sync them')).toBeVisible();
	await expect(page.getByText('Connecting')).toBeHidden();
	await page.keyboard.press('Escape');
	await expect(page.getByText('Log in to sync them')).toBeHidden();

	// Logging back in as the same account needs no confirmation.
	await page.getByRole('button', { name: 'Log in' }).click();
	await expect(page).toHaveURL(/\/login/);
	await signIn(page, email);
	await expect(page).toHaveURL(/\/dashboard/);
	await expect(page.getByText(expiredToast)).toBeHidden();
	await expect(otherAccountDialog(page)).toBeHidden();
	expect((await localAccount(page)).users).toBe(1);
});

test('the login form asks before a different email replaces unsynced data', async ({
	page,
	context
}) => {
	const email = await signUpWithUnsyncedEdit(context, page);
	await context.clearCookies();
	await page.goto('/login');

	const other = newEmail();
	await submitEmail(page, other);
	await expect(otherAccountDialog(page)).toContainText(email);

	await page.getByRole('button', { name: 'Use a different email' }).click();
	await expect(otherAccountDialog(page)).toBeHidden();
	await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeHidden();
	expect((await localAccount(page)).users).toBe(1);

	await submitEmail(page, other);
	await unblockApi(context);
	await page.getByRole('button', { name: 'Discard and continue' }).click();
	await enterCode(page, other);
	await setUpName(page, 'Other User');
	await expect(page.getByRole('button', { name: new RegExp(other) })).toBeVisible();
	expect((await localAccount(page)).users).toBe(1);
});

test('a login that skips the form still asks, and keeping the local account signs out', async ({
	page,
	context
}) => {
	const email = await signUpWithUnsyncedEdit(context, page);
	await context.clearCookies();
	await unblockApi(context);
	// The page must not push the local account's edits under the other login.
	await page.goto('/login');

	await signInOutsideForm(page, newEmail());
	await page.goto('/dashboard');
	await expect(otherAccountDialog(page)).toContainText(email);

	await page.getByRole('button', { name: 'Keep it and sign out' }).click();
	await expect(page).toHaveURL(/\/login/);
	expect((await localAccount(page)).users).toBe(1);

	// The original account signs back in. Its name is still unsynced, so onboarding asks again,
	// but the field is already filled from the local copy that was kept.
	await signIn(page, email);
	await expect(page.getByLabel('Name')).toHaveValue('E2E User');
	await setUpName(page);
	await waitForNameSynced(page);
});

test('a login that skips the form can discard the local account', async ({ page, context }) => {
	await signUpWithUnsyncedEdit(context, page);
	await context.clearCookies();
	await unblockApi(context);
	await page.goto('/login');

	const other = newEmail();
	await signInOutsideForm(page, other);
	await page.goto('/dashboard');
	await page.getByRole('button', { name: 'Discard and continue' }).click();

	await expect(page.getByRole('button', { name: new RegExp(other) })).toBeVisible();
	expect((await localAccount(page)).users).toBe(1);
});

test('going offline says changes will sync later instead of showing a fetch error', async ({
	page,
	context
}) => {
	await signUp(page);
	await waitForNameSynced(page);
	await context.setOffline(true);

	await page.getByRole('button', { name: 'Data sync' }).click();
	await expect(page.getByText("They'll sync when you're back online")).toBeVisible();
	await expect(page.getByText('Failed to fetch')).toBeHidden();
	await expect(page.getByText('Last synced')).toBeVisible();
});
