import { expect, test } from '@playwright/test';
import {
	API,
	enterCode,
	newEmail,
	readCode,
	signUp,
	signUpWithUnsyncedEdit,
	unblockApi,
	waitForNameSynced
} from './support/auth.js';
import { settle } from './support/settle.js';

test('a background session refetch keeps the page and what was typed on it', async ({ page }) => {
	let sessionRequests = 0;
	page.on('request', (request) => request.url().includes('/get-session') && sessionRequests++);
	await signUp(page);
	await page.goto('/food-diary/goals/metrics');
	await page.getByLabel('Bodyweight').fill('77');
	await page.evaluate(
		() => ((window as unknown as { main: unknown }).main = document.querySelector('main'))
	);

	// The session store refetches when the tab becomes visible again, at most every five seconds,
	// so keep showing the tab until it does.
	const before = sessionRequests;
	const refetched = page.waitForResponse((response) => response.url().includes('/get-session'));
	await expect
		.poll(
			async () => {
				await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
				return sessionRequests;
			},
			{ timeout: 15_000, intervals: [500] }
		)
		.toBeGreaterThan(before);
	await refetched;
	await settle(page);

	const sameMain = await page.evaluate(
		() => (window as unknown as { main: unknown }).main === document.querySelector('main')
	);
	expect(sameMain).toBe(true);
	await expect(page.getByLabel('Bodyweight')).toHaveValue('77');
});

test('another account signing in while the app is open asks first and hides the page', async ({
	page,
	context
}) => {
	await signUpWithUnsyncedEdit(context, page);
	// The session check can reach the API again, but the edit stays unsynced.
	await unblockApi(context);
	await context.route(`${API}/api/sync/**`, (route) => route.abort());
	await expect(page.locator('main')).toBeVisible();

	const email = newEmail();
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

	// The session store refetches at most every five seconds, so keep showing the tab until it does.
	const otherAccount = page.getByRole('dialog', { name: "This isn't the account on this device" });
	await expect
		.poll(
			async () => {
				await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
				return otherAccount.isVisible();
			},
			{ timeout: 20_000, intervals: [1000] }
		)
		.toBe(true);
	await expect(page.locator('main')).toHaveCount(0);
});

test('a signed-out visit to a protected page comes back to it after login', async ({
	page,
	browser
}) => {
	const email = newEmail();
	const other = await browser.newContext();
	const otherPage = await other.newPage();
	await signUp(otherPage, email);
	await waitForNameSynced(otherPage);
	await other.close();

	// Hovering a link preloads its page, which must not announce a redirect that never happens.
	await page.goto('/privacy-policy');
	await page.getByRole('link', { name: 'Food diary' }).first().hover();
	// Nothing on the page shows that the preload finished, so this absence check keeps a bounded wait.
	await page.waitForTimeout(800);
	await expect(page.getByText('Log in to continue')).toHaveCount(0);

	await page.goto('/food-diary/goals');
	await expect(page).toHaveURL(/\/login\?redirect=/);
	await expect(page.getByText('Log in to continue')).toBeVisible();

	await page.getByLabel('Email').fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
	await enterCode(page, email);
	await expect(page).toHaveURL(/\/food-diary\/goals/);
});
