import { test, expect } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/login');
});

test('cookie should be set after login', async ({ loggedInPage }) => {
	const cookies = await loggedInPage.context().cookies();
	const session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeDefined();
	expect(session_id?.secure).toStrictEqual(true);
});

test('cookie should not be set when not logged in', async ({ page }) => {
	const cookies = await page.context().cookies();
	const session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeUndefined();
});

test('cookie should be removed after logout', async ({ loggedInPage }) => {
	let cookies = await loggedInPage.context().cookies();
	let session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeDefined();

	await loggedInPage.request.get('/api/auth/logout');
	cookies = await loggedInPage.context().cookies();
	session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeUndefined();
});
