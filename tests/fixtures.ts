import { test as base, expect } from '@playwright/test';
import { createClient } from 'redis';

export const testWithCreatableUsername = base.extend<{ creatable_username: string }>({
	creatable_username: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			const client = createClient();
			await client.connect();

			// Generate an unused username
			let username: string;
			do {
				username = 'user' + Math.floor(Math.random() * 10001);
			} while ((await client.get(username)) !== null);
			await use(username);
		},
		{ scope: 'test' }
	]
});

export const testWithExistingUsername = base.extend<{ username: string }>({
	username: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			const client = createClient();
			await client.connect();

			// Generate an unused username
			let username: string;
			do {
				username = 'user' + Math.floor(Math.random() * 10001);
			} while ((await client.get(username)) !== null);
			await use(username);
		},
		{ scope: 'test' }
	],
	page: [
		async ({ page, username }, use) => {
			// Create account with username
			const register_res = await page.request.post('/api/auth/register', {
				data: {
					username,
					password: 'password'
				}
			});
			expect(register_res.ok()).toStrictEqual(true);
			await use(page);
		},
		{ scope: 'test' }
	]
});

export const testLoggedIn = base.extend<{ user: UserData }>({
	user: [
		async ({ request }, use) => {
			const client = createClient();
			await client.connect();

			// Generate an unused username
			let username: string;
			do {
				username = 'user' + Math.floor(Math.random() * 10001);
			} while ((await client.get(username)) !== null);
			const credentials: AccountDetails = { username, password: 'password' };

			// Create the account
			const register_res = await request.post('/api/auth/register', {
				data: credentials
			});
			expect(register_res.ok()).toStrictEqual(true);

			// Get the account details as UserData
			const data = await client.get(username);
			const userData: UserData = data ? JSON.parse(data) : '';

			await use(userData);
		},
		{ scope: 'test' }
	],
	page: async ({ page, user }, use) => {
		// Login with account
		const login_res = await page.request.post('/api/auth/login', {
			data: {
				username: user.username,
				password: 'password'
			}
		});
		expect(login_res.ok()).toStrictEqual(true);

		await use(page);
	}
});

export { expect } from '@playwright/test';
