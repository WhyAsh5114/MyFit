import { test, expect } from '@playwright/test';
import { testLoggedIn } from '../fixtures.js';

test.beforeEach(async ({ page }) => {
	await page.goto('/profile/login');
});

testLoggedIn('cookie should be set after login', async ({ page }) => {
	const cookies = await page.context().cookies();
	const session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeDefined();
	expect(session_id?.secure).toStrictEqual(true);
});

test('cookie should not be set when not logged in', async ({ page }) => {
	const cookies = await page.context().cookies();
	const session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeUndefined();
});

testLoggedIn('cookie should be removed after logout', async ({ page }) => {
	let cookies = await page.context().cookies();
	let session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeDefined();

	await page.request.get('/api/auth/logout');
	cookies = await page.context().cookies();
	session_id = cookies.find((cookie) => cookie.name === 'session_id');
	expect(session_id).toBeUndefined();
});
