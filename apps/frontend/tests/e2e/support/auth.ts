import { expect, type BrowserContext, type Page } from '@playwright/test';

export const API = 'http://localhost:3000';
const MAIL = 'http://localhost:4010';

/** A fresh account per test, so tests never share server rows. */
export const newEmail = () => `e2e-${crypto.randomUUID()}@example.test`;

/** Waits for the sign-in code the API's mail provider stub recorded for this address. */
export async function readCode(email: string): Promise<string> {
	let code: string | undefined;
	await expect
		.poll(async () => {
			const res = await fetch(`${MAIL}/otp?email=${encodeURIComponent(email)}`);
			code = res.ok ? ((await res.json()) as { code: string }).code : undefined;
			return code;
		})
		.toBeTruthy();
	return code!;
}

/** Requests a code through the login form, stopping at the code screen. */
export async function requestCode(page: Page, email: string) {
	await page.goto('/login');
	await submitEmail(page, email);
}

/** Submits the email on the login form. */
export async function submitEmail(page: Page, email: string) {
	await page.getByLabel('Email').fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
}

/** Signs in through the login form with the code the mail stub recorded. */
export async function signIn(page: Page, email: string) {
	await requestCode(page, email);
	await enterCode(page, email);
}

/** Types the recorded code for `email` into the code screen. */
export async function enterCode(page: Page, email: string) {
	// The code can be recorded before the form switches over, and the email field is a textbox too.
	await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible();
	await page.getByRole('textbox').fill(await readCode(email));
	await page.getByRole('button', { name: 'Verify' }).click();
}

/** Signs in as a new account and completes onboarding, ending on the dashboard. */
export async function signUp(page: Page, email = newEmail(), name = 'E2E User') {
	await signIn(page, email);
	await setUpName(page, name);
	return email;
}

/** Fills the onboarding form that follows a first sign-in. */
export async function setUpName(page: Page, name = 'E2E User') {
	await page.getByLabel('Name').fill(name);
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page).toHaveURL(/\/dashboard/);
}

/** Makes every request to the API fail like a dropped connection, while the app itself still loads. */
export const blockApi = (context: BrowserContext) =>
	context.route(`${API}/**`, (route) => route.abort('internetdisconnected'));

/** Restores the connection to the API. */
export const unblockApi = (context: BrowserContext) => context.unroute(`${API}/**`);

/**
 * Signs in as a new account while the API is unreachable for the onboarding step, so the name
 * edit stays unsynced in the outbox. The API is still blocked when this returns.
 */
export async function signUpWithUnsyncedEdit(context: BrowserContext, page: Page) {
	const email = newEmail();
	await signIn(page, email);
	await expect(page.getByLabel('Name')).toBeVisible();
	await blockApi(context);
	await setUpName(page);
	return email;
}

/** Opens the account menu and chooses Logout. */
export async function clickLogout(page: Page, email: string) {
	await page.getByRole('button', { name: new RegExp(email) }).click();
	await page.getByRole('menuitem', { name: 'Logout' }).click();
}

/** What the browser currently holds for the signed-in account. */
export async function localAccount(page: Page): Promise<{ database: boolean; users: number }> {
	return page.evaluate(async () => {
		const databases = await indexedDB.databases();
		if (!databases.some(({ name }) => name === 'myfit')) return { database: false, users: 0 };
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open('myfit');
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		try {
			const store = [...db.objectStoreNames].find((name) => /^user$/i.test(name));
			if (!store) return { database: true, users: 0 };
			const users = await new Promise<number>((resolve, reject) => {
				const request = db.transaction(store).objectStore(store).count();
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			return { database: true, users };
		} finally {
			db.close();
		}
	});
}

/** Waits until the server has the account's name, which means onboarding's edit has synced. */
export async function waitForNameSynced(page: Page, name = 'E2E User') {
	await expect
		.poll(() =>
			page.evaluate(
				async (api) =>
					(await (await fetch(`${api}/api/auth/get-session`, { credentials: 'include' })).json())
						?.user?.name,
				API
			)
		)
		.toBe(name);
}
